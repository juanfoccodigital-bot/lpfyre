"use client";

const testimonials = [
  {
    name: "Carlos M.",
    company: "E-commerce de Moda",
    text: "A FYRE implementou um sistema de atendimento automático com IA que mudou tudo. Em 60 dias, triplicamos a conversão sem aumentar equipe. O cliente é respondido na hora, qualificado e direcionado automaticamente.",
    result: "3x conversão",
  },
  {
    name: "Amanda R.",
    company: "Clínica de Estética",
    text: "A automação da FYRE eliminou o trabalho manual que travava a operação. Agendamentos, confirmações, follow-ups — tudo roda sozinho agora. Reduzimos 70% do tempo operacional e a equipe finalmente foca no que importa.",
    result: "70% menos tempo operacional",
  },
  {
    name: "Ricardo S.",
    company: "SaaS B2B",
    text: "O sistema de qualificação com IA da FYRE mudou nosso jogo. Leads chegam pré-qualificados, o time comercial foca só nos quentes. Em 90 dias nosso CAC caiu pela metade.",
    result: "50% redução no CAC",
  },
];

const clientLogos = [
  "Cliente 01",
  "Cliente 02",
  "Cliente 03",
  "Cliente 04",
  "Cliente 05",
  "Cliente 06",
  "Cliente 07",
  "Cliente 08",
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-4 block">
            Resultados Reais
          </span>
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            O que nossos clientes{" "}
            <span className="text-gradient italic">dizem</span>
          </h2>
        </div>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-24 stagger-children">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="glass-card rounded-2xl p-8 flex flex-col justify-between"
            >
              {/* Quote mark */}
              <div>
                <svg
                  className="w-8 h-8 text-white/10 mb-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
                <p className="text-sm font-light text-white/50 leading-relaxed mb-6">
                  {testimonial.text}
                </p>
              </div>

              <div>
                {/* Result badge */}
                <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/60">
                    {testimonial.result}
                  </span>
                </div>

                {/* Author */}
                <div>
                  <p className="text-sm font-bold text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs font-light text-white/30">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Client logos - oculto por enquanto */}
      </div>
    </section>
  );
}
