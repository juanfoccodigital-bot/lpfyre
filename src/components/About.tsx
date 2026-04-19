"use client";

import AnimatedCounter from "./AnimatedCounter";

export default function About() {
  return (
    <section id="sobre" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — copy nova */}
          <div className="reveal-left">
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
              Sobre a FYRE
            </span>
            <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white leading-tight">
              Não somos uma
              <br />
              <span className="text-gradient-fyre italic">agência.</span>
            </h2>
            <div className="mt-8 space-y-6">
              <p className="text-sm font-light text-white/50 leading-relaxed">
                Agência entrega serviço. Nós entregamos{" "}
                <span className="text-white font-medium">
                  infraestrutura de crescimento
                </span>
                . Sistemas que automatizam atendimento, qualificam leads, fecham
                vendas e fazem sua operação rodar sem você no meio.
              </p>
              <p className="text-sm font-light text-white/50 leading-relaxed">
                Enquanto o mercado vende template e promessa, a FYRE constrói{" "}
                <span className="text-white font-medium">
                  máquinas previsíveis de receita
                </span>
                . Automação real. IA que funciona. Sistemas que você sente no
                caixa, não no PowerPoint.
              </p>
            </div>
          </div>

          {/* Right - Feature cards */}
          <div className="stagger-children grid grid-cols-2 gap-4">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                title: "Sistemas Sob Medida",
                desc: "Nada de plataforma genérica. Construímos pra sua operação.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: "Visão de Negócio",
                desc: "Cada linha de código é pensada pra dar resultado financeiro.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
                title: "IA que Trabalha",
                desc: "Agentes IA que atendem, qualificam e vendem 24h por dia.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                ),
                title: "Escala Real",
                desc: "Crescer sem aumentar equipe. Isso é automação de verdade.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 rounded-2xl group">
                <div className="w-10 h-10 rounded-xl border border-[#00FF2B]/15 flex items-center justify-center text-[#00FF2B]/30 mb-4 group-hover:text-[#00FF2B]/70 group-hover:border-[#00FF2B]/30 group-hover:shadow-[0_0_15px_rgba(0,255,43,0.1)] transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs font-light text-white/40 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats band */}
        <div className="mt-24 reveal">
          <div className="neon-line mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { label: "Projetos Entregues", value: "320+" },
              { label: "Processos Automatizados", value: "500+" },
              { label: "Anos de Mercado", value: "8+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-gradient-fyre tracking-tight">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/25 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
