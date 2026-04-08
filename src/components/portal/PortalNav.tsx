"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearPortalSession } from "@/lib/portal-auth";

interface PortalNavProps {
  user: {
    display_name: string;
    client_id: string;
    username: string;
  };
}

const navLinks = [
  { label: "Dashboard", href: "/portal-cliente/dashboard" },
  { label: "Tráfego", href: "/portal-cliente/trafego" },
  { label: "Conteúdo", href: "/portal-cliente/conteudo" },
  { label: "Automação", href: "/portal-cliente/automacao" },
  { label: "Reuniões", href: "/portal-cliente/reunioes" },
  { label: "Calendário", href: "/portal-cliente/calendario" },
  { label: "Arquivos", href: "/portal-cliente/arquivos" },
  { label: "Atualizações", href: "/portal-cliente/atualizacoes" },
  { label: "Aulas", href: "/portal-cliente/aulas" },
];

export default function PortalNav({ user }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user.display_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    clearPortalSession();
    router.push("/portal-cliente/login");
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Logo + Label */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/images/logo-fyre-circle.png"
              alt="FYRE"
              className="w-6 h-auto"
            />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/40 hidden sm:block">
              Portal do Cliente
            </span>
          </div>

          {/* Center: Nav Links (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + Logout (desktop) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <span className="text-xs text-white/50 font-medium">
              {user.display_name}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60 tracking-wider">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white/25 hover:text-white/60 transition-colors duration-200 ml-1"
            >
              Sair
            </button>
          </div>

          {/* Mobile: Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span
              className={`block w-5 h-px bg-white/50 transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-px bg-white/50 transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-px bg-white/50 transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-20 px-6 lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/60 tracking-wider">
                {initials}
              </div>
              <span className="text-sm text-white/50 font-medium">
                {user.display_name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold tracking-[0.12em] uppercase text-white/25 hover:text-white/60 transition-colors duration-200"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </>
  );
}
