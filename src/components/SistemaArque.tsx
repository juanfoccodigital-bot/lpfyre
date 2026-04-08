"use client";

import { useState } from "react";

const pillars = [
  {
    letter: "A",
    title: "Análise & Arquitetura",
    subtitle: "Clareza antes de velocidade.",
    description:
      "Raio-X completo do seu negócio. Mapeamos gargalos, processos manuais e oportunidades de automação antes de qualquer ação.",
    points: [
      {
        title: "Raio-X do Negócio",
        desc: "Mapeamos cada processo — do primeiro contato ao fechamento",
      },
      {
        title: "Gargalos & Processos Manuais",
        desc: "Identificamos onde tempo e dinheiro estão sendo desperdiçados",
      },
      {
        title: "Arquitetura de Automação",
        desc: "Desenhamos o plano técnico para eliminar retrabalho e escalar",
      },
    ],
    insight:
      "Aqui, você para de tomar decisões no feeling e passa a operar com precisão.",
  },
  {
    letter: "R",
    title: "Reconhecimento & Resultados",
    subtitle: "Automação onde dá mais resultado.",
    description:
      "Identificamos exatamente onde automação e IA geram mais impacto no seu negócio — priorizando o que traz retorno rápido.",
    points: [
      {
        title: "Mapa de Impacto",
        desc: "Priorizamos as automações que geram resultado mais rápido",
      },
      {
        title: "Quick Wins",
        desc: "Implementações iniciais que já reduzem custo e aumentam velocidade",
      },
      {
        title: "ROI Projetado",
        desc: "Cada automação tem retorno estimado antes de ser implementada",
      },
    ],
    insight: "Tecnologia sem estratégia é desperdício. Aqui, cada automação tem propósito.",
  },
  {
    letter: "Q",
    title: "Qualificação Autônoma",
    subtitle: "IA trabalhando por você, 24h por dia.",
    description:
      "Inteligência artificial qualificando leads e atendendo seus clientes a qualquer hora — sem depender do seu time.",
    points: [
      {
        title: "Atendimento 24h com IA",
        desc: "Agentes inteligentes respondendo e qualificando leads sem parar",
      },
      {
        title: "Triagem Automática",
        desc: "Leads qualificados antes mesmo de falar com seu time comercial",
      },
      {
        title: "Follow-up Inteligente",
        desc: "Nenhum lead esfria — a IA faz o acompanhamento no tempo certo",
      },
    ],
    insight:
      'Seu time para de "apagar incêndio" e foca só no que gera dinheiro: fechar.',
  },
  {
    letter: "U",
    title: "Unificação Operacional",
    subtitle: "Sem integração, não existe escala.",
    description:
      "CRM, atendimento e vendas — tudo integrado em um sistema único. Fim das ferramentas soltas e dados espalhados.",
    points: [
      {
        title: "Sistema Unificado",
        desc: "CRM, atendimento, automações e vendas em uma só operação",
      },
      {
        title: "Dados Centralizados",
        desc: "Decisão baseada em números reais, não achismo",
      },
      {
        title: "Integrações via API",
        desc: "Conectamos tudo o que seu negócio já usa — sem retrabalho",
      },
    ],
    insight:
      "Tecnologia integrada deixa de ser custo e vira um ativo estratégico mensurável.",
  },
  {
    letter: "E",
    title: "Escala & Perenidade",
    subtitle: "Crescer é fácil. Sustentar é para poucos.",
    description: "Crescimento controlado com operação automatizada. Aqui é onde o jogo muda.",
    points: [
      {
        title: "Escala Controlada",
        desc: "Aumentamos volume sem quebrar a operação — a automação absorve a demanda",
      },
      {
        title: "Operação Autônoma",
        desc: "Seu negócio funciona mesmo quando você não está olhando",
      },
      {
        title: "Ativo Vendável",
        desc: "Seu negócio deixa de depender de você e ganha valor de mercado",
      },
    ],
    insight: "Você sai da operação e assume o papel de dono de verdade.",
  },
];

export default function SistemaArque() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="sistema" className="relative py-16 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.01] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-20 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-4 block">
            Metodologia Exclusiva
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Sistema{" "}
            <span className="text-gradient italic">A.R.Q.U.E</span>
          </h2>
          <p className="mt-4 text-lg font-light text-white/30">
            Arquitetura de Escala para Negócios
          </p>
          <p className="mt-2 text-sm font-light text-white/20 max-w-2xl mx-auto">
            Não é marketing. É engenharia de automação e crescimento previsível.
            Desenhado para empresários que já faturam — mas estão presos na
            operação.
          </p>
        </div>

        {/* Pillar navigation with connected progress */}
        <div className="flex justify-center items-center gap-0 mb-8 sm:mb-16 reveal overflow-x-auto">
          {pillars.map((pillar, index) => (
            <div key={pillar.letter} className="flex items-center">
              <button
                onClick={() => setActiveIndex(index)}
                className={`group relative flex flex-col items-center gap-2 px-4 sm:px-8 py-4 transition-all duration-500 ${
                  activeIndex === index
                    ? "opacity-100"
                    : index <= activeIndex
                      ? "opacity-60 hover:opacity-80"
                      : "opacity-25 hover:opacity-50"
                }`}
              >
                {/* Dot indicator */}
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-500 mb-1 ${
                    activeIndex === index
                      ? "bg-white border-white scale-125"
                      : index < activeIndex
                        ? "bg-white/30 border-white/30"
                        : "bg-transparent border-white/20"
                  }`}
                />
                <span
                  className={`text-2xl sm:text-3xl font-black transition-all duration-500 ${
                    activeIndex === index ? "text-white" : "text-white/50"
                  }`}
                >
                  {pillar.letter}
                </span>
                <span className="text-[8px] sm:text-[9px] font-medium tracking-[0.15em] uppercase text-white/40 hidden sm:block">
                  {pillar.title.split(" ")[0]}
                </span>
              </button>
              {/* Connecting line */}
              {index < pillars.length - 1 && (
                <div className="w-6 sm:w-12 h-[1px] relative -mt-6">
                  <div className="absolute inset-0 bg-white/10" />
                  <div
                    className={`absolute inset-y-0 left-0 bg-white/40 transition-all duration-700 ${
                      index < activeIndex ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active pillar content */}
        <div className="max-w-4xl mx-auto">
          <div
            key={activeIndex}
            className="glass-card rounded-3xl p-8 sm:p-12 animate-fade-in"
          >
            <div className="flex items-start gap-6 mb-8">
              <span className="text-6xl sm:text-7xl font-black text-white/10 leading-none">
                {pillars[activeIndex].letter}
              </span>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {pillars[activeIndex].title}
                </h3>
                <p className="text-sm font-medium text-white/40 mt-1">
                  {pillars[activeIndex].subtitle}
                </p>
              </div>
            </div>

            <p className="text-sm font-light text-white/50 mb-10 leading-relaxed">
              {pillars[activeIndex].description}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {pillars[activeIndex].points.map((point) => (
                <div
                  key={point.title}
                  className="relative pl-4 border-l border-white/10"
                >
                  <h4 className="text-sm font-bold text-white mb-2">
                    {point.title}
                  </h4>
                  <p className="text-xs font-light text-white/40 leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6">
              <p className="text-sm font-medium text-white/60 italic">
                &ldquo;{pillars[activeIndex].insight}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 reveal">
          <a href="#contato" className="cta-button">
            QUERO APLICAR O SISTEMA NO MEU NEGÓCIO
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
        </div>
      </div>
    </section>
  );
}
