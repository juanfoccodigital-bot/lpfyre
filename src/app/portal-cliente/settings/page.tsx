"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";
import { Client, USERS_MAP } from "@/lib/types";

const SERVICE_COLORS: Record<string, string> = {
  trafego: "bg-orange-500/20 text-orange-400",
  automacao: "bg-blue-500/20 text-blue-400",
  website: "bg-purple-500/20 text-purple-400",
  sistema: "bg-cyan-500/20 text-cyan-400",
  "360": "bg-green-500/20 text-green-400",
  design: "bg-pink-500/20 text-pink-400",
  consultoria: "bg-amber-500/20 text-amber-400",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
  );
}

export default function PortalSettingsPage() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
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
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      setClient(data as Client | null);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-32 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
          Dados do cliente nao encontrados.
        </p>
      </div>
    );
  }

  const assignedUser = client.assigned_to ? USERS_MAP[client.assigned_to] : undefined;

  const infoFields = [
    { label: "Nome", value: client.nome },
    { label: "Empresa", value: client.empresa },
    { label: "Email", value: client.email },
    { label: "Telefone", value: client.telefone },
    { label: "Cidade", value: client.cidade },
    { label: "Estado", value: client.estado },
  ];

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl lg:text-5xl text-white mb-1">
          Configuracoes
        </h1>
        <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          Informacoes da sua conta
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Client Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-5 font-[family-name:var(--font-montserrat)]">
            Dados do Cliente
          </h3>
          <div className="space-y-4">
            {infoFields.map((field) => (
              <div key={field.label}>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1 font-[family-name:var(--font-montserrat)]">
                  {field.label}
                </p>
                <p className="text-sm text-white/80 font-[family-name:var(--font-montserrat)]">
                  {field.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Team Member */}
        {assignedUser && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-5 font-[family-name:var(--font-montserrat)]">
              Responsavel
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-400 font-[family-name:var(--font-montserrat)]">
                  {assignedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="text-sm text-white font-medium font-[family-name:var(--font-montserrat)]">
                  {assignedUser.name}
                </p>
                <p className="text-xs text-white/30 font-[family-name:var(--font-montserrat)]">
                  @{assignedUser.username}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        {client.servicos && client.servicos.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-4 font-[family-name:var(--font-montserrat)]">
              Servicos Contratados
            </h3>
            <div className="flex flex-wrap gap-2">
              {client.servicos.map((service) => (
                <span
                  key={service}
                  className={`text-xs px-3 py-1.5 rounded-full font-[family-name:var(--font-montserrat)] capitalize ${
                    SERVICE_COLORS[service.toLowerCase()] ||
                    "bg-white/10 text-white/50"
                  }`}
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notice */}
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 sm:p-6">
          <p className="text-sm text-white/30 font-[family-name:var(--font-montserrat)] text-center">
            Para alteracoes, entre em contato com a equipe FYRE.
          </p>
        </div>
      </div>
    </div>
  );
}
