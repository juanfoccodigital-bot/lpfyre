import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// User IDs for round-robin assignment
const USERS = {
  juan: "1bab39ad-f161-4da0-b65f-5b56a9e32dd5",
  rodrigo: "50872c28-4457-4642-833b-b512c68b2941",
};

// Alternates between Juan and Rodrigo based on current lead count
async function getNextAssignee(): Promise<string> {
  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  // Even count → Juan, odd → Rodrigo
  return (count ?? 0) % 2 === 0 ? USERS.juan : USERS.rodrigo;
}

interface LeadData {
  empresa?: string;
  segmento?: string;
  faturamento?: string;
  desafio?: string;
  servico?: string;
  whatsapp?: string;
  email?: string;
}

// Map faturamento string to number
function parseFaturamento(value?: string): number | null {
  if (!value) return null;
  if (value.includes("50 mil") && !value.includes("200")) return 50000;
  if (value.includes("200 mil")) return 200000;
  if (value.includes("500 mil")) return 500000;
  if (value.includes("1 milhão")) return 1000000;
  if (value.includes("Acima")) return 1500000;
  return null;
}

// ─── LEADS (Public) ───

export async function createLeadPublic(body: LeadData) {
  const assignee = await getNextAssignee();
  const faturamentoNum = parseFaturamento(body.faturamento);

  const { error } = await supabase.from("leads").insert({
    nome: body.empresa || "Lead",
    empresa: body.empresa || null,
    email: body.email || null,
    telefone: body.whatsapp || null,
    faturamento: faturamentoNum,
    observacoes: [
      body.segmento && `Segmento: ${body.segmento}`,
      body.desafio && `Desafio: ${body.desafio}`,
      body.servico && `Interesse: ${body.servico}`,
      body.faturamento && `Faturamento: ${body.faturamento}`,
    ].filter(Boolean).join("\n"),
    assigned_to: assignee,
    status: "lead_novo",
    resposta: false,
    archived: false,
  });

  if (error) {
    console.error("Erro ao criar lead:", error);
    throw error;
  }
  return { success: true };
}

// ─── PROPOSTAS ───

export interface PropostaData {
  slug: string;
  cliente_nome: string;
  cliente_empresa: string;
  servicos: string[];
  tom: string;
  valor: number;
  valor_desconto: number | null;
  forma_pagamento: string;
  parcelas: number | null;
  validade_dias: number;
  observacoes: string;
  created_at?: string;
}

export async function createProposta(data: PropostaData) {
  const { error } = await supabase.from("propostas").insert({
    slug: data.slug,
    cliente_nome: data.cliente_nome,
    cliente_empresa: data.cliente_empresa,
    servicos: data.servicos,
    tom: data.tom,
    valor: data.valor,
    valor_desconto: data.valor_desconto,
    forma_pagamento: data.forma_pagamento,
    parcelas: data.parcelas,
    validade_dias: data.validade_dias,
    observacoes: data.observacoes,
  });

  if (error) {
    console.error("Erro ao criar proposta:", error);
    throw error;
  }
}

export async function getProposta(slug: string): Promise<PropostaData | null> {
  const { data, error } = await supabase
    .from("propostas")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as PropostaData;
}

export async function listarPropostas(): Promise<PropostaData[]> {
  const { data, error } = await supabase
    .from("propostas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []) as PropostaData[];
}

// ─── FILE UPLOAD ───

export async function uploadFile(file: File, clientId: string): Promise<{ url: string; size: number } | null> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${clientId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from('client-files')
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('Upload error:', error.message, error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('client-files')
    .getPublicUrl(path);

  return { url: urlData.publicUrl, size: file.size };
}

export async function uploadFileToPath(file: File, path: string): Promise<{ url: string; size: number } | null> {
  const { error } = await supabase.storage
    .from('client-files')
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('Upload error:', error.message, error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('client-files')
    .getPublicUrl(path);

  return { url: urlData.publicUrl, size: file.size };
}

// ─── ONBOARDING BRIEFING ───

export interface OnboardingBriefingData {
  cliente_nome: string;
  cliente_empresa: string;
  cliente_email: string;
  cliente_whatsapp: string;
  proposta_ref: string;
  respostas: Record<string, string>;
  arquivos: { nome: string; url: string; tipo: string }[];
  status: "pendente" | "em_analise" | "concluido";
}

export async function createOnboardingBriefing(data: OnboardingBriefingData) {
  const { error } = await supabase.from("onboarding_briefings").insert({
    cliente_nome: data.cliente_nome,
    cliente_empresa: data.cliente_empresa,
    cliente_email: data.cliente_email,
    cliente_whatsapp: data.cliente_whatsapp,
    proposta_ref: data.proposta_ref,
    respostas: data.respostas,
    arquivos: data.arquivos,
    status: data.status,
  });

  if (error) {
    console.error("Erro ao criar briefing:", error);
    throw error;
  }
}

export async function uploadOnboardingFile(file: File, briefingRef: string): Promise<{ nome: string; url: string; tipo: string } | null> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `onboarding/${briefingRef}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from("client-files")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("client-files")
    .getPublicUrl(path);

  return { nome: file.name, url: urlData.publicUrl, tipo: file.type };
}

// ─── LEADS ───

export async function createLead(data: LeadData) {
  const assignedTo = await getNextAssignee();

  const observacoes = [
    data.segmento ? `Segmento: ${data.segmento}` : "",
    data.desafio ? `Desafio: ${data.desafio}` : "",
    data.servico ? `Interesse: ${data.servico}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const { error } = await supabase.from("leads").insert({
    nome: data.empresa || "Lead Site FYRE",
    telefone: data.whatsapp || null,
    email: data.email || null,
    especialidade: data.segmento?.toLowerCase() || null,
    faturamento: parseFaturamento(data.faturamento),
    status: "lead_novo",
    assigned_to: assignedTo,
    observacoes: observacoes || null,
    resposta: false,
    archived: false,
  });

  if (error) {
    console.error("Erro ao criar lead:", error);
    throw error;
  }
}
