"use client";

import { useEffect, useRef } from "react";

const whatsappLinks = [
  "https://wa.me/5541997038671?text=Ol%C3%A1!%20Vim%20pelo%20link%20da%20bio%20e%20quero%20agendar%20um%20diagn%C3%B3stico.",
  "https://wa.me/5541997641408?text=Ol%C3%A1!%20Vim%20pelo%20link%20da%20bio%20e%20quero%20agendar%20um%20diagn%C3%B3stico.",
];

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47M5 14.5l2.47-2.47m0 0a48.578 48.578 0 019.06 0" />
        <circle cx="12" cy="19" r="2" />
        <path d="M12 17v-2.5" />
      </svg>
    ),
    title: "Automação & IA",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: "Sites & Sistemas",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: "Consultoria Estratégica",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Automação Comercial",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: "Projetos de Automação",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: "CRM & Unificação",
  },
];

const founders = [
  {
    name: "Juan Mansilha",
    title: "Founder",
    role: "Growth Architect",
    image: "/images/juan.jpg",
    instagram: "https://www.instagram.com/juanmansilha.mkt/",
    handle: "@juanmansilha.mkt",
  },
  {
    name: "Rodrigo Lopes",
    title: "Founder",
    role: "Automação & IA",
    image: "/images/rodrigo.jpg",
    instagram: "https://www.instagram.com/rodrigohacking/",
    handle: "@rodrigohacking",
  },
];

function handleDiagnostico() {
  const randomLink = whatsappLinks[Math.floor(Math.random() * whatsappLinks.length)];
  window.open(randomLink, "_blank");
}

export default function BioPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-30px" }
    );

    const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const spinText = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* Content container */}
      <div className="w-full max-w-md mx-auto px-5 py-10 sm:py-14 relative z-10">

        {/* Spinning Logo */}
        <div className="flex justify-center mb-8 reveal">
          <div className="relative w-28 h-28">
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <defs>
                <path
                  id="bioCirclePath"
                  d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                />
              </defs>
              <text
                className="fill-white/30"
                style={{
                  fontSize: "7.5px",
                  letterSpacing: "3px",
                  fontFamily: "var(--font-montserrat)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <textPath href="#bioCirclePath">{spinText}</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/logo-fyre-circle.png"
                alt="FYRE Automação & I.A"
                className="w-7 h-auto"
              />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center mb-10 reveal">
          <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2">
            Tecnologia que <span className="text-gradient italic">escala</span>
          </h1>
          <p className="text-xs font-light text-white/40 leading-relaxed max-w-xs mx-auto">
            Automação, IA e sistemas para empresários que querem resultado — não promessa.
          </p>
        </div>

        {/* CTA Principal */}
        <div className="mb-10 reveal">
          <button
            onClick={handleDiagnostico}
            className="cta-button w-full group"
          >
            AGENDE UM DIAGNÓSTICO
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div className="separator mb-10" />

        {/* Soluções */}
        <div className="mb-10">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-5 block text-center reveal">
            Nossas Soluções
          </span>
          <div className="grid grid-cols-2 gap-[1px] bg-white/[0.06] stagger-children">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-black p-4 flex flex-col items-center text-center gap-2 hover:bg-white/[0.03] transition-all duration-500"
              >
                <div className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/30">
                  {service.icon}
                </div>
                <span className="text-[11px] font-semibold text-white/60 leading-tight">
                  {service.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Secundário */}
        <div className="mb-10 reveal">
          <button
            onClick={handleDiagnostico}
            className="cta-button-outline w-full group"
          >
            FALE COM A GENTE
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-300 group-hover:scale-110">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div className="separator mb-10" />

        {/* Sócios / Instagram */}
        <div className="mb-10">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-6 block text-center reveal">
            Os Fundadores
          </span>
          <div className="flex flex-col gap-4 stagger-children">
            {founders.map((founder) => (
              <a
                key={founder.handle}
                href={founder.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-2xl p-4 flex items-center gap-4 group cursor-pointer"
              >
                {/* Photo */}
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-white/30 transition-colors duration-300">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {founder.name}
                  </h3>
                  <p className="text-[11px] text-white/50 font-semibold">
                    {founder.title}
                  </p>
                  <p className="text-[10px] text-white/30 font-light">
                    {founder.role}
                  </p>
                  <p className="text-[11px] text-white/60 font-semibold mt-0.5">
                    {founder.handle}
                  </p>
                </div>

                {/* Instagram icon */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="separator mb-10" />

        {/* Conheça nosso site */}
        <div className="mb-10 reveal">
          <a
            href="/"
            className="glass-card rounded-2xl p-5 flex items-center justify-between group cursor-pointer block"
          >
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-fyre.png"
                alt="FYRE"
                className="h-5 w-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition-colors duration-300 uppercase tracking-wider">
                Conheça nosso site
              </span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/30 group-hover:text-white/70 transition-all duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* CTA Final */}
        <div className="mb-8 reveal">
          <button
            onClick={handleDiagnostico}
            className="cta-button w-full group"
          >
            AGENDE UM DIAGNÓSTICO
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-[10px] font-light text-white/15 tracking-wider">
            &copy; {new Date().getFullYear()} FYRE Automação & I.A
          </p>
        </div>
      </div>
    </div>
  );
}
