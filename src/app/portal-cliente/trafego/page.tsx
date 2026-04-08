"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMetaInsights } from "@/lib/fyre-api";
import { getPortalSession } from "@/lib/portal-auth";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface DailyMetric {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  roas: number;
}

interface CampaignInsights {
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  ctr: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget: number | null;
  lifetime_budget: number | null;
  start_time: string | null;
  stop_time: string | null;
  insights: CampaignInsights | null;
}

interface OptUpdate {
  id: string;
  content: string;
  created_at: string;
  title: string;
}

interface TrafficData {
  daily: DailyMetric[];
  summary: {
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    cpl: number;
    roas: number;
    cpc?: number;
    ctr?: number;
  };
  campaigns?: Campaign[];
  period: { since: string; until: string };
}

const RANGE_OPTIONS = [
  { label: "7 dias", value: 7 },
  { label: "15 dias", value: 15 },
  { label: "30 dias", value: 30 },
  { label: "60 dias", value: 60 },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR");
}

export default function TrafegoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);
  const [customSince, setCustomSince] = useState("");
  const [customUntil, setCustomUntil] = useState("");
  const [optUpdates, setOptUpdates] = useState<OptUpdate[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente/login");
      return;
    }

    async function init() {
      setClientId(session!.client_id);

      const { data: client } = await supabase
        .from("clients")
        .select("observacoes")
        .eq("id", session!.client_id)
        .single();

      // Load optimization updates
      const { data: updates } = await supabase
        .from("client_updates")
        .select("*")
        .eq("client_id", session!.client_id)
        .eq("type", "otimizacao")
        .order("created_at", { ascending: false });
      setOptUpdates(updates || []);

      if (!client?.observacoes) {
        setHasCredentials(false);
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(client.observacoes);
        if (parsed.meta_ads_id && parsed.meta_token) {
          setHasCredentials(true);
          await loadTraffic(parsed.meta_ads_id, parsed.meta_token, 30);
        }
      } catch {
        setHasCredentials(false);
      }
      setLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTraffic(accountId: string, token: string, days?: number, sinceDateStr?: string, untilDateStr?: string) {
    setTrafficLoading(true);
    let since: string;
    let until: string;
    if (sinceDateStr && untilDateStr) {
      since = sinceDateStr;
      until = untilDateStr;
    } else {
      const d = days || 30;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - d);
      since = sinceDate.toISOString().split("T")[0];
      until = new Date().toISOString().split("T")[0];
    }

    try {
      const data = await getMetaInsights({ accountId, accessToken: token, dateRange: { since, until } });
      if (!data.error) {
        setTrafficData(data);
      }
    } catch {
      // silently fail
    }
    setTrafficLoading(false);
  }

  async function handleRangeChange(days?: number, sinceDateStr?: string, untilDateStr?: string) {
    if (days) {
      setSelectedDays(days);
      setCustomSince("");
      setCustomUntil("");
    }
    const session = getPortalSession();
    if (!session) return;

    const { data: client } = await supabase
      .from("clients")
      .select("observacoes")
      .eq("id", session.client_id)
      .single();

    if (!client?.observacoes) return;
    try {
      const parsed = JSON.parse(client.observacoes);
      if (parsed.meta_ads_id && parsed.meta_token) {
        await loadTraffic(parsed.meta_ads_id, parsed.meta_token, days, sinceDateStr, untilDateStr);
      }
    } catch {
      // ignore
    }
  }

  const glassCard = "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasCredentials) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] text-white mb-2">
            Tráfego
          </h1>
          <div className={`${glassCard} p-8 mt-8 text-center`}>
            <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">
              Dados de tráfego serão disponibilizados em breve pela equipe FYRE.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = trafficData
    ? [
        { label: "Investimento", value: formatCurrency(trafficData.summary.spend), accent: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
        { label: "Impressões", value: formatNumber(trafficData.summary.impressions), accent: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
        { label: "Cliques", value: formatNumber(trafficData.summary.clicks), accent: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
        { label: "CPL", value: formatCurrency(trafficData.summary.cpl), accent: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
        { label: "Leads", value: formatNumber(trafficData.summary.leads), accent: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
        { label: "ROAS", value: trafficData.summary.roas.toFixed(2) + "x", accent: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-[family-name:var(--font-instrument)] text-white">
              Tráfego
            </h1>
            <p className="text-xs text-white/40 mt-1 font-[family-name:var(--font-montserrat)]">
              Dados de performance das campanhas
            </p>
          </div>

          {/* Date range selector */}
          <div className="flex flex-wrap items-center gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleRangeChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  selectedDays === opt.value && !customSince
                    ? "text-white bg-white/[0.08]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customSince}
                onChange={(e) => setCustomSince(e.target.value)}
                className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/30"
              />
              <span className="text-white/30 text-xs">até</span>
              <input
                type="date"
                value={customUntil}
                onChange={(e) => setCustomUntil(e.target.value)}
                className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/30"
              />
              {customSince && customUntil && (
                <button
                  onClick={() => handleRangeChange(undefined, customSince, customUntil)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.12] transition-all"
                >
                  Aplicar
                </button>
              )}
            </div>
          </div>
        </div>

        {trafficLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : trafficData ? (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {metrics.map((m) => (
                <div key={m.label} className={`rounded-2xl border p-4 backdrop-blur-sm ${m.bg}`}>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30 mb-2 font-[family-name:var(--font-montserrat)]">
                    {m.label}
                  </p>
                  <p className={`text-lg font-bold ${m.accent} font-[family-name:var(--font-montserrat)]`}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className={`${glassCard} p-6 mb-8`}>
              <h3 className="text-sm font-semibold text-white/60 mb-4 font-[family-name:var(--font-montserrat)]">
                Investimento vs Leads
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData.daily}>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                      tickLine={false}
                      tickFormatter={(v: string) => {
                        const d = new Date(v);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis
                      yAxisId="spend"
                      orientation="left"
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `R$${v}`}
                    />
                    <YAxis
                      yAxisId="leads"
                      orientation="right"
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value: unknown, name: unknown) => {
                        const v = Number(value || 0);
                        const n = String(name || "");
                        return [n === "spend" ? formatCurrency(v) : v, n === "spend" ? "Investimento" : "Leads"] as [string | number, string];
                      }}
                      labelFormatter={(label) => {
                        const d = new Date(String(label));
                        return d.toLocaleDateString("pt-BR");
                      }}
                    />
                    <Line
                      yAxisId="spend"
                      type="monotone"
                      dataKey="spend"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="leads"
                      type="monotone"
                      dataKey="leads"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-orange-500 rounded-full" />
                  <span className="text-[10px] text-white/40">Investimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-green-500 rounded-full" />
                  <span className="text-[10px] text-white/40">Leads</span>
                </div>
              </div>
            </div>

            {/* Daily table */}
            <div className={`${glassCard} p-6`}>
              <h3 className="text-sm font-semibold text-white/60 mb-4 font-[family-name:var(--font-montserrat)]">
                Dados Diários
              </h3>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-white/60">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-2 px-2 text-white/30 font-semibold">Data</th>
                      <th className="text-right py-2 px-2 text-white/30 font-semibold">Invest.</th>
                      <th className="text-right py-2 px-2 text-white/30 font-semibold">Impress.</th>
                      <th className="text-right py-2 px-2 text-white/30 font-semibold">Cliques</th>
                      <th className="text-right py-2 px-2 text-white/30 font-semibold">Leads</th>
                      <th className="text-right py-2 px-2 text-white/30 font-semibold">CPL</th>
                      <th className="text-right py-2 px-2 text-white/30 font-semibold">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficData.daily.map((day) => (
                      <tr key={day.date} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-2 px-2">
                          {new Date(day.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="text-right py-2 px-2 text-orange-400">{formatCurrency(day.spend)}</td>
                        <td className="text-right py-2 px-2">{formatNumber(day.impressions)}</td>
                        <td className="text-right py-2 px-2">{formatNumber(day.clicks)}</td>
                        <td className="text-right py-2 px-2 text-green-400">{day.leads}</td>
                        <td className="text-right py-2 px-2 text-yellow-400">{formatCurrency(day.cpl)}</td>
                        <td className="text-right py-2 px-2 text-purple-400">{day.roas.toFixed(2)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Campaigns */}
            {trafficData.campaigns && trafficData.campaigns.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/60 font-[family-name:var(--font-montserrat)]">
                  Campanhas Ativas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trafficData.campaigns.map((camp) => (
                    <div key={camp.id} className={`${glassCard} p-4 space-y-3`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate font-[family-name:var(--font-montserrat)]">{camp.name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{camp.objective?.replace(/_/g, " ") || "—"}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          camp.status === "ACTIVE" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}>
                          {camp.status === "ACTIVE" ? "Ativo" : "Pausado"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/40">
                        {camp.daily_budget && <span>Diário: R$ {camp.daily_budget.toFixed(2)}</span>}
                        {camp.lifetime_budget && <span>Total: R$ {camp.lifetime_budget.toFixed(2)}</span>}
                        {camp.start_time && <span>Início: {new Date(camp.start_time).toLocaleDateString("pt-BR")}</span>}
                        {camp.stop_time && <span>Fim: {new Date(camp.stop_time).toLocaleDateString("pt-BR")}</span>}
                      </div>
                      {camp.insights && (
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { label: "Impr.", value: camp.insights.impressions.toLocaleString("pt-BR"), color: "text-cyan-400" },
                            { label: "Cliques", value: camp.insights.clicks.toLocaleString("pt-BR"), color: "text-emerald-400" },
                            { label: "Invest.", value: `R$ ${camp.insights.spend.toFixed(2)}`, color: "text-blue-400" },
                            { label: "CPC", value: `R$ ${camp.insights.cpc.toFixed(2)}`, color: "text-orange-400" },
                            { label: "CTR", value: `${camp.insights.ctr.toFixed(2)}%`, color: "text-yellow-400" },
                          ].map((m) => (
                            <div key={m.label} className="text-center">
                              <p className="text-[9px] text-white/30 uppercase tracking-wider font-[family-name:var(--font-montserrat)]">{m.label}</p>
                              <p className={`text-xs font-bold ${m.color} font-[family-name:var(--font-montserrat)]`}>{m.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`${glassCard} p-8 text-center`}>
            <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">Nenhum dado disponível para o período selecionado.</p>
          </div>
        )}

        {/* Otimizações & Atualizações */}
        {optUpdates.length > 0 && (
          <div className={`${glassCard} p-6 mt-8`}>
            <h3 className="text-sm font-semibold text-white/60 mb-4 font-[family-name:var(--font-montserrat)]">
              Otimizações & Atualizações
            </h3>
            <div className="space-y-3">
              {optUpdates.map((upd) => (
                <div key={upd.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
                  <div className="w-1 self-stretch rounded-full bg-green-500/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 whitespace-pre-wrap font-[family-name:var(--font-montserrat)]">{upd.content}</p>
                    <p className="text-[10px] text-white/30 mt-2 font-[family-name:var(--font-montserrat)]">
                      {new Date(upd.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
