"use client";

import { useEffect, useState } from "react";
import { getSession, AuthSession, setSession } from "@/lib/admin-auth";

export default function SettingsPage() {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setSessionState(s);
      setDisplayName(s.display_name);
      // Load saved overrides from localStorage
      const overrides = localStorage.getItem(`fyre_settings_${s.id}`);
      if (overrides) {
        try {
          const parsed = JSON.parse(overrides);
          if (parsed.display_name) setDisplayName(parsed.display_name);
          if (parsed.avatar_url) setAvatarUrl(parsed.avatar_url);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  function handleSave() {
    if (!session) return;

    // Save overrides to localStorage
    const overrides = { display_name: displayName, avatar_url: avatarUrl };
    localStorage.setItem(`fyre_settings_${session.id}`, JSON.stringify(overrides));

    // Update session display name
    const updatedSession: AuthSession = { ...session, display_name: displayName };
    setSession(updatedSession);
    setSessionState(updatedSession);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const inputClass =
    "w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300";
  const labelClass = "block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1.5";
  const glassCard = "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Settings
          </h1>
          <p className="text-xs font-light text-white/40 mt-1">
            Configuracoes do seu perfil
          </p>
        </div>

        {/* Profile Card */}
        <div className={`${glassCard} p-6 mb-6`}>
          <h2 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30 mb-6">
            Perfil
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const sibling = (e.target as HTMLImageElement).nextElementSibling;
                    if (sibling) sibling.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`w-16 h-16 rounded-full bg-white/10 border-2 border-white/10 flex items-center justify-center ${
                  avatarUrl ? "hidden" : ""
                }`}
              >
                <span className="text-lg font-bold text-white/50">{initials}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/80">{displayName}</p>
              <p className="text-xs text-white/30">@{session.username}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Nome de Exibicao</label>
              <input
                className={inputClass}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className={labelClass}>URL do Avatar</label>
              <input
                className={inputClass}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
              />
              <p className="text-[10px] text-white/20 mt-1">Cole a URL de uma imagem para usar como avatar</p>
            </div>
          </div>

          {/* Save */}
          <div className="mt-8 pt-5 border-t border-white/[0.06]">
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                saved
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white text-black hover:bg-white/90"
              }`}
            >
              {saved ? "Salvo!" : "Salvar Alteracoes"}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className={`${glassCard} p-6`}>
          <h2 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30 mb-6">
            Informacoes da Conta
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
              <span className="text-xs text-white/30 font-medium">Username</span>
              <span className="text-sm text-white/60 font-mono">@{session.username}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
              <span className="text-xs text-white/30 font-medium">User ID</span>
              <span className="text-[10px] text-white/30 font-mono">{session.id}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-white/30 font-medium">Tipo</span>
              <span className="text-sm text-white/60">Administrador</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
