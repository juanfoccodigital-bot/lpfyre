"use client";

const services = [
  {
    number: "01",
    title: "Automação & Inteligência Artificial",
    desc: "Atendimento automático, follow-up inteligente e qualificação com IA. Seu negócio operando 24h sem depender de você.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47M5 14.5l2.47-2.47m0 0a48.578 48.578 0 019.06 0m-9.06 0L5 14.5m14 0l-2.47-2.47" />
        <circle cx="12" cy="19" r="2" />
        <path d="M12 17v-2.5" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Automação de Marketing & Comercial",
    desc: "Funis automatizados, nutrição de leads e recuperação de oportunidades. Máquina comercial rodando no piloto automático.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Sistemas & CRM Sob Medida",
    desc: "CRM personalizado, dashboards inteligentes e integrações via API. Tudo construído para a realidade do seu negócio.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Construção de Sites & Estrutura Digital",
    desc: "Sites estratégicos, landing pages de alta conversão e integração direta com automações e CRM. Estrutura que gera resultado.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Projetos de Automação Completos",
    desc: "Operação comercial automatizada de ponta a ponta. Projetos high ticket para quem quer escalar sem aumentar equipe.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    number: "06",
    title: "FYRE HUB — Produtos & SaaS",
    desc: "SaaS próprios, sistemas escaláveis e tecnologia proprietária. Produtos digitais prontos para resolver problemas reais do mercado.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
];

export default function WhatWeDo() {
  return (
    <section className="relative py-16 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 sm:mb-20 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-4 block">
            Soluções
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
              O que{" "}
              <span className="text-gradient italic">fazemos</span>
            </h2>
            <p className="text-sm font-light text-white/30 max-w-md">
              Automação, IA, sistemas e estrutura digital sob medida. Nada de
              pacotes genéricos — construímos a tecnologia que o seu negócio precisa para escalar.
            </p>
          </div>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.06] stagger-children">
          {services.map((service) => (
            <div
              key={service.number}
              className="bg-black p-8 sm:p-10 group hover:bg-white/[0.03] transition-all duration-500 cursor-default relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04)_0%,transparent_60%)]" />

              <div className="relative z-10">
                {/* Icon + Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/60 group-hover:border-white/20 transition-all duration-500">
                    {service.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-white/10 group-hover:text-white/20 transition-colors duration-500">
                    {service.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-3 group-hover:translate-x-1 transition-transform duration-500">
                  {service.title}
                </h3>
                <p className="text-xs font-light text-white/35 leading-relaxed group-hover:text-white/50 transition-colors duration-500">
                  {service.desc}
                </p>

                {/* Animated bottom line */}
                <div className="mt-6 h-[1px] bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-0 bg-white/30 group-hover:w-full transition-all duration-700" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 reveal">
          <a href="#contato" className="cta-button-outline group">
            VER COMO PODEMOS AJUDAR
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
