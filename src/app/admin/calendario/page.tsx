"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/admin-auth";
import { getCalendarEvents, createCalendarEvent, syncCalendar, notifyMeeting, aiChat } from "@/lib/fyre-api";
import { Meeting, Client, Lead, USERS_MAP, normalizeMeeting, formatWhatsApp } from "@/lib/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/* ──────────────────── Types ──────────────────── */

interface MeetingWithRelations extends Meeting {
  clients?: { nome: string; empresa: string | null } | null;
  leads?: { nome: string; empresa: string | null } | null;
}

interface CalendarTask {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  client_id: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  checklist: { text: string; done: boolean }[] | null;
}

interface ContentPost {
  id: string;
  date: string;
  day_of_week: string;
  type: string;
  theme: string;
  headline: string;
  status: string;
}

const CONTENT_TYPE_COLORS: Record<string, string> = {
  carrossel: "bg-purple-500/20 text-purple-400",
  estatico: "bg-cyan-500/20 text-cyan-400",
  reels: "bg-pink-500/20 text-pink-400",
  stories: "bg-amber-500/20 text-amber-400",
};

const CONTENT_STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-white/10 text-white/50",
  aprovado: "bg-blue-500/20 text-blue-400",
  criado: "bg-amber-500/20 text-amber-400",
  publicado: "bg-green-500/20 text-green-400",
};

