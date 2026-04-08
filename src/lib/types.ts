export interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  telefone: string | null;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  especialidade: string | null;
  faturamento: number | null;
  status: string;
  assigned_to: string;
  observacoes: string | null;
  resposta: boolean;
  archived: boolean;
  empresa: string | null;
  cidade: string | null;
  estado: string | null;
  fonte: string | null;
  kanban_order: number;
  valor_estimado: number | null;
  ultimo_contato: string | null;
  proximo_contato: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Client {
  id: string;
  lead_id: string | null;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  cpf_cnpj: string | null;
  servicos: string[];
  tipo_pagamento: string; // mensal, projeto, avista
  valor_mensal: number | null;
  valor_projeto: number | null;
  dia_vencimento: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: string; // ativo, pausado, cancelado
  observacoes: string | null;
  assigned_to: string;
  cidade: string | null;
  estado: string | null;
  payment_link: string | null;
  contract_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingItem {
  id: string;
  client_id: string;
  item_key: string;
  item_label: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  sort_order: number;
}

export interface FinancialTransaction {
  id: string;
  client_id: string | null;
  type: string; // receita, despesa
  category: string | null;
  description: string;
  amount: number;
  status: string; // pendente, pago, atrasado, cancelado
  due_date: string | null;
  paid_date: string | null;
  is_recurring: boolean;
  recurrence_day: number | null;
  payment_link: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  client_id: string | null;
  lead_id: string | null;
  // DB columns are Portuguese (titulo, descricao), but we normalize to English after fetch
  titulo?: string;
  descricao?: string | null;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string | null;
  status: string;
  assigned_to: string;
  notes: string | null;
  observacoes: string | null;
  created_at: string;
}

/**
 * Normalizes a meeting row from Supabase (which uses Portuguese column names)
 * into the Meeting interface with English property names for the UI.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeMeeting(row: any): any {
  return {
    ...row,
    title: row.titulo || row.title || "",
    description: row.descricao ?? row.description ?? null,
  };
}

export interface ClientFile {
  id: string;
  client_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export const KANBAN_COLUMNS = [
  {
    key: "lead_novo",
    label: "Lead Novo",
    color: "bg-blue-500/20 text-blue-400",
    icon: "1️⃣",
    action: "Ligar em até 5 min",
    hint: "Lead chegou no WhatsApp. Ação imediata: 1ª ligação.",
  },
  {
    key: "primeiro_contato",
    label: "1° Contato",
    color: "bg-cyan-500/20 text-cyan-400",
    icon: "📞",
    action: "Primeiro contato realizado",
    hint: "Atendeu → Qualificar. Não atendeu → Enviar vídeo bolinha + fotos de resultado.",
  },
  {
    key: "qualificado",
    label: "Qualificado",
    color: "bg-yellow-500/20 text-yellow-400",
    icon: "🎯",
    action: "Lead qualificado",
    hint: "Entendeu necessidade, faturamento, desafios. Se qualificado → iniciar follow-ups.",
  },
  {
    key: "follow_up_1",
    label: "1° Follow Up",
    color: "bg-teal-500/20 text-teal-400",
    icon: "🔄",
    action: "1° Follow Up",
    hint: "Primeiro follow-up após qualificação. Enviar material relevante, cases, provas sociais.",
  },
  {
    key: "follow_up_2",
    label: "2° Follow Up",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: "🔄",
    action: "2° Follow Up",
    hint: "Segundo follow-up. Reforçar valor, enviar áudio humanizado, vídeo técnico.",
  },
  {
    key: "follow_up_3",
    label: "3° Follow Up",
    color: "bg-green-600/20 text-green-500",
    icon: "🔄",
    action: "3° Follow Up",
    hint: "Terceiro e último follow-up. Se não interagir → Potencial Cliente Futuro.",
  },
  {
    key: "agendado",
    label: "Agendado",
    color: "bg-orange-500/20 text-orange-400",
    icon: "📅",
    action: "Reunião marcada",
    hint: "Diagnóstico/call agendado. Enviar conteúdos de aquecimento até o dia.",
  },
  {
    key: "call_realizada",
    label: "Call Realizada",
    color: "bg-amber-500/20 text-amber-400",
    icon: "✅",
    action: "Call feita",
    hint: "Reunião realizada. Preparar e enviar proposta comercial.",
  },
  {
    key: "proposta_encaminhada",
    label: "Proposta Encaminhada",
    color: "bg-purple-500/20 text-purple-400",
    icon: "📄",
    action: "Proposta enviada",
    hint: "Proposta enviada ao lead. Aguardar retorno e iniciar negociação.",
  },
  {
    key: "em_negociacao",
    label: "Em Negociação",
    color: "bg-pink-500/20 text-pink-400",
    icon: "🤝",
    action: "Negociando",
    hint: "Lead analisando proposta. Tirar dúvidas, negociar valores, quebrar objeções.",
  },
  {
    key: "venda_realizada",
    label: "Venda Realizada",
    color: "bg-green-500/20 text-green-400",
    icon: "🏆",
    action: "Fechou!",
    hint: "Lead convertido em cliente! Iniciar processo de onboarding.",
  },
  {
    key: "potencial_cliente_futuro",
    label: "Potencial Futuro",
    color: "bg-slate-500/20 text-slate-400",
    icon: "🕐",
    action: "Futuro",
    hint: "Não fechou agora mas tem potencial. Manter nutrição periódica e retomar contato futuramente.",
  },
  {
    key: "perdido",
    label: "Perdido",
    color: "bg-red-500/20 text-red-400",
    icon: "❌",
    action: "Não fechou",
    hint: "Lead descartado ou sem fit. Motivo deve estar nas observações.",
  },
] as const;

export const ONBOARDING_TEMPLATE = [
  { key: "grupo_whatsapp", label: "Grupo no WhatsApp criado" },
  { key: "portal_drive", label: "Portal do Cliente (Drive) criado" },
  { key: "briefing", label: "Briefing enviado e preenchido" },
  { key: "acessos", label: "Acessos recebidos" },
  { key: "kickoff", label: "Call de kickoff realizada" },
  { key: "contrato", label: "Contrato assinado" },
  { key: "pagamento", label: "Primeiro pagamento confirmado" },
  { key: "setup", label: "Setup inicial concluído" },
  { key: "primeira_entrega", label: "Primeira entrega realizada" },
];

export const USERS_MAP: Record<string, { name: string; username: string }> = {
  "1bab39ad-f161-4da0-b65f-5b56a9e32dd5": { name: "Juan Mansilha", username: "juanmansilha" },
  "50872c28-4457-4642-833b-b512c68b2941": { name: "Rodrigo Lopes", username: "rodrigolopes" },
};

const DEFAULT_DDD = "41";

/** Normalizes a Brazilian phone to wa.me format: 55 + DDD + number */
export function formatWhatsApp(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  // Already has country code (55) + DDD + number (13 digits)
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  // Has DDD + number (10-11 digits like 41999999999)
  if (digits.length >= 10) return `55${digits}`;
  // Only number without DDD (8-9 digits) - add default DDD
  if (digits.length >= 8) return `55${DEFAULT_DDD}${digits}`;
  return `55${DEFAULT_DDD}${digits}`;
}

// ─── PORTAL DO CLIENTE ───

export interface ClientPortalUser {
  id: string;
  client_id: string;
  username: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface ClientUpdate {
  id: string;
  client_id: string;
  title: string;
  content: string;
  type: string; // update, insight, report, alert
  author_id: string;
  created_at: string;
}

export interface ClientLesson {
  id: string;
  client_id: string | null; // null = global for all clients
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface TrafficData {
  id: string;
  client_id: string;
  date: string;
  platform: string; // meta, google, tiktok
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  conversions: number;
  revenue: number;
  cpc: number;
  cpl: number;
  cpa: number;
  roas: number;
  created_at: string;
}
