"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, setSession } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const spinText = "FYRE ADMIN • FYRE ADMIN • FYRE ADMIN • ";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const session = authenticate(username, password);
    if (!session) {
      setError("Credenciais inválidas. Tente novamente.");
      setLoading(false);
      return;
    }

    setSession(session);
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm mx-auto px-6 relative z-10">
        {/* Spinning Logo */}
        <div className="flex justify-center mb-10">
          <div className="relative w-28 h-28">
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <defs>
                <path
                  id="adminCirclePath"
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
                <textPath href="#adminCirclePath">{spinText}</textPath>
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

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-1">
            Admin Portal
          </h1>
          <p className="text-xs font-light text-white/40">
            Faça login para continuar
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300"
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
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-[#ff4500] text-xs font-medium text-center py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cta-button w-full group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
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

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-[10px] font-light text-white/15 tracking-wider">
            &copy; {new Date().getFullYear()} FYRE Automação & I.A
          </p>
        </div>
      </div>
    </div>
  );
}
