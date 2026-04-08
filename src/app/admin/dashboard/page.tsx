"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  Lead,
  Client,
  FinancialTransaction,
  Meeting,
  USERS_MAP,
  KANBAN_COLUMNS,
  normalizeMeeting,
} from "@/lib/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const USER_PHOTOS: Record<string, string> = {
  "1bab39ad-f161-4da0-b65f-5b56a9e32dd5": "/images/juan.jpg",
  "50872c28-4457-4642-833b-b512c68b2941": "/images/rodrigo.jpg",
};

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
      className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`}
    />
  );
}

const RANKING_COLORS: Record<string, string> = {
  leads: "bg-blue-500/60",
  fechamentos: "bg-green-500/60",
  clientes: "bg-orange-500/60",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  lead_novo: "bg-blue-400",
  primeiro_contato: "bg-cyan-400",
  qualificado: "bg-yellow-400",
  follow_up_1: "bg-teal-400",
  follow_up_2: "bg-emerald-400",
  follow_up_3: "bg-green-500",
  agendado: "bg-orange-400",
  call_realizada: "bg-amber-400",
  proposta_encaminhada: "bg-purple-400",
  em_negociacao: "bg-pink-400",
  venda_realizada: "bg-green-400",
  potencial_cliente_futuro: "bg-slate-400",
  perdido: "bg-red-400",
};

interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
  leads?: { nome: string } | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
}

type DateFilter = "hoje" | "7dias" | "30dias" | "mes" | "tudo";

function timeAgo(dateStr: string) {
  const now = new Date().getTime();
  const date = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
}

function getDateRange(filter: DateFilter): { from: Date | null; to: Date } {
  const now = new Date();
  const to = now;
  switch (filter) {
    case "hoje": {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { from, to };
    }
    case "7dias": {
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from, to };
    }
    case "30dias": {
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from, to };
    }
    case "mes": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to };
    }
    case "tudo":
      return { from: null, to };
  }
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeadStatuses, setAllLeadStatuses] = useState<string[]>([]);
  const [leadCounts, setLeadCounts] = useState({
    total: 0, novo: 0, frio: 0, perdido: 0, concluido: 0, ativos: 0,
    juan: { total: 0, atend: 0, fech: 0, agend: 0, perd: 0 },
    rodrigo: { total: 0, atend: 0, fech: 0, agend: 0, perd: 0 },
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [activityLog, setActivityLog] = useState<LeadNote[]>([]);
  const [meetings, setMeetings] = useState<(Meeting & { clients?: { nome: string; empresa: string | null } | null; _source?: string })[]>([]);
  const [googleMeetings, setGoogleMeetings] = useState<(Meeting & { _source?: string })[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>("mes");

  useEffect(() => {
    async function fetchData() {
      const [
        totalLeadsRes,
        leadsNovoRes,
        leadsFrioRes,
        leadsPerdidoRes,
        leadsConcluidoRes,
        leadsAtivosRes,
        leadsJuanRes,
        leadsRodrigoRes,
        leadsJuanAtendRes,
        leadsRodrigoAtendRes,
        leadsJuanFechRes,
        leadsRodrigoFechRes,
        leadsJuanAgendRes,
        leadsRodrigoAgendRes,
        leadsJuanPerdRes,
        leadsRodrigoPerdRes,
        leadsStatusRes,
        recentLeadsRes,
        clientsRes,
        transactionsRes,
        notesRes,
        meetingsRes,
        tasksRes,
      ] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "lead_novo"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "lead_frio"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "perdido"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "concluido"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("archived", false).not("status", "in", '("perdido")'),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "1bab39ad-f161-4da0-b65f-5b56a9e32dd5"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "50872c28-4457-4642-833b-b512c68b2941"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "1bab39ad-f161-4da0-b65f-5b56a9e32dd5").not("status", "in", '("lead_novo","lead_frio")'),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "50872c28-4457-4642-833b-b512c68b2941").not("status", "in", '("lead_novo","lead_frio")'),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "1bab39ad-f161-4da0-b65f-5b56a9e32dd5").eq("status", "concluido"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "50872c28-4457-4642-833b-b512c68b2941").eq("status", "concluido"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "1bab39ad-f161-4da0-b65f-5b56a9e32dd5").eq("status", "agendado"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "50872c28-4457-4642-833b-b512c68b2941").eq("status", "agendado"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "1bab39ad-f161-4da0-b65f-5b56a9e32dd5").eq("status", "perdido"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("assigned_to", "50872c28-4457-4642-833b-b512c68b2941").eq("status", "perdido"),
        supabase.from("leads").select("status"),
        supabase.from("leads").select("*").order("updated_at", { ascending: false }).limit(5),
        supabase.from("clients").select("*"),
        supabase.from("financial_transactions").select("*"),
        supabase.from("lead_notes").select("*, leads(nome)").order("created_at", { ascending: false }).limit(10),
        supabase.from("meetings").select("*, clients(nome, empresa)").gte("scheduled_at", new Date(new Date().setHours(0,0,0,0)).toISOString()).order("scheduled_at").limit(10),
        supabase.from("tasks").select("*").eq("status", "pendente").order("due_date").limit(5),
      ]);

      const counts = {
        total: totalLeadsRes.count || 0,
        novo: leadsNovoRes.count || 0,
        frio: leadsFrioRes.count || 0,
        perdido: leadsPerdidoRes.count || 0,
        concluido: leadsConcluidoRes.count || 0,
        ativos: leadsAtivosRes.count || 0,
        juan: { total: leadsJuanRes.count || 0, atend: leadsJuanAtendRes.count || 0, fech: leadsJuanFechRes.count || 0, agend: leadsJuanAgendRes.count || 0, perd: leadsJuanPerdRes.count || 0 },
        rodrigo: { total: leadsRodrigoRes.count || 0, atend: leadsRodrigoAtendRes.count || 0, fech: leadsRodrigoFechRes.count || 0, agend: leadsRodrigoAgendRes.count || 0, perd: leadsRodrigoPerdRes.count || 0 },
      };

      setLeadCounts(counts);
      setLeads(recentLeadsRes.data || []);
      setAllLeadStatuses((leadsStatusRes.data || []).map((l: { status: string }) => l.status));
      setClients(clientsRes.data || []);
      setTransactions(transactionsRes.data || []);
      setActivityLog((notesRes.data as LeadNote[]) || []);
      setMeetings((meetingsRes.data || []).map((m: any) => normalizeMeeting(m)) as typeof meetings);
      setTasks((tasksRes.data as Task[]) || []);
      setLoading(false);

      // Also fetch Google Calendar events (non-blocking)
      fetch("/api/google-calendar/events")
        .then((res) => res.json())
        .then((data) => {
          if (data.events) {
            const mapped = data.events.map((e: { id: string; title: string; description: string | null; scheduled_at: string; end_at: string; meeting_link: string | null }) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              scheduled_at: e.scheduled_at,
              duration_minutes: e.end_at && e.scheduled_at
                ? Math.round((new Date(e.end_at).getTime() - new Date(e.scheduled_at).getTime()) / 60000)
                : 60,
              meeting_link: e.meeting_link,
              status: "agendado",
              assigned_to: "",
              created_by: "",
              client_id: null,
              lead_id: null,
              notes: null,
              created_at: "",
              _source: "google",
            }));
            setGoogleMeetings(mapped);
          }
        })
        .catch(() => {});
    }
    fetchData();
  }, []);

  // Subscribe to realtime activity log
  useEffect(() => {
    const channel = supabase
      .channel("activity-log-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lead_notes" },
        async (payload) => {
          const { data } = await supabase
            .from("lead_notes")
            .select("*, leads(nome)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            setActivityLog((prev) => [data as LeadNote, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ─── Date filtered data ─── */
  const filteredTransactions = useMemo(() => {
    if (dateFilter === "tudo") return transactions;
    const { from, to } = getDateRange(dateFilter);
    if (!from) return transactions;
    return transactions.filter((t) => {
      const d = t.due_date ? new Date(t.due_date) : new Date(t.created_at);
      return d >= from && d <= to;
    });
  }, [transactions, dateFilter]);

  const metrics = useMemo(() => {
    const totalLeads = leadCounts.total;
    const activeLeads = leadCounts.ativos;
    const concluidos = leadCounts.concluido;
    const atendimentos = totalLeads - leadCounts.novo - leadCounts.frio;
    const conversionRate = totalLeads > 0 ? ((concluidos / totalLeads) * 100).toFixed(1) : "0";
    const activeClients = clients.filter((c) => c.status === "ativo").length;
    const monthlyRevenue = clients.filter((c) => c.status === "ativo").reduce((sum, c) => sum + (c.valor_mensal || 0), 0);
    const pendingTransactions = filteredTransactions.filter((t) => t.status === "pendente").length;

    return {
      totalLeads,
      activeLeads,
      atendimentos,
      conversionRate,
      activeClients,
      monthlyRevenue,
      pendingTransactions,
    };
  }, [leadCounts, clients, filteredTransactions]);

  /* ─── Financial metrics ─── */
  const financialMetrics = useMemo(() => {
    // A Receber follows the date filter
    const pending = filteredTransactions
      .filter((t) => t.status === "pendente")
      .reduce((sum, t) => sum + t.amount, 0);
    // Faturamento follows the date filter
    const totalReceita = filteredTransactions
      .filter((t) => t.type === "receita" && t.status === "pago")
      .reduce((sum, t) => sum + t.amount, 0);
    // Saldo is CUMULATIVE (all time) - receita pago minus despesa pago
    const saldoReceita = transactions
      .filter((t) => t.type === "receita" && t.status === "pago")
      .reduce((sum, t) => sum + t.amount, 0);
    const saldoDespesa = transactions
      .filter((t) => t.type === "despesa" && t.status === "pago")
      .reduce((sum, t) => sum + t.amount, 0);
    const saldo = saldoReceita - saldoDespesa;

    return { pending, totalReceita, saldo };
  }, [filteredTransactions, transactions]);

  /* ─── Active clients ─── */
  const activeClients = useMemo(() => {
    return clients.filter((c) => c.status === "ativo");
  }, [clients]);

  const userStats = useMemo(() => {
    return {
      "1bab39ad-f161-4da0-b65f-5b56a9e32dd5": {
        name: "Juan Mansilha",
        leads: leadCounts.juan.total,
        atendimentos: leadCounts.juan.atend,
        agendados: leadCounts.juan.agend,
        fechamentos: leadCounts.juan.fech,
        perdidos: leadCounts.juan.perd,
      },
      "50872c28-4457-4642-833b-b512c68b2941": {
        name: "Rodrigo Lopes",
        leads: leadCounts.rodrigo.total,
        atendimentos: leadCounts.rodrigo.atend,
        agendados: leadCounts.rodrigo.agend,
        fechamentos: leadCounts.rodrigo.fech,
        perdidos: leadCounts.rodrigo.perd,
      },
    };
  }, [leadCounts]);

  const recentLeads = leads;

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const col of KANBAN_COLUMNS) {
      counts[col.key] = 0;
    }
    for (const status of allLeadStatuses) {
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    }
    return KANBAN_COLUMNS.map((col) => ({
      name: col.label,
      quantidade: counts[col.key] || 0,
    }));
  }, [allLeadStatuses]);

  const rankingData = useMemo(() => {
    return Object.entries(userStats).map(([, stat]) => ({
      name: stat.name.split(" ")[0],
      leads: stat.leads,
      atendimentos: stat.atendimentos,
      fechamentos: stat.fechamentos,
      perdidos: stat.perdidos,
    }));
  }, [userStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
        <Skeleton className="h-72 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statusLabel = (status: string) => {
    const col = KANBAN_COLUMNS.find((c) => c.key === status);
    return col ? col.label : status;
  };

  const statusColor = (status: string) => {
    const col = KANBAN_COLUMNS.find((c) => c.key === status);
    return col ? col.color : "bg-white/10 text-white/60";
  };

  const metricCards = [
    {
      label: "Total Leads",
      value: metrics.totalLeads,
      border: "border-l-blue-500",
      icon: (
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Em Atendimento",
      value: metrics.atendimentos,
      border: "border-l-cyan-500",
      icon: (
        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: "bg-cyan-500/10",
    },
    {
      label: "Taxa Conversão",
      value: `${metrics.conversionRate}%`,
      border: "border-l-emerald-500",
      icon: (
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Clientes Ativos",
      value: metrics.activeClients,
      border: "border-l-orange-500",
      icon: (
        <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      iconBg: "bg-orange-500/10",
    },
    {
      label: "Faturamento Mensal",
      value: formatCurrency(metrics.monthlyRevenue),
      border: "border-l-green-500",
      icon: (
        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-green-500/10",
    },
    {
      label: "Pendentes",
      value: metrics.pendingTransactions,
      border: "border-l-amber-500",
      icon: (
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-amber-500/10",
    },
  ];

  const dateFilterButtons: { key: DateFilter; label: string }[] = [
    { key: "hoje", label: "Hoje" },
    { key: "7dias", label: "7 dias" },
    { key: "30dias", label: "30 dias" },
    { key: "mes", label: "Este mês" },
    { key: "tudo", label: "Tudo" },
  ];

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const priorityBadge = (priority: string | null) => {
    switch (priority) {
      case "alta":
        return "bg-red-500/20 text-red-400";
      case "media":
        return "bg-yellow-500/20 text-yellow-400";
      case "baixa":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-white/10 text-white/40";
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl lg:text-5xl text-white mb-1">
          Dashboard
        </h1>
        <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          Visão geral da operação
        </p>
      </div>

      {/* Date Filter + Quick Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Date filter pills */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
          {dateFilterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setDateFilter(btn.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-[family-name:var(--font-montserrat)] transition-all duration-200 ${
                dateFilter === btn.key
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/crm"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/[0.12] text-white/70 text-xs font-medium font-[family-name:var(--font-montserrat)] uppercase tracking-wider hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Lead
          </Link>
          <Link
            href="/fechamento"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/[0.12] text-white/70 text-xs font-medium font-[family-name:var(--font-montserrat)] uppercase tracking-wider hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Gerar Proposta
          </Link>
          <Link
            href="/admin/crm"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/[0.12] text-white/70 text-xs font-medium font-[family-name:var(--font-montserrat)] uppercase tracking-wider hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Ver CRM
          </Link>
        </div>
      </div>

      {/* Row 1: Metrics Row (6 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className={`bg-white/[0.03] border border-white/[0.08] border-l-4 ${metric.border} rounded-2xl p-4 sm:p-5 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-[family-name:var(--font-montserrat)]">
                {metric.label}
              </p>
              <div className={`w-7 h-7 rounded-lg ${metric.iconBg} flex items-center justify-center`}>
                {metric.icon}
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-[family-name:var(--font-montserrat)]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Row 2: Financial Summary (3 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
        {/* A Receber */}
        <div className="bg-white/[0.03] border border-white/[0.08] border-l-4 border-l-yellow-500 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-[family-name:var(--font-montserrat)]">
              A Receber
            </p>
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 font-[family-name:var(--font-montserrat)]">
            {formatCurrency(financialMetrics.pending)}
          </p>
          <p className="text-[10px] text-white/25 mt-1 font-[family-name:var(--font-montserrat)]">
            Transações pendentes
          </p>
        </div>

        {/* Faturamento Total */}
        <div className="bg-white/[0.03] border border-white/[0.08] border-l-4 border-l-green-500 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-[family-name:var(--font-montserrat)]">
              Faturamento Total
            </p>
            <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 font-[family-name:var(--font-montserrat)]">
            {formatCurrency(financialMetrics.totalReceita)}
          </p>
          <p className="text-[10px] text-white/25 mt-1 font-[family-name:var(--font-montserrat)]">
            Receita confirmada (pago)
          </p>
        </div>

        {/* Saldo */}
        <div className={`bg-white/[0.03] border border-white/[0.08] border-l-4 ${financialMetrics.saldo >= 0 ? "border-l-green-500" : "border-l-red-500"} rounded-2xl p-4 sm:p-5 backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-[family-name:var(--font-montserrat)]">
              Saldo
            </p>
            <div className={`w-7 h-7 rounded-lg ${financialMetrics.saldo >= 0 ? "bg-green-500/10" : "bg-red-500/10"} flex items-center justify-center`}>
              <svg className={`w-4 h-4 ${financialMetrics.saldo >= 0 ? "text-green-400" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold font-[family-name:var(--font-montserrat)] ${financialMetrics.saldo >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(financialMetrics.saldo)}
          </p>
          <p className="text-[10px] text-white/25 mt-1 font-[family-name:var(--font-montserrat)]">
            Saldo acumulado geral
          </p>
        </div>
      </div>

      {/* Row 3: Per-user Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {Object.entries(userStats).map(([userId, stat]) => (
          <div
            key={userId}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              {USER_PHOTOS[userId] && (
                <Image
                  src={USER_PHOTOS[userId]}
                  alt={stat.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                />
              )}
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-montserrat)]">
                {stat.name}
              </h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {[
                { label: "Leads", value: stat.leads, color: "text-blue-400" },
                { label: "Atendimentos", value: stat.atendimentos, color: "text-cyan-400" },
                { label: "Agendados", value: stat.agendados, color: "text-orange-400" },
                { label: "Fechamentos", value: stat.fechamentos, color: "text-green-400" },
                { label: "Perdidos", value: stat.perdidos, color: "text-red-400" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-[family-name:var(--font-montserrat)]">
                    {item.label}
                  </p>
                  <p className={`text-2xl font-bold ${item.color} font-[family-name:var(--font-montserrat)]`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Row 4: Próximas Reuniões | Próximas Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {/* Próximas Reuniões */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-6 font-[family-name:var(--font-montserrat)]">
            Próximas Reuniões
          </h3>
          {(() => {
            // Merge Supabase meetings with Google Calendar events, deduplicate by title+date, sort by date
            const supabaseMeetings = meetings.map((m) => ({ ...m, _source: m._source || "supabase" }));
            const allMeetings = [...supabaseMeetings, ...googleMeetings]
              .filter((m) => new Date(m.scheduled_at) >= new Date(new Date().setHours(0,0,0,0)))
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
            // Deduplicate: if a Google event has the same title prefix as a Supabase one on the same day, skip it
            const seen = new Set(supabaseMeetings.map((m) => `${m.title}__${new Date(m.scheduled_at).toDateString()}`));
            const merged = allMeetings.filter((m) => {
              const key = `${m.title}__${new Date(m.scheduled_at).toDateString()}`;
              if (m._source === "google" && seen.has(key)) return false;
              seen.add(key);
              return true;
            });

            if (merged.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)]">
                    Nenhuma reunião agendada.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {merged.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-white font-medium truncate font-[family-name:var(--font-montserrat)]">
                            {meeting.title}
                          </p>
                          {meeting._source === "google" && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">
                              Google
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/30 font-[family-name:var(--font-montserrat)]">
                          <span>{formatDateTime(meeting.scheduled_at)}</span>
                          {"clients" in meeting && (meeting as typeof meetings[number]).clients?.nome && (
                            <>
                              <span className="text-white/10">|</span>
                              <span className="text-white/50">{(meeting as typeof meetings[number]).clients?.nome}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {meeting.meeting_link && (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium font-[family-name:var(--font-montserrat)] hover:bg-orange-500/20 transition-colors flex-shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          Entrar
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Próximas Tarefas */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-6 font-[family-name:var(--font-montserrat)]">
            Próximas Tarefas
          </h3>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)]">
                Nenhuma tarefa pendente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const overdue = isOverdue(task.due_date);
                const assignedUser = task.assigned_to ? USERS_MAP[task.assigned_to] : null;
                return (
                  <div
                    key={task.id}
                    className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate font-[family-name:var(--font-montserrat)] mb-1">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-[family-name:var(--font-montserrat)]">
                          {task.due_date && (
                            <span className={overdue ? "text-red-400 font-semibold" : "text-white/30"}>
                              {overdue ? "Atrasada - " : ""}{formatDate(task.due_date)}
                            </span>
                          )}
                          {assignedUser && (
                            <>
                              <span className="text-white/10">|</span>
                              <span className="text-white/40">{assignedUser.name.split(" ")[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {task.priority && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium font-[family-name:var(--font-montserrat)] ${priorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Chart | Clientes Ativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {/* Leads by Status Chart */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-6 font-[family-name:var(--font-montserrat)]">
            Leads por Status
          </h3>
          {leads.length === 0 ? (
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhum lead encontrado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusChartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4500" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ff4500" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Clientes Ativos */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-6 font-[family-name:var(--font-montserrat)]">
            Clientes Ativos
          </h3>
          {activeClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-white/25 text-sm font-[family-name:var(--font-montserrat)]">
                Nenhum cliente ativo.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {activeClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white/[0.02] rounded-xl p-3.5 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate font-[family-name:var(--font-montserrat)]">
                        {client.nome}
                      </p>
                      {client.empresa && (
                        <p className="text-xs text-white/30 truncate font-[family-name:var(--font-montserrat)]">
                          {client.empresa}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      {client.servicos?.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400/80 font-[family-name:var(--font-montserrat)]"
                        >
                          {s}
                        </span>
                      ))}
                      {client.servicos && client.servicos.length > 2 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30 font-[family-name:var(--font-montserrat)]">
                          +{client.servicos.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 6: Ranking */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm mb-10">
        <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-6 font-[family-name:var(--font-montserrat)]">
          Ranking
        </h3>
        <div className="space-y-5">
          {(["leads", "atendimentos", "fechamentos", "perdidos"] as const).map((metric) => {
            const max = Math.max(
              ...rankingData.map(
                (d) => d[metric as keyof (typeof rankingData)[0]] as number
              ),
              1
            );
            const barColor = RANKING_COLORS[metric] || "bg-white/20";
            return (
              <div key={metric}>
                <p className="text-xs text-white/50 mb-2 capitalize font-[family-name:var(--font-montserrat)]">
                  {metric}
                </p>
                <div className="space-y-2">
                  {rankingData.map((user) => {
                    const val = user[metric as keyof typeof user] as number;
                    const pct = (val / max) * 100;
                    return (
                      <div key={user.name} className="flex items-center gap-3">
                        <span className="text-xs text-white/60 w-20 font-[family-name:var(--font-montserrat)]">
                          {user.name}
                        </span>
                        <div className="flex-1 h-5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white w-8 text-right font-[family-name:var(--font-montserrat)]">
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 7: Atividade Recente + Atividade em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {/* Recent Activity */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-6 font-[family-name:var(--font-montserrat)]">
            Atividade Recente
          </h3>
          {recentLeads.length === 0 ? (
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhuma atividade recente.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate font-[family-name:var(--font-montserrat)]">
                      {lead.nome}
                    </p>
                    <p className="text-xs text-white/30 font-[family-name:var(--font-montserrat)]">
                      {formatDate(lead.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[lead.status] || "bg-white/30"}`}
                    />
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full ${statusColor(lead.status)} font-[family-name:var(--font-montserrat)]`}
                    >
                      {statusLabel(lead.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atividade em Tempo Real */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-[family-name:var(--font-montserrat)]">
              Atividade em Tempo Real
            </h3>
          </div>
          {activityLog.length === 0 ? (
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhuma atividade registrada.
            </p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {activityLog.map((note) => {
                const author = note.author_id ? USERS_MAP[note.author_id] : null;
                const borderColor = note.content.includes("Concluido") || note.content.includes("Concluído")
                  ? "border-l-green-500"
                  : note.content.includes("Perdido")
                  ? "border-l-red-500"
                  : "border-l-white/10";

                return (
                  <div
                    key={note.id}
                    className={`flex items-center gap-3 py-2.5 px-3 border-l-2 ${borderColor} bg-white/[0.02] rounded-r-lg`}
                  >
                    <div className="flex-shrink-0">
                      {author && USER_PHOTOS[note.author_id!] ? (
                        <Image
                          src={USER_PHOTOS[note.author_id!]}
                          alt={author.name}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center">
                          <span className="text-[10px] text-white/40 font-bold">
                            {author ? author.name.charAt(0) : "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 font-[family-name:var(--font-montserrat)]">
                        <span className="font-semibold text-white/90">
                          {author ? author.name.split(" ")[0] : "Sistema"}
                        </span>{" "}
                        {note.content}
                        {note.leads?.nome && (
                          <>
                            {" — "}
                            <span className="text-white/50">{note.leads.nome}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-[10px] text-white/30 flex-shrink-0 font-[family-name:var(--font-montserrat)]">
                      {timeAgo(note.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
