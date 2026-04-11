"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/admin-auth";

interface AdminNavProps {
  user: {
    id: string;
    username: string;
    display_name: string;
  };
}

const navLinks = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Clientes", href: "/admin/clients" },
  { label: "Calendário", href: "/admin/calendario" },
  { label: "Funil", href: "/admin/funil" },
  { label: "Financeiro", href: "/admin/financeiro" },
  { label: "Tarefas", href: "/admin/tarefas" },
  { label: "Operacional", href: "/admin/operacional" },
];

const ferramentasLinks = [
  { label: "Gerar Proposta", href: "/fechamento", icon: "📄" },
  { label: "Briefings", href: "/admin/briefings", icon: "📋" },
  { label: "Criador Instagram", href: "/admin/instagram", icon: "📸" },
  { label: "Calendário Conteúdo", href: "/admin/conteudo", icon: "📅" },
  { label: "Time I.A", href: "/admin/time-ia", icon: "🤖" },
];

const moreLinks = [
  { label: "Links", href: "/admin/links" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  const userPhoto =
    user.username === "juanmansilha"
      ? "/images/juan.jpg"
      : user.username === "rodrigolopes"
      ? "/images/rodrigo.jpg"
      : null;

  const initials = user.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/admin/login");
  }

  const isToolsActive = ferramentasLinks.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + "/")
  );

  function NavLink({ href, label }: { href: string; label: string }) {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
          isActive
            ? "text-white bg-white/[0.08]"
            : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="flex-shrink-0">
            <img src="/images/logo-fyre.png" alt="FYRE" className="h-4 w-auto opacity-50 hover:opacity-80 transition-opacity duration-300" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}

            {/* Ferramentas dropdown */}
            <div ref={toolsRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1 ${
                  isToolsActive || toolsOpen
                    ? "text-white bg-white/[0.08]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                Ferramentas
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {toolsOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  {ferramentasLinks.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? "text-white bg-white/[0.08]"
                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="text-sm">{link.icon}</span>
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {moreLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="text-xs text-white/40 font-medium">{user.display_name}</span>
            {userPhoto ? (
              <img src={userPhoto} alt={user.display_name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/60">{initials}</span>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="text-white/30 hover:text-white/70 transition-colors duration-200 p-1.5" title="Sair">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white/40 hover:text-white/70 transition-colors duration-200 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white bg-white/[0.08]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}>
                  {link.label}
                </Link>
              );
            })}

            {/* Ferramentas section */}
            <div className="pt-2 pb-1">
              <span className="px-3 text-[9px] font-semibold tracking-[0.25em] uppercase text-white/20">Ferramentas</span>
            </div>
            {ferramentasLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white bg-white/[0.08]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}>
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 pb-1">
              <span className="px-3 text-[9px] font-semibold tracking-[0.25em] uppercase text-white/20">Mais</span>
            </div>
            {moreLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white bg-white/[0.08]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile user info */}
          <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2.5 sm:hidden">
            {userPhoto ? (
              <img src={userPhoto} alt={user.display_name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/60">{initials}</span>
              </div>
            )}
            <span className="text-xs text-white/40 font-medium">{user.display_name}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
