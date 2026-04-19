"use client";

/* ── Card 1: Dashboard de Performance ── */
function DashboardCard() {
  const bars = [35, 52, 45, 68, 82, 75, 95, 88, 92];
  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:border-[#00FF2B]/15 transition-all duration-500">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00FF2B] shadow-[0_0_6px_rgba(0,255,43,0.5)]" />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">Dashboard — Ao vivo</span>
          </div>
          <span className="text-[9px] font-mono text-white/15">FYRE CRM</span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Leads", value: "1.247", change: "+23%" },
            { label: "Conversão", value: "34%", change: "+8%" },
            { label: "Receita", value: "R$142K", change: "+31%" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
              <p className="text-[9px] font-medium text-white/20 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-lg font-black text-white mt-0.5">{kpi.value}</p>
              <p className="text-[10px] font-semibold text-[#00FF2B]/60">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Chart bars */}
        <div className="flex items-end gap-1.5 h-20">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-700 group-hover:opacity-100"
              style={{
                height: `${h}%`,
                background: i >= 6
                  ? "linear-gradient(180deg, #00FF2B, rgba(0,255,43,0.3))"
                  : "rgba(255,255,255,0.06)",
                opacity: i >= 6 ? 1 : 0.6,
                boxShadow: i >= 6 ? "0 0 8px rgba(0,255,43,0.15)" : "none",
                transitionDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[8px] text-white/10 font-mono">Jan</span>
          <span className="text-[8px] text-white/10 font-mono">Set</span>
        </div>
      </div>
      <div className="px-6 py-3 border-t border-white/[0.04]">
        <p className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">
          Dashboard de performance em tempo real
        </p>
      </div>
    </div>
  );
}

/* ── Card 2: WhatsApp IA ── */
function WhatsAppCard() {
  const messages = [
    { from: "lead", text: "Oi, vi o anúncio de vocês. Quanto custa?", time: "14:32" },
    { from: "ia", text: "Olá! Tudo bem? Sou a assistente da FYRE. Antes de falar sobre valores, me conta: qual o segmento do seu negócio?", time: "14:32" },
    { from: "lead", text: "Trabalho com consultoria financeira", time: "14:33" },
    { from: "ia", text: "Ótimo! Temos soluções específicas pra consultoria. Qual seu maior desafio hoje — atendimento, vendas ou operação?", time: "14:33" },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:border-[#00FF2B]/15 transition-all duration-500">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.04]">
          <div className="w-8 h-8 rounded-full bg-[#00FF2B]/10 border border-[#00FF2B]/20 flex items-center justify-center">
            <img src="/images/icon-fyre.svg" alt="" className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Ayla — Agente IA</p>
            <p className="text-[9px] text-[#00FF2B]/50 font-medium">Online agora</p>
          </div>
          <div className="ml-auto">
            <span className="text-[8px] font-mono text-white/10">WhatsApp</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-2.5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === "lead" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[11px] leading-relaxed ${
                  msg.from === "lead"
                    ? "bg-[#00FF2B]/[0.08] border border-[#00FF2B]/10 text-white/70 rounded-br-sm"
                    : "bg-white/[0.04] border border-white/[0.06] text-white/55 rounded-bl-sm"
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[8px] mt-1 ${msg.from === "lead" ? "text-[#00FF2B]/25 text-right" : "text-white/15"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-bl-sm px-4 py-3 flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF2B]/30 animate-[typingBounce_1.4s_ease-in-out_infinite]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF2B]/30 animate-[typingBounce_1.4s_ease-in-out_infinite_0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF2B]/30 animate-[typingBounce_1.4s_ease-in-out_infinite_0.4s]" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-white/[0.04]">
        <p className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">
          Agente IA qualificando leads 24h no WhatsApp
        </p>
      </div>
    </div>
  );
}

/* ── Card 3: Automação Pipeline ── */
function PipelineCard() {
  const stages = [
    { name: "Novo Lead", count: 24, color: "rgba(255,255,255,0.08)" },
    { name: "Qualificado", count: 18, color: "rgba(0,255,43,0.08)" },
    { name: "Proposta", count: 12, color: "rgba(0,255,43,0.12)" },
    { name: "Negociação", count: 7, color: "rgba(207,255,0,0.1)" },
    { name: "Fechado", count: 5, color: "rgba(0,255,43,0.18)" },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:border-[#00FF2B]/15 transition-all duration-500">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#CFFF00] shadow-[0_0_6px_rgba(207,255,0,0.5)]" />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">Pipeline — CRM</span>
          </div>
          <span className="text-[9px] font-mono text-white/15">Automático</span>
        </div>

        {/* Pipeline stages */}
        <div className="space-y-2.5">
          {stages.map((stage, i) => (
            <div key={stage.name} className="flex items-center gap-3 group/stage">
              {/* Stage bar */}
              <div className="flex-1 relative">
                <div
                  className="h-9 rounded-lg flex items-center px-3 justify-between transition-all duration-500"
                  style={{
                    background: stage.color,
                    border: `1px solid ${i === 4 ? "rgba(0,255,43,0.2)" : "rgba(255,255,255,0.04)"}`,
                    width: `${100 - i * 12}%`,
                  }}
                >
                  <span className="text-[10px] font-semibold text-white/50">{stage.name}</span>
                  <span className={`text-xs font-black ${i === 4 ? "text-[#00FF2B]" : "text-white/30"}`}>
                    {stage.count}
                  </span>
                </div>
              </div>
              {/* Arrow */}
              {i < stages.length - 1 && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,43,0.15)" strokeWidth="2" className="flex-shrink-0">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Bottom metrics */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
            <p className="text-[9px] text-white/20 uppercase tracking-wider">Taxa de conversão</p>
            <p className="text-base font-black text-[#00FF2B] mt-0.5">20.8%</p>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
            <p className="text-[9px] text-white/20 uppercase tracking-wider">Tempo médio</p>
            <p className="text-base font-black text-white mt-0.5">3.2 dias</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 border-t border-white/[0.04]">
        <p className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">
          Pipeline automatizado com qualificação por IA
        </p>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function ResultsShowcase() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div className="text-center mb-12 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
            Por Dentro dos Sistemas
          </span>
          <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Veja com seus{" "}
            <span className="text-gradient-fyre italic">próprios olhos</span>
          </h2>
          <p className="mt-3 text-sm font-light text-white/30 max-w-md mx-auto">
            É isso que roda por dentro dos negócios que a FYRE automatiza.
            Dashboards, agentes IA e pipelines — tudo conectado.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          <DashboardCard />
          <WhatsAppCard />
          <PipelineCard />
        </div>
      </div>
    </section>
  );
}
