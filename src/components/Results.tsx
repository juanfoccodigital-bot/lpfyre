"use client";

import { useRef, useState, useEffect } from "react";

const cases = [
  {
    metric: "3x",
    metricLabel: "conversão",
    title: "Consultoria de Gestão",
    result: "Triplicou a conversão em 60 dias sem aumentar equipe.",
    tags: ["Agente IA", "WhatsApp", "CRM"],
    client: "Carlos M.",
  },
  {
    metric: "70%",
    metricLabel: "menos tempo",
    title: "Clínica de Estética",
    result: "Equipe recuperou 70% do tempo. No-show caiu pela metade.",
    tags: ["Agendamento IA", "Automação", "Follow-up"],
    client: "Amanda R.",
  },
  {
    metric: "50%",
    metricLabel: "redução CAC",
    title: "SaaS B2B",
    result: "CAC caiu pela metade em 90 dias. Time vende mais, trabalhando menos.",
    tags: ["Qualificação IA", "Pipeline", "Lead Scoring"],
    client: "Ricardo S.",
  },
  {
    metric: "4.2x",
    metricLabel: "ROAS",
    title: "Suplementos",
    result: "ROAS de 1.8 para 4.2 em 45 dias. R$450K+ no trimestre.",
    tags: ["Landing Page", "Quiz", "Recuperação"],
    client: "Marcos T.",
  },
  {
    metric: "R$1.2M",
    metricLabel: "vendas",
    title: "Consultoria Financeira",
    result: "R$1.2M passaram pelo sistema automatizado em 6 meses.",
    tags: ["Agente IA", "CRM", "Dashboard"],
    client: "Fernando L.",
  },
];

export default function Results() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.min(380, el.clientWidth * 0.85);
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <section id="resultados" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00FF2B]/[0.015] rounded-full blur-[200px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14 reveal">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
              Resultados Reais
            </span>
            <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
              Números que{" "}
              <span className="text-gradient-fyre italic">falam sozinhos</span>
            </h2>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                canScrollLeft
                  ? "border-[#00FF2B]/20 text-white/50 hover:border-[#00FF2B]/40 hover:text-white hover:bg-[#00FF2B]/[0.05]"
                  : "border-white/[0.06] text-white/15 cursor-not-allowed"
              }`}
              disabled={!canScrollLeft}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                canScrollRight
                  ? "border-[#00FF2B]/20 text-white/50 hover:border-[#00FF2B]/40 hover:text-white hover:bg-[#00FF2B]/[0.05]"
                  : "border-white/[0.06] text-white/15 cursor-not-allowed"
              }`}
              disabled={!canScrollRight}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cases.map((c) => (
            <div
              key={c.client}
              className="flex-shrink-0 w-[320px] sm:w-[360px] snap-start glass-card rounded-2xl overflow-hidden group"
            >
              {/* Top — Metric highlight */}
              <div
                className="px-7 pt-7 pb-5 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(0,255,43,0.04), transparent 60%)",
                }}
              >
                {/* Large metric */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl sm:text-6xl font-black text-gradient-fyre leading-none">{c.metric}</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00FF2B]/50">{c.metricLabel}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{c.title}</h3>

                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00FF2B]/[0.04] rounded-full blur-[40px] group-hover:bg-[#00FF2B]/[0.08] transition-all duration-700" />
              </div>

              {/* Divider */}
              <div className="mx-7 h-[1px] bg-gradient-to-r from-[#00FF2B]/10 via-[#00FF2B]/[0.06] to-transparent" />

              {/* Bottom — Result + Tags */}
              <div className="px-7 pt-5 pb-7">
                <p className="text-sm font-medium text-white/60 leading-relaxed mb-5">
                  {c.result}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-semibold tracking-[0.1em] uppercase text-[#00FF2B]/40 border border-[#00FF2B]/10 px-2.5 py-1 rounded-full bg-[#00FF2B]/[0.03]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] font-light text-white/20">— {c.client}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14 reveal">
          <p className="text-sm font-light text-white/25 mb-5">
            Quer ser o próximo case?
          </p>
          <a href="#aplicacao" className="cta-button group">
            QUERO RESULTADOS ASSIM
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
