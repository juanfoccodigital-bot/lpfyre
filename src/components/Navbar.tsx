"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const links = [
    { href: "#home", label: "Home" },
    { href: "#sobre", label: "Sobre" },
    { href: "#servicos", label: "Soluções" },
    { href: "#resultados", label: "Resultados" },
    { href: "#contato", label: "Diagnóstico" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY < 200) { setActiveSection("home"); return; }
      const sections = links.map((l) => l.href.replace("#", ""));
      let current = "home";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveSection(current);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [menuOpen]);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "#home") { window.scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(false); return; }
    const el = document.getElementById(href.replace("#", ""));
    if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: "smooth" }); }
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-black/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      {/* Desktop — tudo centralizado numa linha */}
      <div className="hidden lg:flex items-center justify-center h-20 px-6 gap-3">
        {/* Logo */}
        <a href="#home" onClick={(e) => scrollTo(e, "#home")} aria-label="Home">
          <img id="navbar-logo" src="/images/logo-fyre.svg" alt="FYRE" className="h-7 w-auto hover:opacity-85 transition-opacity" />
        </a>

        {/* Pill nav */}
        <div className="flex items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md px-1 py-1">
          {links.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-[0.14em] whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-white/[0.1] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* CTA */}
        <a
          href="#aplicacao"
          onClick={(e) => scrollTo(e, "#aplicacao")}
          className="px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md text-[11px] font-medium uppercase tracking-[0.14em] text-white/50 whitespace-nowrap transition-all duration-300 hover:bg-[#00FF2B]/[0.08] hover:border-[#00FF2B]/20 hover:text-[#00FF2B]"
        >
          Entrar em Contato
        </a>
      </div>

      {/* Mobile — logo esquerda, hamburger direita */}
      <div className="flex lg:hidden items-center justify-between h-16 px-5">
        <a href="#home" onClick={(e) => scrollTo(e, "#home")} aria-label="Home">
          <img id="navbar-logo-mobile" src="/images/logo-fyre.svg" alt="FYRE" className="h-6 w-auto" />
        </a>
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="flex flex-col items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] p-2.5"
          aria-label="Menu"
        >
          <span className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`mt-1.5 block h-[1.5px] w-5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`mt-1.5 block h-[1.5px] w-5 bg-white transition-all duration-300 ${menuOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <button aria-label="Fechar" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
      )}

      {/* Mobile menu dropdown */}
      <div className={`relative z-50 overflow-hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl transition-all duration-300 lg:hidden ${menuOpen ? "max-h-[420px]" : "max-h-0"}`}>
        <div className="flex flex-col gap-1 px-5 py-5">
          {links.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`px-4 py-3 rounded-xl text-[12px] font-medium uppercase tracking-[0.16em] transition-all ${
                  isActive ? "text-white bg-white/[0.06]" : "text-white/50"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="#aplicacao"
            onClick={(e) => scrollTo(e, "#aplicacao")}
            className="mt-2 px-4 py-3 rounded-xl border border-[#00FF2B]/20 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00FF2B]/60 hover:bg-[#00FF2B]/[0.06]"
          >
            Entrar em Contato
          </a>
        </div>
      </div>
    </nav>
  );
}
