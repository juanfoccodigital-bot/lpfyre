"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, uploadFile, uploadFileToPath } from "@/lib/supabase";
import { getSession, AuthSession } from "@/lib/admin-auth";
import {
  Client,
  OnboardingItem,
  FinancialTransaction,
  ClientFile,
  Meeting,
  ONBOARDING_TEMPLATE,
  USERS_MAP,
  normalizeMeeting,
  formatWhatsApp,
} from "@/lib/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const SERVICOS_OPTIONS = [
  "Automação & IA",
  "Automação",
  "Website",
  "Sistema",
  "360",
  "Consultoria",
  "Social Media",
  "Branding",
];

const STATUS_COLORS: Record<string, string> = {
  ativo: "bg-green-500/20 text-green-400 border-green-500/30",
  pausado: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cancelado: "bg-red-500/20 text-red-400 border-red-500/30",
};

const TRANSACTION_STATUS_COLORS: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400",
  pago: "bg-green-500/20 text-green-400",
  atrasado: "bg-red-500/20 text-red-400",
  cancelado: "bg-white/10 text-white/40",
};

const MEETING_STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-500/20 text-blue-400",
  concluido: "bg-green-500/20 text-green-400",
  cancelado: "bg-red-500/20 text-red-400",
};

/* ── METADATA KEYS stored inside observacoes JSON ── */
const METADATA_KEYS = ["grupo_whatsapp", "bm_id", "meta_ads_id", "meta_token", "google_ads_id", "ga_id", "pixel_id", "gtm_id"] as const;

type ClientMetadata = Record<(typeof METADATA_KEYS)[number], string>;

function parseObservacoes(raw: string | null | undefined): { text: string; meta: ClientMetadata } {
  if (!raw) return { text: "", meta: { grupo_whatsapp: "", bm_id: "", meta_ads_id: "", meta_token: "", google_ads_id: "", ga_id: "", pixel_id: "", gtm_id: "" } };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "text" in parsed) {
      const meta: ClientMetadata = { grupo_whatsapp: "", bm_id: "", meta_ads_id: "", meta_token: "", google_ads_id: "", ga_id: "", pixel_id: "", gtm_id: "" };
      for (const k of METADATA_KEYS) meta[k] = parsed[k] || "";
      return { text: parsed.text || "", meta };
    }
  } catch { /* plain text */ }
  return { text: raw, meta: { grupo_whatsapp: "", bm_id: "", meta_ads_id: "", meta_token: "", google_ads_id: "", ga_id: "", pixel_id: "", gtm_id: "" } };
}

function serializeObservacoes(text: string, meta: Partial<ClientMetadata>): string {
  const hasAnyMeta = METADATA_KEYS.some((k) => meta[k]);
  if (!hasAnyMeta) return text;
  const obj: Record<string, string> = { text };
  for (const k of METADATA_KEYS) if (meta[k]) obj[k] = meta[k]!;
  return JSON.stringify(obj);
}

/* ──────────────────────────────────────────── */
/*  EMPTY CLIENT TEMPLATE                       */
/* ──────────────────────────────────────────── */
function emptyClient(assignedTo: string): Omit<Client, "id" | "created_at" | "updated_at"> {
  return {
    lead_id: null,
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    cpf_cnpj: "",
    servicos: [],
    tipo_pagamento: "mensal",
    valor_mensal: null,
    valor_projeto: null,
    dia_vencimento: 5,
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: null,
    status: "ativo",
    observacoes: "",
    assigned_to: assignedTo,
    cidade: "",
    estado: "",
    payment_link: "",
    contract_url: "",
  };
}

