"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";
import { ClientUpdate } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const TYPE_COLORS: Record<string, string> = {
  update: "bg-blue-500/20 text-blue-400",
  insight: "bg-purple-500/20 text-purple-400",
  report: "bg-green-500/20 text-green-400",
  alert: "bg-red-500/20 text-red-400",
};

const TYPE_LABELS: Record<string, string> = {
  update: "Atualizacao",
  insight: "Insight",
  report: "Relatorio",
  alert: "Alerta",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
  );
}

export default function PortalAtualizacoesPage() {
  const router = useRouter();
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente");
      return;
    }

    const clientId = session.client_id;

    async function fetchData() {
      const { data } = await supabase
        .from("client_updates")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      setUpdates((data as ClientUpdate[]) || []);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl lg:text-5xl text-white mb-1">
          Atualizacoes
        </h1>
        <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          Novidades e insights sobre seu projeto
        </p>
      </div>

      {updates.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 backdrop-blur-sm text-center">
          <svg
            className="w-12 h-12 text-white/10 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
            Nenhuma atualizacao ainda. Fique tranquilo, estamos trabalhando!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div
              key={update.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base text-white font-semibold font-[family-name:var(--font-montserrat)] mb-1">
                    {update.title}
                  </h3>
                  <p className="text-xs text-white/30 font-[family-name:var(--font-montserrat)]">
                    {formatDate(update.created_at)}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-[family-name:var(--font-montserrat)] flex-shrink-0 ${
                    TYPE_COLORS[update.type] || "bg-white/10 text-white/60"
                  }`}
                >
                  {TYPE_LABELS[update.type] || update.type}
                </span>
              </div>

              {/* Content */}
              <div className="text-sm text-white/60 font-[family-name:var(--font-montserrat)] leading-relaxed whitespace-pre-line">
                {update.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