const EVENT_TYPES = [
  { value: "reuniao", label: "Reunião", icon: "📹", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "presencial", label: "Presencial", icon: "🤝", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "alinhamento", label: "Alinhamento", icon: "🎯", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "diagnostico", label: "Diagnóstico", icon: "🔍", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "apresentacao", label: "Apresentação", icon: "📊", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { value: "evento", label: "Evento", icon: "🎉", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  { value: "outro", label: "Outro", icon: "📌", color: "bg-white/10 text-white/60 border-white/20" },
];

interface NewMeeting {
  title: string;
  description: string;
  client_id: string;
  lead_id: string;
  scheduled_at_date: string;
  scheduled_at_time: string;
  end_time: string;
  duration_minutes: string;
  meeting_link: string;
  assigned_to: string;
  participants: string[];
  location: string;
  event_type: string;
}

const emptyForm: NewMeeting = {
  title: "",
  description: "",
  client_id: "",
  lead_id: "",
  scheduled_at_date: "",
  scheduled_at_time: "10:00",
  end_time: "11:00",
  duration_minutes: "60",
  meeting_link: "",
  assigned_to: Object.keys(USERS_MAP)[0],
  participants: [],
  location: "",
  event_type: "reuniao",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  agendado: { bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
  concluido: { bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-400" },
  cancelado: { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-400" },
  remarcado: { bg: "bg-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-400" },
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function statusColor(status: string) {
  return STATUS_COLORS[status] || STATUS_COLORS.agendado;
}

/* ──────────────────── Component ──────────────────── */

export default function CalendarioPage() {
  const [meetings, setMeetings] = useState<MeetingWithRelations[]>([]);
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([]);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailMeeting, setDetailMeeting] = useState<MeetingWithRelations | null>(null);
  const [transcription, setTranscription] = useState("");
  const [savingTranscription, setSavingTranscription] = useState(false);
  const [form, setForm] = useState<NewMeeting>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [contactType, setContactType] = useState<"client" | "lead" | "interno">("client");
  const [mobileView, setMobileView] = useState<"calendar" | "list">("calendar");
  const [googleEvents, setGoogleEvents] = useState<MeetingWithRelations[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  /* ──── Fetch ──── */

  const fetchMeetings = useCallback(async () => {
    const { data } = await supabase
      .from("meetings")
      .select("*, clients(nome, empresa)")
      .order("scheduled_at");

    const meetingsData = ((data || []) as MeetingWithRelations[]).map((m) => normalizeMeeting(m)) as MeetingWithRelations[];

    // Fetch lead names for meetings that have lead_id
    const leadIds = meetingsData
      .filter((m) => m.lead_id)
      .map((m) => m.lead_id!);

    if (leadIds.length > 0) {
      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, nome, empresa")
        .in("id", leadIds);

      if (leadsData) {
        const leadsMap = new Map(leadsData.map((l) => [l.id, l]));
        meetingsData.forEach((m) => {
          if (m.lead_id && leadsMap.has(m.lead_id)) {
            m.leads = leadsMap.get(m.lead_id) || null;
          }
        });
      }
    }

    setMeetings(meetingsData);
  }, []);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .not("due_date", "is", null);
    setCalendarTasks((data as CalendarTask[]) || []);
  }, []);

  const fetchContentPosts = useCallback(async () => {
    const { data } = await supabase
      .from("content_calendar")
      .select("*")
      .in("status", ["aprovado", "criado"]);
    setContentPosts((data as ContentPost[]) || []);
  }, []);

  const fetchGoogleEvents = useCallback(async () => {
    try {
      // Auto-sync: notify + create leads for new events
      syncCalendar().catch(() => {});

      const data = await getCalendarEvents();
      if (data.connected !== undefined) setGoogleConnected(data.connected);
      if (data.events) {
        const mapped: MeetingWithRelations[] = data.events.map((e: { id: string; title: string; description: string | null; scheduled_at: string; end_at: string; meeting_link: string | null; attendees: { email: string; name: string }[]; location: string | null }) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          scheduled_at: e.scheduled_at,
          duration_minutes: e.end_at && e.scheduled_at
            ? Math.round((new Date(e.end_at).getTime() - new Date(e.scheduled_at).getTime()) / 60000)
            : 60,
          meeting_link: e.meeting_link,
          status: "agendado",
          assigned_to: "",
          created_by: "",
          client_id: null,
          lead_id: null,
          _source: "google",
          _attendees: e.attendees,
          _location: e.location,
        }));
        setGoogleEvents(mapped);
      }
    } catch {
      // Google Calendar not connected
    }
  }, []);

  useEffect(() => {
    async function init() {
      const [, , , , clRes, ldRes] = await Promise.all([
        fetchMeetings(),
        fetchTasks(),
        fetchContentPosts(),
        fetchGoogleEvents(),
        supabase.from("clients").select("*").order("nome"),
        supabase.from("leads").select("*").eq("archived", false).order("nome"),
      ]);
      setClients(clRes.data || []);
      setLeads(ldRes.data || []);
      setLoading(false);
    }
    init();
  }, [fetchMeetings, fetchTasks, fetchContentPosts, fetchGoogleEvents]);

  /* ──── Calendar days ──── */

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const allMeetings = useMemo(() => [...meetings, ...googleEvents], [meetings, googleEvents]);

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, MeetingWithRelations[]>();
    allMeetings.forEach((m) => {
      try {
        const key = format(parseISO(m.scheduled_at), "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(m);
      } catch { /* skip invalid dates */ }
    });
    return map;
  }, [allMeetings]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    calendarTasks.forEach((t) => {
      if (!t.due_date) return;
      const key = t.due_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [calendarTasks]);

  const contentByDate = useMemo(() => {
    const map = new Map<string, ContentPost[]>();
    contentPosts.forEach((p) => {
      if (!p.date) return;
      const key = p.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [contentPosts]);

  /* ──── Selected day events ──── */

  const selectedDayMeetings = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return meetingsByDate.get(key) || [];
  }, [selectedDate, meetingsByDate]);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return tasksByDate.get(key) || [];
  }, [selectedDate, tasksByDate]);

  const selectedDayContent = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return contentByDate.get(key) || [];
  }, [selectedDate, contentByDate]);

  /* ──── Upcoming events ──── */

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return allMeetings
      .filter((m) => parseISO(m.scheduled_at) >= now && m.status !== "cancelado")
      .sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime())
      .slice(0, 10);
  }, [allMeetings]);

  const upcomingTasks = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return calendarTasks
      .filter((t) => t.due_date && t.due_date >= todayStr && t.status !== "concluido")
      .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
      .slice(0, 10);
  }, [calendarTasks]);

  const upcomingContent = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return contentPosts
      .filter((p) => p.date >= todayStr)
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .slice(0, 10);
  }, [contentPosts]);

  /* ──── Handlers ──── */

  function handlePrevMonth() {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSelectedDate(null);
  }

  function handleNextMonth() {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedDate(null);
  }

  function handleDayClick(day: Date) {
    setSelectedDate(day);
  }

  function openAddModal(date?: Date) {
    setForm({
      ...emptyForm,
      scheduled_at_date: date
        ? format(date, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
    });
    setContactType("client");
    setShowAddModal(true);
  }

  function calcDuration(startTime: string, endTime: string): number {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff : 60;
  }

  function handleTimeChange(field: "scheduled_at_time" | "end_time", value: string) {
    const updated = { ...form, [field]: value };
    if (field === "scheduled_at_time" && value >= form.end_time) {
      const [h, m] = value.split(":").map(Number);
      const endH = h + 1;
      updated.end_time = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    updated.duration_minutes = String(calcDuration(updated.scheduled_at_time, updated.end_time));
    setForm(updated);
  }

  function toggleParticipant(userId: string) {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const scheduledAt = new Date(
      `${form.scheduled_at_date}T${form.scheduled_at_time}:00`
    ).toISOString();

    const duration = calcDuration(form.scheduled_at_time, form.end_time);
    const session = getSession();
    const fallbackUserId = "1bab39ad-f161-4da0-b65f-5b56a9e32dd5"; // Juan
    const createdBy = session?.id || form.assigned_to || fallbackUserId;
    const assignedTo = form.assigned_to || fallbackUserId;

    // Build description with extras appended
    const eventTypeLabel = EVENT_TYPES.find((t) => t.value === form.event_type)?.label || "Reunião";
    const descParts: string[] = [];
    descParts.push(`🏷️ ${eventTypeLabel}`);
    if (form.description) descParts.push(form.description);
    if (form.location) descParts.push(`📍 ${form.location}`);
    if (form.participants.length > 0) {
      const names = form.participants.map((id) => USERS_MAP[id]?.name?.split(" ")[0] || "?").join(", ");
      descParts.push(`👥 ${names}`);
    }

    const payload: Record<string, unknown> = {
      titulo: `${eventTypeLabel}: ${form.title}`,
      descricao: descParts.join("\n") || null,
      client_id: contactType === "client" && form.client_id ? form.client_id : null,
      lead_id: contactType === "lead" && form.lead_id ? form.lead_id : null,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      meeting_link: form.meeting_link || null,
      status: "agendado",
      assigned_to: assignedTo,
      created_by: createdBy,
    };

    const { error } = await supabase.from("meetings").insert(payload);
    if (error) {
      alert("Erro ao salvar: " + error.message);
      setSaving(false);
      return;
    }

    // Also create on Google Calendar (fire and forget)
    const endAt = new Date(
      `${form.scheduled_at_date}T${form.end_time}:00`
    ).toISOString();
    createCalendarEvent({
      title: `${eventTypeLabel}: ${form.title}`,
      description: descParts.join("\n") || undefined,
      start: scheduledAt,
      end: endAt,
      meeting_link: form.meeting_link || undefined,
    }).catch(() => {});

    // Notify DIRETORIA group via Ayla + auto-create lead
    const contactName = contactType === "client"
      ? clients.find((c) => c.id === form.client_id)?.nome
      : contactType === "lead"
        ? leads.find((l) => l.id === form.lead_id)?.nome
        : "Interno";
    const currentSession = getSession();

    try {
      await notifyMeeting({
          title: form.title,
          date: new Date(`${form.scheduled_at_date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }),
          time: form.scheduled_at_time,
          endTime: form.end_time,
          duration: calcDuration(form.scheduled_at_time, form.end_time),
          contact: contactName || undefined,
          link: form.meeting_link || undefined,
          createdBy: currentSession ? USERS_MAP[currentSession.id]?.name : undefined,
        });
    } catch { /* silent */ }

    // Move lead to "agendado" if meeting is for a lead
    if (contactType === "lead" && form.lead_id) {
      supabase.from("leads").update({ status: "agendado" }).eq("id", form.lead_id).then(() => {});
    }

    setShowAddModal(false);
    setForm({ ...emptyForm });
    setSaving(false);
    await fetchMeetings();
    fetchGoogleEvents();
  }

  function openDetail(meeting: MeetingWithRelations) {
    setDetailMeeting(meeting);
    setTranscription(meeting.notes || "");
    setAiSummary("");
  }

  async function handleSaveTranscription() {
    if (!detailMeeting) return;
    setSavingTranscription(true);
    await supabase.from("meetings").update({ notes: transcription }).eq("id", detailMeeting.id);
    setMeetings((prev) => prev.map((m) => m.id === detailMeeting.id ? { ...m, notes: transcription } : m));
    setDetailMeeting((prev) => prev ? { ...prev, notes: transcription } : null);
    setSavingTranscription(false);
  }

  async function handleGenerateSummary() {
    if (!detailMeeting || !transcription.trim()) {
      alert("Cole a transcrição da reunião primeiro.");
      return;
    }
    setGeneratingSummary(true);
    setAiSummary("");
    try {
      const data = await aiChat({
          agentSystemPrompt: "Voce e um analista de reunioes especialista. Analise transcricoes e gere resumos executivos estruturados, praticos e acionaveis.",
          messages: [
            {
              role: "user",
              content: `Analise esta transcricao de reuniao e gere um resumo estruturado com:\n\n1. **Resumo Executivo** (2-3 frases)\n2. **Pontos-chave discutidos**\n3. **Insights importantes**\n4. **Proximos passos / Action items**\n5. **Oportunidades identificadas**\n\nTranscricao:\n${transcription}`,
            },
          ],
        });
      if (data.output) {
        setAiSummary(data.output);
      } else {
        alert("Erro ao gerar resumo: resposta vazia");
      }
    } catch {
      alert("Erro ao gerar resumo.");
    }
    setGeneratingSummary(false);
  }

  async function handleDeleteMeeting(id: string) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    await supabase.from("meetings").delete().eq("id", id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setDetailMeeting(null);
  }

  async function handleUpdateMeetingStatus(id: string, newStatus: string) {
    await supabase.from("meetings").update({ status: newStatus }).eq("id", id);
    setMeetings((prev) => prev.map((m) => m.id === id ? { ...m, status: newStatus } : m));
    setDetailMeeting((prev) => prev ? { ...prev, status: newStatus } : null);
  }

  function getContactName(m: MeetingWithRelations) {
    if (m.clients) return m.clients.nome;
    if (m.leads) return m.leads.nome;
    return "Interno";
  }

  function getContactPhone(m: MeetingWithRelations) {
    if (m.client_id) {
      const cl = clients.find((c) => c.id === m.client_id);
      return cl?.telefone || null;
    }
    if (m.lead_id) {
      const ld = leads.find((l) => l.id === m.lead_id);
      return ld?.telefone || null;
    }
    return null;
  }

  /* ──── Render helpers ──── */

  function MeetingCard({ meeting }: { meeting: MeetingWithRelations }) {
    const isGoogle = (meeting as unknown as Record<string, unknown>)._source === "google";
    const sc = statusColor(meeting.status);
    const phone = getContactPhone(meeting);
    const assignedUser = USERS_MAP[meeting.assigned_to];

    return (
      <div onClick={() => !isGoogle && openDetail(meeting)} className={`rounded-xl border p-4 space-y-2 backdrop-blur-sm cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.05] transition-all ${isGoogle ? "border-blue-500/20 bg-blue-500/[0.03]" : "border-white/[0.06] bg-white/[0.03]"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isGoogle && (
              <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/></svg>
            )}
            <h4 className="font-semibold text-white/90 text-sm leading-tight">
              {meeting.title}
            </h4>
          </div>
          <span
            className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${isGoogle ? "bg-blue-500/20 text-blue-400" : `${sc.bg} ${sc.text}`}`}
          >
            {isGoogle ? "Google" : meeting.status}
          </span>
        </div>

        <div className="space-y-1 text-xs text-white/50">
          {(() => {
            const start = format(parseISO(meeting.scheduled_at), "HH:mm");
            const endDate = new Date(new Date(meeting.scheduled_at).getTime() + meeting.duration_minutes * 60000);
            const end = format(endDate, "HH:mm");
            return (
              <p>
                <span className="text-white/30">Horário:</span>{" "}
                {start} — {end} <span className="text-white/20">({meeting.duration_minutes}min)</span>
              </p>
            );
          })()}
          {getContactName(meeting) !== "Interno" && (
            <p>
              <span className="text-white/30">Contato:</span>{" "}
              {getContactName(meeting)}
            </p>
          )}
          {assignedUser && (
            <p>
              <span className="text-white/30">Responsável:</span>{" "}
              {assignedUser.name}
            </p>
          )}
          {meeting.description && (
            <p className="text-white/40 whitespace-pre-wrap text-[11px]">{meeting.description}</p>
          )}
          {meeting.meeting_link && (
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-block text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
            >
              Link da reunião
            </a>
          )}
        </div>

        {phone && (
          <a
            href={`https://wa.me/${formatWhatsApp(phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 transition-colors mt-1"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.508-.756-6.265-2.037l-.438-.33-2.648.888.888-2.649-.33-.437A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
            </svg>
            WhatsApp
          </a>
        )}
      </div>
    );
  }

  /* ──── Loading ──── */

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  /* ──────────────────── Render ──────────────────── */

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:px-8">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl text-white/90 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Calendário
            </h1>
            <p
              className="text-white/40 text-sm mt-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Reuniões, tarefas e conteúdo da equipe
            </p>
          </div>

          <div className="flex items-center gap-3">
            {googleConnected ? (
              <button
                onClick={async () => {
                  try {
                    const data = await syncCalendar();
                    if (data.synced > 0) {
                      alert(`✅ ${data.synced} novo(s) evento(s) sincronizado(s)!\n\n${data.results?.map((r: { event: string }) => `• ${r.event}`).join("\n") || ""}`);
                      fetchGoogleEvents();
                      fetchMeetings();
                    } else {
                      alert("✅ Tudo sincronizado, nenhum evento novo.");
                    }
                  } catch {
                    alert("Erro ao sincronizar");
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Sincronizar Google
              </button>
            ) : (
              <a
                href="https://fyre-back.vercel.app/api/calendar/auth"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.06] border border-white/[0.06] transition-all text-xs font-medium"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Conectar Google Calendar
              </a>
            )}
            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 transition-all text-sm font-medium"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Novo evento
            </button>
          </div>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="md:hidden max-w-[1600px] mx-auto mb-4 flex gap-2">
        <button
          onClick={() => setMobileView("calendar")}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            mobileView === "calendar"
              ? "bg-white/10 text-white"
              : "bg-white/[0.03] text-white/40"
          }`}
        >
          Calendário
        </button>
        <button
          onClick={() => setMobileView("list")}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            mobileView === "list"
              ? "bg-white/10 text-white"
              : "bg-white/[0.03] text-white/40"
          }`}
        >
          Próximos
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6">
        {/* ──── Calendar ──── */}
        <div
          className={`flex-1 ${mobileView === "list" ? "hidden md:block" : ""}`}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <h2
              className="text-xl text-white/80 capitalize"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider py-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayMeetings = meetingsByDate.get(key) || [];
              const dayTasks = tasksByDate.get(key) || [];
              const dayContent = contentByDate.get(key) || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const hasEvents = dayMeetings.length > 0 || dayTasks.length > 0 || dayContent.length > 0;

              return (
                <button
                  key={key}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative min-h-[80px] md:min-h-[100px] p-2 text-left transition-all
                    bg-black hover:bg-white/[0.04]
                    ${!inMonth ? "opacity-30" : ""}
                    ${selected ? "ring-1 ring-orange-500/60 bg-orange-500/[0.04]" : ""}
                    ${today ? "ring-1 ring-orange-400/40" : ""}
                  `}
                >
                  <span
                    className={`
                      text-xs font-medium block mb-1
                      ${today ? "text-orange-400 font-bold" : inMonth ? "text-white/70" : "text-white/20"}
                    `}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Event dots: orange=meetings, blue=tasks, purple=content */}
                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {dayMeetings.slice(0, 2).map((m) => (
                        <span
                          key={m.id}
                          className={`w-1.5 h-1.5 rounded-full ${statusColor(m.status).dot}`}
                          title={m.title}
                        />
                      ))}
                      {dayTasks.slice(0, 2).map((t) => (
                        <span
                          key={t.id}
                          className="w-1.5 h-1.5 rounded-full bg-blue-400"
                          title={t.title}
                        />
                      ))}
                      {dayContent.slice(0, 2).map((p) => (
                        <span
                          key={p.id}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400"
                          title={p.theme}
                        />
                      ))}
                    </div>
                  )}

                  {/* Event titles (desktop) */}
                  <div className="hidden md:flex flex-col gap-0.5 mt-1">
                    {dayMeetings.slice(0, 1).map((m) => (
                      <div
                        key={m.id}
                        className={`text-[9px] leading-tight truncate px-1 py-0.5 rounded ${statusColor(m.status).bg} ${statusColor(m.status).text}`}
                      >
                        {format(parseISO(m.scheduled_at), "HH:mm")} {m.title}
                      </div>
                    ))}
                    {dayTasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="text-[9px] leading-tight truncate px-1 py-0.5 rounded bg-blue-500/20 text-blue-400"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayContent.slice(0, 1).map((p) => (
                      <div
                        key={p.id}
                        className="text-[9px] leading-tight truncate px-1 py-0.5 rounded bg-purple-500/20 text-purple-400"
                      >
                        {p.theme}
                      </div>
                    ))}
                    {(dayMeetings.length + dayTasks.length + dayContent.length) > 3 && (
                      <span className="text-[9px] text-white/40 px-1">
                        +{dayMeetings.length + dayTasks.length + dayContent.length - 3} mais
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ──── Selected day detail ──── */}
          {selectedDate && (
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-white/80 text-lg capitalize"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                <button
                  onClick={() => openAddModal(selectedDate)}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  + Adicionar
                </button>
              </div>

              {selectedDayMeetings.length === 0 && selectedDayTasks.length === 0 && selectedDayContent.length === 0 ? (
                <p className="text-white/30 text-sm">Nenhum evento neste dia.</p>
              ) : (
                <div className="space-y-4">
                  {/* Meetings */}
                  {selectedDayMeetings.length > 0 && (
                    <div className="space-y-3">
                      {selectedDayMeetings.map((m) => (
                        <MeetingCard key={m.id} meeting={m} />
                      ))}
                    </div>
                  )}

                  {/* Tasks */}
                  {selectedDayTasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400/70 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Tarefas
                      </p>
                      {selectedDayTasks.map((t) => {
                        const assignedUser = USERS_MAP[t.assigned_to];
                        const checklistDone = t.checklist ? t.checklist.filter((c) => c.done).length : 0;
                        const checklistTotal = t.checklist ? t.checklist.length : 0;
                        return (
                          <div
                            key={t.id}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-1.5 backdrop-blur-sm border-l-2 border-l-blue-400/60"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-white/90 text-sm leading-tight">{t.title}</h4>
                              <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                t.priority === "urgente" ? "bg-red-500/20 text-red-400" :
                                t.priority === "alta" ? "bg-orange-500/20 text-orange-400" :
                                t.priority === "media" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-white/10 text-white/50"
                              }`}>
                                {t.priority}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/40">
                              {assignedUser && <span>{assignedUser.name}</span>}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                t.status === "pendente" ? "bg-orange-500/20 text-orange-400" :
                                t.status === "em_andamento" ? "bg-blue-500/20 text-blue-400" :
                                "bg-green-500/20 text-green-400"
                              }`}>{t.status.replace("_", " ")}</span>
                              {checklistTotal > 0 && <span>{checklistDone}/{checklistTotal}</span>}
                            </div>
                            {t.description && (
                              <p className="text-xs text-white/30 truncate">{t.description}</p>
                            )}
                            <a
                              href="/admin/tarefas"
                              className="inline-block text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                            >
                              Ver tarefa
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Content Posts */}
                  {selectedDayContent.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-400/70 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Conteúdo
                      </p>
                      {selectedDayContent.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-1.5 backdrop-blur-sm border-l-2 border-l-purple-400/60"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-white/90 text-sm leading-tight">{p.theme}</h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${CONTENT_TYPE_COLORS[p.type] || "bg-white/10 text-white/50"}`}>
                                {p.type}
                              </span>
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${CONTENT_STATUS_COLORS[p.status] || "bg-white/10 text-white/50"}`}>
                                {p.status}
                              </span>
                            </div>
                          </div>
                          {p.headline && (
                            <p className="text-xs text-white/30 truncate">{p.headline}</p>
                          )}
                          <a
                            href={`/admin/conteudo`}
                            className="inline-block text-[11px] text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                          >
                            Criar Post
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ──── Side panel: Próximos eventos ──── */}
        <div
          className={`lg:w-[340px] shrink-0 ${
            mobileView === "calendar" ? "hidden md:block" : ""
          }`}
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 sticky top-24">
            <h3
              className="text-white/80 text-lg mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Próximos eventos
            </h3>

            {upcomingMeetings.length === 0 && upcomingTasks.length === 0 && upcomingContent.length === 0 ? (
              <p className="text-white/30 text-sm">Nenhum evento agendado.</p>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 custom-scrollbar">
                {/* Upcoming Meetings */}
                {upcomingMeetings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-orange-400/60 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      Reuniões
                    </p>
                    {upcomingMeetings.map((m) => {
                      const sc = statusColor(m.status);
                      const phone = getContactPhone(m);

                      return (
                        <div
                          key={m.id}
                          onClick={() => openDetail(m)}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-1.5 cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.05] transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-white/80 leading-tight">
                              {m.title}
                            </p>
                            <span
                              className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
                            >
                              {m.status}
                            </span>
                          </div>

                          <p className="text-[11px] text-white/40">
                            {format(parseISO(m.scheduled_at), "dd/MM · HH:mm", {
                              locale: ptBR,
                            })}{" "}
                            — {getContactName(m)}
                          </p>

                          {phone && (
                            <a
                              href={`https://wa.me/${formatWhatsApp(phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.508-.756-6.265-2.037l-.438-.33-2.648.888.888-2.649-.33-.437A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                              </svg>
                              WhatsApp
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upcoming Tasks */}
                {upcomingTasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-400/60 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Tarefas
                    </p>
                    {upcomingTasks.map((t) => {
                      const assignedUser = USERS_MAP[t.assigned_to];
                      return (
                        <a
                          key={t.id}
                          href="/admin/tarefas"
                          className="block rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-1 hover:bg-white/[0.05] transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-white/80 leading-tight">
                              {t.title}
                            </p>
                            <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                              t.priority === "urgente" ? "bg-red-500/20 text-red-400" :
                              t.priority === "alta" ? "bg-orange-500/20 text-orange-400" :
                              t.priority === "media" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-white/10 text-white/50"
                            }`}>
                              {t.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/40">
                            {t.due_date ? format(parseISO(t.due_date), "dd/MM", { locale: ptBR }) : ""}{" "}
                            {assignedUser ? `— ${assignedUser.name.split(" ")[0]}` : ""}
                          </p>
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* Upcoming Content */}
                {upcomingContent.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-purple-400/60 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Conteúdo
                    </p>
                    {upcomingContent.map((p) => (
                      <a
                        key={p.id}
                        href="/admin/conteudo"
                        className="block rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-1 hover:bg-white/[0.05] transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-white/80 leading-tight">
                            {p.theme}
                          </p>
                          <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${CONTENT_TYPE_COLORS[p.type] || "bg-white/10 text-white/50"}`}>
                            {p.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40">
                          {format(parseISO(p.date), "dd/MM", { locale: ptBR })} · {p.status}
                        </p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────── Detail/Edit Modal ──────────────────── */}
      {detailMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetailMeeting(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl text-white/90 font-[family-name:var(--font-instrument)]">
                {detailMeeting.title}
              </h2>
              <button onClick={() => setDetailMeeting(null)} className="text-white/30 hover:text-white/60 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status + Actions */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {(["agendado", "concluido", "cancelado", "remarcado"] as const).map((s) => {
                const sc = statusColor(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleUpdateMeetingStatus(detailMeeting.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                      detailMeeting.status === s
                        ? `${sc.bg} ${sc.text} border-current`
                        : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-white/50 mb-5 font-[family-name:var(--font-montserrat)]">
              <p>
                <span className="text-white/30">Data:</span>{" "}
                {format(parseISO(detailMeeting.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                {" — "}
                {format(new Date(new Date(detailMeeting.scheduled_at).getTime() + detailMeeting.duration_minutes * 60000), "HH:mm")}
                <span className="text-white/20"> ({detailMeeting.duration_minutes}min)</span>
              </p>
              {getContactName(detailMeeting) !== "Interno" && (
                <p><span className="text-white/30">Contato:</span> {getContactName(detailMeeting)}</p>
              )}
              {USERS_MAP[detailMeeting.assigned_to] && (
                <p><span className="text-white/30">Criado por:</span> {USERS_MAP[detailMeeting.assigned_to].name}</p>
              )}
              {detailMeeting.meeting_link && (
                <p>
                  <span className="text-white/30">Link:</span>{" "}
                  <a href={detailMeeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
                    {detailMeeting.meeting_link}
                  </a>
                </p>
              )}
              {detailMeeting.description && (
                <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-white/60 whitespace-pre-wrap">{detailMeeting.description}</p>
                </div>
              )}
            </div>

            {/* Transcription */}
            <div className="mb-5">
              <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                Transcrição / Anotações
              </label>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                rows={6}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors resize-y min-h-[100px] font-[family-name:var(--font-montserrat)]"
                placeholder="Cole aqui a transcrição da reunião, anotações, próximos passos..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveTranscription}
                  disabled={savingTranscription}
                  className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 transition-all text-xs font-semibold disabled:opacity-50 font-[family-name:var(--font-montserrat)]"
                >
                  {savingTranscription ? "Salvando..." : "Salvar anotações"}
                </button>
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary || !transcription.trim()}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/20 transition-all text-xs font-semibold disabled:opacity-50 font-[family-name:var(--font-montserrat)] flex items-center gap-1.5"
                >
                  {generatingSummary ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Gerando...
                    </>
                  ) : (
                    <>🤖 Gerar Resumo I.A.</>
                  )}
                </button>
              </div>
            </div>

            {/* AI Summary */}
            {aiSummary && (
              <div className="mb-5 p-4 rounded-xl bg-purple-500/[0.05] border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">🤖</span>
                  <h4 className="text-xs font-bold text-purple-400 font-[family-name:var(--font-montserrat)]">Resumo I.A.</h4>
                </div>
                <div className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-montserrat)]">
                  {aiSummary}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex gap-2">
                {detailMeeting.status !== "concluido" && (
                  <button
                    onClick={() => handleUpdateMeetingStatus(detailMeeting.id, "concluido")}
                    className="px-4 py-2 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 transition-all text-xs font-semibold font-[family-name:var(--font-montserrat)] flex items-center gap-1.5"
                  >
                    ✓ Concluir reunião
                  </button>
                )}
                {detailMeeting.status !== "cancelado" && detailMeeting.status !== "concluido" && (
                  <button
                    onClick={() => handleUpdateMeetingStatus(detailMeeting.id, "cancelado")}
                    className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/15 transition-all text-xs font-semibold font-[family-name:var(--font-montserrat)]"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <button
                onClick={() => handleDeleteMeeting(detailMeeting.id)}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 transition-all text-xs font-semibold font-[family-name:var(--font-montserrat)]"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── Add Event Modal ──────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl text-white/90"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Novo evento
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Título *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors"
                  placeholder="Ex: Diagnóstico — Empresa X"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Tipo
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, event_type: type.value })}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                        form.event_type === type.value
                          ? type.color
                          : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:bg-white/[0.06]"
                      }`}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors resize-none"
                  placeholder="Detalhes do evento..."
                />
              </div>

              {/* Contact type toggle */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Vincular a
                </label>
                <div className="flex gap-2">
                  {(["interno", "client", "lead"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setContactType(type); if (type === "interno") setForm((f) => ({ ...f, client_id: "", lead_id: "" })); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        contactType === type
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-white/[0.03] text-white/40 border border-white/[0.06]"
                      }`}
                    >
                      {type === "interno" ? "Nenhum" : type === "client" ? "Cliente" : "Lead"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client / Lead dropdown */}
              {contactType === "client" && (
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                    Cliente
                  </label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value, lead_id: "" })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors"
                  >
                    <option value="" className="bg-[#111]">Opcional — selecionar cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#111]">
                        {c.nome} {c.empresa ? `— ${c.empresa}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {contactType === "lead" && (
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                    Lead
                  </label>
                  <select
                    value={form.lead_id}
                    onChange={(e) => setForm({ ...form, lead_id: e.target.value, client_id: "" })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors"
                  >
                    <option value="" className="bg-[#111]">Opcional — selecionar lead</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id} className="bg-[#111]">
                        {l.nome} {l.empresa ? `— ${l.empresa}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Data *
                </label>
                <input
                  required
                  type="date"
                  value={form.scheduled_at_date}
                  onChange={(e) => setForm({ ...form, scheduled_at_date: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Start time + End time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                    Início *
                  </label>
                  <input
                    required
                    type="time"
                    value={form.scheduled_at_time}
                    onChange={(e) => handleTimeChange("scheduled_at_time", e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                    Término *
                  </label>
                  <input
                    required
                    type="time"
                    value={form.end_time}
                    onChange={(e) => handleTimeChange("end_time", e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Duration display */}
              <p className="text-[10px] text-white/25 -mt-2 font-[family-name:var(--font-montserrat)]">
                Duração: {form.duration_minutes} minutos
              </p>

              {/* Location */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Local
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors"
                  placeholder="Escritório, online, endereço..."
                />
              </div>

              {/* Meeting link */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Link da reunião
                </label>
                <input
                  type="url"
                  value={form.meeting_link}
                  onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              {/* Participants (multi-select) */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium font-[family-name:var(--font-montserrat)]">
                  Participantes
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(USERS_MAP).map(([id, user]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleParticipant(id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        form.participants.includes(id)
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {form.participants.includes(id) && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {user.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
                {form.participants.length > 0 && (
                  <p className="text-[10px] text-white/25 mt-1 font-[family-name:var(--font-montserrat)]">
                    {form.participants.length} participante{form.participants.length !== 1 ? "s" : ""} selecionado{form.participants.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-3 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 transition-all text-sm font-semibold disabled:opacity-50 font-[family-name:var(--font-montserrat)]"
              >
                {saving ? "Salvando..." : "Salvar evento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}