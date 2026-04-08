"use client";

import { useEffect, useRef } from "react";

/* ──────────────────────────── helpers ──────────────────────────── */

const colors = [
  { name: "FYRE Green (Principal)", hex: "#00FF88", rgb: "0, 255, 136", desc: "Verde neon. Luz, energia, inovação.", class: "bg-[#00FF88]" },
  { name: "FYRE Deep", hex: "#0A3D2A", rgb: "10, 61, 42", desc: "Verde profundo. Sofisticação, confiança.", class: "bg-[#0A3D2A]" },
  { name: "FYRE Accent", hex: "#00CC6A", rgb: "0, 204, 106", desc: "Verde médio. Equilíbrio, crescimento.", class: "bg-[#00CC6A]" },
  { name: "Preto", hex: "#000000", rgb: "0, 0, 0", desc: "Background principal. Base sólida.", class: "bg-black border border-white/20" },
  { name: "Branco", hex: "#FFFFFF", rgb: "255, 255, 255", desc: "Texto principal. Clareza.", class: "bg-white" },
  { name: "Branco 60%", hex: "rgba(255,255,255,0.6)", rgb: "255, 255, 255 / 60%", desc: "Texto secundário.", class: "bg-white/60" },
  { name: "Branco 10%", hex: "rgba(255,255,255,0.1)", rgb: "255, 255, 255 / 10%", desc: "Bordas, divisores.", class: "bg-white/10 border border-white/20" },
];

const montserratWeights = [
  { label: "Light", weight: 300 },
  { label: "Regular", weight: 400 },
  { label: "Medium", weight: 500 },
  { label: "SemiBold", weight: 600 },
  { label: "Bold", weight: 700 },
  { label: "ExtraBold", weight: 800 },
  { label: "Black", weight: 900 },
];

const correctUsage = [
  "Logo branca sobre fundo preto",
  "Logo com espaço de proteção respeitado",
  "Texto com hierarquia clara (Instrument Serif títulos + Montserrat corpo)",
];

const incorrectUsage = [
  "Não distorcer a logo",
  "Não alterar as cores da logo",
  "Não colocar logo sobre fundos claros sem contraste",
  "Não usar fontes diferentes das especificadas",
  "Não remover o símbolo do vagalume",
];

const tomDireto = [
  { label: "Direto", desc: "Sem enrolação. Fala o que precisa ser dito." },
  { label: "Técnico com clareza", desc: "Usa termos como ROI, eficiência, automação — mas explica quando necessário." },
  { label: "Confiante, não arrogante", desc: "Mostra resultado, não promete milagre." },
  { label: "Provocativo", desc: 'Questiona o status quo. "Você realmente sabe quanto tempo perde com processos manuais?"' },
];

const frasesTom = [
  { bom: "Sua operação não escala porque seus processos não sustentam crescimento.", ruim: "Nós somos a melhor agência de marketing do Brasil!" },
  { bom: "Se você não automatizou, você está perdendo tempo e dinheiro.", ruim: "Vamos explodir suas vendas com nosso método inovador!" },
  { bom: "Dados primeiro. Criativo depois.", ruim: "Deixa com a gente que a mágica acontece." },
];

/* ──────────────────────────── page ──────────────────────────── */

