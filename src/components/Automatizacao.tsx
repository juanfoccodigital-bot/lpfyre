"use client";

export default function Automatizacao() {
  return (
    <section id="servicos" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.01] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div className="text-center mb-10 sm:mb-20">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-4 block">
            Nossos Sistemas
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Automação{" "}
            <span className="text-gradient italic">360°</span>
          </h2>
          <p className="mt-4 text-lg font-light text-white/30">
            Soluções completas para sua operação
          </p>
          <p className="mt-2 text-sm font-light text-white/20 max-w-2xl mx-auto">
            Integração de IA, automação e sistemas inteligentes para negócios que querem escalar sem complicações.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-8">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Atendimento com IA</h3>
            <p className="text-sm text-white/60">Agentes inteligentes que respondem, qualificam e direcionam leads 24h por dia.</p>
          </div>

          <div className="glass-card p-8">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Automação de Vendas</h3>
            <p className="text-sm text-white/60">Follow-up automático, nutrição e fechamento sem esforço manual.</p>
          </div>

          <div className="glass-card p-8">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Integrações</h3>
            <p className="text-sm text-white/60">CRM, WhatsApp, e-mail e ferramentas conectadas em tempo real.</p>
          </div>
        </div>

        <div className="text-center mt-16">
          <a href="#contato" className="cta-button">
            QUERO MINHA OPERAÇÃO AUTOMATIZADA
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

