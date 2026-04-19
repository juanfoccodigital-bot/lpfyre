"use client";

export default function MarqueeBanner2() {
  const items = [
    "ESTRUTURA SE CONSTRÓI",
    "PARE DE OPERAR",
    "COMECE A DOMINAR",
    "ESCALA PREVISÍVEL",
    "LUCRO MENSURÁVEL",
  ];

  return (
    <div className="relative overflow-hidden py-8 border-y border-[#00FF2B]/[0.04] bg-[#00FF2B]/[0.01]">
      <div className="flex whitespace-nowrap">
        <div className="animate-marquee-reverse flex items-center">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="text-[13px] font-black tracking-[0.5em] uppercase text-[#CFFF00]/[0.06] px-10">
                {item}
              </span>
              <span className="w-2 h-2 bg-[#CFFF00]/[0.04] rotate-45" />
            </span>
          ))}
        </div>
        <div
          className="animate-marquee-reverse flex items-center"
          aria-hidden="true"
        >
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="text-[13px] font-black tracking-[0.5em] uppercase text-[#CFFF00]/[0.06] px-10">
                {item}
              </span>
              <span className="w-2 h-2 bg-[#CFFF00]/[0.04] rotate-45" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
