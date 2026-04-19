"use client";

const words = [
  "AUTOMAÇÃO",
  "INTELIGÊNCIA ARTIFICIAL",
  "SISTEMAS",
  "CRM",
  "ESCALA",
  "PERFORMANCE",
  "ESTRATÉGIA",
  "INTEGRAÇÃO",
  "TECNOLOGIA",
  "RESULTADO",
];

export default function MarqueeBanner() {
  return (
    <div className="relative overflow-hidden py-10 sm:py-14">
      {/* Back band */}
      <div
        className="relative w-[140vw] -ml-[20vw] py-4 sm:py-5 z-0"
        style={{
          transform: "rotate(3deg)",
          background: "linear-gradient(90deg, rgba(207,255,0,0.03), rgba(0,255,43,0.05), rgba(207,255,0,0.03))",
          borderTop: "1px solid rgba(0,255,43,0.08)",
          borderBottom: "1px solid rgba(0,255,43,0.08)",
        }}
      >
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee-reverse flex items-center">
            {[...words, ...words].map((word, i) => (
              <span key={i} className="flex items-center gap-8 px-8">
                <span className={`text-sm sm:text-base font-bold tracking-[0.2em] uppercase ${
                  i % 2 === 0 ? "text-white/15" : "text-[#00FF2B]/15"
                }`}>
                  {word}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#00FF2B]/10" />
              </span>
            ))}
          </div>
          <div className="animate-marquee-reverse flex items-center" aria-hidden="true">
            {[...words, ...words].map((word, i) => (
              <span key={i} className="flex items-center gap-8 px-8">
                <span className={`text-sm sm:text-base font-bold tracking-[0.2em] uppercase ${
                  i % 2 === 0 ? "text-white/15" : "text-[#00FF2B]/15"
                }`}>
                  {word}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#00FF2B]/10" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Front band — with backdrop-blur */}
      <div
        className="relative w-[140vw] -ml-[20vw] py-4 sm:py-5 -mt-6 sm:-mt-8 z-10"
        style={{
          transform: "rotate(-3deg)",
          background: "linear-gradient(90deg, rgba(0,255,43,0.05), rgba(207,255,0,0.03), rgba(0,255,43,0.05))",
          borderTop: "1px solid rgba(0,255,43,0.12)",
          borderBottom: "1px solid rgba(0,255,43,0.12)",
          boxShadow: "0 0 50px rgba(0,255,43,0.04)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex items-center">
            {[...words, ...words].map((word, i) => (
              <span key={i} className="flex items-center gap-8 px-8">
                <span className={`text-sm sm:text-base font-bold tracking-[0.2em] uppercase ${
                  i % 2 === 0 ? "text-[#00FF2B]/25" : "text-white/20"
                }`}>
                  {word}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#CFFF00]/10" />
              </span>
            ))}
          </div>
          <div className="animate-marquee flex items-center" aria-hidden="true">
            {[...words, ...words].map((word, i) => (
              <span key={i} className="flex items-center gap-8 px-8">
                <span className={`text-sm sm:text-base font-bold tracking-[0.2em] uppercase ${
                  i % 2 === 0 ? "text-[#00FF2B]/25" : "text-white/20"
                }`}>
                  {word}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#CFFF00]/10" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
