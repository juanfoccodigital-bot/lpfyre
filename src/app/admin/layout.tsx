"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, AuthSession } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [notification, setNotification] = useState<{name: string; time: Date} | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession && !isLoginPage) {
      router.push("/admin/login");
      return;
    }

    setSession(currentSession);
    setChecking(false);
  }, [pathname, router, isLoginPage]);

  // Subscribe to realtime lead inserts
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          setNotification({ name: payload.new.nome, time: new Date() });
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczJjqH0telezo0VYy8x7R3SDlIe7PCqHRINlCCv8qnh0RJWI3ByaCIUExnkbvEn4tTWXGWuMKak19qfp24u5qMZHGHoraunJBuf5Gqr6GVeYCRqaicjXuElqSdlYd+kJ2YlY+FjZmWk5GNkZiVkpCRkpaVkZKUk5SVk5OUlJSUlJSUlJOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTlJSUlJSUlJSUlJSUlJSUlJSUlA=="
          );
          audio.volume = 0.5;
          audio.play().catch(() => {});
          setTimeout(() => setNotification(null), 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Login page renders without nav
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNav user={session} />
      <div className="pt-16">{children}</div>

      {/* Real-time lead notification toast */}
      {notification && (
        <div
          className="fixed top-20 right-6 z-50 animate-[slideInRight_0.4s_ease-out] max-w-sm"
          style={{
            animation: "slideInRight 0.4s ease-out",
          }}
        >
          <style jsx>{`
            @keyframes slideInRight {
              from {
                transform: translateX(120%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            @keyframes pulseGlow {
              0%, 100% { box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.4); }
              50% { box-shadow: 0 0 20px 4px rgba(255, 69, 0, 0.2); }
            }
          `}</style>
          <div
            className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] border-l-4 border-l-orange-500 rounded-2xl p-4 shadow-2xl"
            style={{ animation: "pulseGlow 2s ease-in-out infinite" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-400 mb-1">
                  {"🔔"} Novo Lead!
                </p>
                <p className="text-sm text-white/90 font-semibold">
                  {notification.name}
                </p>
                <p className="text-xs text-red-400 mt-1.5 font-medium">
                  Atender em ate 5 minutos
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
