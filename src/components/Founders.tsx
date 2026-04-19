"use client";

const founders = [
  {
    name: "Juan Mansilha",
    role: "Co-Founder",
    specialty: "Automação & Inteligência Artificial",
    image: "/images/juan.jpg",
    instagram: "https://www.instagram.com/juanmansilha.mkt/",
    highlight: "8+ anos no digital | 500+ processos automatizados",
    bio: "Graduado em Marketing pela Universidade Positivo. Enquanto a maioria do mercado foca em métrica de vaidade, Juan projeta sistemas de automação e IA que impactam CAC, LTV e margem. A visão de growth aplicada à construção de tecnologia.",
    bio2: "Na FYRE, atua na estratégia, desenvolvimento de sistemas, automações com n8n e design de produto. O objetivo é tirar o empresário do operacional e colocá-lo na direção do próprio negócio.",
  },
  {
    name: "Rodrigo Lopes",
    role: "Co-Founder",
    specialty: "Automação & Inteligência Artificial",
    image: "/images/rodrigo.jpg",
    instagram: "https://www.instagram.com/rodrigohacking/",
    highlight: "+150 operações automatizadas",
    bio: "Entendeu antes da maioria que IA não era tendência — era inevitável. +5 anos construindo sistemas de automação pra holdings e operações com mais de 150 clientes. Aprendeu a construir com a ferramenta que assustava todo mundo.",
    bio2: "Na FYRE, constrói sistemas reais com n8n, Claude Code, APIs e IA. Não vende template, não vende hype. Entrega resultado que aparece no caixa.",
  },
];

export default function Founders() {
  return (
    <section id="socios" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00FF2B]/[0.02] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-20 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
            Quem Constrói
          </span>
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Dois fundadores,{" "}
            <span className="text-gradient-fyre italic">um sistema</span>
          </h2>
          <p className="mt-4 text-sm font-light text-white/30 max-w-lg mx-auto">
            Marketing + Tecnologia. A combinação que o mercado precisa
            e quase ninguém tem.
          </p>
        </div>

        {/* Founders grid */}
        <div className="grid md:grid-cols-2 gap-12 sm:gap-16 lg:gap-20">
          {founders.map((founder, index) => (
            <div
              key={founder.name}
              className={`${index === 0 ? "reveal-left" : "reveal-right"}`}
            >
              <div className="glass-card rounded-2xl p-8 sm:p-10">
                {/* Photo + Name row */}
                <div className="flex items-center gap-5 mb-6">
                  {/* Photo */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#00FF2B]/20 group hover:shadow-[0_0_30px_rgba(0,255,43,0.12)] transition-all duration-500">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name block */}
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {founder.name}
                    </h3>
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#00FF2B]/50 block">
                      {founder.role}
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-white/25 block mt-0.5">
                      {founder.specialty}
                    </span>
                  </div>
                </div>


                {/* Bio */}
                <div className="space-y-4">
                  <p className="text-sm font-light text-white/45 leading-relaxed">
                    {founder.bio}
                  </p>
                  <p className="text-sm font-light text-white/45 leading-relaxed">
                    {founder.bio2}
                  </p>
                </div>

                {/* Instagram */}
                {founder.instagram && (
                  <div className="mt-6 pt-5 border-t border-white/[0.04]">
                    <a
                      href={founder.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-white/30 hover:text-[#00FF2B] transition-all duration-300 group"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform duration-300">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                      @{founder.instagram.split("/").filter(Boolean).pop()}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
