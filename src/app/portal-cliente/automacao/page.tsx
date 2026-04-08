"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";

interface Automation {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  url: string | null;
  created_at: string;
  updated_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  chatbot: { label: "Chatbot", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  fluxo: { label: "Fluxo", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  integracao: { label: "Integração", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  sistema: { label: "Sistema", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  agente_ia: { label: "Agente IA", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  em_progresso: { label: "Em Progresso", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  em_teste: { label: "Em Teste", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  em_manutencao: { label: "Em Manutenção", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  desativado: { label: "Desativado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const STATUS_ORDER = ["ativo", "em_progresso", "em_teste", "em_manutencao", "desativado"];

export default function AutomacaoPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente/login");
      return;
    }

    async function fetchAutomations() {
      const { data } = await supabase
        .from("client_automations")
        .select("*")
        .eq("client_id", session!.client_id)
        .order("created_at", { ascending: false });
      setAutomations((data as Automation[]) || []);
      setLoading(false);
    }

    fetchAutomations();
  }, [router]);

  function groupByStatus(items: Automation[]) {
    const groups: Record<string, Automation[]> = {};
    for (const status of STATUS_ORDER) {
      const filtered = items.filter((a) => a.status === status);
      if (filtered.length > 0) groups[status] = filtered;
    }
    return groups;
  }

  const glassCard = "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  const grouped = groupByStatus(automations);

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] text-white">
            Automação
          </h1>
          <p className="text-xs text-white/40 mt-1 font-[family-name:var(--font-montserrat)]">
            Sistemas e automações desenvolvidos para seu negócio
          </p>
        </div>

        {automations.length === 0 ? (
          <div className={`${glassCard} p-8 text-center`}>
            <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">
              Suas automações serão listadas aqui conforme forem desenvolvidas pela equipe FYRE.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([status, items]) => {
              const config = STATUS_CONFIG[status] || { label: status, color: "bg-white/10 text-white/40 border-white/10" };
              return (
                <div key={status}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-white/20">
                      {items.length} automação{items.length !== 1 ? "ões" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((auto) => (
                      <div key={auto.id} className={`${glassCard} p-5`}>
                        {/* Name */}
                        <h3 className="text-base font-semibold text-white/80 mb-2 font-[family-name:var(--font-montserrat)]">
                          {auto.name}
                        </h3>

                        {/* Description */}
                        {auto.description && (
                          <p className="text-xs text-white/40 mb-3 font-[family-name:var(--font-montserrat)] line-clamp-3">
                            {auto.description}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${TYPE_CONFIG[auto.type]?.color || "bg-white/10 text-white/40 border-white/10"}`}>
                            {TYPE_CONFIG[auto.type]?.label || auto.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${STATUS_CONFIG[auto.status]?.color || "bg-white/10 text-white/40 border-white/10"}`}>
                            {STATUS_CONFIG[auto.status]?.label || auto.status}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center justify-between text-[10px] text-white/20 font-[family-name:var(--font-montserrat)]">
                          <span>Criado: {new Date(auto.created_at).toLocaleDateString("pt-BR")}</span>
                          {auto.updated_at && (
                            <span>Atualizado: {new Date(auto.updated_at).toLocaleDateString("pt-BR")}</span>
                          )}
                        </div>

                        {/* Link button */}
                        {auto.url && (
                          <a
                            href={auto.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 text-xs font-semibold hover:bg-white/10 transition-all font-[family-name:var(--font-montserrat)]"
                          >
                            Acessar
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
