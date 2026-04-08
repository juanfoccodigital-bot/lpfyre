"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateClient, setPortalSession } from "@/lib/portal-auth";

export default function PortalClienteLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const spinText = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const session = await authenticateClient(username, password);
    if (!session) {
      setError("Credenciais inválidas. Verifique usuário e senha.");
      setLoading(false);
      return;
    }

    setPortalSession(session);
    router.push("/portal-cliente/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-white/[0.015] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-sm mx-auto px-6 relative z-10">
        {/* Spinning Logo */}
        <div className="flex justify-center mb-12">
          <div className="relative w-32 h-32">
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <defs>
                <path
                  id="portalCirclePath"
                  d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                />
              </defs>
              <text
                className="fill-white/25"
                style={{
                  fontSize: "7.2px",
                  letterSpacing: "3.2px",
                  fontFamily: "var(--font-montserrat)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <textPath href="#portalCirclePath">{spinText}</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/logo-fyre-circle.png"
                alt="FYRE Automação & I.A"
                className="w-8 h-auto"
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2">
            Portal do Cliente
          </h1>
          <p className="text-sm font-light text-white/35 tracking-wide">
            Acesse sua área exclusiva
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu.usuario"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-300"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-[#ff4500] text-xs font-medium text-center py-2 bg-[#ff4500]/[0.06] rounded-lg border border-[#ff4500]/10">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cta-button w-full group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "ENTRANDO..." : "ACESSAR PORTAL"}
              {!loading && (
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
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-[10px] font-light text-white/10 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} FYRE Automação & I.A
          </p>
        </div>
      </div>
    </div>
  );
}
