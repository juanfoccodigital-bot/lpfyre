"use client";

export default function TechDivider() {
  const text = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";

  return (
    <div className="relative py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-0">
          {/* Left neon line */}
          <div
            className="flex-1 h-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(0,255,43,0.12), rgba(207,255,0,0.1))",
            }}
          />

          {/* Center spinning logo */}
          <div className="flex-shrink-0 relative w-32 h-32 mx-4">
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <defs>
                <path
                  id="circlePath"
                  d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                />
              </defs>
              <text className="fill-[#00FF2B]/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
                <textPath href="#circlePath">
                  {text}
                </textPath>
              </text>
            </svg>

            {/* Center logo image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/icon-fyre.svg"
                alt="FYRE Automação & I.A"
                className="w-8 h-8"
              />
            </div>
          </div>

          {/* Right neon line */}
          <div
            className="flex-1 h-[1px]"
            style={{
              background: "linear-gradient(90deg, rgba(207,255,0,0.1), rgba(0,255,43,0.12), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