/* ──────────────────────────────────────────── */
/*  PAGE                                        */
/* ──────────────────────────────────────────── */
export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [session, setSession] = useState<AuthSession | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssigned, setFilterAssigned] = useState("all");

  // Detail state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);

  // Sub-data
  const [checklist, setChecklist] = useState<OnboardingItem[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingDetail, setMeetingDetail] = useState<Meeting | null>(null);
  const [meetingTranscription, setMeetingTranscription] = useState("");
  const [meetingAiSummary, setMeetingAiSummary] = useState("");
  const [savingMeetingNotes, setSavingMeetingNotes] = useState(false);
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);

  // Create mode
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState<ReturnType<typeof emptyClient> | null>(null);

  // Forms
  const [newFileType, setNewFileType] = useState("documento");
  const [uploading, setUploading] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", amount: 0, due_date: "", type: "receita", category: "avulso" });
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: "", scheduled_at: "", duration_minutes: 30, meeting_link: "", notes: "" });

  // Content (Conteudo) state
  const [contentPosts, setContentPosts] = useState<{ id: string; client_id: string; image_url: string | null; caption: string; scheduled_date: string; status: string; feedback: string | null; post_type?: string; direcao_criativa?: string | null; texto_arte?: string | null; designer?: string | null; data_publicacao?: string | null; created_at: string; updated_at: string }[]>([]);
  const [showAddContent, setShowAddContent] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState({ image_url: "", caption: "", scheduled_date: "", status: "em_analise", post_type: "estatico", direcao_criativa: "", texto_arte: "", designer: "", data_publicacao: "" });
  const [contentUploading, setContentUploading] = useState(false);
  const [contentFilePreview, setContentFilePreview] = useState<{ url: string; isVideo: boolean } | null>(null);
  const [carouselPreviews, setCarouselPreviews] = useState<string[]>([]);
  const [carouselPreviewIndex, setCarouselPreviewIndex] = useState(0);
  const [listCarouselIndices, setListCarouselIndices] = useState<Record<string, number>>({});
  const [contentViewMode, setContentViewMode] = useState<"calendario" | "lista" | "cards">("cards");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [contentFilter, setContentFilter] = useState<"todos" | "feed" | "stories">("todos");
  const [feedbackPostId, setFeedbackPostId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  // Automations state
  const [automations, setAutomations] = useState<{ id: string; client_id: string; name: string; description: string | null; type: string; status: string; url: string | null; created_at: string; updated_at: string }[]>([]);
  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [newAutomation, setNewAutomation] = useState({ name: "", description: "", type: "chatbot", url: "", status: "em_progresso" });

  // Traffic (Tráfego) state
  const [trafficData, setTrafficData] = useState<{daily: any[], summary: any, campaigns?: any[], period: any} | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficDays, setTrafficDays] = useState(30);
  const [trafficCustomSince, setTrafficCustomSince] = useState("");
  const [trafficCustomUntil, setTrafficCustomUntil] = useState("");

  // Optimization updates state
  const [optUpdates, setOptUpdates] = useState<{id: string; content: string; created_at: string; title: string}[]>([]);
  const [optNewContent, setOptNewContent] = useState("");
  const [optPublishing, setOptPublishing] = useState(false);

  // Edit form for selected client
  const [editForm, setEditForm] = useState<Partial<Client>>({});

  useEffect(() => {
    const s = getSession();
    setSession(s);
  }, []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    setClients((data as Client[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Load selected client
  useEffect(() => {
    if (selectedId && clients.length > 0) {
      const c = clients.find((cl) => cl.id === selectedId);
      if (c) {
        setSelectedClient(c);
        const { text, meta } = parseObservacoes(c.observacoes);
        setEditForm({ ...c, observacoes: text, ...meta } as Partial<Client>);
        setCreating(false);
        setNewClient(null);
        setTrafficData(null);
      }
    } else if (!selectedId) {
      setSelectedClient(null);
    }
  }, [selectedId, clients]);

  // Load sub-data when client selected
  useEffect(() => {
    if (!selectedClient) return;
    const id = selectedClient.id;

    supabase
      .from("onboarding_checklists")
      .select("*")
      .eq("client_id", id)
      .order("sort_order")
      .then(({ data, error }) => { if (error) console.error("Erro checklist:", error.message); setChecklist((data as OnboardingItem[]) || []); });

    supabase
      .from("financial_transactions")
      .select("*")
      .eq("client_id", id)
      .order("due_date", { ascending: false })
      .then(({ data, error }) => { if (error) console.error("Erro transacoes:", error.message); setTransactions((data as FinancialTransaction[]) || []); });

    supabase
      .from("files")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { if (error) console.error("Erro arquivos:", error.message); setFiles((data as ClientFile[]) || []); });

    supabase
      .from("meetings")
      .select("*")
      .eq("client_id", id)
      .order("scheduled_at", { ascending: false })
      .then(({ data, error }) => { if (error) console.error("Erro reunioes:", error.message); setMeetings((data || []).map((m: any) => normalizeMeeting(m)) as Meeting[]); });

    supabase
      .from("client_content")
      .select("*")
      .eq("client_id", id)
      .order("scheduled_date")
      .then(({ data, error }) => { if (error) console.error("Erro conteudo:", error.message); setContentPosts(data || []); });

    supabase
      .from("client_automations")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { if (error) console.error("Erro automacoes:", error.message); setAutomations(data || []); });
  }, [selectedClient, activeTab]);

  // Traffic data loader
  async function loadTraffic(days?: number, customSince?: string, customUntil?: string) {
    if (!selectedClient) return;
    const meta = parseObservacoes(selectedClient.observacoes);
    if (!meta.meta.meta_ads_id || !meta.meta.meta_token) return;
    setTrafficLoading(true);
    let since: string;
    let until: string;
    if (customSince && customUntil) {
      since = customSince;
      until = customUntil;
    } else {
      const d = days || trafficDays;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - d);
      since = sinceDate.toISOString().split("T")[0];
      until = new Date().toISOString().split("T")[0];
    }
    try {
      const res = await fetch("/api/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: meta.meta.meta_ads_id,
          accessToken: meta.meta.meta_token,
          dateRange: { since, until },
        }),
      });
      const data = await res.json();
      if (data.error) { alert("Erro Meta: " + data.error); return; }
      setTrafficData(data);
    } catch { alert("Erro de conexão"); }
    finally { setTrafficLoading(false); }
  }

  // Auto-load traffic when tab selected
  useEffect(() => {
    if (activeTab === "trafego" && selectedClient && !trafficData && !trafficLoading) {
      const meta = parseObservacoes(selectedClient.observacoes);
      if (meta.meta.meta_ads_id && meta.meta.meta_token) {
        loadTraffic(trafficDays);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedClient]);

  // Load optimization updates when trafego tab is active
  useEffect(() => {
    if (activeTab === "trafego" && selectedClient) {
      loadOptUpdates(selectedClient.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedClient]);

  async function loadOptUpdates(clientId: string) {
    const { data } = await supabase
      .from("client_updates")
      .select("*")
      .eq("client_id", clientId)
      .eq("type", "otimizacao")
      .order("created_at", { ascending: false });
    setOptUpdates(data || []);
  }

  async function publishOptUpdate() {
    if (!selectedClient || !optNewContent.trim()) return;
    setOptPublishing(true);
    const { error } = await supabase.from("client_updates").insert({
      client_id: selectedClient.id,
      title: "Otimização",
      content: optNewContent.trim(),
      type: "otimizacao",
      author_id: session?.id || "",
    });
    if (!error) {
      setOptNewContent("");
      await loadOptUpdates(selectedClient.id);
    }
    setOptPublishing(false);
  }

  async function deleteOptUpdate(id: string) {
    if (!selectedClient) return;
    await supabase.from("client_updates").delete().eq("id", id);
    await loadOptUpdates(selectedClient.id);
  }

  /* ── FILTERS ── */
  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.empresa || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── CREATE CLIENT ── */
  async function handleCreate() {
    if (!newClient || !newClient.nome) return;
    setSaving(true);

    // Serialize metadata into observacoes for create
    const nc = newClient as Record<string, unknown>;
    const metaObj: Record<string, string> = {};
    for (const k of METADATA_KEYS) {
      metaObj[k] = (nc[k] as string) || "";
    }
    const serialized = serializeObservacoes((nc.observacoes as string) || "", metaObj);
    const createPayload: Record<string, unknown> = { ...newClient, observacoes: serialized };
    for (const k of METADATA_KEYS) delete createPayload[k];

    const { data, error } = await supabase
      .from("clients")
      .insert(createPayload)
      .select()
      .single();

    if (error || !data) {
      alert("Erro ao criar cliente: " + (error?.message || ""));
      setSaving(false);
      return;
    }

    const newId = (data as Client).id;

    // Auto-generate onboarding checklist
    const checklistItems = ONBOARDING_TEMPLATE.map((item, i) => ({
      client_id: newId,
      item_key: item.key,
      item_label: item.label,
      sort_order: i,
    }));
    await supabase.from("onboarding_checklists").insert(checklistItems);

    // Auto-generate 12 months of transactions if mensal
    if (newClient.tipo_pagamento === "mensal" && newClient.valor_mensal) {
      const txs = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        date.setDate(newClient.dia_vencimento || 5);
        return {
          client_id: newId,
          type: "receita",
          category: "mensalidade",
          description: `Mensalidade ${months[date.getMonth()]}/${date.getFullYear()} - ${newClient.empresa || newClient.nome}`,
          amount: newClient.valor_mensal,
          status: "pendente",
          due_date: date.toISOString().split("T")[0],
          is_recurring: true,
          recurrence_day: newClient.dia_vencimento || 5,
        };
      });
      await supabase.from("financial_transactions").insert(txs);
    }

    await fetchClients();
    setCreating(false);
    setNewClient(null);
    setSaving(false);
    router.push(`/admin/clients?id=${newId}`);
  }

  /* ── SAVE CLIENT ── */
  async function handleSave() {
    if (!selectedClient) return;
    setSaving(true);

    // Extract metadata fields and serialize into observacoes
    const ef = editForm as Record<string, unknown>;
    const metaObj: Record<string, string> = {};
    for (const k of METADATA_KEYS) {
      metaObj[k] = (ef[k] as string) || "";
    }
    const serialized = serializeObservacoes((ef.observacoes as string) || "", metaObj);

    // Build payload without metadata keys
    const payload: Record<string, unknown> = { ...editForm, observacoes: serialized, updated_at: new Date().toISOString() };
    for (const k of METADATA_KEYS) delete payload[k];

    const { error } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", selectedClient.id);

    if (error) alert("Erro: " + error.message);
    else await fetchClients();
    setSaving(false);
  }

  /* ── DELETE CLIENT ── */
  async function handleDelete() {
    if (!selectedClient) return;
    if (!confirm("Tem certeza que deseja excluir este cliente? Esta acao nao pode ser desfeita.")) return;
    await supabase.from("clients").delete().eq("id", selectedClient.id);
    router.push("/admin/clients");
    setSelectedClient(null);
    await fetchClients();
  }

  /* ── TOGGLE ONBOARDING ── */
  async function toggleChecklist(item: OnboardingItem) {
    const newVal = !item.completed;
    await supabase
      .from("onboarding_checklists")
      .update({
        completed: newVal,
        completed_at: newVal ? new Date().toISOString() : null,
        completed_by: newVal ? session?.id || null : null,
      })
      .eq("id", item.id);

    setChecklist((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, completed: newVal, completed_at: newVal ? new Date().toISOString() : null }
          : i
      )
    );
  }

  /* ── ADD FILE (upload) ── */
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedClient) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. Maximo 10MB.");
      return;
    }
    setUploading(true);
    const result = await uploadFile(file, selectedClient.id);
    if (!result) {
      alert("Erro ao fazer upload do arquivo.");
      setUploading(false);
      return;
    }
    const { data } = await supabase
      .from("files")
      .insert({
        client_id: selectedClient.id,
        name: file.name,
        file_url: result.url,
        file_type: newFileType,
        uploaded_by: session?.id || null,
      })
      .select()
      .single();
    if (data) setFiles((prev) => [data as ClientFile, ...prev]);
    setNewFileType("documento");
    setUploading(false);
    e.target.value = "";
  }

  /* ── DELETE FILE ── */
  async function handleDeleteFile(id: string) {
    await supabase.from("files").delete().eq("id", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  /* ── ADD TRANSACTION ── */
  async function handleAddTransaction() {
    if (!selectedClient || !newTx.description) return;
    const { data } = await supabase
      .from("financial_transactions")
      .insert({
        client_id: selectedClient.id,
        ...newTx,
        status: "pendente",
        is_recurring: false,
      })
      .select()
      .single();
    if (data) setTransactions((prev) => [data as FinancialTransaction, ...prev]);
    setNewTx({ description: "", amount: 0, due_date: "", type: "receita", category: "avulso" });
    setShowAddTransaction(false);
  }

  /* ── ADD MEETING ── */
  async function handleAddMeeting() {
    if (!selectedClient || !newMeeting.title || !newMeeting.scheduled_at) return;
    const scheduledIso = new Date(newMeeting.scheduled_at).toISOString();
    const { data, error } = await supabase
      .from("meetings")
      .insert({
        client_id: selectedClient.id,
        titulo: newMeeting.title,
        scheduled_at: scheduledIso,
        duration_minutes: newMeeting.duration_minutes || 30,
        meeting_link: newMeeting.meeting_link || null,
        notes: newMeeting.notes || null,
        status: "agendado",
        assigned_to: session?.id || null,
      })
      .select()
      .single();
    if (error) { alert("Erro ao salvar reunião: " + error.message); return; }
    if (data) setMeetings((prev) => [normalizeMeeting(data) as Meeting, ...prev]);
    setNewMeeting({ title: "", scheduled_at: "", duration_minutes: 30, meeting_link: "", notes: "" });
    setShowAddMeeting(false);
  }

  /* ── CONTENT FILE UPLOAD ── */
  async function handleContentFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedClient) return;

    const isCarrossel = newContent.post_type === "carrossel";

    if (!isCarrossel) {
      // Single file upload (original behavior)
      const file = files[0];
      if (file.size > 50 * 1024 * 1024) {
        alert("Arquivo muito grande. Máximo 50MB.");
        return;
      }
      setContentUploading(true);
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${selectedClient.id}/conteudo/${timestamp}_${safeName}`;
      const result = await uploadFileToPath(file, path);
      if (!result) {
        alert("Erro ao fazer upload do arquivo.");
        setContentUploading(false);
        return;
      }
      const isVideo = file.type.startsWith("video/");
      setNewContent((p) => ({ ...p, image_url: result.url }));
      setContentFilePreview({ url: result.url, isVideo });
      setContentUploading(false);
      e.target.value = "";
      return;
    }

    // Carrossel: multiple file upload
    setContentUploading(true);
    const uploadedUrls: string[] = [...carouselPreviews];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) {
        alert(`Arquivo "${file.name}" muito grande. Máximo 50MB. Pulando...`);
        continue;
      }
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${selectedClient.id}/conteudo/${timestamp}_${safeName}`;
      const result = await uploadFileToPath(file, path);
      if (result) {
        uploadedUrls.push(result.url);
      }
    }
    if (uploadedUrls.length > 0) {
      setCarouselPreviews(uploadedUrls);
      setCarouselPreviewIndex(0);
      setNewContent((p) => ({ ...p, image_url: uploadedUrls.join(",") }));
    }
    setContentUploading(false);
    e.target.value = "";
  }

  function handleRemoveContentFile() {
    setNewContent((p) => ({ ...p, image_url: "" }));
    setContentFilePreview(null);
    setCarouselPreviews([]);
    setCarouselPreviewIndex(0);
  }

  function handleRemoveCarouselImage(index: number) {
    const updated = carouselPreviews.filter((_, i) => i !== index);
    setCarouselPreviews(updated);
    setNewContent((p) => ({ ...p, image_url: updated.join(",") }));
    if (carouselPreviewIndex >= updated.length) {
      setCarouselPreviewIndex(Math.max(0, updated.length - 1));
    }
  }

  /* ── ADD CONTENT POST ── */
  async function handleAddContent() {
    if (!selectedClient || !newContent.caption) return;
    const payload: Record<string, unknown> = {
      client_id: selectedClient.id,
      image_url: newContent.image_url || null,
      caption: newContent.caption,
      scheduled_date: newContent.scheduled_date || new Date().toISOString().split("T")[0],
      status: newContent.status,
      post_type: newContent.post_type || "estatico",
      direcao_criativa: newContent.direcao_criativa || null,
      texto_arte: newContent.texto_arte || null,
      designer: newContent.designer || null,
      data_publicacao: newContent.data_publicacao || null,
    };
    if (editingContentId) {
      const { data, error } = await supabase.from("client_content").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingContentId).select().single();
      if (error) { alert("Erro: " + error.message); return; }
      if (data) setContentPosts((prev) => prev.map((p) => p.id === editingContentId ? data : p));
      setEditingContentId(null);
    } else {
      const { data, error } = await supabase.from("client_content").insert(payload).select().single();
      if (error) { alert("Erro: " + error.message); return; }
      if (data) {
        setContentPosts((prev) => [...prev, data]);
        // Auto-save to files table
        if (newContent.image_url) {
          await supabase.from("files").insert({
            client_id: selectedClient.id,
            name: `[Conteúdo] ${newContent.caption?.slice(0, 40) || 'Post'} - ${new Date().toLocaleDateString('pt-BR')}`,
            file_url: newContent.image_url,
            file_type: "conteudo",
          });
        }
      }
    }
    setNewContent({ image_url: "", caption: "", scheduled_date: "", status: "em_analise", post_type: "estatico", direcao_criativa: "", texto_arte: "", designer: "", data_publicacao: "" });
    setContentFilePreview(null);
    setCarouselPreviews([]);
    setCarouselPreviewIndex(0);
    setShowAddContent(false);
  }

  /* ── CONTENT APPROVAL WORKFLOW ── */
  async function handleContentApproval(postId: string, newStatus: string, feedbackMsg?: string) {
    const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
    if (feedbackMsg !== undefined) updates.feedback = feedbackMsg;
    const { data, error } = await supabase.from("client_content").update(updates).eq("id", postId).select().single();
    if (error) { alert("Erro: " + error.message); return; }
    if (data) setContentPosts((prev) => prev.map((p) => p.id === postId ? data : p));
    setFeedbackPostId(null);
    setFeedbackText("");
  }

  async function handleDeleteContent(id: string) {
    if (!confirm("Excluir este post?")) return;
    await supabase.from("client_content").delete().eq("id", id);
    setContentPosts((prev) => prev.filter((p) => p.id !== id));
  }

  /* ── ADD AUTOMATION ── */
  async function handleAddAutomation() {
    if (!selectedClient || !newAutomation.name) return;
    const payload = {
      client_id: selectedClient.id,
      name: newAutomation.name,
      description: newAutomation.description || null,
      type: newAutomation.type,
      url: newAutomation.url || null,
      status: newAutomation.status,
    };
    if (editingAutomationId) {
      const { data, error } = await supabase.from("client_automations").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingAutomationId).select().single();
      if (error) { alert("Erro: " + error.message); return; }
      if (data) setAutomations((prev) => prev.map((a) => a.id === editingAutomationId ? data : a));
      setEditingAutomationId(null);
    } else {
      const { data, error } = await supabase.from("client_automations").insert(payload).select().single();
      if (error) { alert("Erro: " + error.message); return; }
      if (data) setAutomations((prev) => [data, ...prev]);
    }
    setNewAutomation({ name: "", description: "", type: "chatbot", url: "", status: "em_progresso" });
    setShowAddAutomation(false);
  }

  async function handleDeleteAutomation(id: string) {
    if (!confirm("Excluir esta automacao?")) return;
    await supabase.from("client_automations").delete().eq("id", id);
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  }

  /* ── RENDER HELPERS ── */
  const labelClass = "block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1.5";
  const inputClass =
    "w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300";
  const glassCard =
    "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  function getUserName(id: string | null) {
    if (!id) return "—";
    return USERS_MAP[id]?.name || id.slice(0, 8);
  }

  /* ──────────────────────────────────────────── */
  /*  CLIENT FORM (reused for create & edit)      */
  /* ──────────────────────────────────────────── */
  function renderClientForm(
    form: Record<string, unknown>,
    setForm: (fn: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
    isCreate: boolean
  ) {
    const f = form as Record<string, unknown>;
    const update = (key: string, value: unknown) =>
      setForm((prev: Record<string, unknown>) => ({ ...prev, [key]: value }));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome *</label>
            <input className={inputClass} value={(f.nome as string) || ""} onChange={(e) => update("nome", e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div>
            <label className={labelClass}>Empresa</label>
            <input className={inputClass} value={(f.empresa as string) || ""} onChange={(e) => update("empresa", e.target.value)} placeholder="Nome da empresa" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={(f.email as string) || ""} onChange={(e) => update("email", e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input className={inputClass} value={(f.telefone as string) || ""} onChange={(e) => update("telefone", e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className={labelClass}>CPF / CNPJ</label>
            <input className={inputClass} value={(f.cpf_cnpj as string) || ""} onChange={(e) => update("cpf_cnpj", e.target.value)} />
          </div>
          {/* Clientes são gestão geral */}
        </div>

        {/* Link do Grupo WhatsApp */}
        <div>
          <label className={labelClass}>Link do Grupo WhatsApp</label>
          <div className="flex gap-2">
            <input
              className={`${inputClass} flex-1`}
              value={(f.grupo_whatsapp as string) || ""}
              onChange={(e) => update("grupo_whatsapp", e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
            />
            {(f.grupo_whatsapp as string) && (
              <a
                href={f.grupo_whatsapp as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-all whitespace-nowrap border border-green-500/20"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Abrir Grupo
              </a>
            )}
          </div>
        </div>

        {/* Servicos multi-select */}
        <div>
          <label className={labelClass}>Servicos</label>
          <div className="flex flex-wrap gap-2">
            {SERVICOS_OPTIONS.map((s) => {
              const selected = ((f.servicos as string[]) || []).includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    const current = (f.servicos as string[]) || [];
                    update("servicos", selected ? current.filter((x: string) => x !== s) : [...current, s]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    selected
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Tipo Pagamento</label>
            <select className={inputClass} value={(f.tipo_pagamento as string) || "mensal"} onChange={(e) => update("tipo_pagamento", e.target.value)}>
              <option value="mensal">Mensal</option>
              <option value="projeto">Projeto</option>
              <option value="avista">A Vista</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Valor Mensal</label>
            <input className={inputClass} type="number" value={(f.valor_mensal as number) || ""} onChange={(e) => update("valor_mensal", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <label className={labelClass}>Valor Projeto</label>
            <input className={inputClass} type="number" value={(f.valor_projeto as number) || ""} onChange={(e) => update("valor_projeto", e.target.value ? Number(e.target.value) : null)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Dia Vencimento</label>
            <input className={inputClass} type="number" min={1} max={31} value={(f.dia_vencimento as number) || ""} onChange={(e) => update("dia_vencimento", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <label className={labelClass}>Data Inicio</label>
            <input className={inputClass} type="date" value={(f.data_inicio as string) || ""} onChange={(e) => update("data_inicio", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Data Fim</label>
            <input className={inputClass} type="date" value={(f.data_fim as string) || ""} onChange={(e) => update("data_fim", e.target.value || null)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={(f.status as string) || "ativo"} onChange={(e) => update("status", e.target.value)}>
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input className={inputClass} value={(f.cidade as string) || ""} onChange={(e) => update("cidade", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <input className={inputClass} value={(f.estado as string) || ""} onChange={(e) => update("estado", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Link de Pagamento</label>
            <input className={inputClass} value={(f.payment_link as string) || ""} onChange={(e) => update("payment_link", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>URL do Contrato</label>
            <input className={inputClass} value={(f.contract_url as string) || ""} onChange={(e) => update("contract_url", e.target.value)} placeholder="https://..." />
          </div>
        </div>

        {/* ── Dados de Trafego & Acessos ── */}
        <div className="pt-3">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 mb-3">Dados de Trafego & Acessos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>BM ID</label>
              <input className={inputClass} value={(f.bm_id as string) || ""} onChange={(e) => update("bm_id", e.target.value)} placeholder="Ex: 123456789" />
            </div>
            <div>
              <label className={labelClass}>Meta Ads ID (Conta)</label>
              <input className={inputClass} value={(f.meta_ads_id as string) || ""} onChange={(e) => update("meta_ads_id", e.target.value)} placeholder="Ex: 877139761516838" />
            </div>
            <div>
              <label className={labelClass}>Meta Token de Acesso</label>
              <input className={inputClass} value={(f.meta_token as string) || ""} onChange={(e) => update("meta_token", e.target.value)} placeholder="Token de acesso da API Meta" type="password" />
            </div>
            <div>
              <label className={labelClass}>Google Ads ID</label>
              <input className={inputClass} value={(f.google_ads_id as string) || ""} onChange={(e) => update("google_ads_id", e.target.value)} placeholder="ID da conta Google Ads" />
            </div>
            <div>
              <label className={labelClass}>Google Analytics ID</label>
              <input className={inputClass} value={(f.ga_id as string) || ""} onChange={(e) => update("ga_id", e.target.value)} placeholder="Ex: G-XXXXXXXXXX" />
            </div>
            <div>
              <label className={labelClass}>Pixel ID</label>
              <input className={inputClass} value={(f.pixel_id as string) || ""} onChange={(e) => update("pixel_id", e.target.value)} placeholder="ID do Pixel" />
            </div>
            <div>
              <label className={labelClass}>Tag Manager ID</label>
              <input className={inputClass} value={(f.gtm_id as string) || ""} onChange={(e) => update("gtm_id", e.target.value)} placeholder="Ex: GTM-XXXXXXX" />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Observacoes</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={(f.observacoes as string) || ""}
            onChange={(e) => update("observacoes", e.target.value)}
          />
        </div>

        {!isCreate && (
          <div className="flex gap-3 pt-2">
            {String(f.telefone || "") !== "" && (
              <a
                href={`https://wa.me/${formatWhatsApp(String(f.telefone || ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            )}
            {String(f.email || "") !== "" && (
              <a
                href={`mailto:${String(f.email || "")}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
                Email
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ──────────────────────────────────────────── */
  /*  DETAIL PANEL                                */
  /* ──────────────────────────────────────────── */
  function renderDetail() {
    if (!selectedClient) return null;

    const tabs = [
      { key: "trafego", label: "Tráfego" },
      { key: "info", label: "Info" },
      { key: "onboarding", label: "Onboarding" },
      { key: "financeiro", label: "Financeiro" },
      { key: "arquivos", label: "Arquivos" },
      { key: "reunioes", label: "Reuniões" },
      { key: "conteudo", label: "Conteúdo" },
      { key: "automacao", label: "Automação" },
    ];

    const completedCount = checklist.filter((i) => i.completed).length;
    const totalCount = checklist.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className={`${glassCard} p-6`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-[family-name:var(--font-instrument)] text-white">
              {selectedClient.nome}
            </h2>
            {selectedClient.empresa && (
              <p className="text-sm text-white/40 mt-0.5">{selectedClient.empresa}</p>
            )}
          </div>
          <button
            onClick={() => router.push("/admin/clients")}
            className="text-white/30 hover:text-white/60 transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                activeTab === t.key
                  ? "text-white bg-white/[0.08]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "trafego" && (() => {
          const meta = parseObservacoes(selectedClient.observacoes);
          const hasMeta = !!(meta.meta.meta_ads_id && meta.meta.meta_token);

          if (!hasMeta) {
            return (
              <div className="text-center py-16">
                <p className="text-white/40 text-sm">Configure o Meta Ads ID e Token de Acesso na aba Info para visualizar dados de tráfego.</p>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              {/* Date range selector */}
              <div className="flex flex-wrap items-center gap-2">
                {[7, 15, 30, 60].map((d) => (
                  <button
                    key={d}
                    onClick={() => { setTrafficDays(d); setTrafficCustomSince(""); setTrafficCustomUntil(""); loadTraffic(d); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      trafficDays === d && !trafficCustomSince
                        ? "bg-white/[0.12] text-white"
                        : "bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="date"
                    value={trafficCustomSince}
                    onChange={(e) => setTrafficCustomSince(e.target.value)}
                    className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/30"
                  />
                  <span className="text-white/30 text-xs">até</span>
                  <input
                    type="date"
                    value={trafficCustomUntil}
                    onChange={(e) => setTrafficCustomUntil(e.target.value)}
                    className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/30"
                  />
                  {trafficCustomSince && trafficCustomUntil && (
                    <button
                      onClick={() => loadTraffic(undefined, trafficCustomSince, trafficCustomUntil)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.12] transition-all"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
                <button
                  onClick={() => loadTraffic(trafficCustomSince && trafficCustomUntil ? undefined : trafficDays, trafficCustomSince || undefined, trafficCustomUntil || undefined)}
                  disabled={trafficLoading}
                  className="ml-auto px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {trafficLoading ? "Carregando..." : "Carregar Dados"}
                </button>
              </div>

              {trafficLoading && (
                <div className="text-center py-12">
                  <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-white/30 text-xs mt-3">Carregando dados do Meta Ads...</p>
                </div>
              )}

              {trafficData && !trafficLoading && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Investimento", value: `R$ ${Number(trafficData.summary?.spend || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, border: "border-blue-500/40", text: "text-blue-400" },
                      { label: "Impressões", value: Number(trafficData.summary?.impressions || 0).toLocaleString("pt-BR"), border: "border-cyan-500/40", text: "text-cyan-400" },
                      { label: "Cliques", value: Number(trafficData.summary?.clicks || 0).toLocaleString("pt-BR"), border: "border-emerald-500/40", text: "text-emerald-400" },
                      { label: "CTR", value: `${Number(trafficData.summary?.ctr || 0).toFixed(2)}%`, border: "border-yellow-500/40", text: "text-yellow-400" },
                      { label: "CPC", value: `R$ ${Number(trafficData.summary?.cpc || 0).toFixed(2)}`, border: "border-orange-500/40", text: "text-orange-400" },
                      { label: "CPL", value: `R$ ${Number(trafficData.summary?.cpl || 0).toFixed(2)}`, border: "border-purple-500/40", text: "text-purple-400" },
                      { label: "Leads", value: Number(trafficData.summary?.leads || 0).toLocaleString("pt-BR"), border: "border-green-500/40", text: "text-green-400" },
                      { label: "ROAS", value: Number(trafficData.summary?.roas || 0).toFixed(2), border: "border-amber-500/40", text: "text-amber-400" },
                    ].map((card) => (
                      <div key={card.label} className={`bg-white/[0.03] border ${card.border} rounded-xl backdrop-blur-sm p-4`}>
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1">{card.label}</p>
                        <p className={`text-lg font-bold ${card.text}`}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Daily chart */}
                  {trafficData.daily && trafficData.daily.length > 0 && (
                    <div className={`${glassCard} p-4`}>
                      <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30 mb-4">Investimento x Leads por dia</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trafficData.daily}>
                          <XAxis
                            dataKey="date"
                            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                            tickLine={false}
                            tickFormatter={(v: string) => { const parts = v.split("-"); return `${parts[2]}/${parts[1]}`; }}
                          />
                          <YAxis
                            yAxisId="spend"
                            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => `R$${v}`}
                          />
                          <YAxis
                            yAxisId="leads"
                            orientation="right"
                            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0,0,0,0.9)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                            labelFormatter={(v) => { const parts = String(v).split("-"); return `${parts[2]}/${parts[1]}/${parts[0]}`; }}
                          />
                          <Line yAxisId="spend" type="monotone" dataKey="spend" stroke="#f97316" strokeWidth={2} dot={false} name="Investimento (R$)" />
                          <Line yAxisId="leads" type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} dot={false} name="Leads" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Daily table */}
                  {trafficData.daily && trafficData.daily.length > 0 && (
                    <div className={`${glassCard} overflow-hidden`}>
                      <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30 p-4 pb-2">Dados diários</h3>
                      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/[0.06]">
                              {["Data", "Impressões", "Cliques", "Spend", "Leads", "CPC", "CPL", "CTR"].map((h) => (
                                <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30 sticky top-0 bg-black/80 backdrop-blur-sm">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {trafficData.daily.map((row: any, i: number) => (
                              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                                <td className="px-4 py-2 text-white/60">{row.date ? (() => { const p = row.date.split("-"); return `${p[2]}/${p[1]}`; })() : "-"}</td>
                                <td className="px-4 py-2 text-white/60">{Number(row.impressions || 0).toLocaleString("pt-BR")}</td>
                                <td className="px-4 py-2 text-white/60">{Number(row.clicks || 0).toLocaleString("pt-BR")}</td>
                                <td className="px-4 py-2 text-white/60">R$ {Number(row.spend || 0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-green-400 font-semibold">{Number(row.leads || 0)}</td>
                                <td className="px-4 py-2 text-white/60">R$ {Number(row.cpc || 0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-white/60">R$ {Number(row.cpl || 0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-white/60">{Number(row.ctr || 0).toFixed(2)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Active Campaigns */}
                  {trafficData.campaigns && trafficData.campaigns.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30">Campanhas Ativas</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {trafficData.campaigns.map((camp: any) => (
                          <div key={camp.id} className={`${glassCard} p-4 space-y-3`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{camp.name}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{camp.objective?.replace(/_/g, " ") || "—"}</p>
                              </div>
                              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                camp.status === "ACTIVE" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              }`}>
                                {camp.status === "ACTIVE" ? "Ativo" : "Pausado"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-white/40">
                              {camp.daily_budget && <span>Diário: R$ {camp.daily_budget.toFixed(2)}</span>}
                              {camp.lifetime_budget && <span>Total: R$ {camp.lifetime_budget.toFixed(2)}</span>}
                              {camp.start_time && <span>Início: {new Date(camp.start_time).toLocaleDateString("pt-BR")}</span>}
                              {camp.stop_time && <span>Fim: {new Date(camp.stop_time).toLocaleDateString("pt-BR")}</span>}
                            </div>
                            {camp.insights && (
                              <div className="grid grid-cols-5 gap-2">
                                {[
                                  { label: "Impr.", value: camp.insights.impressions.toLocaleString("pt-BR"), color: "text-cyan-400" },
                                  { label: "Cliques", value: camp.insights.clicks.toLocaleString("pt-BR"), color: "text-emerald-400" },
                                  { label: "Invest.", value: `R$ ${camp.insights.spend.toFixed(2)}`, color: "text-blue-400" },
                                  { label: "CPC", value: `R$ ${camp.insights.cpc.toFixed(2)}`, color: "text-orange-400" },
                                  { label: "CTR", value: `${camp.insights.ctr.toFixed(2)}%`, color: "text-yellow-400" },
                                ].map((m) => (
                                  <div key={m.label} className="text-center">
                                    <p className="text-[9px] text-white/30 uppercase tracking-wider">{m.label}</p>
                                    <p className={`text-xs font-bold ${m.color}`}>{m.value}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Otimizações & Atualizações */}
              <div className={`${glassCard} p-5 space-y-4`}>
                <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30">Otimizações & Atualizações</h3>
                <div className="space-y-3">
                  <textarea
                    value={optNewContent}
                    onChange={(e) => setOptNewContent(e.target.value)}
                    rows={3}
                    placeholder="Escreva uma atualização sobre otimizações realizadas..."
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 resize-none"
                  />
                  <button
                    onClick={publishOptUpdate}
                    disabled={optPublishing || !optNewContent.trim()}
                    className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-40"
                  >
                    {optPublishing ? "Publicando..." : "Publicar"}
                  </button>
                </div>
                {optUpdates.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                    {optUpdates.map((upd) => (
                      <div key={upd.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
                        <div className="w-1 self-stretch rounded-full bg-green-500/60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 whitespace-pre-wrap">{upd.content}</p>
                          <p className="text-[10px] text-white/30 mt-2">
                            {new Date(upd.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteOptUpdate(upd.id)}
                          className="text-white/20 hover:text-red-400 transition-colors text-xs shrink-0"
                          title="Excluir"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!trafficData && !trafficLoading && (
                <div className="text-center py-12">
                  <p className="text-white/20 text-sm">Clique em &quot;Carregar Dados&quot; para visualizar as métricas de tráfego.</p>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === "info" && (
          <div>
            {renderClientForm(
              editForm as Record<string, unknown>,
              setEditForm as unknown as (fn: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
              false
            )}
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold tracking-wider uppercase hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold tracking-wider uppercase hover:bg-red-500/30 transition-all border border-red-500/20"
              >
                Excluir
              </button>
            </div>
          </div>
        )}

        {activeTab === "onboarding" && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40 font-medium">Progresso do Onboarding</span>
                <span className="text-xs text-white/60 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">
                {completedCount} de {totalCount} itens concluidos
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklist(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                    item.completed
                      ? "bg-green-500/[0.06] border-green-500/20"
                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.completed
                        ? "bg-green-500 border-green-500"
                        : "border-white/20"
                    }`}
                  >
                    {item.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${item.completed ? "text-white/50 line-through" : "text-white/80"}`}>
                      {item.item_label}
                    </span>
                    {item.completed && item.completed_at && (
                      <p className="text-[10px] text-white/20 mt-0.5">
                        Concluido em {new Date(item.completed_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "financeiro" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-medium">{transactions.length} transacoes</span>
              <button
                onClick={() => setShowAddTransaction(!showAddTransaction)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 text-xs font-semibold hover:bg-white/10 transition-all"
              >
                + Adicionar
              </button>
            </div>

            {showAddTransaction && (
              <div className={`${glassCard} p-4 space-y-3`}>
                <input className={inputClass} placeholder="Descrição" value={newTx.description} onChange={(e) => setNewTx((p) => ({ ...p, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} type="number" placeholder="Valor" value={newTx.amount || ""} onChange={(e) => setNewTx((p) => ({ ...p, amount: Number(e.target.value) }))} />
                  <input className={inputClass} type="date" value={newTx.due_date} onChange={(e) => setNewTx((p) => ({ ...p, due_date: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className={inputClass} value={newTx.type} onChange={(e) => setNewTx((p) => ({ ...p, type: e.target.value }))}>
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                  <select className={inputClass} value={newTx.category} onChange={(e) => setNewTx((p) => ({ ...p, category: e.target.value }))}>
                    <option value="avulso">Avulso</option>
                    <option value="mensalidade">Mensalidade</option>
                    <option value="projeto">Projeto</option>
                  </select>
                </div>
                <button onClick={handleAddTransaction} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 transition-all">
                  Salvar Transacao
                </button>
              </div>
            )}

            {/* Transactions table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="pb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">Descrição</th>
                    <th className="pb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">Valor</th>
                    <th className="pb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">Vencimento</th>
                    <th className="pb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.03]">
                      <td className="py-2.5 text-sm text-white/70 max-w-[200px] truncate">{tx.description}</td>
                      <td className={`py-2.5 text-sm font-medium ${tx.type === "receita" ? "text-green-400" : "text-red-400"}`}>
                        R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-sm text-white/40">
                        {tx.due_date ? new Date(tx.due_date + "T12:00:00").toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${TRANSACTION_STATUS_COLORS[tx.status] || "bg-white/10 text-white/40"}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <p className="text-center text-white/20 text-sm py-8">Nenhuma transacao encontrada</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "arquivos" && (
          <div className="space-y-4">
            {/* Upload zone */}
            <div className={`${glassCard} p-4 space-y-3`}>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">Adicionar Arquivo</p>
              <div className="flex items-end gap-3">
                <div className="flex-shrink-0">
                  <label className={labelClass}>Tipo</label>
                  <select className={inputClass} value={newFileType} onChange={(e) => setNewFileType(e.target.value)}>
                    <option value="documento">Documento</option>
                    <option value="contrato">Contrato</option>
                    <option value="briefing">Briefing</option>
                    <option value="imagem">Imagem</option>
                    <option value="video">Video</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
              <label className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all block">
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                {uploading ? (
                  <>
                    <svg className="w-8 h-8 text-white/20 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-xs text-white/40 font-[family-name:var(--font-montserrat)]">Enviando arquivo...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs text-white/40 font-[family-name:var(--font-montserrat)]">Clique ou arraste um arquivo</p>
                    <p className="text-[10px] text-white/20 mt-1">PDF, DOC, XLS, IMG ate 10MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Files list */}
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-bold uppercase text-white/40 flex-shrink-0">
                      {file.file_type || "arquivo"}
                    </span>
                    <div className="min-w-0">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white truncate block transition-colors">
                        {file.name}
                      </a>
                      <p className="text-[10px] text-white/20">{new Date(file.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteFile(file.id)} className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
              {files.length === 0 && (
                <p className="text-center text-white/20 text-sm py-8">Nenhum arquivo adicionado</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "reunioes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-medium">{meetings.length} reuniões</span>
              <button
                onClick={() => setShowAddMeeting(!showAddMeeting)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 text-xs font-semibold hover:bg-white/10 transition-all"
              >
                + Agendar
              </button>
            </div>

            {showAddMeeting && (
              <div className={`${glassCard} p-4 space-y-3`}>
                <input className={inputClass} placeholder="Título da reunião" value={newMeeting.title} onChange={(e) => setNewMeeting((p) => ({ ...p, title: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} type="datetime-local" value={newMeeting.scheduled_at} onChange={(e) => setNewMeeting((p) => ({ ...p, scheduled_at: e.target.value }))} />
                  <input className={inputClass} type="number" placeholder="Duração (min)" value={newMeeting.duration_minutes} onChange={(e) => setNewMeeting((p) => ({ ...p, duration_minutes: Number(e.target.value) }))} />
                </div>
                <input className={inputClass} placeholder="Link da reunião" value={newMeeting.meeting_link} onChange={(e) => setNewMeeting((p) => ({ ...p, meeting_link: e.target.value }))} />
                <textarea className={`${inputClass} min-h-[60px]`} placeholder="Notas" value={newMeeting.notes} onChange={(e) => setNewMeeting((p) => ({ ...p, notes: e.target.value }))} />
                <button onClick={handleAddMeeting} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 transition-all">
                  Salvar Reunião
                </button>
              </div>
            )}

            {/* Meetings list */}
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.id} className={`${glassCard} p-4 cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.05] transition-all`} onClick={() => { setMeetingDetail(m); setMeetingTranscription(m.notes || ""); setMeetingAiSummary(""); }}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white/80">{m.title}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${MEETING_STATUS_COLORS[m.status] || "bg-white/10 text-white/40"}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                    <span>{new Date(m.scheduled_at).toLocaleString("pt-BR")}</span>
                    <span>{m.duration_minutes} min</span>
                    {m.meeting_link && (
                      <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:underline">
                        Entrar
                      </a>
                    )}
                  </div>
                  {m.notes && <p className="text-xs text-white/30 mt-2 line-clamp-2">{m.notes}</p>}
                </div>
              ))}
              {meetings.length === 0 && (
                <p className="text-center text-white/20 text-sm py-8">Nenhuma reunião agendada</p>
              )}
            </div>

            {/* Meeting Detail Modal */}
            {meetingDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMeetingDetail(null)} />
                <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl text-white/90 font-[family-name:var(--font-instrument)]">{meetingDetail.title}</h2>
                    <button onClick={() => setMeetingDetail(null)} className="text-white/30 hover:text-white/60 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-white/50 mb-5 font-[family-name:var(--font-montserrat)]">
                    <p><span className="text-white/30">Data:</span> {new Date(meetingDetail.scheduled_at).toLocaleString("pt-BR")} · {meetingDetail.duration_minutes} min</p>
                    <p><span className="text-white/30">Status:</span> {meetingDetail.status}</p>
                    {meetingDetail.meeting_link && (
                      <p><span className="text-white/30">Link:</span> <a href={meetingDetail.meeting_link} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">{meetingDetail.meeting_link}</a></p>
                    )}
                  </div>

                  {/* Transcription */}
                  <div className="mb-5">
                    <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                      Transcrição / Anotações da Reunião
                    </label>
                    <textarea
                      value={meetingTranscription}
                      onChange={(e) => setMeetingTranscription(e.target.value)}
                      rows={8}
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors resize-y min-h-[120px] font-[family-name:var(--font-montserrat)]"
                      placeholder="Cole aqui a transcrição da reunião, anotações, decisões tomadas, próximos passos..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          setSavingMeetingNotes(true);
                          await supabase.from("meetings").update({ notes: meetingTranscription }).eq("id", meetingDetail.id);
                          setMeetings((prev) => prev.map((m) => m.id === meetingDetail.id ? { ...m, notes: meetingTranscription } : m));
                          setSavingMeetingNotes(false);
                        }}
                        disabled={savingMeetingNotes}
                        className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 transition-all text-xs font-semibold disabled:opacity-50 font-[family-name:var(--font-montserrat)]"
                      >
                        {savingMeetingNotes ? "Salvando..." : "Salvar Anotações"}
                      </button>
                      <button
                        onClick={async () => {
                          if (!meetingTranscription.trim()) { alert("Adicione a transcrição primeiro."); return; }
                          setGeneratingAiSummary(true);
                          try {
                            const res = await fetch("/api/ai/team", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                agentId: "estrategista",
                                message: `Analise esta transcrição de reunião com o cliente "${selectedClient?.nome || ""}" (${selectedClient?.empresa || ""}) e gere:\n\n1. **Resumo** (3-5 pontos principais)\n2. **Decisões tomadas**\n3. **Próximos passos** (action items com responsáveis se possível)\n4. **Insights importantes** (oportunidades, riscos, observações)\n\nTranscrição:\n${meetingTranscription}`,
                              }),
                            });
                            const data = await res.json();
                            setMeetingAiSummary(data.response || data.reply || "Erro ao gerar resumo.");
                          } catch {
                            setMeetingAiSummary("Erro ao conectar com a IA.");
                          }
                          setGeneratingAiSummary(false);
                        }}
                        disabled={generatingAiSummary}
                        className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/20 transition-all text-xs font-semibold disabled:opacity-50 font-[family-name:var(--font-montserrat)] flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                        {generatingAiSummary ? "Analisando..." : "Resumo com IA"}
                      </button>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {meetingAiSummary && (
                    <div className="mb-5 p-4 rounded-xl bg-purple-500/[0.06] border border-purple-500/15">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider font-[family-name:var(--font-montserrat)]">Resumo IA</span>
                      </div>
                      <div className="text-sm text-white/70 whitespace-pre-wrap font-[family-name:var(--font-montserrat)] leading-relaxed">{meetingAiSummary}</div>
                    </div>
                  )}

                  {/* Delete */}
                  <div className="pt-4 border-t border-white/[0.06] flex justify-between">
                    <button
                      onClick={async () => {
                        if (!confirm("Excluir esta reunião?")) return;
                        await supabase.from("meetings").delete().eq("id", meetingDetail.id);
                        setMeetings((prev) => prev.filter((m) => m.id !== meetingDetail.id));
                        setMeetingDetail(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 transition-all text-xs font-semibold font-[family-name:var(--font-montserrat)]"
                    >
                      Excluir reunião
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CONTEUDO TAB ── */}
        {activeTab === "conteudo" && (() => {
          const contentStatusColors: Record<string, string> = {
            em_analise: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            aprovado: "bg-green-500/20 text-green-400 border-green-500/30",
            rejeitado: "bg-red-500/20 text-red-400 border-red-500/30",
            em_progresso: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            agendado: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            postado: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
          };
          const postTypeColors: Record<string, string> = {
            estatico: "bg-cyan-500/20 text-cyan-400",
            carrossel: "bg-purple-500/20 text-purple-400",
            video: "bg-pink-500/20 text-pink-400",
            reels: "bg-red-500/20 text-red-400",
            stories: "bg-yellow-500/20 text-yellow-400",
          };
          const postTypeIcons: Record<string, string> = {
            estatico: "\u{1F5BC}",
            carrossel: "\u{1F501}",
            video: "\u{1F3AC}",
            reels: "\u{1F4F1}",
            stories: "\u{26A1}",
          };
          const filteredPosts = contentPosts.filter((p) => {
            if (contentFilter === "stories") return p.post_type === "stories";
            if (contentFilter === "feed") return p.post_type !== "stories";
            return true;
          });

          function startEditPost(post: typeof contentPosts[0]) {
            setEditingContentId(post.id);
            setNewContent({
              image_url: post.image_url || "", caption: post.caption, scheduled_date: post.scheduled_date?.split("T")[0] || "",
              status: post.status, post_type: post.post_type || "estatico",
              direcao_criativa: post.direcao_criativa || "", texto_arte: post.texto_arte || "",
              designer: post.designer || "", data_publicacao: post.data_publicacao?.split("T")[0] || "",
            });
            if (post.post_type === "carrossel" && post.image_url?.includes(",")) {
              setCarouselPreviews(post.image_url.split(",").filter(Boolean));
              setCarouselPreviewIndex(0);
              setContentFilePreview(null);
            } else {
              const isVid = post.image_url?.match(/\.(mp4|mov|webm|avi)(\?|$)/i);
              setContentFilePreview(post.image_url ? { url: post.image_url, isVideo: !!isVid } : null);
              setCarouselPreviews([]);
              setCarouselPreviewIndex(0);
            }
            setShowAddContent(true);
          }

          /* Calendar helpers */
          const calDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
          const calFirstDay = new Date(calendarYear, calendarMonth, 1).getDay();
          const calDays = Array.from({ length: calDaysInMonth }, (_, i) => i + 1);
          const calPostsByDay: Record<number, typeof contentPosts> = {};
          filteredPosts.forEach((p) => {
            if (!p.scheduled_date) return;
            const d = new Date(p.scheduled_date);
            if (d.getMonth() === calendarMonth && d.getFullYear() === calendarYear) {
              const day = d.getDate();
              if (!calPostsByDay[day]) calPostsByDay[day] = [];
              calPostsByDay[day].push(p);
            }
          });

          return (
          <div className="space-y-4">
            {/* Header Row: counter + filter + view toggle + add button */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40 font-medium">{filteredPosts.length} posts</span>
                  {/* Feed / Stories filter */}
                  <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
                    {(["todos", "feed", "stories"] as const).map((f) => (
                      <button key={f} onClick={() => setContentFilter(f)}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${contentFilter === f ? "bg-white/[0.1] text-white/80" : "bg-white/[0.02] text-white/30 hover:bg-white/[0.06]"}`}
                      >{f === "todos" ? "Todos" : f === "feed" ? "Feed" : "Stories"}</button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { setShowAddContent(!showAddContent); setEditingContentId(null); setNewContent({ image_url: "", caption: "", scheduled_date: "", status: "em_analise", post_type: "estatico", direcao_criativa: "", texto_arte: "", designer: "", data_publicacao: "" }); setContentFilePreview(null); setCarouselPreviews([]); setCarouselPreviewIndex(0); }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 text-xs font-semibold hover:bg-white/10 transition-all"
                >
                  + Novo Post
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-white/[0.08] w-fit">
                {([
                  { key: "calendario" as const, label: "Calendario", icon: "\u{1F4C5}" },
                  { key: "lista" as const, label: "Lista", icon: "\u{1F4CB}" },
                  { key: "cards" as const, label: "Cards", icon: "\u{1F0CF}" },
                ]).map((v) => (
                  <button key={v.key} onClick={() => setContentViewMode(v.key)}
                    className={`px-3 py-1.5 text-[11px] font-semibold transition-all flex items-center gap-1.5 ${contentViewMode === v.key ? "bg-white/[0.12] text-white/90" : "bg-white/[0.02] text-white/30 hover:bg-white/[0.06] hover:text-white/50"}`}
                  >
                    <span className="text-xs">{v.icon}</span> {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Content Creation / Edit Form ── */}
            {showAddContent && (
              <div className={`${glassCard} p-4 space-y-3`}>
                {/* Post Type Pills */}
                <div>
                  <label className={labelClass}>Tipo de Post</label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: "estatico", label: "Estatico", color: "cyan" },
                      { value: "carrossel", label: "Carrossel", color: "purple" },
                      { value: "video", label: "Video", color: "pink" },
                      { value: "reels", label: "Reels", color: "red" },
                      { value: "stories", label: "Stories", color: "yellow" },
                    ] as const).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setNewContent((p) => ({ ...p, post_type: t.value }))}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          newContent.post_type === t.value
                            ? t.color === "cyan" ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                            : t.color === "purple" ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                            : t.color === "pink" ? "bg-pink-500/30 text-pink-300 border border-pink-500/50"
                            : t.color === "red" ? "bg-red-500/30 text-red-300 border border-red-500/50"
                            : "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50"
                            : "bg-white/[0.04] text-white/30 border border-white/[0.06] hover:bg-white/[0.08]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Zone */}
                <div>
                  <label className={labelClass}>Midia {newContent.post_type === "carrossel" && <span className="text-purple-400/70">(multiplas imagens)</span>}</label>

                  {/* Carrossel multi-image preview */}
                  {newContent.post_type === "carrossel" && carouselPreviews.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-purple-500/20 bg-white/[0.03]">
                        <img src={carouselPreviews[carouselPreviewIndex]} alt={`Slide ${carouselPreviewIndex + 1}`} className="w-full max-h-48 object-contain" />
                        {carouselPreviews.length > 1 && (
                          <>
                            <button type="button" onClick={() => setCarouselPreviewIndex((i) => (i - 1 + carouselPreviews.length) % carouselPreviews.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                            </button>
                            <button type="button" onClick={() => setCarouselPreviewIndex((i) => (i + 1) % carouselPreviews.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                          </>
                        )}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/70 text-white/70 text-[10px] font-bold">
                          {carouselPreviewIndex + 1} / {carouselPreviews.length}
                        </div>
                        <button type="button" onClick={() => handleRemoveCarouselImage(carouselPreviewIndex)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white/60 hover:text-white flex items-center justify-center transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {carouselPreviews.map((url, idx) => (
                          <button key={idx} type="button" onClick={() => setCarouselPreviewIndex(idx)} className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === carouselPreviewIndex ? "border-purple-500" : "border-transparent opacity-50 hover:opacity-80"}`}>
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <label className="border-2 border-dashed border-purple-500/20 rounded-xl p-3 text-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/[0.03] transition-all block">
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleContentFileUpload} disabled={contentUploading} />
                        {contentUploading ? <p className="text-xs text-white/40">Enviando...</p> : <p className="text-xs text-purple-400/60">+ Adicionar mais imagens</p>}
                      </label>
                    </div>
                  ) : contentFilePreview || (newContent.image_url && newContent.post_type !== "carrossel") ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
                      {(contentFilePreview?.isVideo || newContent.image_url?.match(/\.(mp4|mov|webm|avi)(\?|$)/i)) ? (
                        <video src={newContent.image_url} controls className="w-full max-h-48 object-contain" />
                      ) : (
                        <img src={newContent.image_url} alt="Preview" className="w-full max-h-48 object-contain" />
                      )}
                      <button type="button" onClick={handleRemoveContentFile} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white/60 hover:text-white flex items-center justify-center transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <label className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-white/[0.02] transition-all block ${newContent.post_type === "carrossel" ? "border-purple-500/20 hover:border-purple-500/40" : "border-white/10 hover:border-white/20"}`}>
                      <input type="file" className="hidden" accept="image/*,video/*" multiple={newContent.post_type === "carrossel"} onChange={handleContentFileUpload} disabled={contentUploading} />
                      {contentUploading ? (
                        <>
                          <svg className="w-8 h-8 text-white/20 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <p className="text-xs text-white/40">Enviando arquivo...</p>
                        </>
                      ) : newContent.post_type === "carrossel" ? (
                        <>
                          <svg className="w-8 h-8 text-purple-400/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <p className="text-xs text-purple-400/60">Selecione multiplas imagens para o carrossel</p>
                          <p className="text-[10px] text-white/20 mt-1">JPG, PNG - selecione varios arquivos</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <p className="text-xs text-white/40">Clique ou arraste uma imagem ou video</p>
                          <p className="text-[10px] text-white/20 mt-1">JPG, PNG, MP4, MOV ate 50MB</p>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {/* New fields */}
                <div>
                  <label className={labelClass}>Direcao Criativa</label>
                  <input className={inputClass} placeholder="Notas de direcao criativa..." value={newContent.direcao_criativa} onChange={(e) => setNewContent((p) => ({ ...p, direcao_criativa: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Legenda</label>
                  <textarea className={`${inputClass} min-h-[100px]`} placeholder="Legenda completa do post..." value={newContent.caption} onChange={(e) => setNewContent((p) => ({ ...p, caption: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Texto na Arte</label>
                  <input className={inputClass} placeholder="Texto que vai na arte..." value={newContent.texto_arte} onChange={(e) => setNewContent((p) => ({ ...p, texto_arte: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Designer</label>
                    <input className={inputClass} placeholder="Designer responsavel" value={newContent.designer} onChange={(e) => setNewContent((p) => ({ ...p, designer: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Data Publicacao</label>
                    <input className={inputClass} type="date" value={newContent.data_publicacao} onChange={(e) => setNewContent((p) => ({ ...p, data_publicacao: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Data Agendamento</label>
                    <input className={inputClass} type="date" value={newContent.scheduled_date} onChange={(e) => setNewContent((p) => ({ ...p, scheduled_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select className={inputClass} value={newContent.status} onChange={(e) => setNewContent((p) => ({ ...p, status: e.target.value }))}>
                      <option value="em_analise">Em Analise</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="rejeitado">Rejeitado</option>
                      <option value="em_progresso">Em Progresso</option>
                      <option value="agendado">Agendado</option>
                      <option value="postado">Postado</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleAddContent} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 transition-all w-full">
                  {editingContentId ? "Salvar Alteracoes" : "Criar Post"}
                </button>
              </div>
            )}

            {/* ════════════════ CALENDAR VIEW ════════════════ */}
            {contentViewMode === "calendario" && (
              <div className={`${glassCard} p-4`}>
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear((y) => y - 1); } else setCalendarMonth((m) => m - 1); }}
                    className="w-8 h-8 rounded-lg bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/80 flex items-center justify-center transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <h3 className="text-sm font-[family-name:var(--font-instrument)] text-white/80">
                    {months[calendarMonth]} {calendarYear}
                  </h3>
                  <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear((y) => y + 1); } else setCalendarMonth((m) => m + 1); }}
                    className="w-8 h-8 rounded-lg bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/80 flex items-center justify-center transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((d) => (
                    <div key={d} className="text-center text-[9px] font-bold uppercase tracking-wider text-white/20 py-1">{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: calFirstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                  {calDays.map((day) => {
                    const dayPosts = calPostsByDay[day] || [];
                    const isToday = day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
                    return (
                      <div key={day} className={`min-h-[56px] rounded-lg p-1 transition-all ${isToday ? "bg-white/[0.08] border border-white/[0.15]" : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05]"}`}>
                        <span className={`text-[10px] font-semibold ${isToday ? "text-white/90" : "text-white/30"}`}>{day}</span>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {dayPosts.slice(0, 3).map((p) => (
                            <button key={p.id} onClick={() => startEditPost(p)} title={p.caption}
                              className={`w-full px-1 py-0.5 rounded text-[8px] font-bold truncate text-left transition-all hover:opacity-80 ${postTypeColors[p.post_type || "estatico"]}`}>
                              {postTypeIcons[p.post_type || "estatico"]} {p.texto_arte || p.caption?.slice(0, 12) || p.post_type}
                            </button>
                          ))}
                          {dayPosts.length > 3 && (
                            <span className="text-[8px] text-white/30 text-center">+{dayPosts.length - 3}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════════ LIST VIEW ════════════════ */}
            {contentViewMode === "lista" && (
              <div className={`${glassCard} overflow-hidden`}>
                {/* Table header */}
                <div className="grid grid-cols-[100px_70px_1fr_80px_80px_100px] gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Data</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Tipo</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Texto na Arte</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Status</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Designer</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Acoes</span>
                </div>
                {filteredPosts.length === 0 && (
                  <p className="text-center text-white/20 text-sm py-8">Nenhum post adicionado</p>
                )}
                {filteredPosts.map((post) => (
                  <div key={post.id} className="grid grid-cols-[100px_70px_1fr_80px_80px_100px] gap-2 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-all items-center">
                    <span className="text-[11px] text-white/50">{post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString("pt-BR") : "---"}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-center ${postTypeColors[post.post_type || "estatico"]}`}>
                      {post.post_type || "estatico"}
                    </span>
                    <span className="text-[11px] text-white/60 truncate">{post.texto_arte || post.caption?.slice(0, 50) || "---"}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-center ${contentStatusColors[post.status] || "bg-white/10 text-white/40"}`}>
                      {post.status.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-white/40 truncate">{post.designer || "---"}</span>
                    <div className="flex gap-1">
                      <button onClick={() => startEditPost(post)} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 text-[9px] font-semibold hover:bg-white/10 transition-all">Editar</button>
                      <button onClick={() => handleDeleteContent(post.id)} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/60 text-[9px] font-semibold hover:bg-red-500/20 transition-all">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ════════════════ CARDS VIEW ════════════════ */}
            {contentViewMode === "cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.length === 0 && (
                  <p className="text-center text-white/20 text-sm py-8 col-span-full">Nenhum post adicionado</p>
                )}
                {filteredPosts.map((post) => {
                  const isVideoFile = post.image_url?.match(/\.(mp4|mov|webm|avi)(\?|$)/i) || post.post_type === "video" || post.post_type === "reels";
                  const isCarrosselPost = post.post_type === "carrossel" && post.image_url?.includes(",");
                  const carrosselImages = isCarrosselPost ? post.image_url!.split(",").filter(Boolean) : [];
                  const currentCarouselIdx = listCarouselIndices[post.id] || 0;
                  return (
                    <div key={post.id} className={`${glassCard} overflow-hidden flex flex-col`}>
                      {/* Image preview area */}
                      <div className="relative h-40 bg-white/[0.02] border-b border-white/[0.06]">
                        {isCarrosselPost && carrosselImages.length > 0 ? (
                          <>
                            <img src={carrosselImages[currentCarouselIdx]} alt="" className="w-full h-full object-cover" />
                            {carrosselImages.length > 1 && (
                              <>
                                <button type="button" onClick={() => setListCarouselIndices((p) => ({ ...p, [post.id]: (currentCarouselIdx - 1 + carrosselImages.length) % carrosselImages.length }))} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center transition-colors">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                <button type="button" onClick={() => setListCarouselIndices((p) => ({ ...p, [post.id]: (currentCarouselIdx + 1) % carrosselImages.length }))} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center transition-colors">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                              </>
                            )}
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                              {carrosselImages.map((_, idx) => (
                                <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentCarouselIdx ? "bg-purple-400" : "bg-white/30"}`} />
                              ))}
                            </div>
                          </>
                        ) : post.image_url && !isCarrosselPost ? (
                          isVideoFile ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/30">
                              <svg className="w-10 h-10 text-pink-400/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          ) : (
                            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl opacity-20">{postTypeIcons[post.post_type || "estatico"]}</span>
                          </div>
                        )}
                        {/* Post type badge overlay */}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase backdrop-blur-sm ${postTypeColors[post.post_type || "estatico"]}`}>
                          {postTypeIcons[post.post_type || "estatico"]} {post.post_type || "estatico"}
                        </span>
                        {/* Status badge overlay */}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase backdrop-blur-sm ${contentStatusColors[post.status] || "bg-white/10 text-white/40"}`}>
                          {post.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Card body */}
                      <div className="p-3 flex-1 flex flex-col">
                        <p className="text-[11px] text-white/30 mb-1">
                          {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString("pt-BR") : "Sem data"}
                          {post.designer && <span className="ml-2 text-white/20">| {post.designer}</span>}
                        </p>
                        <p className="text-xs text-white/70 line-clamp-2 mb-2 flex-1">{post.caption || "Sem legenda"}</p>
                        {post.texto_arte && (
                          <p className="text-[10px] text-cyan-400/60 mb-2 truncate">Arte: {post.texto_arte}</p>
                        )}

                        {/* Feedback display */}
                        {post.feedback && (
                          <div className="mb-2 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mb-0.5">Feedback</p>
                            <p className="text-[10px] text-white/50 line-clamp-2">{post.feedback}</p>
                          </div>
                        )}

                        {/* Feedback input (when commenting) */}
                        {feedbackPostId === post.id && (
                          <div className="mb-2 space-y-1.5">
                            <textarea
                              className={`${inputClass} min-h-[60px] text-[11px]`}
                              placeholder="Escreva seu feedback..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              autoFocus
                            />
                            <div className="flex gap-1.5">
                              <button onClick={() => { if (feedbackText.trim()) handleContentApproval(post.id, "rejeitado", feedbackText.trim()); }}
                                className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-[9px] font-bold hover:bg-red-500/30 transition-all flex-1">
                                Rejeitar com Feedback
                              </button>
                              <button onClick={() => { if (feedbackText.trim()) handleContentApproval(post.id, post.status, feedbackText.trim()); }}
                                className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-bold hover:bg-blue-500/30 transition-all flex-1">
                                Salvar Comentario
                              </button>
                              <button onClick={() => { setFeedbackPostId(null); setFeedbackText(""); }}
                                className="px-2 py-1 rounded-md bg-white/[0.06] text-white/40 text-[9px] font-bold hover:bg-white/10 transition-all">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Approval + action buttons */}
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-white/[0.06]">
                          {post.status !== "aprovado" && (
                            <button onClick={() => handleContentApproval(post.id, "aprovado")}
                              className="px-2 py-1 rounded-md bg-green-500/15 text-green-400 text-[9px] font-bold hover:bg-green-500/25 transition-all">
                              Aprovar
                            </button>
                          )}
                          <button onClick={() => { setFeedbackPostId(post.id); setFeedbackText(post.feedback || ""); }}
                            className="px-2 py-1 rounded-md bg-blue-500/15 text-blue-400 text-[9px] font-bold hover:bg-blue-500/25 transition-all">
                            Comentar
                          </button>
                          {post.status !== "rejeitado" && (
                            <button onClick={() => { setFeedbackPostId(post.id); setFeedbackText(""); }}
                              className="px-2 py-1 rounded-md bg-red-500/15 text-red-400 text-[9px] font-bold hover:bg-red-500/25 transition-all">
                              Rejeitar
                            </button>
                          )}
                          <button onClick={() => startEditPost(post)}
                            className="px-2 py-1 rounded-md bg-white/[0.06] text-white/40 text-[9px] font-semibold hover:bg-white/10 transition-all ml-auto">
                            Editar
                          </button>
                          <button onClick={() => handleDeleteContent(post.id)}
                            className="px-2 py-1 rounded-md bg-red-500/10 text-red-400/50 text-[9px] font-semibold hover:bg-red-500/20 transition-all">
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          );
        })()}

        {/* ── AUTOMACAO TAB ── */}
        {activeTab === "automacao" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-medium">{automations.length} automações</span>
              <button
                onClick={() => { setShowAddAutomation(!showAddAutomation); setEditingAutomationId(null); setNewAutomation({ name: "", description: "", type: "chatbot", url: "", status: "em_progresso" }); }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 text-xs font-semibold hover:bg-white/10 transition-all"
              >
                + Nova Automação
              </button>
            </div>

            {showAddAutomation && (
              <div className={`${glassCard} p-4 space-y-3`}>
                <input className={inputClass} placeholder="Nome da automação" value={newAutomation.name} onChange={(e) => setNewAutomation((p) => ({ ...p, name: e.target.value }))} />
                <textarea className={`${inputClass} min-h-[60px]`} placeholder="Descrição" value={newAutomation.description} onChange={(e) => setNewAutomation((p) => ({ ...p, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <select className={inputClass} value={newAutomation.type} onChange={(e) => setNewAutomation((p) => ({ ...p, type: e.target.value }))}>
                    <option value="chatbot">Chatbot</option>
                    <option value="fluxo">Fluxo</option>
                    <option value="integracao">Integração</option>
                    <option value="sistema">Sistema</option>
                    <option value="agente_ia">Agente IA</option>
                  </select>
                  <select className={inputClass} value={newAutomation.status} onChange={(e) => setNewAutomation((p) => ({ ...p, status: e.target.value }))}>
                    <option value="em_progresso">Em Progresso</option>
                    <option value="em_teste">Em Teste</option>
                    <option value="ativo">Ativo</option>
                    <option value="desativado">Desativado</option>
                    <option value="em_manutencao">Em Manutenção</option>
                  </select>
                </div>
                <input className={inputClass} placeholder="URL (opcional)" value={newAutomation.url} onChange={(e) => setNewAutomation((p) => ({ ...p, url: e.target.value }))} />
                <button onClick={handleAddAutomation} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 transition-all">
                  {editingAutomationId ? "Salvar Alterações" : "Criar Automação"}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {automations.map((auto) => {
                const typeColors: Record<string, string> = {
                  chatbot: "bg-blue-500/20 text-blue-400",
                  fluxo: "bg-cyan-500/20 text-cyan-400",
                  integracao: "bg-purple-500/20 text-purple-400",
                  sistema: "bg-orange-500/20 text-orange-400",
                  agente_ia: "bg-pink-500/20 text-pink-400",
                };
                const statusAutoColors: Record<string, string> = {
                  ativo: "bg-green-500/20 text-green-400",
                  em_progresso: "bg-blue-500/20 text-blue-400",
                  em_teste: "bg-yellow-500/20 text-yellow-400",
                  em_manutencao: "bg-orange-500/20 text-orange-400",
                  desativado: "bg-red-500/20 text-red-400",
                };
                return (
                  <div key={auto.id} className={`${glassCard} p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white/80">{auto.name}</h4>
                      <div className="flex gap-1.5 flex-shrink-0 ml-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${typeColors[auto.type] || "bg-white/10 text-white/40"}`}>
                          {auto.type.replace("_", " ")}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${statusAutoColors[auto.status] || "bg-white/10 text-white/40"}`}>
                          {auto.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    {auto.description && <p className="text-xs text-white/40 mb-2">{auto.description}</p>}
                    {auto.url && (
                      <a href={auto.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                        {auto.url}
                      </a>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingAutomationId(auto.id);
                          setNewAutomation({ name: auto.name, description: auto.description || "", type: auto.type, url: auto.url || "", status: auto.status });
                          setShowAddAutomation(true);
                        }}
                        className="px-2 py-1 rounded-md bg-white/[0.06] text-white/40 text-[10px] font-semibold hover:bg-white/10 transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAutomation(auto.id)}
                        className="px-2 py-1 rounded-md bg-red-500/10 text-red-400/60 text-[10px] font-semibold hover:bg-red-500/20 transition-all"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
              {automations.length === 0 && (
                <p className="text-center text-white/20 text-sm py-8">Nenhuma automação adicionada</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ──────────────────────────────────────────── */
  /*  MAIN RENDER                                 */
  /* ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
              Clientes
            </h1>
            <p className="text-xs font-light text-white/40 mt-1">
              {clients.length} clientes cadastrados
            </p>
          </div>
          <button
            onClick={() => {
              setCreating(true);
              setNewClient(emptyClient(session?.id || Object.keys(USERS_MAP)[0]));
              setSelectedClient(null);
              router.push("/admin/clients");
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold tracking-wider uppercase hover:bg-white/90 transition-all"
          >
            + Novo Cliente
          </button>
        </div>

        {/* Create mode */}
        {creating && newClient && (
          <div className={`${glassCard} p-6 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-[family-name:var(--font-instrument)] text-white">Novo Cliente</h2>
              <button onClick={() => { setCreating(false); setNewClient(null); }} className="text-white/30 hover:text-white/60 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            {renderClientForm(
              newClient as unknown as Record<string, unknown>,
              ((fn: (prev: Record<string, unknown>) => Record<string, unknown>) =>
                setNewClient((prev) => fn(prev as unknown as Record<string, unknown>) as unknown as ReturnType<typeof emptyClient>)) as unknown as (fn: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
              true
            )}
            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleCreate}
                disabled={saving || !newClient.nome}
                className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold tracking-wider uppercase hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {saving ? "Criando..." : "Criar Cliente"}
              </button>
            </div>
          </div>
        )}

        {/* If detail is selected, show detail panel */}
        {selectedClient && !creating ? (
          renderDetail()
        ) : !creating ? (
          <>
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <input
                  className={inputClass}
                  placeholder="Buscar por nome ou empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={`${inputClass} sm:w-40`}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos Status</option>
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              {/* Clientes são gestão geral, sem filtro por responsável */}
            </div>

            {/* Client Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/20 text-sm">Nenhum cliente encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => router.push(`/admin/clients?id=${client.id}`)}
                    className={`${glassCard} p-5 text-left hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 group`}
                  >
                    {/* Name + Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                          {client.nome}
                        </h3>
                        {client.empresa && (
                          <p className="text-xs text-white/30 truncate">{client.empresa}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border flex-shrink-0 ml-2 ${STATUS_COLORS[client.status] || "bg-white/10 text-white/40 border-white/10"}`}>
                        {client.status}
                      </span>
                    </div>

                    {/* Servicos badges */}
                    {client.servicos && client.servicos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {client.servicos.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-medium text-white/40">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Value + Assigned */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/60">
                        {client.valor_mensal
                          ? `R$ ${client.valor_mensal.toLocaleString("pt-BR")}/mes`
                          : client.valor_projeto
                          ? `R$ ${client.valor_projeto.toLocaleString("pt-BR")}`
                          : "-"}
                      </span>
                      <span className="text-[10px] text-white/20 font-medium">
                        {getUserName(client.assigned_to).split(" ")[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
