"use client";

const founders = [
  {
    name: "Juan Mansilha",
    role: "Founder",
    specialty: "Growth Architect",
    image: "/images/juan.jpg",
    instagram: "https://www.instagram.com/juanmansilha.mkt/",
    bio: "Mais de 8 anos no digital e R$10M+ gerenciados em campanhas. Graduado em Marketing pela Universidade Positivo, Juan construiu uma visão rara: entende profundamente de marketing e usa isso como diferencial para projetar sistemas que escalam de verdade. Não acredita em métrica de vaidade — acredita em CAC, LTV e margem.",
    bio2: "Na FYRE Automação & I.A, atua na estratégia, desenvolvimento de sistemas, automações com n8n, design de produto e vibecoding. A mentalidade de growth aplicada à construção de tecnologia. O objetivo é tirar o empresário do operacional e colocá-lo na direção do próprio negócio.",
    bio3: "",
  },
  {
    name: "Rodrigo Lopes",
    role: "Founder",
    specialty: "Head de Automação & IA",
    image: "/images/rodrigo.jpg",
    instagram: "https://www.instagram.com/rodrigohacking/",
    bio: "Rodrigo Lopes entendeu antes da maioria que a IA não era tendência. Era inevitável. Com +5 anos de experiência, construiu sistemas de automação para holdings e gerenciou operações com mais de 150 clientes. Enquanto o mercado reclamava, ele aprendia a construir com a ferramenta que assustava todo mundo.",
    bio2: "Hoje é fundador da FYRE Automação & I.A. Tem algo que poucos têm: entende de marketing e de tecnologia ao mesmo tempo. Não vende template, não vende hype. Constrói sistemas reais com n8n, Claude Code, APIs e IA para empresários que precisam de resultado, não de promessa.",
    bio3: "",
  },
];

export default function Founders() {
  return (
    <section id="socios" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/[0.01] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-20 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-4 block">
            Quem está por trás
          </span>
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Os <span className="text-gradient italic">Fundadores</span>
          </h2>
        </div>

        {/* Founders grid */}
        <div className="grid md:grid-cols-2 gap-12 sm:gap-16 lg:gap-24">
          {founders.map((founder, index) => (
            <div
              key={founder.name}
              className={`${index === 0 ? "reveal-left" : "reveal-right"}`}
            >
              {/* Photo + Name */}
              <div className="flex flex-col items-center mb-8">
                {/* Circular photo */}
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 mb-4 group">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 z-10 group-hover:opacity-0 transition-opacity duration-500" />
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name and role */}
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {founder.name}
                </h3>
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30 mt-1">
                  {founder.role}
                </span>
                <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/20 mt-0.5 block">
                  {founder.specialty}
                </span>
              </div>

              {/* Bio */}
              {founder.bio ? (
                <div className="space-y-4">
                  <p className="text-sm font-light text-white/45 leading-relaxed text-center">
                    {founder.bio}
                  </p>
                  {founder.bio2 && (
                    <p className="text-sm font-light text-white/45 leading-relaxed text-center">
                      {founder.bio2}
                    </p>
                  )}
                  {founder.bio3 && (
                    <p className="text-sm font-light text-white/45 leading-relaxed text-center">
                      {founder.bio3}
                    </p>
                  )}

                  {/* Instagram button */}
                  {founder.instagram && (
                    <div className="flex justify-center pt-2">
                      <a
                        href={founder.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-full text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform duration-300">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                        Seguir
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-sm font-light text-white/30 italic">
                    Em breve.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
