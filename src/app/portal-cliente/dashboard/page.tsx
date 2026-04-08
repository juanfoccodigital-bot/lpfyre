"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";
import { getMetaInsights } from "@/lib/fyre-api";
import {
  Client,
  TrafficData,
  OnboardingItem,
  Meeting,
  ClientUpdate,
  ClientLesson,
  USERS_MAP,
  normalizeMeeting,
} from "@/lib/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ─── Helpers ─── */

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/[0.05] ${className}`}
    />
  );
}

const UPDATE_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  update: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Atualização" },
  insight: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Insight" },
  report: { bg: "bg-green-500/20", text: "text-green-400", label: "Relatório" },
  alert: { bg: "bg-red-500/20", text: "text-red-400", label: "Alerta" },
};

const CATEGORY_COLORS: Record<string, string> = {
  trafego: "bg-orange-500/20 text-orange-400",
  branding: "bg-purple-500/20 text-purple-400",
  vendas: "bg-green-500/20 text-green-400",
  estrategia: "bg-cyan-500/20 text-cyan-400",
  geral: "bg-white/10 text-white/60",
};

const CONTENT_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  em_analise: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "Em Análise" },
  aprovado: { bg: "bg-green-500/15", text: "text-green-400", label: "Aprovado" },
  rejeitado: { bg: "bg-red-500/15", text: "text-red-400", label: "Rejeitado" },
  em_progresso: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Em Progresso" },
  agendado: { bg: "bg-purple-500/15", text: "text-purple-400", label: "Agendado" },
  postado: { bg: "bg-white/10", text: "text-white/50", label: "Postado" },
  pendente: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "Pendente" },
};

/* ─── Glass Card Component ─── */

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Section Title ─── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-[family-name:var(--font-montserrat)]">
      {children}
    </h3>
  );
}

/* ─── Icons ─── */

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

/* ─── Content Post interface ─── */

interface ContentPost {
  id: string;
  client_id: string;
  caption: string;
  image_url: string | null;
  status: string;
  post_type: string | null;
  scheduled_date: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Main Page ─── */

export default function PortalDashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [lessons, setLessons] = useState<ClientLesson[]>([]);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
  const [automationsCount, setAutomationsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente");
      return;
    }

    setDisplayName(session.display_name);
    const clientId = session.client_id;

    async function fetchData() {
      const [clientRes, trafficRes, onboardingRes, meetingsRes, updatesRes, lessonsRes, contentRes, automationsRes] =
        await Promise.all([
          supabase
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .single(),
          supabase
            .from("traffic_data")
            .select("*")
            .eq("client_id", clientId)
            .order("date", { ascending: false })
            .limit(30),
          supabase
            .from("onboarding_checklists")
            .select("*")
            .eq("client_id", clientId)
            .order("sort_order"),
          supabase
            .from("meetings")
            .select("*")
            .eq("client_id", clientId)
            .gte("scheduled_at", new Date().toISOString())
            .order("scheduled_at")
            .limit(5),
          supabase
            .from("client_updates")
            .select("*")
            .eq("client_id", clientId)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("client_lessons")
            .select("*")
            .or(`client_id.eq.${clientId},client_id.is.null`)
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("client_content")
            .select("*")
            .eq("client_id", clientId)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("client_automations")
            .select("*", { count: "exact", head: true })
            .eq("client_id", clientId)
            .eq("status", "ativo"),
        ]);

      const clientData = clientRes.data as Client | null;
      setClient(clientData);

      // Try traffic_data table first; if empty, fetch from Meta API
      let traffic = (trafficRes.data as TrafficData[]) || [];
      if (traffic.length === 0 && clientData?.observacoes) {
        try {
          const obs = typeof clientData.observacoes === "string"
            ? JSON.parse(clientData.observacoes)
            : clientData.observacoes;
          const metaAdsId = obs?.meta_ads_id;
          const metaToken = obs?.meta_token;
          if (metaAdsId && metaToken) {
            try {
              const metaJson = await getMetaInsights({ accountId: metaAdsId, accessToken: metaToken });
              if (metaJson) {
                traffic = (metaJson.daily || []).map((d: any) => ({
                  id: d.date,
                  client_id: clientId,
                  date: d.date,
                  platform: "meta",
                  impressions: d.impressions || 0,
                  clicks: d.clicks || 0,
                  spend: d.spend || 0,
                  leads: d.leads || 0,
                  conversions: d.conversions || 0,
                  revenue: d.revenue || 0,
                  cpc: d.cpc || 0,
                  cpl: d.cpl || 0,
                  cpa: d.cpa || 0,
                  roas: d.roas || 0,
                  created_at: d.date,
                }));
              }
            } catch (_) {
              // Silently fail - will show empty state
            }
          }
        } catch {
          // Silently fail
        }
      }
      setTrafficData(traffic);

      setOnboarding((onboardingRes.data as OnboardingItem[]) || []);
      setMeetings((meetingsRes.data || []).map((m: any) => normalizeMeeting(m)) as Meeting[]);
      setUpdates((updatesRes.data as ClientUpdate[]) || []);
      setLessons((lessonsRes.data as ClientLesson[]) || []);
      setContentPosts((contentRes.data as ContentPost[]) || []);
      setAutomationsCount(automationsRes.count || 0);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  /* ─── Computed values ─── */

  const firstName = displayName.split(" ")[0];

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const metrics = useMemo(() => {
    if (trafficData.length === 0) {
      return {
        totalSpend: 0,
        totalLeads: 0,
        avgCPC: 0,
        avgCPL: 0,
        avgROAS: 0,
        totalConversions: 0,
      };
    }

    const totalSpend = trafficData.reduce((sum, d) => sum + d.spend, 0);
    const totalLeads = trafficData.reduce((sum, d) => sum + d.leads, 0);
    const totalClicks = trafficData.reduce((sum, d) => sum + d.clicks, 0);
    const totalConversions = trafficData.reduce(
      (sum, d) => sum + d.conversions,
      0
    );
    const totalRevenue = trafficData.reduce((sum, d) => sum + d.revenue, 0);
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const avgCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    return { totalSpend, totalLeads, avgCPC, avgCPL, avgROAS, totalConversions };
  }, [trafficData]);

  const chartData = useMemo(() => {
    return [...trafficData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => ({
        date: new Date(d.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        Investimento: d.spend,
        Receita: d.revenue,
      }));
  }, [trafficData]);

  const onboardingProgress = useMemo(() => {
    if (onboarding.length === 0) return 0;
    const completed = onboarding.filter((item) => item.completed).length;
    return Math.round((completed / onboarding.length) * 100);
  }, [onboarding]);

  const isOnboardingComplete = onboardingProgress === 100;

  const assignedUserName = client?.assigned_to
    ? USERS_MAP[client.assigned_to]?.name || "Equipe FYRE"
    : "Equipe FYRE";

  /* ─── Loading State ─── */

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <Skeleton className="h-14 w-72 mb-2" />
        <Skeleton className="h-5 w-96 mb-2" />
        <Skeleton className="h-4 w-48 mb-10" />
        <Skeleton className="h-40 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  /* ─── Metric Cards Config ─── */

  const metricCards = [
    {
      label: "Investimento",
      value: formatCurrency(metrics.totalSpend),
      accent: "border-l-blue-500",
      color: "text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Leads",
      value: metrics.totalLeads.toLocaleString("pt-BR"),
      accent: "border-l-cyan-500",
      color: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
    },
    {
      label: "CPC Médio",
      value: formatCurrency(metrics.avgCPC),
      accent: "border-l-emerald-500",
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "CPL Médio",
      value: formatCurrency(metrics.avgCPL),
      accent: "border-l-orange-500",
      color: "text-orange-400",
      iconBg: "bg-orange-500/10",
    },
    {
      label: "ROAS Médio",
      value: metrics.avgROAS.toFixed(2) + "x",
      accent: "border-l-green-500",
      color: "text-green-400",
      iconBg: "bg-green-500/10",
    },
    {
      label: "Conversões",
      value: metrics.totalConversions.toLocaleString("pt-BR"),
      accent: "border-l-amber-500",
      color: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
  ];

  /* ─── Quick Links Config ─── */

  const quickLinks = [
    {
      label: "Ver Reuniões",
      href: "/portal-cliente/reunioes",
      icon: <CalendarIcon />,
    },
    {
      label: "Meus Arquivos",
      href: "/portal-cliente/arquivos",
      icon: <FolderIcon />,
    },
    {
      label: "Atualizações",
      href: "/portal-cliente/atualizacoes",
      icon: <BellIcon />,
    },
    {
      label: "Conteúdos",
      href: "/portal-cliente/aulas",
      icon: <PlayIcon />,
    },
  ];

  /* ─── Render ─── */

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* ─── 1. Welcome Header ─── */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-instrument)] text-4xl sm:text-5xl lg:text-6xl text-white mb-2 leading-tight">
                Olá, {firstName}
              </h1>
              <p className="text-white/50 text-sm sm:text-base font-[family-name:var(--font-montserrat)] mb-1">
                Aqui está o resumo do seu projeto com a FYRE.
              </p>
              <p className="text-white/25 text-xs font-[family-name:var(--font-montserrat)] capitalize">
                {todayFormatted}
              </p>
            </div>

            {/* Client info badges */}
            <div className="flex flex-col items-start sm:items-end gap-2">
              {client?.empresa && (
                <span className="text-sm text-white/60 font-medium font-[family-name:var(--font-montserrat)]">
                  {client.empresa}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── 2. Onboarding (only show if NOT 100%) ─── */}
        {onboarding.length > 0 && !isOnboardingComplete && (
          <GlassCard className="p-5 sm:p-7 mb-8">
            <div className="flex items-center justify-between mb-5">
              <SectionTitle>Progresso do Onboarding</SectionTitle>
            </div>

            {/* Big progress bar */}
            <div className="mb-6">
              <div className="flex items-end justify-between mb-3">
                <span className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-montserrat)]">
                  {onboardingProgress}%
                </span>
                <span className="text-xs text-white/30 font-[family-name:var(--font-montserrat)]">
                  {onboarding.filter((i) => i.completed).length} de {onboarding.length} etapas
                </span>
              </div>
              <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-orange-500 to-amber-400"
                  style={{ width: `${onboardingProgress}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {[...onboarding]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 group"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        item.completed
                          ? "border-green-500 bg-green-500/20"
                          : "border-white/15 bg-white/[0.03]"
                      }`}
                    >
                      {item.completed && (
                        <span className="text-green-400">
                          <CheckCircleIcon />
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm font-[family-name:var(--font-montserrat)] transition-colors ${
                        item.completed
                          ? "text-white/35 line-through"
                          : "text-white/75"
                      }`}
                    >
                      {item.item_label}
                    </span>
                  </div>
                ))}
            </div>
          </GlassCard>
        )}

        {/* Onboarding complete badge (when 100%) */}
        {onboarding.length > 0 && isOnboardingComplete && (
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium font-[family-name:var(--font-montserrat)]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Onboarding concluído
            </span>
          </div>
        )}

        {/* ─── 3. Traffic Metrics ─── */}
        {trafficData.length > 0 ? (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
              {metricCards.map((metric) => (
                <GlassCard
                  key={metric.label}
                  className={`border-l-4 ${metric.accent} p-4 sm:p-5`}
                >
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/35 mb-2.5 font-[family-name:var(--font-montserrat)]">
                    {metric.label}
                  </p>
                  <p
                    className={`text-lg sm:text-xl lg:text-2xl font-bold ${metric.color} font-[family-name:var(--font-montserrat)]`}
                  >
                    {metric.value}
                  </p>
                </GlassCard>
              ))}
            </div>

            {/* Chart */}
            <GlassCard className="p-5 sm:p-7 mb-8">
              <SectionTitle>Investimento vs Receita</SectionTitle>
              <div className="flex items-center gap-5 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 rounded-full bg-[#ff4500]" />
                  <span className="text-[10px] text-white/40 font-[family-name:var(--font-montserrat)]">
                    Investimento
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 rounded-full bg-[#22c55e]" />
                  <span className="text-[10px] text-white/40 font-[family-name:var(--font-montserrat)]">
                    Receita
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff4500" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ff4500" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.92)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "var(--font-montserrat)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    }}
                    formatter={(value) => formatCurrency(Number(value || 0))}
                  />
                  <Line
                    type="monotone"
                    dataKey="Investimento"
                    stroke="#ff4500"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "#ff4500", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Receita"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </>
        ) : (
          <GlassCard className="p-8 sm:p-10 mb-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.05] flex items-center justify-center">
              <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">
              Dados de tráfego serão disponibilizados em breve.
            </p>
            <p className="text-white/20 text-xs font-[family-name:var(--font-montserrat)] mt-1">
              Assim que suas campanhas estiverem ativas, os números aparecerão aqui.
            </p>
          </GlassCard>
        )}

        {/* ─── 4. Quick Links ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <GlassCard className="p-4 sm:p-5 group cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="text-white/30 group-hover:text-orange-400 transition-colors duration-300">
                    {link.icon}
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white/90 font-[family-name:var(--font-montserrat)] transition-colors duration-300">
                    {link.label}
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* ─── 5. Próximas Reuniões (prominent) + Últimas Atualizações ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Próximas Reuniões - more prominent */}
          <GlassCard className="p-5 sm:p-7 border-orange-500/10">
            <div className="flex items-center justify-between mb-5">
              <SectionTitle>Próximas Reuniões</SectionTitle>
              <Link
                href="/portal-cliente/reunioes"
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-orange-400/60 hover:text-orange-400 font-[family-name:var(--font-montserrat)] transition-colors"
              >
                Ver todas
                <ArrowRightIcon />
              </Link>
            </div>
            {meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                  <CalendarIcon />
                </div>
                <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)] mb-1">
                  Nenhuma reunião agendada.
                </p>
                <p className="text-white/15 text-xs font-[family-name:var(--font-montserrat)]">
                  Quando sua equipe agendar uma reunião, ela aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting, idx) => (
                  <div
                    key={meeting.id}
                    className={`bg-white/[0.02] rounded-xl p-4 border transition-colors ${
                      idx === 0 ? "border-orange-500/15 bg-orange-500/[0.02]" : "border-white/[0.04] hover:border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {idx === 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium font-[family-name:var(--font-montserrat)]">
                              PRÓXIMA
                            </span>
                          )}
                          <p className="text-sm text-white font-medium truncate font-[family-name:var(--font-montserrat)]">
                            {meeting.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/30 font-[family-name:var(--font-montserrat)]">
                          <span>{formatDateTime(meeting.scheduled_at)}</span>
                          <span className="text-white/10">|</span>
                          <span>{meeting.duration_minutes} min</span>
                        </div>
                      </div>
                      {meeting.meeting_link && (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-[family-name:var(--font-montserrat)] transition-colors flex-shrink-0 ${
                            idx === 0
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                          }`}
                        >
                          <LinkIcon />
                          Entrar
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Últimas Atualizações */}
          <GlassCard className="p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Últimas Atualizações</SectionTitle>
              {updates.length > 0 && (
                <Link
                  href="/portal-cliente/atualizacoes"
                  className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-orange-400/60 hover:text-orange-400 font-[family-name:var(--font-montserrat)] transition-colors"
                >
                  Ver todas
                  <ArrowRightIcon />
                </Link>
              )}
            </div>
            {updates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                  <BellIcon />
                </div>
                <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)] mb-1">
                  Nenhuma atualização ainda.
                </p>
                <p className="text-white/15 text-xs font-[family-name:var(--font-montserrat)]">
                  Atualizações sobre seu projeto aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {updates.map((update) => {
                  const typeInfo = UPDATE_TYPE_COLORS[update.type] || {
                    bg: "bg-white/10",
                    text: "text-white/60",
                    label: update.type,
                  };
                  return (
                    <div
                      key={update.id}
                      className="py-3 border-b border-white/[0.04] last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-[family-name:var(--font-montserrat)] ${typeInfo.bg} ${typeInfo.text}`}
                        >
                          {typeInfo.label}
                        </span>
                        <span className="text-[10px] text-white/20 font-[family-name:var(--font-montserrat)]">
                          {formatDate(update.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 font-medium font-[family-name:var(--font-montserrat)] mb-1">
                        {update.title}
                      </p>
                      {update.content && (
                        <p className="text-xs text-white/30 font-[family-name:var(--font-montserrat)] line-clamp-2">
                          {update.content.length > 120
                            ? update.content.slice(0, 120) + "..."
                            : update.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ─── 6. Recent Content Posts + Automations ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Recent Content Posts (2 cols) */}
          <GlassCard className="p-5 sm:p-7 lg:col-span-2">
            <SectionTitle>Conteúdos Recentes</SectionTitle>
            {contentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)] mb-1">
                  Nenhum conteúdo publicado ainda.
                </p>
                <p className="text-white/15 text-xs font-[family-name:var(--font-montserrat)]">
                  Posts e conteúdos criados pela equipe aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {contentPosts.map((post) => {
                  const statusInfo = CONTENT_STATUS_COLORS[post.status] || CONTENT_STATUS_COLORS.em_analise;
                  return (
                    <div
                      key={post.id}
                      className="bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-colors overflow-hidden group"
                    >
                      {/* Thumbnail area */}
                      {post.image_url ? (
                        <div className="aspect-video bg-white/[0.03] overflow-hidden">
                          {post.image_url.match(/\.(mp4|mov|webm|avi)(\?|$)/i) || post.post_type === "video" || post.post_type === "reels" ? (
                            <video
                              src={post.image_url}
                              muted
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <img
                              src={post.image_url}
                              alt={post.caption || "Conteúdo"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                      )}
                      <div className="p-3.5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-[family-name:var(--font-montserrat)] ${statusInfo.bg} ${statusInfo.text}`}>
                            {statusInfo.label}
                          </span>
                          {post.post_type && (
                            <span className="text-[9px] text-white/25 font-[family-name:var(--font-montserrat)] capitalize">
                              {post.post_type}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/75 font-medium font-[family-name:var(--font-montserrat)] line-clamp-2">
                          {post.caption}
                        </p>
                        <p className="text-[10px] text-white/20 mt-1.5 font-[family-name:var(--font-montserrat)]">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Automations summary (1 col) */}
          <GlassCard className="p-5 sm:p-7">
            <SectionTitle>Automações</SectionTitle>
            <div className="flex flex-col items-center justify-center py-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                automationsCount > 0 ? "bg-cyan-500/10" : "bg-white/[0.04]"
              }`}>
                <svg className={`w-8 h-8 ${automationsCount > 0 ? "text-cyan-400" : "text-white/15"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              {automationsCount > 0 ? (
                <>
                  <p className="text-3xl font-bold text-cyan-400 font-[family-name:var(--font-montserrat)] mb-1">
                    {automationsCount}
                  </p>
                  <p className="text-xs text-white/40 font-[family-name:var(--font-montserrat)]">
                    {automationsCount === 1 ? "automação ativa" : "automações ativas"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] text-cyan-400/60 font-[family-name:var(--font-montserrat)]">
                      Em execução
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)] mb-1">
                    Nenhuma automação ativa.
                  </p>
                  <p className="text-white/15 text-xs font-[family-name:var(--font-montserrat)] text-center">
                    Automações configuradas pela equipe aparecerão aqui.
                  </p>
                </>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ─── 7. Últimas Aulas ─── */}
        <GlassCard className="p-5 sm:p-7 mb-8">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Últimas Aulas</SectionTitle>
            {lessons.length > 0 && (
              <Link
                href="/portal-cliente/aulas"
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-orange-400/60 hover:text-orange-400 font-[family-name:var(--font-montserrat)] transition-colors"
              >
                Ver todas
                <ArrowRightIcon />
              </Link>
            )}
          </div>
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3 text-white/15">
                <PlayIcon />
              </div>
              <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)] mb-1">
                Conteúdos exclusivos em breve.
              </p>
              <p className="text-white/15 text-xs font-[family-name:var(--font-montserrat)]">
                Aulas e materiais educativos para você acompanhar seus resultados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-[family-name:var(--font-montserrat)] ${
                        CATEGORY_COLORS[lesson.category] || CATEGORY_COLORS.geral
                      }`}
                    >
                      {lesson.category}
                    </span>
                  </div>
                  <p className="text-sm text-white/75 font-medium font-[family-name:var(--font-montserrat)] mb-3 line-clamp-2">
                    {lesson.title}
                  </p>
                  <Link
                    href="/portal-cliente/aulas"
                    className="inline-flex items-center gap-1.5 text-xs text-orange-400/70 hover:text-orange-400 font-[family-name:var(--font-montserrat)] transition-colors"
                  >
                    Assistir
                    <ArrowRightIcon />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* ─── 8. Footer Info ─── */}
        <div className="border-t border-white/[0.05] pt-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/25 font-[family-name:var(--font-montserrat)]">
              Equipe responsável:{" "}
              <span className="text-white/45">FYRE Automação & I.A</span>
            </p>
          </div>
          <p className="text-xs text-white/20 font-[family-name:var(--font-montserrat)]">
            Dúvidas? Fale no grupo do WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
