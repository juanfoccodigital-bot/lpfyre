"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ────────────────────────────────────────────────────────
   SLIDES DATA
   ──────────────────────────────────────────────────────── */

interface Slide {
  id: string;
  type: "cover" | "content" | "stats" | "problem" | "solution" | "objection" | "methodology" | "cases";
  label?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  body?: React.ReactNode;
}

const slides: Slide[] = [
  // ─── 01 COVER ───
  {
    id: "cover",
    type: "cover",
    title: "",
    body: null,
  },

  // ─── 02 QUEM SOMOS ───
  {
    id: "quem-somos",
    type: "content",
    label: "Quem Somos",
    title: (
      <>
        Somos uma empresa de <span className="text-gradient italic">tecnologia</span>
      </>
    ),
    subtitle: "Somos uma empresa de tecnologia especializada em automação e inteligência artificial.",
    body: (
      <div className="space-y-6">
        <p className="text-sm sm:text-base font-light text-white/50 leading-relaxed">
          A FYRE Automação & I.A constrói <span className="text-white font-medium">sistemas inteligentes, automações e plataformas sob medida</span> para empresas que querem escalar com tecnologia — sem depender de processos manuais ou ferramentas genéricas.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          {[
            { icon: "⚡", text: "Automação de ponta a ponta" },
            { icon: "🤖", text: "Inteligência Artificial aplicada" },
            { icon: "📊", text: "Sistemas & CRM sob medida" },
            { icon: "🔧", text: "Tecnologia que gera resultado" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs sm:text-sm text-white/60 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ─── 03 O PROBLEMA DO MERCADO ───
  {
    id: "problema",
    type: "problem",
    label: "O Problema",
    title: (
      <>
        A operação está <span className="text-gradient italic">travando</span> seu crescimento
      </>
    ),
    body: (
      <div className="space-y-5">
        {[
          { stat: "74%", text: "das empresas ainda operam processos comerciais de forma manual e perdem leads todos os dias" },
          { stat: "68%", text: "dos leads recebidos nunca são respondidos a tempo — o cliente compra do concorrente" },
          { stat: "81%", text: "das PMEs não possuem um sistema integrado de vendas, atendimento e gestão" },
          { stat: "45min", text: "é o tempo médio que um empresário gasta por dia em tarefas que poderiam ser automatizadas" },
        ].map((item) => (
          <div key={item.stat} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-2xl sm:text-3xl font-black text-white/80 min-w-[80px] sm:min-w-[100px] text-right">{item.stat}</span>
            <span className="text-xs sm:text-sm font-light text-white/50 leading-relaxed pt-1">{item.text}</span>
          </div>
        ))}
      </div>
    ),
  },

  // ─── 04 PARA QUEM ───
  {
    id: "para-quem",
    type: "content",
    label: "Para Quem",
    title: (
      <>
        Empresários que <span className="text-gradient italic">já faturam</span>
      </>
    ),
    subtitle: "Mas perdem oportunidades por falta de sistema.",
    body: (
      <div className="space-y-4">
        <p className="text-sm sm:text-base font-light text-white/40 leading-relaxed mb-6">
          A FYRE é para quem já tem demanda — mas perde vendas porque não tem tecnologia acompanhando o ritmo do negócio.
        </p>
        <div className="space-y-3">
          {[
            "Fatura acima de R$20k/mês mas ainda depende de planilha e WhatsApp",
            "Perde leads porque ninguém responde rápido o suficiente",
            "Cresce, mas a operação não escala junto",
            "Trabalha 12h por dia apagando incêndio em vez de estratégia",
            "Não tem sistema integrado — cada ferramenta funciona isolada",
            "Quer automatizar mas não sabe por onde começar",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 group">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors flex-shrink-0" />
              <span className="text-xs sm:text-sm font-light text-white/50 group-hover:text-white/70 transition-colors">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ─── 05 NÚMEROS DO MERCADO ───
  {
    id: "mercado",
    type: "stats",
    label: "Automação & I.A",
    title: (
      <>
        Os números não <span className="text-gradient italic">mentem</span>
      </>
    ),
    body: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "US$1.8T", label: "Mercado global de automação e IA até 2030", sub: "Crescimento de 37% a.a." },
            { value: "80%", label: "Das empresas líderes já usam automação nos processos comerciais", sub: "Fonte: McKinsey Digital" },
            { value: "5x", label: "ROI médio de quem usa automação vs. quem faz tudo manual", sub: "Processos inteligentes vencem" },
            { value: "47%", label: "Redução de custo operacional com IA e automação", sub: "Mais resultado com menos equipe" },
          ].map((item) => (
            <div key={item.value} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center group hover:bg-white/[0.04] transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-black text-white mb-2">{item.value}</div>
              <div className="text-[10px] sm:text-xs font-medium text-white/40 leading-relaxed">{item.label}</div>
              <div className="text-[9px] sm:text-[10px] font-light text-white/20 mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-xs font-light text-white/25 italic">
            Quem automatiza agora, domina. Quem demora, compete por preço.
          </p>
        </div>
      </div>
    ),
  },

  // ─── 06 NOSSA SOLUÇÃO ───
  {
    id: "solucao",
    type: "solution",
    label: "Nossa Solução",
    title: (
      <>
        Tecnologia que <span className="text-gradient italic">trabalha por você</span>
      </>
    ),
    subtitle: "Cada sistema conectado. Cada resultado mensurável.",
    body: (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { num: "01", title: "Automação & IA", desc: "Agentes inteligentes, chatbots, follow-up 24h sem intervenção humana" },
          { num: "02", title: "Automação Comercial", desc: "Funis, qualificação e distribuição de leads automatizados" },
          { num: "03", title: "Sistemas & CRM", desc: "Plataformas sob medida para gestão, vendas e atendimento" },
          { num: "04", title: "Sites & Landing Pages", desc: "Interfaces de alta conversão integradas ao seu ecossistema" },
          { num: "05", title: "Projetos de Automação", desc: "Mapeamento e automação completa de processos operacionais" },
          { num: "06", title: "FYRE HUB (SaaS)", desc: "Plataforma proprietária com CRM, automações e IA integrados" },
        ].map((s) => (
          <div key={s.num} className="p-4 sm:p-5 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.05] transition-all duration-300">
            <span className="text-[9px] font-bold tracking-[0.3em] text-white/15 block mb-2">{s.num}</span>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{s.title}</h4>
            <p className="text-[10px] sm:text-xs font-light text-white/35 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    ),
  },

  // ─── 07 SISTEMA A.R.Q.U.E ───
  {
    id: "arque",
    type: "methodology",
    label: "Metodologia",
    title: (
      <>
        Sistema <span className="text-gradient italic">A.R.Q.U.E.</span>
      </>
    ),
    subtitle: "Arquitetura de Automação para Negócios",
    body: (
      <div className="space-y-3">
        {[
          { letter: "A", name: "Análise & Arquitetura", desc: "Raio-X do negócio. Mapeamos gargalos operacionais, fluxos e pontos de automação." },
          { letter: "R", name: "Redesenho de Processos", desc: "Eliminamos etapas manuais e redesenhamos a operação com tecnologia." },
          { letter: "Q", name: "Qualificação Autônoma", desc: "IA + automação qualificando e atendendo leads 24h. Seu time só fecha." },
          { letter: "U", name: "Unificação Operacional", desc: "CRM, atendimento, vendas e gestão integrados. Dados centralizados em tempo real." },
          { letter: "E", name: "Escala & Perenidade", desc: "Crescimento controlado com processos automatizados. O negócio roda sem depender de você." },
        ].map((p) => (
          <div key={p.letter} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-3xl sm:text-4xl font-black text-white/15 group-hover:text-white/30 transition-colors min-w-[40px] text-center leading-none">{p.letter}</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{p.name}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // ─── 08 QUEBRA DE OBJEÇÕES ───
  {
    id: "objecoes",
    type: "objection",
    label: "Objeções",
    title: (
      <>
        Talvez você esteja <span className="text-gradient italic">pensando...</span>
      </>
    ),
    body: (
      <div className="space-y-4">
        {[
          {
            question: '"Já tentei automatizar e não funcionou."',
            answer: "Provavelmente usaram ferramentas genéricas sem entender o seu processo. Nós construímos sistemas sob medida para a sua operação — não adaptamos template pronto.",
          },
          {
            question: '"É caro demais investir em tecnologia."',
            answer: "Caro é perder leads todo dia, pagar equipe para tarefas repetitivas e não ter dados para decidir. Nosso diagnóstico gratuito mostra exatamente quanto você perde por mês sem automação.",
          },
          {
            question: '"Não tenho tempo pra mais um projeto."',
            answer: "Justamente. Se você não tem tempo, é porque está fazendo manualmente o que deveria ser automático. A FYRE existe para devolver tempo ao empresário.",
          },
          {
            question: '"IA e automação são hype."',
            answer: "Hype é continuar respondendo lead no dia seguinte enquanto o concorrente responde em 2 minutos com IA. Automação não é futuro — é o mínimo para competir hoje.",
          },
          {
            question: '"Meu segmento é diferente."',
            answer: "Já automatizamos processos de clínicas, e-commerces, construtoras, consultorias, SaaS e indústria. O princípio é universal: processo, velocidade, dados e escala.",
          },
        ].map((obj) => (
          <div key={obj.question} className="p-4 sm:p-5 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <p className="text-xs sm:text-sm font-semibold text-white/70 mb-2">{obj.question}</p>
            <p className="text-[11px] sm:text-xs font-light text-white/40 leading-relaxed">{obj.answer}</p>
          </div>
        ))}
      </div>
    ),
  },

  // ─── 09 NOSSOS NÚMEROS ───
  {
    id: "resultados",
    type: "stats",
    label: "Resultados",
    title: (
      <>
        Track record <span className="text-gradient italic">comprovado</span>
      </>
    ),
    body: (
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {[
            { value: "320+", label: "Projetos Entregues" },
            { value: "50k+", label: "Horas Automatizadas" },
            { value: "8+", label: "Anos de Mercado" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-white/25">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "2min", label: "Tempo médio de resposta ao lead", desc: "Com IA, antes era 3.5h em média" },
            { value: "-62%", label: "Redução de tarefas manuais", desc: "Com automação de processos comerciais" },
            { value: "3.8x", label: "Aumento médio na taxa de conversão", desc: "Leads atendidos no tempo certo convertem mais" },
            { value: "92%", label: "Taxa de retenção de clientes", desc: "Porque resultado real fideliza" },
          ].map((item) => (
            <div key={item.value} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
              <div className="text-xl sm:text-2xl font-black text-white mb-1">{item.value}</div>
              <div className="text-[10px] sm:text-xs font-medium text-white/40">{item.label}</div>
              <div className="text-[9px] text-white/20 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ─── 10 DIFERENCIAIS ───
  {
    id: "diferenciais",
    type: "content",
    label: "Diferenciais",
    title: (
      <>
        Por que a <span className="text-gradient italic">FYRE</span>?
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          {
            title: "Estratégia + Tecnologia na mesma mesa.",
            desc: "Somos os dois. Entendemos o negócio e construímos a tecnologia que ele precisa.",
          },
          {
            title: "Fundadores com bagagem real.",
            desc: "8+ anos no mercado, centenas de projetos entregues. Não somos teóricos — construímos sistemas que rodam.",
          },
          {
            title: "Sistemas sob medida, não template.",
            desc: "Cada operação é única. Desenhamos e desenvolvemos a solução exata para o seu cenário.",
          },
          {
            title: "FYRE HUB — nossa plataforma SaaS.",
            desc: "CRM, automações, IA e gestão em uma única plataforma construída por nós. Tecnologia proprietária.",
          },
          {
            title: "Falamos a língua do empresário.",
            desc: "Sem jargão técnico desnecessário. Traduzimos tecnologia em resultado para o seu negócio.",
          },
          {
            title: "Você fica com o ativo.",
            desc: "Se encerrar a parceria, toda a estrutura, automações e sistemas ficam com você.",
          },
        ].map((d) => (
          <div key={d.title} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <div className="w-2 h-2 rounded-full bg-white/20 mt-1.5 flex-shrink-0 group-hover:bg-white/50 transition-colors" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{d.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{d.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // ─── 11 FUNDADORES ───
  {
    id: "socios",
    type: "content",
    label: "Fundadores",
    title: (
      <>
        Quem está <span className="text-gradient italic">por trás</span>
      </>
    ),
    body: (
      <div className="grid sm:grid-cols-2 gap-6">
        {[
          {
            name: "Juan Mansilha",
            title: "Founder",
            role: "Estratégia & Negócios",
            image: "/images/juan.jpg",
            handle: "@juanmansilha.mkt",
            bio: "+8 anos no mercado digital. Especialista em diagnóstico de negócios, modelagem de processos comerciais e estratégia de crescimento com automação.",
          },
          {
            name: "Rodrigo Lopes",
            title: "Founder",
            role: "Automação & IA",
            image: "/images/rodrigo.jpg",
            handle: "@rodrigohacking",
            bio: "Especialista em automação e inteligência artificial. Constrói sistemas reais com n8n, Claude Code, SaaS e plataformas sob medida para empresários que precisam de resultado.",
          },
        ].map((f) => (
          <div key={f.name} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 mx-auto mb-4">
              <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-base font-bold text-white">{f.name}</h4>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mt-1">{f.title}</p>
            <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-white/20 mt-0.5 mb-3">{f.role}</p>
            <p className="text-xs font-light text-white/40 leading-relaxed mb-3">{f.bio}</p>
            <span className="text-[11px] font-semibold text-white/50">{f.handle}</span>
          </div>
        ))}
      </div>
    ),
  },

];

/* ────────────────────────────────────────────────────────
   SPINNING LOGO COMPONENT
   ──────────────────────────────────────────────────────── */

function SpinningLogo({ size = "w-24 h-24", imgSize = "w-6" }: { size?: string; imgSize?: string }) {
  const spinText = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";
  return (
    <div className={`relative ${size}`}>
      <svg
        className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]"
        viewBox="0 0 100 100"
      >
        <defs>
          <path id="cpPresentation" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-white/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
          <textPath href="#cpPresentation">{spinText}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <img src="/images/logo-fyre-circle.png" alt="FYRE" className={`${imgSize} h-auto`} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   PROGRESS BAR
   ──────────────────────────────────────────────────────── */

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i === current ? "w-6 bg-white/60" : i < current ? "w-2 bg-white/20" : "w-2 bg-white/8"
          }`}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────── */

export default function Apresentacao() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides.length;

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (isAnimating || index < 0 || index >= totalSlides || index === current) return;
      setDirection(dir || (index > current ? "next" : "prev"));
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setTimeout(() => setIsAnimating(false), 50);
      }, 200);
    },
    [current, isAnimating, totalSlides]
  );

  const next = useCallback(() => goTo(current + 1, "next"), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, "prev"), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  const slide = slides[current];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 bg-black text-white overflow-hidden select-none"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.015] blur-[120px] bg-white animate-[float_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.01] blur-[80px] bg-white animate-[float_8s_ease-in-out_infinite_3s]" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-10 py-5">
        <img src="/images/logo-fyre.png" alt="FYRE" className="h-4 sm:h-5 w-auto opacity-40" />
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/20">
            {String(current + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </span>
          <ProgressBar current={current} total={totalSlides} />
        </div>
      </div>

      {/* Slide content */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
          isAnimating
            ? direction === "next"
              ? "opacity-0 translate-x-8"
              : "opacity-0 -translate-x-8"
            : "opacity-100 translate-x-0"
        }`}
      >
        {/* ─── COVER SLIDE ─── */}
        {slide.type === "cover" && (
          <div className="text-center px-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <SpinningLogo size="w-32 h-32 sm:w-40 sm:h-40" imgSize="w-8 sm:w-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-instrument)] tracking-tight leading-[0.95] text-white mb-4">
              Automatize o <span className="italic">Crescimento</span>
              <br />
              <span className="text-gradient">Domine com <span className="italic">I.A</span></span>
            </h1>
            <p className="text-sm sm:text-base font-light text-white/30 max-w-lg mx-auto mt-6 leading-relaxed">
              Apresentação comercial — Automação, Inteligência Artificial e Sistemas sob medida para empresas que querem escalar.
            </p>
            <div className="mt-10 flex items-center justify-center gap-2 text-white/20">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Deslize ou use as setas</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-[float_2s_ease-in-out_infinite]">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* ─── CONTENT / GENERIC SLIDES ─── */}
        {slide.type !== "cover" && (
          <div className="w-full max-w-3xl mx-auto px-5 sm:px-10 pt-16 pb-24 max-h-screen overflow-y-auto scrollbar-hide">
            {slide.label && (
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 mb-4 block">
                {slide.label}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2 leading-tight">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-sm sm:text-base font-light text-white/30 mb-8">{slide.subtitle}</p>
            )}
            {!slide.subtitle && <div className="mb-8" />}
            {slide.body}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-10 py-5">
        <button
          onClick={prev}
          disabled={current === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 ${
            current === 0
              ? "opacity-0 pointer-events-none"
              : "text-white/40 border border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <button
          onClick={next}
          disabled={current === totalSlides - 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 group ${
            current === totalSlides - 1
              ? "opacity-0 pointer-events-none"
              : "bg-white text-black hover:bg-white/90"
          }`}
        >
          <span className="hidden sm:inline">Próximo</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-0.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slide indicator dots - clickable */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-1">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-2 h-2 bg-white/60"
                : "w-1.5 h-1.5 bg-white/15 hover:bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
