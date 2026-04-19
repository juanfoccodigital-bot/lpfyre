"use client";

export default function Automatizacao() {
  return (
    <section id="servicos" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF2B]/[0.02] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div className="text-center mb-10 sm:mb-20">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
            Como Funciona
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Sua operação no{" "}
            <span className="text-gradient-fyre italic">piloto automático</span>
          </h2>
          <p className="mt-4 text-sm font-light text-white/30 max-w-2xl mx-auto">
            Você foca na estratégia. A tecnologia cuida do resto.
            Atendimento, vendas, follow-up — tudo rodando sem você no meio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: "Atendimento com IA",
              desc: "Seus leads são respondidos em segundos, qualificados automaticamente e direcionados pro time certo. 24h por dia, sem folga.",
              icon: (
                <svg className="w-6 h-6 text-[#00FF2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              ),
            },
            {
              title: "Funil Automatizado",
              desc: "Lead entrou? O sistema nutre, faz follow-up e esquenta até estar pronto pra comprar. Sem depender do seu time lembrar.",
              icon: (
                <svg className="w-6 h-6 text-[#00FF2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
            {
              title: "Tudo Conectado",
              desc: "CRM, WhatsApp, e-mail, calendário, pagamento — tudo integrado via API. Uma engrenagem, não um Frankenstein.",
              icon: (
                <svg className="w-6 h-6 text-[#00FF2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.title} className="glass-card p-8 rounded-2xl group">
              <div className="w-12 h-12 bg-[#00FF2B]/[0.08] border border-[#00FF2B]/15 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(0,255,43,0.12)] transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a href="#contato" className="cta-button">
            QUERO AUTOMATIZAR MINHA OPERAÇÃO
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