export default function BrandManualPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "-20px" }
    );

    const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const spinText = "FYRE AUTOMAÇÃO & I.A • MANUAL DA MARCA • ";

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden grain-overlay">
      {/* Poppins font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&display=swap');`}</style>

      {/* Background elements */}
      <div className="grid-bg pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/[0.015] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute top-[60%] right-0 w-[500px] h-[500px] bg-[#00FF88]/[0.03] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[150px] pointer-events-none" />

      {/* ═══════════ HEADER ═══════════ */}
      <header className="pt-16 pb-20 sm:pt-24 sm:pb-28 relative z-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 flex flex-col items-center">
          {/* Main logo */}
          <div className="reveal mb-10">
            <img src="/images/logo-fyre.png" alt="FYRE Automação & I.A" className="h-12 mx-auto" />
          </div>

          {/* Spinning circular logo */}
          <div className="reveal mb-12">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44">
              <svg
                className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite]"
                viewBox="0 0 100 100"
              >
                <defs>
                  <path id="brandCirclePath" d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
                </defs>
                <text
                  className="fill-white/25"
                  style={{ fontSize: "6.8px", letterSpacing: "2.5px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}
                >
                  <textPath href="#brandCirclePath">{spinText}</textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/images/logo-fyre-circle.png" alt="FYRE" className="w-10 h-auto" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center reveal">
            <h1 className="text-4xl sm:text-6xl font-[family-name:var(--font-instrument)] tracking-tight mb-4">
              Manual da <span className="italic text-gradient">Marca</span>
            </h1>
            <p className="text-sm sm:text-base text-white/50 font-light tracking-wide">
              FYRE Automação & I.A — Guia de Identidade Visual
            </p>
          </div>
        </div>
      </header>

      {/* ═══════════ SECTION 1 — A MARCA ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="01" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            A Marca
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8 reveal">
              <h3 className="text-lg font-bold mb-4 text-white/90">FYRE Automação & I.A</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                <strong className="text-white">FYRE</strong> vem de <em>Firefly</em> — o vagalume. Estilizado como FYRE, o nome carrega a essência de quem brilha com luz própria.
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                Não é uma agência. É uma empresa de tecnologia focada em automação e inteligência artificial, para empresários que querem escalar com estrutura, dados e tecnologia.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 reveal">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 block mb-4">Tagline</span>
              <p className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] leading-tight mb-6">
                Pare de Operar.<br />
                <span className="italic text-gradient">Comece a Dominar.</span>
              </p>
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 block mb-3">Missão</span>
              <p className="text-sm text-white/60 leading-relaxed">
                Construir arquiteturas de crescimento para empresários que querem escalar com automação, inteligência artificial e tecnologia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 2 — O SÍMBOLO ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="02" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            O Símbolo <span className="italic text-gradient">(Vagalume)</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-12 items-start">
            {/* Symbol display */}
            <div className="reveal-scale flex-shrink-0 self-center sm:self-start">
              <div className="w-32 h-32 sm:w-40 sm:h-40 glass-card rounded-3xl flex items-center justify-center">
                <img src="/images/logo-fyre-circle.png" alt="Vagalume FYRE" className="w-20 sm:w-24 h-auto" />
              </div>
            </div>

            {/* Explanation */}
            <div className="flex-1 space-y-4 stagger-children">
              <p className="text-sm text-white/60 leading-relaxed reveal">
                O vagalume é o símbolo da FYRE. No universo da tecnologia, representa:
              </p>

              {[
                { title: "Luz própria", desc: "O vagalume não precisa de fonte externa. Brilha por mérito próprio. Assim como a FYRE constrói negócios que não dependem de terceiros." },
                { title: "Precisão", desc: "95% de eficiência luminosa. Zero desperdício. Cada processo automatizado é otimizado, cada ação tem propósito." },
                { title: "Destaque no escuro", desc: "Em um mercado saturado de soluções genéricas, a FYRE é a luz verde que guia empresários na direção certa." },
                { title: "Transformação", desc: "Metamorfose completa. De larva a luz. De operação caótica a máquina de crescimento." },
              ].map((item) => (
                <div key={item.title} className="glass-card rounded-xl p-5 reveal">
                  <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 3 — LOGOTIPO ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="03" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            Logotipo
          </h2>

          {/* Logo variations */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 reveal">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">SVG Principal</span>
              <div className="flex-1 flex items-center justify-center py-4">
                <img src="/images/logo-fyre.png" alt="Logo FYRE SVG" className="h-8" />
              </div>
              <span className="text-xs text-white/40">logo-fyre.svg</span>
            </div>

            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 reveal">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">Símbolo</span>
              <div className="flex-1 flex items-center justify-center py-4">
                <img src="/images/logo-fyre-circle.png" alt="Logo FYRE Circle" className="h-14" />
              </div>
              <span className="text-xs text-white/40">logo-fyre-circle.png</span>
            </div>

            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 reveal">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">PNG</span>
              <div className="flex-1 flex items-center justify-center py-4">
                <img src="/images/logo-fyre.png" alt="Logo FYRE PNG" className="h-8" />
              </div>
              <span className="text-xs text-white/40">logo-fyre.png</span>
            </div>
          </div>

          {/* Font info */}
          <div className="glass-card rounded-2xl p-8 mb-10 reveal">
            <h3 className="text-lg font-bold mb-6">Fonte do Logotipo: Poppins</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 block mb-2">FYRE</span>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }} className="text-3xl">FYRE</p>
                <p className="text-xs text-white/40 mt-1">Poppins Bold (700)</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 block mb-2">Automação & I.A</span>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 300 }} className="text-3xl">Automação & I.A</p>
                <p className="text-xs text-white/40 mt-1">Poppins Light (300)</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 block mb-2">Taglines</span>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }} className="text-xl">Pare de Operar.</p>
                <p className="text-xs text-white/40 mt-1">Poppins Regular (400)</p>
              </div>
            </div>
          </div>

          {/* Protection area */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-8 reveal">
              <h4 className="text-sm font-bold mb-4">Área de Proteção</h4>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex items-center justify-center">
                <div className="border border-[#00FF88]/30 rounded-lg p-6">
                  <img src="/images/logo-fyre.png" alt="Logo com área de proteção" className="h-6" />
                </div>
              </div>
              <p className="text-xs text-white/40 mt-4 leading-relaxed">
                Manter espaçamento mínimo equivalente à altura do símbolo ao redor de toda a logo.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 reveal">
              <h4 className="text-sm font-bold mb-4">Tamanho Mínimo</h4>
              <div className="flex flex-col items-start gap-6 mt-6">
                <div className="flex items-center gap-4">
                  <img src="/images/logo-fyre.png" alt="Logo tamanho mínimo" style={{ height: "24px" }} />
                  <span className="text-xs text-white/40">24px — mínimo digital</span>
                </div>
                <div className="flex items-center gap-4">
                  <img src="/images/logo-fyre.png" alt="Logo tamanho normal" style={{ height: "40px" }} />
                  <span className="text-xs text-white/40">40px — recomendado</span>
                </div>
                <div className="flex items-center gap-4">
                  <img src="/images/logo-fyre.png" alt="Logo tamanho grande" style={{ height: "60px" }} />
                  <span className="text-xs text-white/40">60px — destaque</span>
                </div>
              </div>
              <p className="text-xs text-white/40 mt-6 leading-relaxed">
                A logo deve ter no mínimo 24px de altura para digital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 4 — TIPOGRAFIA ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="04" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            Tipografia
          </h2>

          {/* Montserrat */}
          <div className="glass-card rounded-2xl p-8 mb-8 reveal">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-8">
              <h3 className="text-xl font-bold">Montserrat</h3>
              <span className="text-xs text-white/40">Fonte primária (Site)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {montserratWeights.map((w) => (
                <div key={w.weight} className="border border-white/[0.06] rounded-xl p-5">
                  <p className="text-xs text-white/30 mb-2">{w.label} ({w.weight})</p>
                  <p
                    className="text-2xl tracking-tight"
                    style={{ fontFamily: "var(--font-montserrat)", fontWeight: w.weight }}
                  >
                    Aa Bb Cc 123
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Instrument Serif */}
          <div className="glass-card rounded-2xl p-8 mb-8 reveal">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-8">
              <h3 className="text-xl font-bold">Instrument Serif</h3>
              <span className="text-xs text-white/40">Fonte display (Títulos)</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="border border-white/[0.06] rounded-xl p-6">
                <p className="text-xs text-white/30 mb-3">Normal</p>
                <p className="text-3xl sm:text-4xl font-[family-name:var(--font-instrument)]">Pare de Operar</p>
              </div>
              <div className="border border-white/[0.06] rounded-xl p-6">
                <p className="text-xs text-white/30 mb-3">Italic</p>
                <p className="text-3xl sm:text-4xl font-[family-name:var(--font-instrument)] italic text-gradient">Comece a Dominar</p>
              </div>
            </div>
          </div>

          {/* Poppins */}
          <div className="glass-card rounded-2xl p-8 reveal">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-8">
              <h3 className="text-xl font-bold">Poppins</h3>
              <span className="text-xs text-white/40">Fonte do logo</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="border border-white/[0.06] rounded-xl p-5">
                <p className="text-xs text-white/30 mb-2">Bold (700)</p>
                <p className="text-3xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>FYRE</p>
              </div>
              <div className="border border-white/[0.06] rounded-xl p-5">
                <p className="text-xs text-white/30 mb-2">Regular (400)</p>
                <p className="text-3xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}>Automação</p>
              </div>
              <div className="border border-white/[0.06] rounded-xl p-5">
                <p className="text-xs text-white/30 mb-2">Light (300)</p>
                <p className="text-3xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 300 }}>& I.A</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 5 — CORES ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="05" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            Cores
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {colors.map((color) => (
              <div key={color.name} className="glass-card rounded-2xl overflow-hidden">
                <div className={`${color.class} h-28 sm:h-32`} />
                <div className="p-5">
                  <h4 className="text-sm font-bold mb-1">{color.name}</h4>
                  <p className="text-xs text-white/40 font-mono mb-1">{color.hex}</p>
                  <p className="text-xs text-white/30 font-mono mb-3">RGB: {color.rgb}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{color.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 6 — MODOS DE USO ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="06" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            Modos de Uso
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Correct */}
            <div className="reveal">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-green-400 tracking-wide uppercase">Correto</span>
              </div>
              <div className="space-y-3">
                {correctUsage.map((item) => (
                  <div key={item} className="glass-card rounded-xl p-5 border-green-500/10 hover:border-green-500/20">
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm text-white/70 leading-relaxed">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incorrect */}
            <div className="reveal">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-red-400 tracking-wide uppercase">Incorreto</span>
              </div>
              <div className="space-y-3">
                {incorrectUsage.map((item) => (
                  <div key={item} className="glass-card rounded-xl p-5 border-red-500/10 hover:border-red-500/20">
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-sm text-white/70 leading-relaxed">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 7 — ELEMENTOS VISUAIS ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="07" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            Elementos <span className="italic text-gradient">Visuais</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 stagger-children">
            {/* Glass-morphism */}
            <div className="glass-card rounded-2xl p-8">
              <h4 className="text-sm font-bold mb-3">Glass-morphism</h4>
              <div className="font-mono text-xs text-white/40 bg-white/[0.03] rounded-lg p-4 mb-4 leading-relaxed">
                bg-white/[0.03]<br />
                backdrop-blur<br />
                border border-white/8
              </div>
              <p className="text-xs text-white/50 leading-relaxed">Usado em cards, painéis e containers. Cria profundidade sem peso visual.</p>
            </div>

            {/* Grain */}
            <div className="glass-card rounded-2xl p-8">
              <h4 className="text-sm font-bold mb-3">Grain Overlay</h4>
              <div className="w-full h-20 rounded-lg relative overflow-hidden bg-white/[0.02] mb-4">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
                  opacity: 0.6,
                }} />
              </div>
              <p className="text-xs text-white/50 leading-relaxed">Textura sutil aplicada sobre toda a página. Adiciona organicidade ao visual digital.</p>
            </div>

            {/* Gradientes */}
            <div className="glass-card rounded-2xl p-8">
              <h4 className="text-sm font-bold mb-3">Gradientes de Texto</h4>
              <p className="text-3xl font-[family-name:var(--font-instrument)] italic text-gradient mb-4">Dominar</p>
              <div className="font-mono text-xs text-white/40 bg-white/[0.03] rounded-lg p-4 leading-relaxed">
                background: linear-gradient<br />
                (135deg, #fff, #999)
              </div>
            </div>

            {/* Animações */}
            <div className="glass-card rounded-2xl p-8">
              <h4 className="text-sm font-bold mb-3">Animações</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                  <span className="text-xs text-white/50">Scroll reveal (IntersectionObserver)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                  <span className="text-xs text-white/50">Hover effects em cards</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-[spin_3s_linear_infinite]" />
                  <span className="text-xs text-white/50">Spinning logo contínuo</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-float" />
                  <span className="text-xs text-white/50">Float sutil em elementos</span>
                </li>
              </ul>
            </div>

            {/* Grid background */}
            <div className="glass-card rounded-2xl p-8 sm:col-span-2">
              <h4 className="text-sm font-bold mb-3">Grid Background</h4>
              <div className="w-full h-32 rounded-lg relative overflow-hidden mb-4">
                <div className="absolute inset-0" style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
                }} />
              </div>
              <div className="font-mono text-xs text-white/40 bg-white/[0.03] rounded-lg p-4 leading-relaxed">
                background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),<br />
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);<br />
                background-size: 60px 60px;
              </div>
              <p className="text-xs text-white/50 mt-4 leading-relaxed">Linhas sutis que criam profundidade. Aplicado com mask radial para fade nas bordas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 8 — TOM DE VOZ ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <SectionLabel text="08" />
          <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-instrument)] mb-12 reveal">
            Tom de <span className="italic text-gradient">Voz</span>
          </h2>

          {/* Principles */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16 stagger-children">
            {tomDireto.map((item) => (
              <div key={item.label} className="glass-card rounded-2xl p-8">
                <h4 className="text-lg font-bold mb-2">{item.label}</h4>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Exemplos */}
          <div className="reveal">
            <h3 className="text-lg font-bold mb-6">Exemplos de Tom</h3>
            <div className="space-y-4">
              {frasesTom.map((f, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-5 border-green-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-green-400/70">Tom FYRE</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed italic">&quot;{f.bom}&quot;</p>
                  </div>
                  <div className="glass-card rounded-xl p-5 border-red-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-red-400/70">Fora do Tom</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed italic">&quot;{f.ruim}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative z-10 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="separator mb-16" />

          <div className="flex flex-col items-center text-center reveal">
            <img src="/images/logo-fyre.png" alt="FYRE" className="h-6 mb-6 opacity-40" />
            <p className="text-xs text-white/30 mb-2">&copy; 2025 FYRE Automação & I.A. Documento confidencial.</p>
            <p className="text-xs text-white/20">Para dúvidas sobre uso da marca, contate a equipe.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────── components ──────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return (
    <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/20 block mb-4 reveal">
      Seção {text}
    </span>
  );
}
