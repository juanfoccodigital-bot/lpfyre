"use client";

import { useState, useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────── */

type TabKey = "inbound" | "outbound" | "indicacao";

/* ────────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────────── */

export default function ModeloDeVendasPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("inbound");
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Scroll reveal */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-30px" }
    );

    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children"
    );
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  /* Re-observe on tab change */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const elements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children"
      );
      elements.forEach((el) => observerRef.current?.observe(el));
    }, 50);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const spinText = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";

  const tabs: { key: TabKey; label: string }[] = [
    { key: "inbound", label: "Modelo Inbound" },
    { key: "outbound", label: "Modelo Outbound" },
    { key: "indicacao", label: "Modelo Indicação" },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#00FF88]/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* ───── HEADER ───── */}
      <header className="relative z-10 pt-10 sm:pt-16 pb-6 px-5">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Spinning Logo */}
          <div className="relative w-28 h-28 mb-8 reveal">
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <defs>
                <path
                  id="modelCirclePath"
                  d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                />
              </defs>
              <text
                className="fill-white/30"
                style={{
                  fontSize: "7.5px",
                  letterSpacing: "3px",
                  fontFamily: "var(--font-montserrat)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <textPath href="#modelCirclePath">{spinText}</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/logo-fyre-circle.png"
                alt="FYRE Automação & I.A"
                className="w-7 h-auto"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-3 text-center reveal">
            Modelos de <span className="text-gradient italic">Vendas</span>
          </h1>
          <p className="text-xs sm:text-sm font-light text-white/40 leading-relaxed text-center max-w-md reveal">
            Estruturas de funil, scripts e fechamento — ProspectaFYRE
          </p>
        </div>
      </header>

      {/* ───── STICKY TABS ───── */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 border-b-2 ${
                activeTab === tab.key
                  ? "text-white border-[#00FF88]"
                  : "text-white/30 border-transparent hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ───── CONTENT ───── */}
      <main className="relative z-10 max-w-3xl mx-auto px-5 py-12 sm:py-16">
        {activeTab === "inbound" && <InboundModel />}
        {activeTab === "outbound" && <OutboundModel />}
        {activeTab === "indicacao" && <IndicacaoModel />}
      </main>

      {/* ───── FOOTER ───── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-5">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
          <img
            src="/images/logo-fyre-circle.png"
            alt="FYRE"
            className="w-6 h-auto opacity-30"
          />
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/20">
            Documento interno FYRE Automação & I.A
          </p>
          <p className="text-[10px] font-light text-white/15">
            Atualizado em Março 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════════════════════ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF88]/60 mb-2 block reveal">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-6 reveal">
      {children}
    </h2>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-5 sm:p-6 reveal ${className}`}
    >
      {children}
    </div>
  );
}

function ScriptStep({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-7 h-7 rounded-full border border-[#00FF88]/30 bg-[#00FF88]/5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[10px] font-bold text-[#00FF88]/70">
          {number}
        </span>
      </div>
      <div className="text-xs sm:text-sm font-light text-white/60 leading-relaxed flex-1">
        {children}
      </div>
    </div>
  );
}

function Separator() {
  return <div className="separator my-12 sm:my-16" />;
}

function ObjectionCard({
  objection,
  response,
}: {
  objection: string;
  response: string;
}) {
  return (
    <GlassCard className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-[#00FF88]/50 text-xs font-bold mt-0.5">OBJ</span>
        <p className="text-xs sm:text-sm font-semibold text-white/80 italic">
          &ldquo;{objection}&rdquo;
        </p>
      </div>
      <div className="border-t border-white/[0.06] pt-3">
        <div className="flex items-start gap-2">
          <span className="text-white/30 text-xs font-bold mt-0.5">RSP</span>
          <p className="text-xs sm:text-sm font-light text-white/50 leading-relaxed">
            &ldquo;{response}&rdquo;
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

/* ─── Funnel flow diagram ─── */
function FunnelNode({
  text,
  accent = false,
  small = false,
}: {
  text: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-2.5 text-center ${
        accent
          ? "border-[#00FF88]/30 bg-[#00FF88]/5"
          : "border-white/[0.08] bg-white/[0.03]"
      } ${small ? "text-[10px]" : "text-xs"} font-medium ${
        accent ? "text-[#00FF88]/80" : "text-white/60"
      }`}
    >
      {text}
    </div>
  );
}

function FunnelArrow() {
  return (
    <div className="flex justify-center py-1.5">
      <div className="w-px h-5 bg-white/10 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-white/10" />
      </div>
    </div>
  );
}

function FunnelBranch({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(50%-1.5rem)] h-px bg-white/10" />
      <div className="space-y-2">{left}</div>
      <div className="space-y-2">{right}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MODEL 1 — INBOUND
   ════════════════════════════════════════════════════════ */

function InboundModel() {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-10 reveal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
            Modelo 01
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2">
          Inbound <span className="text-gradient italic">Lead</span>
        </h2>
        <p className="text-xs sm:text-sm font-light text-white/40">
          Lead que veio pelo site, Instagram ou bio link
        </p>
      </div>

      {/* ─── FUNNEL VISUAL ─── */}
      <SectionLabel>Funil Visual</SectionLabel>
      <SectionTitle>
        Fluxo de <span className="text-gradient italic">atendimento</span>
      </SectionTitle>

      <GlassCard className="space-y-2 mb-2">
        <FunnelNode text="Lead chega (site / Instagram / bio)" accent />
        <div className="flex justify-center">
          <span className="text-[9px] font-bold tracking-wider uppercase text-[#00FF88]/40 py-1">
            5 min max
          </span>
        </div>
        <FunnelArrow />
        <FunnelNode text="1a Ligacao" />
        <FunnelArrow />
        <FunnelBranch
          left={
            <>
              <div className="text-[10px] font-semibold text-[#00FF88]/50 text-center mb-1">
                Atendeu
              </div>
              <FunnelNode text="Qualificacao" small />
              <FunnelArrow />
              <FunnelNode text="Agendamento" small />
              <FunnelArrow />
              <FunnelNode text="Diagnostico" small />
              <FunnelArrow />
              <FunnelNode text="Proposta" small />
              <FunnelArrow />
              <FunnelNode text="Fechamento" accent small />
            </>
          }
          right={
            <>
              <div className="text-[10px] font-semibold text-white/30 text-center mb-1">
                Nao atendeu
              </div>
              <FunnelNode text="WhatsApp: Video bolinha + Fotos resultado" small />
              <FunnelArrow />
              <FunnelNode text="2a Ligacao (2-3h depois)" small />
              <FunnelArrow />
              <div className="grid grid-cols-1 gap-2">
                <FunnelNode text="Atendeu → Qualificacao" small />
                <div className="text-center text-[9px] text-white/20 font-medium">ou</div>
                <FunnelNode text="Nao atendeu → Audio + Video tecnico" small />
                <FunnelArrow />
                <FunnelNode text="3a Ligacao (dia seguinte)" small />
                <FunnelArrow />
                <div className="grid grid-cols-1 gap-2">
                  <FunnelNode text="Atendeu → Qualificacao" small />
                  <div className="text-center text-[9px] text-white/20 font-medium">ou</div>
                  <FunnelNode text="Nao atendeu → Texto + Link → Lead Frio" small />
                </div>
              </div>
            </>
          }
        />
      </GlassCard>

      <Separator />

      {/* ─── SCRIPT DE QUALIFICACAO ─── */}
      <SectionLabel>Script</SectionLabel>
      <SectionTitle>
        Qualificacao do <span className="text-gradient italic">lead</span>
      </SectionTitle>

      <GlassCard className="space-y-5">
        <ScriptStep number={1}>
          <span className="text-white/80">&ldquo;Oi [Nome], tudo bem? Aqui é o [Juan/Rodrigo] da FYRE Automação & I.A. Vi que você demonstrou interesse no [serviço/diagnóstico]. Posso te fazer umas perguntas rápidas pra entender melhor seu cenário?&rdquo;</span>
        </ScriptStep>
        <ScriptStep number={2}>
          <span className="text-white/80">&ldquo;Qual é o segmento da sua empresa?&rdquo;</span>
        </ScriptStep>
        <ScriptStep number={3}>
          <span className="text-white/80">&ldquo;Quanto vocês faturam por mês, mais ou menos?&rdquo;</span>
        </ScriptStep>
        <ScriptStep number={4}>
          <span className="text-white/80">&ldquo;Qual o principal desafio que vocês enfrentam hoje? Geração de leads? Conversão? Escala?&rdquo;</span>
        </ScriptStep>
        <ScriptStep number={5}>
          <span className="text-white/80">&ldquo;Já tentaram automatizar algum processo comercial ou de marketing antes? Como foi a experiência?&rdquo;</span>
        </ScriptStep>
        <ScriptStep number={6}>
          <span className="text-white/80">&ldquo;Vocês têm equipe comercial ou é você que toca tudo?&rdquo;</span>
        </ScriptStep>
        <ScriptStep number={7}>
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#00FF88]/50">
              Decisão: Se fatura +50k e tem dor real
            </span>
            <p className="text-white/80">
              &ldquo;Perfeito, [Nome]. Pelo que você me falou, faz total sentido a gente conversar com mais profundidade. Quero te mostrar como a FYRE pode montar uma estrutura personalizada pro seu negócio. Posso agendar um diagnóstico gratuito de 30 minutos?&rdquo;
            </p>
          </div>
        </ScriptStep>
      </GlassCard>

      <Separator />

      {/* ─── SCRIPT DE AGENDAMENTO ─── */}
      <SectionLabel>Script</SectionLabel>
      <SectionTitle>
        <span className="text-gradient italic">Agendamento</span>
      </SectionTitle>

      <GlassCard>
        <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed italic">
          &ldquo;Show me, vou te mandar o link do calendário. Mas antes — nos próximos dias até o diagnóstico, vou te enviar uns conteúdos que vão te ajudar a enxergar onde seu negócio pode estar perdendo dinheiro. Combinado?&rdquo;
        </p>
      </GlassCard>

      <Separator />

      {/* ─── CADENCIA DE AQUECIMENTO ─── */}
      <SectionLabel>Cadência</SectionLabel>
      <SectionTitle>
        Aquecimento <span className="text-gradient italic">pré-diagnóstico</span>
      </SectionTitle>

      <div className="space-y-3 stagger-children">
        {[
          {
            day: "D-3",
            text: "Case de resultado similar ao nicho do lead",
          },
          {
            day: "D-2",
            text: "Conteúdo educativo sobre o principal desafio mencionado",
          },
          {
            day: "D-1",
            text: "Depoimento de cliente + lembrete da reunião",
          },
          {
            day: "D-0",
            text: '"Nos vemos às [horário]! Preparei uma análise personalizada do seu cenário."',
            sub: "Manhã do diagnóstico",
          },
        ].map((item) => (
          <div
            key={item.day}
            className="glass-card rounded-xl p-4 flex items-start gap-4"
          >
            <div className="min-w-[48px] h-8 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#00FF88]/70 tracking-wider">
                {item.day}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-light text-white/60 leading-relaxed">
                {item.text}
              </p>
              {item.sub && (
                <p className="text-[10px] font-light text-white/25 mt-1">
                  {item.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* ─── SCRIPT DE DIAGNOSTICO ─── */}
      <SectionLabel>Script</SectionLabel>
      <SectionTitle>
        Diagnóstico <span className="text-gradient italic">30 min</span>
      </SectionTitle>

      <GlassCard className="space-y-5">
        <ScriptStep number={1}>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/30 block mb-1">
              5 min — Rapport
            </span>
            <span className="text-white/80">
              &ldquo;Como está o cenário desde que conversamos?&rdquo;
            </span>
          </div>
        </ScriptStep>
        <ScriptStep number={2}>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/30 block mb-1">
              10 min — Diagnóstico
            </span>
            <span className="text-white/80">
              Mostrar gaps usando framework A.R.Q.U.E. — Análise, Reconhecimento, Qualificação, Unificação, Escala
            </span>
          </div>
        </ScriptStep>
        <ScriptStep number={3}>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/30 block mb-1">
              5 min — Apresentar Solução
            </span>
            <span className="text-white/80">
              Mostrar /apresentacao com slides
            </span>
          </div>
        </ScriptStep>
        <ScriptStep number={4}>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/30 block mb-1">
              5 min — Proposta
            </span>
            <span className="text-white/80">
              Abrir proposta gerada em /proposta/[slug]
            </span>
          </div>
        </ScriptStep>
        <ScriptStep number={5}>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/30 block mb-1">
              5 min — Fechamento
            </span>
            <span className="text-white/80">
              &ldquo;Com base no que vimos, quanto você acha que está perdendo por mês sem essa estrutura? ... Nosso investimento é X. Se a gente começar hoje, em 30 dias você já vai ter [resultado específico]. Faz sentido pra você?&rdquo;
            </span>
          </div>
        </ScriptStep>
      </GlassCard>

      <Separator />

      {/* ─── QUEBRA DE OBJECOES ─── */}
      <SectionLabel>Fechamento</SectionLabel>
      <SectionTitle>
        Quebra de <span className="text-gradient italic">objeções</span>
      </SectionTitle>

      <div className="space-y-4 stagger-children">
        <ObjectionCard
          objection="Vou pensar"
          response="Entendo. O que especificamente você precisa avaliar? Quero te ajudar a tomar a melhor decisão — com ou sem a FYRE."
        />
        <ObjectionCard
          objection="Tá caro"
          response="Quanto você investe hoje em marketing sem saber o retorno exato? Nosso diagnóstico mostrou que você está perdendo R$X/mês. O investimento na FYRE se paga em [prazo]."
        />
        <ObjectionCard
          objection="Já contratei agência"
          response="Entendo a frustração. A diferença é que a FYRE constrói sistema, não dependência. Tudo que construímos fica com você. Se a gente parar, o ativo é seu."
        />
        <ObjectionCard
          objection="Preciso falar com meu sócio"
          response="Claro. Quer que eu prepare um resumo executivo pra você apresentar? Ou melhor, posso fazer uma call rápida de 15 min com vocês dois?"
        />
        <ObjectionCard
          objection="Não é o momento"
          response="Respeito. Mas me diz: o que precisa mudar no seu negócio pro momento ser 'certo'? Porque geralmente, cada mês sem estrutura é dinheiro na mesa."
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MODEL 2 — OUTBOUND
   ════════════════════════════════════════════════════════ */

function OutboundModel() {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-10 reveal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
            Modelo 02
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2">
          Outbound <span className="text-gradient italic">Prospecção</span>
        </h2>
        <p className="text-xs sm:text-sm font-light text-white/40">
          Prospecção ativa — você vai até o lead
        </p>
      </div>

      {/* ─── ONDE ENCONTRAR LEADS ─── */}
      <SectionLabel>Fontes</SectionLabel>
      <SectionTitle>
        Onde encontrar <span className="text-gradient italic">leads</span>
      </SectionTitle>

      <div className="space-y-2 stagger-children mb-2">
        {[
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="18" cy="6" r="1.5" fill="currentColor" />
              </svg>
            ),
            title: "Instagram",
            desc: "Perfis de empresários no nicho-alvo, comentários em posts de concorrentes",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            ),
            title: "LinkedIn",
            desc: "Decisores de empresas com 10-200 funcionários",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            ),
            title: "Google Maps",
            desc: "Empresas locais por segmento",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            ),
            title: "Indicações de clientes atuais",
            desc: "Peça referências de forma estruturada",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            title: "Eventos e networking",
            desc: "Presencial e online",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="glass-card rounded-xl p-4 flex items-start gap-4"
          >
            <div className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/30 flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-white/70 mb-0.5">
                {item.title}
              </p>
              <p className="text-[10px] sm:text-xs font-light text-white/40">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* ─── SCRIPTS DE ABORDAGEM FRIA ─── */}
      <SectionLabel>Scripts</SectionLabel>
      <SectionTitle>
        Abordagem <span className="text-gradient italic">fria</span>
      </SectionTitle>

      <div className="space-y-6">
        {/* Instagram DM */}
        <div className="reveal">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]/50" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/40">
              Instagram DM
            </span>
          </div>
          <GlassCard>
            <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed italic">
              &ldquo;Oi [Nome], vi seu perfil e percebi que você tem um negócio forte em [segmento]. Tenho uma pergunta sincera: você sabe exatamente quanto custa pra adquirir cada cliente novo? Pergunto porque a maioria dos empresários que fatura na faixa dos [R$X] não sabe — e quando descobre, muda completamente a operação. Se tiver 2 minutos, posso te mostrar como calculamos isso pros nossos clientes.&rdquo;
            </p>
          </GlassCard>
        </div>

        {/* LinkedIn */}
        <div className="reveal">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]/50" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/40">
              LinkedIn
            </span>
          </div>
          <GlassCard>
            <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed italic">
              &ldquo;[Nome], acompanho a [Empresa] e percebi que vocês estão em um momento de crescimento. Trabalho com arquitetura de crescimento para empresas do segmento de [X] — ajudamos a estruturar automação, IA e processos pra escalar sem perder margem. Posso te mandar um diagnóstico rápido do que enxergo como oportunidade? Sem compromisso.&rdquo;
            </p>
          </GlassCard>
        </div>

        {/* WhatsApp */}
        <div className="reveal">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]/50" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/40">
              WhatsApp
            </span>
          </div>
          <GlassCard>
            <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed italic">
              &ldquo;Oi [Nome], aqui é o [Juan/Rodrigo] da FYRE Automação & I.A. Cheguei até você por [fonte]. Trabalho com empresários que faturam acima de R$50k/mês e querem escalar com estrutura. Vi que a [Empresa] tem potencial pra crescer muito, mas percebi alguns pontos que podem estar travando. Posso te mostrar em 5 minutos?&rdquo;
            </p>
          </GlassCard>
        </div>
      </div>

      <Separator />

      {/* ─── FUNIL OUTBOUND ─── */}
      <SectionLabel>Funil</SectionLabel>
      <SectionTitle>
        Fluxo <span className="text-gradient italic">outbound</span>
      </SectionTitle>

      <GlassCard className="space-y-2">
        <FunnelNode text="Abordagem inicial" accent />
        <FunnelArrow />
        <FunnelNode text="Resposta?" />
        <FunnelArrow />
        <FunnelBranch
          left={
            <>
              <div className="text-[10px] font-semibold text-[#00FF88]/50 text-center mb-1">
                Sim
              </div>
              <FunnelNode text="Qualificar" small />
              <FunnelArrow />
              <FunnelNode text="Mesmo fluxo Inbound" accent small />
            </>
          }
          right={
            <>
              <div className="text-[10px] font-semibold text-white/30 text-center mb-1">
                Não
              </div>
              <FunnelNode text="Follow-up em 3 dias" small />
              <FunnelArrow />
              <div className="grid grid-cols-1 gap-2">
                <FunnelNode text="Resposta → Qualificar" small />
                <div className="text-center text-[9px] text-white/20 font-medium">ou</div>
                <FunnelNode text="Sem resposta → Follow-up 7 dias → Lead Frio" small />
              </div>
            </>
          }
        />
      </GlassCard>

      <Separator />

      {/* ─── CADENCIA FOLLOW-UP ─── */}
      <SectionLabel>Cadência</SectionLabel>
      <SectionTitle>
        Follow-up <span className="text-gradient italic">outbound</span>
      </SectionTitle>

      <div className="space-y-3 stagger-children">
        {[
          {
            day: "D+0",
            text: "Abordagem inicial",
          },
          {
            day: "D+3",
            text: '"Conseguiu ver minha mensagem? Sem pressão, só queria saber se faz sentido pra você."',
          },
          {
            day: "D+7",
            text: "Enviar conteúdo relevante pro nicho (post, vídeo, case)",
          },
          {
            day: "D+14",
            text: '"Última tentativa: preparei uma análise rápida da [Empresa]. Posso te enviar?"',
          },
          {
            day: "D+21",
            text: "Move pra Lead Frio, nutrição mensal",
            sub: "Fim da cadência ativa",
          },
        ].map((item) => (
          <div
            key={item.day}
            className="glass-card rounded-xl p-4 flex items-start gap-4 reveal"
          >
            <div className="min-w-[52px] h-8 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#00FF88]/70 tracking-wider">
                {item.day}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-light text-white/60 leading-relaxed">
                {item.text}
              </p>
              {item.sub && (
                <p className="text-[10px] font-light text-white/25 mt-1">
                  {item.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MODEL 3 — INDICACAO
   ════════════════════════════════════════════════════════ */

function IndicacaoModel() {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-10 reveal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
            Modelo 03
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2">
          Indicação <span className="text-gradient italic">Referral</span>
        </h2>
        <p className="text-xs sm:text-sm font-light text-white/40">
          Leads que vêm por indicação de clientes ativos
        </p>
      </div>

      {/* ─── SISTEMA DE INDICACAO ─── */}
      <SectionLabel>Sistema</SectionLabel>
      <SectionTitle>
        Programa de <span className="text-gradient italic">indicação</span>
      </SectionTitle>

      <GlassCard className="space-y-6 mb-2">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#00FF88]/50 block mb-2">
            Quando pedir
          </span>
          <p className="text-xs sm:text-sm font-light text-white/60 leading-relaxed">
            Todo cliente ativo recebe no <span className="text-white/80 font-medium">mês 2</span>:
          </p>
          <div className="mt-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-xs sm:text-sm font-light text-white/70 italic leading-relaxed">
              &ldquo;Você conhece algum empresário que enfrenta desafios parecidos com os que você tinha? Se indicar, o diagnóstico dele é gratuito e você ganha [benefício].&rdquo;
            </p>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#00FF88]/50 block mb-3">
            Benefícios para quem indica
          </span>
          <div className="space-y-2">
            {[
              "1 mês de desconto no plano atual",
              "Consultoria extra personalizada",
              "Feature premium desbloqueada",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]/40 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-light text-white/50">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#00FF88]/50 block mb-2">
            Momento ideal
          </span>
          <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-xs sm:text-sm font-light text-white/70 italic leading-relaxed">
              &ldquo;Legal que você bateu X resultado! Você conhece alguém que precisa disso também?&rdquo;
            </p>
          </div>
          <p className="text-[10px] font-light text-white/25 mt-2">
            Pedir indicação no momento de resultado — quando o cliente está mais engajado
          </p>
        </div>
      </GlassCard>

      <Separator />

      {/* ─── SCRIPT DE ABORDAGEM POR INDICACAO ─── */}
      <SectionLabel>Script</SectionLabel>
      <SectionTitle>
        Abordagem por <span className="text-gradient italic">indicação</span>
      </SectionTitle>

      <GlassCard>
        <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed italic">
          &ldquo;Oi [Nome], o [Indicador] me falou muito bem de você e sugeriu que a gente conversasse. Ele é cliente nosso e tem visto resultados incríveis com [resultado específico]. Me disse que você também tem um negócio forte em [segmento] e que poderia se beneficiar do mesmo tipo de estrutura. Posso te contar em 2 minutos o que fizemos com ele?&rdquo;
        </p>
      </GlassCard>

      <Separator />

      {/* ─── FUNIL INDICACAO ─── */}
      <SectionLabel>Funil</SectionLabel>
      <SectionTitle>
        Fluxo de <span className="text-gradient italic">indicação</span>
      </SectionTitle>

      <GlassCard className="space-y-2">
        <FunnelNode text="Indicação recebida" accent />
        <FunnelArrow />
        <FunnelNode text="Contato em 24h (mencionando o indicador)" />
        <FunnelArrow />
        <FunnelNode text="Qualificação rápida (já vem semi-qualificado)" />
        <FunnelArrow />
        <div className="flex justify-center">
          <span className="text-[9px] font-bold tracking-wider uppercase text-[#00FF88]/40 py-1">
            Skip aquecimento — confiança já existe
          </span>
        </div>
        <FunnelNode text="Agendamento direto" />
        <FunnelArrow />
        <FunnelNode text="Diagnóstico" />
        <FunnelArrow />
        <FunnelNode text="Proposta" />
        <FunnelArrow />
        <FunnelNode text="Fechamento" accent />
      </GlassCard>

      <Separator />

      {/* ─── TAXA DE CONVERSAO ─── */}
      <SectionLabel>Métricas</SectionLabel>
      <SectionTitle>
        Taxa de conversão <span className="text-gradient italic">esperada</span>
      </SectionTitle>

      <div className="grid grid-cols-3 gap-3 stagger-children">
        {[
          {
            model: "Inbound",
            rate: "15-25%",
            desc: "lead → cliente",
            color: "border-white/10",
          },
          {
            model: "Outbound",
            rate: "5-10%",
            desc: "lead → cliente",
            color: "border-white/10",
          },
          {
            model: "Indicação",
            rate: "30-50%",
            desc: "lead → cliente",
            color: "border-[#00FF88]/20",
          },
        ].map((item) => (
          <div
            key={item.model}
            className={`glass-card rounded-xl p-4 text-center ${item.color}`}
          >
            <p className="text-lg sm:text-2xl font-black text-white/90 mb-1">
              {item.rate}
            </p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-white/50 mb-0.5">
              {item.model}
            </p>
            <p className="text-[9px] font-light text-white/25">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
