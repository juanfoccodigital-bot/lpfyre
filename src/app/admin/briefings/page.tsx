"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatWhatsApp } from "@/lib/types";

interface Briefing {
  id: string;
  nome_empresa: string;
  responsavel: string;
  email: string;
  whatsapp: string;
  responses: Record<string, unknown>;
  created_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  nome_empresa: "Empresa",
  responsavel: "Responsável",
  email: "E-mail",
  whatsapp: "WhatsApp",
  site: "Site",
  instagram: "Instagram",
  cidade: "Cidade",
  estado: "Estado",
  cnpj: "CNPJ",
  segmento: "Segmento",
  descricao_negocio: "Descrição do Negócio",
  tempo_empresa: "Tempo de Empresa",
  faturamento: "Faturamento Mensal",
  ticket_medio: "Ticket Médio",
  funcionarios: "Funcionários",
  investe_trafego: "Investe em Tráfego",
  investimento_mensal: "Investimento Mensal",
  plataformas: "Plataformas",
  trabalhou_agencia: "Trabalhou com Agência",
  experiencia_agencia: "Experiência com Agência",
  canais_aquisicao: "Canais de Aquisição",
  tem_crm: "Tem CRM",
  qual_crm: "Qual CRM",
  desafios: "Desafios",
  objetivo_fyre: "Objetivo com a FYRE",
  visao_12_meses: "Visão 12 Meses",
  tentativas_anteriores: "Tentativas Anteriores",
  cliente_ideal: "Cliente Ideal",
  faixa_etaria: "Faixa Etária",
  genero: "Gênero",
  classe_social: "Classe Social",
  regiao: "Região",
  valores_cliente: "O que Valoriza",
  servicos_interesse: "Serviços de Interesse",
  urgencia: "Urgência",
  orcamento: "Orçamento",
  tem_bm: "Business Manager",
  tem_google_ads: "Google Ads",
  tem_analytics: "Google Analytics",
  tem_identidade: "Identidade Visual",
  observacoes_extras: "Observações",
  como_conheceu: "Como Conheceu a FYRE",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function BriefingsPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Briefing | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("briefings")
        .select("*")
        .order("created_at", { ascending: false });
      setBriefings((data || []) as Briefing[]);
      setLoading(false);
    }
    fetch();
  }, []);

  const glass = "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 bg-white/5 rounded-xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-[family-name:var(--font-instrument)] text-white">
            Briefings
          </h1>
          <p className="text-xs text-white/30 mt-1 uppercase tracking-wider">
            {briefings.length} briefing{briefings.length !== 1 ? "s" : ""} recebido{briefings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/briefing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-semibold tracking-wider uppercase text-white/40 border border-white/10 rounded-full px-4 py-2 hover:text-white hover:border-white/30 transition-all"
        >
          Abrir Formulário
        </a>
      </div>

      {selected ? (
        /* Detail view */
        <div>
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white mb-6 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Voltar
          </button>

          <div className={`${glass} p-6 sm:p-8 mb-6`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.nome_empresa || "Sem nome"}</h2>
                <p className="text-sm text-white/40">{selected.responsavel}</p>
              </div>
              <span className="text-[10px] text-white/20">{formatDate(selected.created_at)}</span>
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap gap-3 mb-8">
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60 hover:text-white transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  {selected.email}
                </a>
              )}
              {selected.whatsapp && (
                <a href={`https://wa.me/${formatWhatsApp(selected.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-xs text-green-400 hover:bg-green-500/20 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                  {selected.whatsapp}
                </a>
              )}
            </div>

            {/* All responses */}
            <div className="space-y-4">
              {Object.entries(selected.responses || {}).map(([key, value]) => {
                if (!value || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && value.length === 0)) return null;
                return (
                  <div key={key} className="border-b border-white/5 pb-3">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-white/30 block mb-1">
                      {FIELD_LABELS[key] || key.replace(/_/g, " ")}
                    </span>
                    <p className="text-sm text-white/70 whitespace-pre-line">{formatValue(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List view */
        <>
          {briefings.length === 0 ? (
            <div className={`${glass} p-12 text-center`}>
              <p className="text-white/30 text-sm">Nenhum briefing recebido ainda.</p>
              <p className="text-white/15 text-xs mt-2">Envie o link /briefing para seus clientes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {briefings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className={`${glass} p-5 w-full text-left hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-bold text-white truncate">{b.nome_empresa || "Sem nome"}</h3>
                        {Array.isArray(b.responses?.servicos_interesse) && (
                          <div className="hidden sm:flex gap-1">
                            {(b.responses.servicos_interesse as string[]).slice(0, 2).map((s: string) => (
                              <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 truncate max-w-[120px]">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/30 truncate">
                        {b.responsavel} {b.email ? `· ${b.email}` : ""} {b.whatsapp ? `· ${b.whatsapp}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-[10px] text-white/15">{formatDate(b.created_at)}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/15 group-hover:text-white/40 transition-colors"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
