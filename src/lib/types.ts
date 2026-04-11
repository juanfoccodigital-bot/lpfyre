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
  // Novos campos
  plano: string | null; // starter, pro, scale, elite
  segmento: string | null;
  site_url: string | null;
  instagram: string | null;
  horario_funcionamento: string | null;
  drive_url: string | null;
  sheets_url: string | null;
  meta_ads_id: string | null;
  meta_token: string | null;
  whatsapp_api_number: string | null;
  tom_de_voz: string | null;
  descricao_negocio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientAutomation {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string; // pendente, em_andamento, concluido
  type: string; // whatsapp_bot, faq_bot, followup, crm_setup, n8n_flow, evolution_setup, outro
  assigned_to: string | null;
  ai_generated: boolean;
  sort_order: number;
  created_at: string;
  completed_at: string | null;
}

export const PLANOS_FYRE = [
  { value: "starter", label: "Starter — R$1.297/mês" },
  { value: "pro", label: "Pro — R$1.997/mês" },
  { value: "scale", label: "Scale — R$2.997/mês" },
  { value: "elite", label: "Elite — Sob consulta" },
  { value: "custom", label: "Personalizado" },
] as const;

export const SEGMENTOS = [
  "Clínica odontológica",
  "Clínica estética",
  "Clínica médica",
  "Imobiliária",
  "Corretora de seguros",
  "E-commerce",
  "Infoprodutor",
  "Serviços B2B",
  "Varejo",
  "Educação",
  "SaaS",
  "Outro",
] as const;

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
  // Etapa 1 — Contrato e pagamento
  { key: "contrato", label: "Contrato assinado", category: "Contratação" },
  { key: "pagamento", label: "Primeiro pagamento confirmado", category: "Contratação" },
  { key: "plano_definido", label: "Plano e escopo definidos", category: "Contratação" },
  // Etapa 2 — Kickoff
  { key: "kickoff", label: "Reunião de kickoff realizada", category: "Kickoff" },
  { key: "dados_empresa", label: "Dados da empresa coletados (segmento, produtos, tom de voz)", category: "Kickoff" },
  { key: "objetivo_definido", label: "Objetivo do 1º mês definido", category: "Kickoff" },
  { key: "metricas_sucesso", label: "Métricas de sucesso alinhadas", category: "Kickoff" },
  // Etapa 3 — Setup
  { key: "grupo_whatsapp", label: "Grupo no WhatsApp criado", category: "Setup" },
  { key: "drive_criado", label: "Drive criado com pastas padrão", category: "Setup" },
  { key: "analise_perfil", label: "Análise de perfil digital realizada", category: "Setup" },
  { key: "cronograma", label: "Cronograma definido", category: "Setup" },
  { key: "acessos_meta", label: "Acessos Meta Ads coletados", category: "Setup" },
  { key: "acessos_instagram", label: "Acesso Instagram coletado", category: "Setup" },
  { key: "acessos_whatsapp", label: "Acesso WhatsApp API configurado", category: "Setup" },
  { key: "crm_configurado", label: "CRM configurado (pipeline + usuários)", category: "Setup" },
  // Etapa 4 — Automações
  { key: "agente_whatsapp", label: "Agente IA WhatsApp configurado", category: "Automação" },
  { key: "agente_testado", label: "Agente IA testado com simulações", category: "Automação" },
  { key: "followup_configurado", label: "Follow-up automático configurado", category: "Automação" },
  { key: "notificacoes", label: "Notificações para equipe configuradas", category: "Automação" },
  // Etapa 5 — Treinamento e Go Live
  { key: "treinamento", label: "Treinamento da equipe realizado", category: "Ativação" },
  { key: "teste_final", label: "Teste final completo com o cliente", category: "Ativação" },
  { key: "aprovacao_cliente", label: "Aprovação do cliente para ativar", category: "Ativação" },
  { key: "go_live", label: "Go live — sistemas em produção", category: "Ativação" },
  { key: "monitoramento_48h", label: "Monitoramento 48h pós-ativação", category: "Ativação" },
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
