"use client";

export default function TechDivider() {
  const text = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";

  return (
    <div className="relative py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-0">
          {/* Left line */}
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-white/10" />

          {/* Center spinning logo */}
          <div className="flex-shrink-0 relative w-32 h-32 mx-4">
            {/* Circular rotating text */}
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
              <text className="fill-white/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
                <textPath href="#circlePath">
                  {text}
                </textPath>
              </text>
            </svg>

            {/* Center logo image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/logo-fyre-circle.png"
                alt="FYRE Automação & I.A"
                className="w-8 h-auto"
              />
            </div>
          </div>

          {/* Right line */}
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-white/10 to-white/10" />
        </div>
      </div>
    </div>
  );
}
