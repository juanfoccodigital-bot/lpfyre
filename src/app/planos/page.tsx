"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "1.297",
    tagline: "Sua primeira maquina de atendimento automatico, pronta para operar.",
    audience: "Empresas que nunca automatizaram e querem comecar pelo WhatsApp",
    color: "from-white/10 to-white/5",
    border: "border-white/10",
    badge: null,
    features: {
      agentes: [
        "1 Agente de IA no WhatsApp",
        "Resposta automatica em ate 2 minutos",
        "Qualificacao basica de leads (quente x frio)",
        "Coleta automatica de informacoes do lead",
        "Transferencia para humano com contexto completo",
      ],
      automacoes: [
        "Follow-up automatico ate 3 etapas",
        "Notificacao para vendedor quando lead e qualificado",
        "Confirmacao automatica de reunioes agendadas",
      ],
      crm: [
        "1 pipeline configurado",
        "Ate 2 usuarios com acesso",
        "Visualizacao basica do funil",
        "Historico de conversas do lead",
      ],
      fyremax: ["1 acesso individual", "500 mensagens/mes"],
      suporte: [
        "Grupo exclusivo no WhatsApp",
        "Suporte seg-sex, 9h-18h",
        "Reuniao mensal de 45 minutos",
        "1 sessao de treinamento",
      ],
      relatorio: ["Relatorio mensal basico"],
    },
    notIncluded: [
      "Agente IA no Instagram",
      "Automacao de marketing",
      "Dashboard em tempo real",
      "Acesso ao FYRE Hub",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "1.997",
    tagline:
      "Atendimento, qualificacao e gestao rodando sozinhos no WhatsApp e Instagram.",
    audience: "Quem usa WhatsApp e Instagram como canais principais",
    color: "from-fyre/20 to-fyre/5",
    border: "border-fyre/30",
    badge: "Mais Popular",
    features: {
      agentes: [
        "1 Agente de IA no WhatsApp (avancado)",
        "Qualificacao com perguntas dinamicas",
        "Scoring automatico (quente, morno, frio)",
        "Agendamento automatico de reunioes",
        "1 Agente de IA no Instagram",
        "Resposta automatica em comentarios e Direct",
        "Captura de leads direto pelo Instagram",
      ],
      automacoes: [
        "Follow-up automatico ate 7 etapas",
        "Recuperacao de leads inativos ate 30 dias",
        "Confirmacao e lembrete de reunioes",
        "Notificacoes inteligentes para o time",
        "Respostas automaticas para FAQs",
      ],
      crm: [
        "2 pipelines configurados",
        "Ate 5 usuarios com acesso",
        "Tags e segmentacao automatica",
        "Historico completo de cada lead",
        "Dashboard de performance diario",
      ],
      fyremax: ["3 acessos individuais", "2.000 mensagens/mes por acesso"],
      suporte: [
        "Grupo exclusivo no WhatsApp",
        "Suporte seg-sex, 9h-18h",
        "Reuniao mensal de 45 minutos",
        "Ate 2 sessoes de treinamento",
      ],
      relatorio: [
        "Relatorio mensal detalhado",
        "Leads atendidos por canal",
        "Taxa de qualificacao e conversao",
        "Recomendacoes de melhoria",
      ],
    },
    notIncluded: [
      "Agente IA no site",
      "Automacao de marketing",
      "Acesso ao FYRE Hub",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: "2.997",
    tagline: "Operacao comercial e marketing completos no automatico.",
    audience: "Operacoes com multiplos canais, times e produtos",
    color: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-400/30",
    badge: "Recomendado",
    features: {
      agentes: [
        "1 Agente de IA no WhatsApp (multi-persona)",
        "Atende diferentes produtos e unidades",
        "Qualificacao avancada com scoring dinamico",
        "Upsell e cross-sell automatico",
        "1 Agente de IA no Instagram",
        "Campanhas de resposta por tipo de post",
        "1 Agente de IA no site (chat widget)",
      ],
      automacoes: [
        "Follow-up ilimitado por segmento",
        "Recuperacao de leads ate 90 dias",
        "Automacao de propostas (GeraProposta)",
        "Confirmacao e reagendamento automatico",
        "Automacao de onboarding de clientes",
      ],
      marketing: [
        "Funil de nutricao por segmento",
        "Sequencias de e-mail automatizadas",
        "Jornadas de recompra",
        "Disparos segmentados por comportamento",
      ],
      crm: [
        "Pipelines ilimitados",
        "Ate 10 usuarios com acesso",
        "Automacao de tarefas internas",
        "Dashboard executivo em tempo real",
        "Relatorio semanal de performance",
      ],
      fyremax: ["5 acessos individuais", "5.000 mensagens/mes por acesso"],
      hub: [
        "Acesso ao FYRE Hub",
        "Todos os sistemas FYRE disponiveis",
        "Acesso antecipado a novos produtos",
      ],
      suporte: [
        "Grupo exclusivo no WhatsApp",
        "Suporte seg-sex, 9h-18h",
        "Reuniao mensal de 45 minutos",
        "Treinamento completo da equipe",
      ],
      relatorio: [
        "Relatorio semanal de performance",
        "Analise mensal estrategica com plano de acao",
      ],
    },
    notIncluded: [
      "Agentes de IA ilimitados (add-on disponivel)",
      "Landing Page inclusa (add-on disponivel)",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: null,
    tagline:
      "Tudo da FYRE. Sem limite. Do jeito que sua operacao precisa.",
    audience: "Franquias, redes e operacoes complexas",
    color: "from-amber-400/20 to-yellow-500/10",
    border: "border-amber-400/40",
    badge: "Enterprise",
    features: {
      agentes: [
        "Agentes de IA ilimitados em todos os canais",
        "Configuracao 100% personalizada",
        "Novos agentes sob demanda sem custo",
      ],
      automacoes: [
        "Automacoes ilimitadas em todos os fluxos",
        "Comercial, marketing, operacional e interno",
        "Fluxos customizados sob demanda",
      ],
      crm: [
        "FYRE CRM completo",
        "Usuarios ilimitados",
        "Configuracao 100% sob medida",
        "Dashboards executivos por unidade/time",
      ],
      fyremax: [
        "Acessos ilimitados",
        "Sem limite de mensagens",
        "FyreMax treinada com dados proprios",
      ],
      hub: [
        "Acesso completo ao FYRE Hub",
        "Primeiros a acessar novos produtos",
      ],
      bonus: [
        "1 Landing Page personalizada inclusa (R$1.497)",
        "Integracoes ilimitadas com sistemas externos",
        "Integracoes customizadas via API sob consulta",
      ],
      suporte: [
        "Canal dedicado no WhatsApp",
        "Gerente de conta exclusivo",
        "Suporte seg-sex, 9h-18h",
        "Reuniao mensal de 45 minutos",
        "Treinamento ilimitado",
      ],
      relatorio: [
        "Relatorio semanal de performance",
        "Analise mensal estrategica",
        "Dashboard executivo dedicado",
      ],
    },
    notIncluded: [],
  },
];

const sectionLabels: Record<string, { label: string; icon: string }> = {
  agentes: { label: "Agentes de IA", icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
  automacoes: { label: "Automacoes", icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" },
  marketing: { label: "Marketing", icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 0 1-1.021-.27l-.112-.193a24.618 24.618 0 0 1-2.49-6.828m6.568 0a48.108 48.108 0 0 0 3.478-.716m-3.478.716 1.394-4.182A48.108 48.108 0 0 1 16.023 9.38" },
  crm: { label: "FYRE CRM", icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" },
  fyremax: { label: "FyreMax", icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" },
  hub: { label: "FYRE Hub", icon: "M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" },
  bonus: { label: "Bonus Incluido", icon: "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" },
  suporte: { label: "Suporte", icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
  relatorio: { label: "Relatorios", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
};

const comparisonData = [
  { label: "Mensalidade", starter: "R$1.297", pro: "R$1.997", scale: "R$2.997", elite: "Sob consulta" },
  { label: "Agente IA WhatsApp", starter: "Basico", pro: "Avancado", scale: "Multi-persona", elite: "Ilimitado" },
  { label: "Agente IA Instagram", starter: false, pro: true, scale: true, elite: true },
  { label: "Agente IA no Site", starter: false, pro: false, scale: true, elite: true },
  { label: "Follow-up automatico", starter: "3 etapas", pro: "7 etapas", scale: "Ilimitado", elite: "Ilimitado" },
  { label: "Recuperacao de leads", starter: false, pro: "30 dias", scale: "90 dias", elite: "Ilimitado" },
  { label: "Automacao de marketing", starter: false, pro: false, scale: true, elite: true },
  { label: "GeraProposta integrado", starter: false, pro: false, scale: true, elite: true },
  { label: "Integracoes externas", starter: "Sob consulta", pro: "Sob consulta", scale: "Sob consulta", elite: "Ilimitado" },
  { label: "CRM - Usuarios", starter: "2", pro: "5", scale: "10", elite: "Ilimitado" },
  { label: "CRM - Pipelines", starter: "1", pro: "2", scale: "Ilimitado", elite: "Ilimitado" },
  { label: "Dashboard", starter: false, pro: "Diario", scale: "Tempo real", elite: "Executivo" },
  { label: "FyreMax - Acessos", starter: "1", pro: "3", scale: "5", elite: "Ilimitado" },
  { label: "FyreMax - Limite/mes", starter: "500 msgs", pro: "2.000 msgs", scale: "5.000 msgs", elite: "Sem limite" },
  { label: "FYRE Hub", starter: false, pro: false, scale: true, elite: true },
  { label: "Landing Page inclusa", starter: false, pro: false, scale: false, elite: true },
  { label: "Treinamento", starter: "1 sessao", pro: "2 sessoes", scale: "Completo", elite: "Ilimitado" },
  { label: "Relatorio", starter: "Mensal", pro: "Mensal detalhado", scale: "Semanal", elite: "Dedicado" },
];

function HeroIcon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4 shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
        <svg className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
        <svg className="h-3.5 w-3.5 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return <span className="text-xs text-white/70">{value}</span>;
}

export default function PlanosPage() {
  useScrollReveal();
  const [expandedPlan, setExpandedPlan] = useState<string | null>("pro");

  return (
    <main className="relative min-h-screen">
      <ScrollProgress />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fyre/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-orange-500/[0.05] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-6">
          <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-fyre/30 bg-fyre/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-fyre animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fyre">
              Planos & Precos
            </span>
          </div>

          <h1 className="reveal font-[family-name:var(--font-instrument)] text-4xl tracking-tight text-white sm:text-5xl lg:text-7xl">
            Escolha o plano que vai{" "}
            <span className="italic text-fyre">escalar</span> sua operacao
          </h1>

          <p className="reveal mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/50 sm:text-base">
            Agentes de IA configurados com o contexto do seu negocio, CRM
            proprio, automacoes e suporte dedicado. Tudo na infraestrutura
            da FYRE.
          </p>

          <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] text-white/40">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-fyre" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Suporte via WhatsApp
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-fyre" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Reuniao mensal de 45min
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-fyre" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Treinamento incluido
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-fyre" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Integracoes sob consulta
            </span>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, idx) => {
            const isExpanded = expandedPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`reveal stagger-children group relative flex flex-col rounded-2xl border bg-gradient-to-b p-6 transition-all duration-500 ${plan.border} ${plan.color} ${
                  plan.badge === "Mais Popular"
                    ? "shadow-[0_0_40px_rgba(255,69,0,0.12)]"
                    : ""
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${
                      plan.badge === "Mais Popular"
                        ? "bg-fyre text-white"
                        : plan.badge === "Enterprise"
                        ? "bg-amber-400 text-black"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-[11px] font-light text-white/40">
                    {plan.audience}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] font-light text-white/40">
                        R$
                      </span>
                      <span className="font-[family-name:var(--font-instrument)] text-4xl tracking-tight text-white">
                        {plan.price}
                      </span>
                      <span className="text-[11px] font-light text-white/40">
                        /mes
                      </span>
                    </div>
                  ) : (
                    <span className="font-[family-name:var(--font-instrument)] text-3xl tracking-tight text-white">
                      Sob consulta
                    </span>
                  )}
                </div>

                {/* Tagline */}
                <p className="mb-6 text-xs font-light leading-relaxed text-white/50">
                  &ldquo;{plan.tagline}&rdquo;
                </p>

                {/* CTA */}
                <a
                  href="#contato"
                  className={`mb-6 block rounded-lg py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                    plan.badge === "Mais Popular"
                      ? "bg-fyre text-white hover:bg-fyre-dark hover:shadow-[0_0_20px_rgba(255,69,0,0.4)]"
                      : plan.badge === "Enterprise"
                      ? "bg-amber-400 text-black hover:bg-amber-300"
                      : "border border-white/20 text-white hover:bg-white hover:text-black"
                  }`}
                >
                  {plan.price ? "Comecar Agora" : "Falar com Especialista"}
                </a>

                {/* Expand/Collapse */}
                <button
                  onClick={() =>
                    setExpandedPlan(isExpanded ? null : plan.id)
                  }
                  className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white/50 transition-colors hover:text-white"
                >
                  {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                  <svg
                    className={`h-3 w-3 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Features detail */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-5 border-t border-white/10 pt-5">
                    {Object.entries(plan.features).map(([key, items]) => {
                      const section = sectionLabels[key];
                      if (!section) return null;
                      return (
                        <div key={key}>
                          <div className="mb-2 flex items-center gap-2 text-white/70">
                            <HeroIcon d={section.icon} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                              {section.label}
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {items.map((item: string, i: number) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-[11px] font-light text-white/50"
                              >
                                <svg
                                  className="mt-0.5 h-3 w-3 shrink-0 text-fyre/70"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m4.5 12.75 6 6 9-13.5"
                                  />
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}

                    {/* Not included */}
                    {plan.notIncluded.length > 0 && (
                      <div>
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
                          Nao inclui
                        </div>
                        <ul className="space-y-1.5">
                          {plan.notIncluded.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-[11px] font-light text-white/30"
                            >
                              <svg
                                className="mt-0.5 h-3 w-3 shrink-0 text-white/15"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18 18 6M6 6l12 12"
                                />
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FYRE Assets Section */}
      <section className="relative border-t border-white/5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-fyre/[0.04] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 sm:px-6">
          <div className="reveal mb-12 text-center">
            <h2 className="font-[family-name:var(--font-instrument)] text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ativos <span className="italic text-fyre">proprios</span> da FYRE
            </h2>
            <p className="mt-3 text-sm font-light text-white/40">
              Tecnologia desenvolvida internamente para maximizar seus resultados.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "FyreMax",
                desc: "IA propria estilo GPT treinada para negocios, com acesso por login e limite por plano.",
                icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z",
              },
              {
                title: "FYRE CRM",
                desc: "CRM proprio na infraestrutura da FYRE, com acesso liberado por plano.",
                icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
              },
              {
                title: "FYRE Hub",
                desc: "Portal com todos os sistemas da FYRE, disponivel a partir do plano Scale.",
                icon: "M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z",
              },
              {
                title: "FYRE Agents",
                desc: "Agentes de IA configurados por nicho e canal, prontos para operar.",
                icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
              },
            ].map((asset, idx) => (
              <div
                key={idx}
                className="reveal glass-card rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-fyre/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-fyre"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={asset.icon}
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">
                  {asset.title}
                </h3>
                <p className="text-[11px] font-light leading-relaxed text-white/40">
                  {asset.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative border-t border-white/5 py-20 sm:py-28">
        <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
          <div className="reveal mb-12 text-center">
            <h2 className="font-[family-name:var(--font-instrument)] text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
              Compare os <span className="italic text-fyre">planos</span>
            </h2>
            <p className="mt-3 text-sm font-light text-white/40">
              Veja lado a lado tudo que cada plano oferece.
            </p>
          </div>

          <div className="reveal overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                    Recurso
                  </th>
                  {["Starter", "Pro", "Scale", "Elite"].map((name) => (
                    <th
                      key={name}
                      className="px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70"
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                      idx % 2 === 0 ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    <td className="px-5 py-3 text-[11px] font-medium text-white/60">
                      {row.label}
                    </td>
                    {(["starter", "pro", "scale", "elite"] as const).map(
                      (plan) => (
                        <td key={plan} className="px-4 py-3 text-center">
                          <CellValue value={row[plan]} />
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative border-t border-white/5 py-20 sm:py-28">
        <div className="relative mx-auto max-w-3xl px-5 sm:px-6">
          <div className="reveal mb-12 text-center">
            <h2 className="font-[family-name:var(--font-instrument)] text-3xl tracking-tight text-white sm:text-4xl">
              Perguntas <span className="italic text-fyre">frequentes</span>
            </h2>
          </div>

          <div className="reveal space-y-4">
            {[
              {
                q: "Posso trocar de plano depois?",
                a: "Sim, voce pode fazer upgrade a qualquer momento. A diferenca e cobrada proporcionalmente ao periodo restante.",
              },
              {
                q: "O que acontece se eu atingir o limite do FyreMax?",
                a: "Voce recebe uma notificacao antes de atingir o limite. Caso ultrapasse, o acesso e pausado ate a renovacao mensal ou voce pode contratar mensagens adicionais.",
              },
              {
                q: "Como funciona o agente de IA no WhatsApp?",
                a: "O agente e configurado com o contexto completo da sua empresa: produtos, servicos, precos, tom de voz. Ele responde automaticamente, qualifica leads e transfere para humano quando necessario, com todo o contexto da conversa.",
              },
              {
                q: "Preciso de conhecimento tecnico para usar?",
                a: "Nao. Nos cuidamos de toda a configuracao e treinamento. Seu time recebe treinamento completo e suporte dedicado via WhatsApp.",
              },
              {
                q: "Como funcionam as integracoes com sistemas externos?",
                a: "Todas as integracoes sao avaliadas sob consulta para garantir compatibilidade e seguranca. No plano Elite, as integracoes sao ilimitadas com possibilidade de desenvolvimento customizado.",
              },
              {
                q: "Tem contrato de fidelidade?",
                a: "Nao exigimos fidelidade minima. Acreditamos que voce vai ficar porque os resultados falam por si.",
              },
            ].map((item, idx) => (
              <FaqItem key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-white/5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fyre/[0.06] blur-[120px]" />
        </div>
        <div className="reveal relative mx-auto max-w-3xl px-5 text-center sm:px-6">
          <h2 className="font-[family-name:var(--font-instrument)] text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
            Pronto para <span className="italic text-fyre">escalar</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm font-light text-white/40">
            Agende seu diagnostico gratuito e descubra qual plano e ideal
            para a sua operacao.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#contato" className="cta-button">
              QUERO MEU DIAGNOSTICO
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button-outline"
            >
              FALAR NO WHATSAPP
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/15">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="pr-4 text-sm font-medium text-white/80">
          {question}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-6 pb-4 text-[13px] font-light leading-relaxed text-white/45">
          {answer}
        </p>
      </div>
    </div>
  );
}
