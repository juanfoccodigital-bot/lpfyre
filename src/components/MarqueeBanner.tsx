"use client";

export default function MarqueeBanner() {
  const items = [
    "SISTEMAS INTELIGENTES",
    "AUTOMAÇÃO",
    "INTELIGÊNCIA ARTIFICIAL",
    "BRANDING",
    "CONSULTORIA",
    "SISTEMAS",
    "ESCALA",
    "PERFORMANCE",
    "ESTRATÉGIA 360°",
    "CRM",
  ];

  return (
    <div className="relative overflow-hidden py-6 border-y border-white/5">
      {/* Top marquee */}
      <div className="flex whitespace-nowrap">
        <div className="animate-marquee flex items-center">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/15 px-8">
                {item}
              </span>
              <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
            </span>
          ))}
        </div>
        <div className="animate-marquee flex items-center" aria-hidden="true">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/15 px-8">
                {item}
              </span>
              <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
