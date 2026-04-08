"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Slide Data ─── */

const slides = [
  // SLIDE 1 — HOOK
  {
    id: "hook",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16 text-center relative">
        <div className="absolute top-12 left-12 flex items-center gap-4">
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-10 w-auto opacity-40" />
        </div>
        <div className="space-y-8">
          <h1 className="text-[4.5rem] leading-[1.1] font-black font-[family-name:var(--font-montserrat)] text-white tracking-tight">
            ONDE O SEU<br />
            MARKETING<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">QUEBRA</span>
          </h1>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="px-6 py-3 rounded-full border border-white/10 bg-white/[0.03]">
              <span className="text-2xl font-bold text-white/40 font-[family-name:var(--font-montserrat)]">Leads</span>
            </div>
            <span className="text-3xl text-red-400 font-bold">≠</span>
            <div className="px-6 py-3 rounded-full border border-[#00FF88]/20 bg-[#00FF88]/[0.05]">
              <span className="text-2xl font-bold text-[#00FF88] font-[family-name:var(--font-montserrat)]">Vendas</span>
            </div>
          </div>
        </div>
        <p className="absolute bottom-12 text-sm text-white/20 font-[family-name:var(--font-montserrat)] tracking-[0.3em] uppercase">
          FYRE Automação & I.A
        </p>
      </div>
    ),
  },

  // SLIDE 2 — AQUISIÇÃO
  {
    id: "aquisicao",
    content: (
      <div className="flex flex-col h-full px-16 py-14 relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#00FF88]/60 font-[family-name:var(--font-montserrat)] mb-2">01 — Aquisição</p>
            <h2 className="text-5xl font-black font-[family-name:var(--font-montserrat)] text-white">TRÁFEGO</h2>
          </div>
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-8 w-auto opacity-30" />
        </div>

        <div className="flex-1 flex gap-8">
          {/* Metrics */}
          <div className="flex-1 space-y-5">
            {[
              { label: "Leads Gerados", value: "847", change: "+23%", color: "#00FF88" },
              { label: "Custo por Lead", value: "R$ 4,72", change: "-18%", color: "#00FF88" },
              { label: "Volume de Tráfego", value: "29.908", change: "+31%", color: "#00CC6A" },
            ].map((m) => (
              <div key={m.label} className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                <p className="text-xs text-white/30 font-medium font-[family-name:var(--font-montserrat)] mb-1">{m.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-white font-[family-name:var(--font-montserrat)]">{m.value}</span>
                  <span className="text-sm font-bold font-[family-name:var(--font-montserrat)]" style={{ color: m.color }}>{m.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart visual */}
          <div className="flex-1 flex flex-col justify-center items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-xs text-white/25 font-[family-name:var(--font-montserrat)] mb-6 tracking-wider uppercase">Volume de Leads / Mês</p>
            <div className="flex items-end gap-3 h-48">
              {[40, 55, 48, 65, 58, 72, 68, 85, 78, 92, 88, 100].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-5 rounded-t-lg transition-all"
                    style={{
                      height: `${h * 1.8}px`,
                      background: `linear-gradient(to top, #0A3D2A, ${i >= 9 ? '#00FF88' : '#00CC6A80'})`,
                    }}
                  />
                  <span className="text-[8px] text-white/15 font-[family-name:var(--font-montserrat)]">
                    {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // SLIDE 3 — CONVERSÃO
  {
    id: "conversao",
    content: (
      <div className="flex flex-col h-full px-16 py-14 relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#00FF88]/60 font-[family-name:var(--font-montserrat)] mb-2">02 — Conversão</p>
            <h2 className="text-5xl font-black font-[family-name:var(--font-montserrat)] text-white">PROCESSO</h2>
          </div>
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-8 w-auto opacity-30" />
        </div>

        <div className="flex-1 flex gap-8">
          {/* Funil Visual */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full space-y-3">
              {[
                { label: "Leads Gerados", value: "847", width: "100%", opacity: 0.15 },
                { label: "Respondidos < 2min", value: "723", width: "85%", opacity: 0.25 },
                { label: "Qualificados", value: "412", width: "55%", opacity: 0.4 },
                { label: "Reunião Agendada", value: "186", width: "35%", opacity: 0.6 },
                { label: "Venda Fechada", value: "94", width: "20%", opacity: 1 },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div
                    className="h-12 rounded-xl flex items-center px-5 transition-all"
                    style={{
                      width: step.width,
                      background: `rgba(0, 255, 136, ${step.opacity})`,
                      border: `1px solid rgba(0, 255, 136, ${step.opacity * 0.5})`,
                    }}
                  >
                    <span className="text-sm font-bold text-white font-[family-name:var(--font-montserrat)]">{step.value}</span>
                  </div>
                  <span className="text-xs text-white/40 font-[family-name:var(--font-montserrat)] whitespace-nowrap">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className="w-72 space-y-5">
            {[
              { icon: "⚡", label: "Tempo de Resposta", value: "< 2 min", desc: "com automação FYRE" },
              { icon: "🔄", label: "Follow-up Automático", value: "24h", desc: "sem perder nenhum lead" },
              { icon: "📈", label: "Taxa de Conversão", value: "11.1%", desc: "média dos nossos clientes" },
            ].map((m) => (
              <div key={m.label} className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{m.icon}</span>
                  <p className="text-xs text-white/30 font-medium font-[family-name:var(--font-montserrat)]">{m.label}</p>
                </div>
                <p className="text-2xl font-black text-[#00FF88] font-[family-name:var(--font-montserrat)]">{m.value}</p>
                <p className="text-[10px] text-white/20 font-[family-name:var(--font-montserrat)] mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  // SLIDE 4 — ESTRUTURA FYRE
  {
    id: "estrutura",
    content: (
      <div className="flex flex-col h-full px-16 py-14 relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#00FF88]/60 font-[family-name:var(--font-montserrat)] mb-2">03 — Ecossistema</p>
            <h2 className="text-5xl font-black font-[family-name:var(--font-montserrat)] text-white">O QUE IMPLEMENTAMOS</h2>
          </div>
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-8 w-auto opacity-30" />
        </div>

        <div className="flex-1 grid grid-cols-3 gap-5">
          {[
            { num: "01", title: "Automação & IA", desc: "Funis automatizados, qualificação e follow-up com IA", icon: "⚡", color: "#00FF88" },
            { num: "02", title: "Automação", desc: "Respostas instantâneas, follow-up e qualificação 24h", icon: "⚡", color: "#00CC6A" },
            { num: "03", title: "Inteligência Artificial", desc: "Agentes que qualificam, atendem e vendem por você", icon: "🤖", color: "#00FF88" },
            { num: "04", title: "CRM Integrado", desc: "Pipeline visual, nenhum lead perdido, dados em tempo real", icon: "📊", color: "#00CC6A" },
            { num: "05", title: "Posicionamento", desc: "Branding que aumenta valor percebido e reduz objeção", icon: "💎", color: "#00FF88" },
            { num: "06", title: "Portal do Cliente", desc: "Transparência total: métricas, conteúdo e relatórios ao vivo", icon: "🖥️", color: "#00CC6A" },
          ].map((item) => (
            <div
              key={item.num}
              className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] flex flex-col justify-between group hover:bg-white/[0.05] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] font-[family-name:var(--font-montserrat)]" style={{ color: item.color, opacity: 0.4 }}>
                    {item.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-montserrat)] mb-2">{item.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed font-[family-name:var(--font-montserrat)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/15 font-[family-name:var(--font-montserrat)] italic">Tudo conectado. Tudo mensurável.</p>
        </div>
      </div>
    ),
  },

  // SLIDE 5 — RESULTADO
  {
    id: "resultado",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16 relative">
        <div className="absolute top-12 left-12">
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-8 w-auto opacity-30" />
        </div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#00FF88]/60 font-[family-name:var(--font-montserrat)] mb-6">04 — Resultado</p>
        <h2 className="text-5xl font-black font-[family-name:var(--font-montserrat)] text-white text-center mb-12">
          O QUE REALMENTE<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">IMPORTA</span>
        </h2>

        <div className="flex gap-8 mb-12">
          {[
            { value: "4.2x", label: "ROAS Médio", sub: "retorno sobre investimento" },
            { value: "-38%", label: "Redução de CAC", sub: "custo de aquisição" },
            { value: "92%", label: "Retenção", sub: "taxa de clientes ativos" },
          ].map((m) => (
            <div key={m.label} className="text-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] min-w-[200px]">
              <p className="text-5xl font-black text-[#00FF88] font-[family-name:var(--font-montserrat)] mb-2">{m.value}</p>
              <p className="text-sm font-bold text-white/60 font-[family-name:var(--font-montserrat)]">{m.label}</p>
              <p className="text-[10px] text-white/20 font-[family-name:var(--font-montserrat)] mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {[
            { label: "Vendas", icon: "💰" },
            { label: "Faturamento", icon: "📈" },
            { label: "Lucro", icon: "🏆" },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-3">
              {i > 0 && <span className="text-white/10 text-2xl mr-3">→</span>}
              <span className="text-xl">{item.icon}</span>
              <span className="text-lg font-bold text-white/70 font-[family-name:var(--font-montserrat)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // SLIDE 6 — FRASE FINAL
  {
    id: "final",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16 text-center relative">
        <div className="absolute top-12">
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-12 w-auto opacity-60" />
        </div>

        <div className="space-y-6">
          <h1 className="text-[3.5rem] leading-[1.2] font-black font-[family-name:var(--font-montserrat)] text-white">
            O problema não é<br />
            <span className="text-white/30">o tráfego.</span>
          </h1>
          <h1 className="text-[3.5rem] leading-[1.2] font-black font-[family-name:var(--font-montserrat)]">
            É a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">
              estrutura.
            </span>
          </h1>
        </div>

        <div className="mt-16 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-16 bg-white/10" />
            <span className="text-xs text-white/25 font-[family-name:var(--font-montserrat)] tracking-[0.3em] uppercase">Link na Bio</span>
            <div className="h-[1px] w-16 bg-white/10" />
          </div>
          <p className="text-sm font-bold text-[#00FF88]/60 font-[family-name:var(--font-montserrat)]">fyreoficial.com.br</p>
        </div>
      </div>
    ),
  },
];

/* ─── Component ─── */

export default function SlidesReelsPage() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => Math.min(p + 1, slides.length - 1)), []);
  const prev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  return (
    <div
      className="w-screen h-screen bg-[#050505] overflow-hidden cursor-none select-none relative"
      onClick={next}
      onContextMenu={(e) => { e.preventDefault(); prev(); }}
    >
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF88]/[0.03] rounded-full blur-[120px]" />

      {/* Slide */}
      <div className="relative w-full h-full">
        {slides[current].content}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-[#00FF88]/60" : "w-2 bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Hidden controls hint */}
      <div className="absolute bottom-4 left-6 text-[10px] text-white/10 font-[family-name:var(--font-montserrat)]">
        ← → navegar · F fullscreen · clique = próximo
      </div>
    </div>
  );
}
