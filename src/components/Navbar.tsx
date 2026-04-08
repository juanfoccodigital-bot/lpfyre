"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const links = [
    { href: "#sobre", label: "Sobre" },
    { href: "#servicos", label: "Soluções" },
    { href: "/planos", label: "Planos" },
    { href: "#contato", label: "Contato" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = links.map((l) => l.href.replace("#", ""));
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [menuOpen]);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) {
      setMenuOpen(false);
      return;
    }
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const offset = 88;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "bg-black/55 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            setMenuOpen(false);
          }}
          className="group flex items-center"
          aria-label="Voltar ao topo"
        >
          <img
            id="navbar-logo"
            src="/images/logo-fyre.png"
            alt="FYRE Automação & I.A"
            className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-85"
          />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`relative text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-white transition-all duration-300 ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </a>
            );
          })}

          <div className="ml-2 flex items-center gap-3">
            <a
              href="#contato"
              onClick={(e) => scrollTo(e, "#contato")}
              className="rounded-md border border-white/30 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-200 hover:bg-white hover:text-black"
            >
              Diagnóstico Gratuito
            </a>
            <a
              href="/portal-cliente"
              className="rounded-md border border-white/15 bg-white/[0.06] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.14] hover:text-white"
            >
              Portal do Cliente
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-white/15 p-2 text-white lg:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={`block h-[1.5px] w-6 bg-white transition-all duration-300 ${
              menuOpen ? "translate-y-[5px] rotate-45" : ""
            }`}
          />
          <span
            className={`mt-1.5 block h-[1.5px] w-6 bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`mt-1.5 block h-[1.5px] w-6 bg-white transition-all duration-300 ${
              menuOpen ? "-translate-y-[5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <div
        id="mobile-menu"
        className={`relative z-50 overflow-hidden border-t border-white/10 bg-black/95 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          menuOpen ? "max-h-[520px]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-5 px-6 py-6">
          {links.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            );
          })}

          <a
            href="#contato"
            onClick={(e) => scrollTo(e, "#contato")}
            className="mt-2 rounded-md border border-white/30 px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-200 hover:bg-white hover:text-black"
          >
            Diagnóstico Gratuito
          </a>
          <a
            href="/portal-cliente"
            onClick={() => setMenuOpen(false)}
            className="rounded-md border border-white/15 bg-white/[0.06] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.14] hover:text-white"
          >
            Portal do Cliente
          </a>
        </div>
      </div>
    </nav>
  );
}
