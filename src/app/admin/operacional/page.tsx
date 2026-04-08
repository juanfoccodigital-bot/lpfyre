"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ───

interface TeamMember {
  id: string;
  nome: string;
  cargo: string;
  tipo: "clt" | "pj" | "freelancer" | "socio";
  email: string;
  telefone: string;
  cpf: string;
  pix: string;
  salario: number;
  dia_pagamento: number;
  data_admissao: string;
  data_demissao: string | null;
  status: "ativo" | "inativo" | "ferias";
  observacoes: string;
  avatar_url: string;
  created_at: string;
}

interface PayrollEntry {
  id: string;
  member_id: string;
  month: string;
  amount: number;
  bonus: number;
  deductions: number;
  total: number;
  status: "pendente" | "pago";
  paid_date: string | null;
  notes: string;
  created_at: string;
  // joined
  team_members?: { nome: string; cargo: string; tipo: string } | null;
}

type Tab = "equipe" | "folha" | "resumo";

const TIPO_COLORS: Record<string, string> = {
  clt: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pj: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  freelancer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  socio: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const TIPO_LABELS: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  freelancer: "Freelancer",
  socio: "Sócio",
};

const STATUS_COLORS: Record<string, string> = {
  ativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inativo: "bg-red-500/20 text-red-400 border-red-500/30",
  ferias: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  ferias: "Férias",
};

const PAYROLL_STATUS_COLORS: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  pago: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const emptyMember: Omit<TeamMember, "id" | "created_at"> = {
  nome: "",
  cargo: "",
  tipo: "clt",
  email: "",
  telefone: "",
  cpf: "",
  pix: "",
  salario: 0,
  dia_pagamento: 5,
  data_admissao: new Date().toISOString().split("T")[0],
  data_demissao: null,
  status: "ativo",
  observacoes: "",
  avatar_url: "",
};

// ─── Component ───

export default function OperacionalPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("equipe");

  // Team
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState<Omit<TeamMember, "id" | "created_at">>({ ...emptyMember });
  const [savingMember, setSavingMember] = useState(false);
  const [seedingPartners, setSeedingPartners] = useState(false);

  // Payroll
  const [payrollMonth, setPayrollMonth] = useState(new Date());
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollEntry | null>(null);
  const [payrollForm, setPayrollForm] = useState({ bonus: 0, deductions: 0, notes: "", status: "pendente" as string });

  // Payroll history for summary
  const [payrollHistory, setPayrollHistory] = useState<{ month: string; total: number }[]>([]);

  // ─── Auth ───
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    setUser(session);
  }, [router]);

  // ─── Fetch Team ───
  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("nome");
    setMembers((data as TeamMember[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user, fetchMembers]);

  // ─── Fetch Payroll ───
  const monthKey = format(payrollMonth, "yyyy-MM");

  const fetchPayroll = useCallback(async () => {
    setLoadingPayroll(true);
    const { data } = await supabase
      .from("payroll")
      .select("*, team_members(nome, cargo, tipo)")
      .eq("month", monthKey)
      .order("created_at");
    setPayroll((data as PayrollEntry[]) || []);
    setLoadingPayroll(false);
  }, [monthKey]);

  useEffect(() => {
    if (user && tab === "folha") fetchPayroll();
  }, [user, tab, fetchPayroll]);

  // ─── Fetch Payroll History (for summary) ───
  const fetchPayrollHistory = useCallback(async () => {
    const months: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = format(subMonths(new Date(), i), "yyyy-MM");
      const { data } = await supabase
        .from("payroll")
        .select("total")
        .eq("month", m)
        .eq("status", "pago");
      const sum = (data || []).reduce((acc: number, r: { total: number }) => acc + (r.total || 0), 0);
      if (sum > 0) months.push({ month: m, total: sum });
    }
    setPayrollHistory(months);
  }, []);

  useEffect(() => {
    if (user && tab === "resumo") {
      fetchMembers();
      fetchPayrollHistory();
    }
  }, [user, tab, fetchMembers, fetchPayrollHistory]);

  // ─── Member CRUD ───
  function openNewMember() {
    setEditingMember(null);
    setMemberForm({ ...emptyMember });
    setShowMemberModal(true);
  }

  function openEditMember(m: TeamMember) {
    setEditingMember(m);
    setMemberForm({
      nome: m.nome,
      cargo: m.cargo,
      tipo: m.tipo,
      email: m.email,
      telefone: m.telefone,
      cpf: m.cpf,
      pix: m.pix,
      salario: m.salario,
      dia_pagamento: m.dia_pagamento,
      data_admissao: m.data_admissao,
      data_demissao: m.data_demissao,
      status: m.status,
      observacoes: m.observacoes,
      avatar_url: m.avatar_url,
    });
    setShowMemberModal(true);
  }

  async function saveMember() {
    setSavingMember(true);
    const payload = { ...memberForm, salario: Number(memberForm.salario) || 0, dia_pagamento: Number(memberForm.dia_pagamento) || 5 };
    if (editingMember) {
      await supabase.from("team_members").update(payload).eq("id", editingMember.id);
    } else {
      await supabase.from("team_members").insert(payload);
    }
    setSavingMember(false);
    setShowMemberModal(false);
    fetchMembers();
  }

  async function deleteMember() {
    if (!editingMember) return;
    if (!confirm("Tem certeza que deseja excluir este membro?")) return;
    await supabase.from("payroll").delete().eq("member_id", editingMember.id);
    await supabase.from("team_members").delete().eq("id", editingMember.id);
    setShowMemberModal(false);
    fetchMembers();
  }

  // ─── Seed Partners ───
  async function seedPartners() {
    setSeedingPartners(true);
    const partners = [
      {
        nome: "Juan Mansilha",
        cargo: "Estratégia",
        tipo: "socio",
        email: "juan@fyre.com.br",
        telefone: "",
        cpf: "",
        pix: "",
        salario: 0,
        dia_pagamento: 5,
        data_admissao: "2024-01-01",
        data_demissao: null,
        status: "ativo",
        observacoes: "Sócio-fundador",
        avatar_url: "/images/juan.jpg",
      },
      {
        nome: "Rodrigo Lopes",
        cargo: "Automação & IA",
        tipo: "socio",
        email: "rodrigo@fyre.com.br",
        telefone: "",
        cpf: "",
        pix: "",
        salario: 0,
        dia_pagamento: 5,
        data_admissao: "2024-01-01",
        data_demissao: null,
        status: "ativo",
        observacoes: "Sócio-fundador",
        avatar_url: "/images/rodrigo.jpg",
      },
    ];
    await supabase.from("team_members").insert(partners);
    setSeedingPartners(false);
    fetchMembers();
  }

  // ─── Payroll ───
  async function generatePayroll() {
    setGeneratingPayroll(true);
    const activeMembers = members.filter((m) => m.status === "ativo");
    const existing = payroll.map((p) => p.member_id);
    const toCreate = activeMembers.filter((m) => !existing.includes(m.id));

    if (toCreate.length > 0) {
      const entries = toCreate.map((m) => ({
        member_id: m.id,
        month: monthKey,
        amount: m.salario,
        bonus: 0,
        deductions: 0,
        total: m.salario,
        status: "pendente",
        paid_date: null,
        notes: "",
      }));
      await supabase.from("payroll").insert(entries);
    }
    setGeneratingPayroll(false);
    fetchPayroll();
  }

  async function markAsPaid(entry: PayrollEntry) {
    await supabase
      .from("payroll")
      .update({ status: "pago", paid_date: new Date().toISOString().split("T")[0] })
      .eq("id", entry.id);
    fetchPayroll();
  }

  function openPayrollEdit(entry: PayrollEntry) {
    setEditingPayroll(entry);
    setPayrollForm({
      bonus: entry.bonus,
      deductions: entry.deductions,
      notes: entry.notes || "",
      status: entry.status,
    });
    setShowPayrollModal(true);
  }

  async function savePayrollEdit() {
    if (!editingPayroll) return;
    const bonus = Number(payrollForm.bonus) || 0;
    const deductions = Number(payrollForm.deductions) || 0;
    const total = editingPayroll.amount + bonus - deductions;
    await supabase
      .from("payroll")
      .update({
        bonus,
        deductions,
        total,
        notes: payrollForm.notes,
        status: payrollForm.status,
        paid_date: payrollForm.status === "pago" ? (editingPayroll.paid_date || new Date().toISOString().split("T")[0]) : null,
      })
      .eq("id", editingPayroll.id);
    setShowPayrollModal(false);
    fetchPayroll();
  }

  // ─── Summary computations ───
  const activeMembers = useMemo(() => members.filter((m) => m.status === "ativo"), [members]);
  const totalFolha = useMemo(() => activeMembers.reduce((s, m) => s + m.salario, 0), [activeMembers]);
  const countByType = useMemo(() => {
    const c: Record<string, number> = { clt: 0, pj: 0, freelancer: 0, socio: 0 };
    activeMembers.forEach((m) => { c[m.tipo] = (c[m.tipo] || 0) + 1; });
    return c;
  }, [activeMembers]);
  const costByType = useMemo(() => {
    const c: Record<string, number> = { clt: 0, pj: 0, freelancer: 0, socio: 0 };
    activeMembers.forEach((m) => { c[m.tipo] = (c[m.tipo] || 0) + m.salario; });
    return c;
  }, [activeMembers]);
  const maxCostByType = useMemo(() => Math.max(...Object.values(costByType), 1), [costByType]);
  const upcomingPayments = useMemo(() => {
    const today = new Date().getDate();
    return activeMembers.filter((m) => {
      const diff = m.dia_pagamento - today;
      return diff >= 0 && diff <= 7;
    });
  }, [activeMembers]);

  const payrollTotal = useMemo(() => payroll.reduce((s, p) => s + p.total, 0), [payroll]);

  // ─── Render guards ───
  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <AdminNav user={user} />
        <div className="pt-20 px-4 max-w-[1400px] mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-montserrat)]">
      <AdminNav user={user} />

      <div className="pt-20 pb-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {(["equipe", "folha", "resumo"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                tab === t ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "equipe" ? "Equipe" : t === "folha" ? "Folha de Pagamento" : "Resumo"}
            </button>
          ))}
        </div>

        {/* ════════════════════════════ TAB: EQUIPE ════════════════════════════ */}
        {tab === "equipe" && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold font-[family-name:var(--font-instrument)] text-white/90">
                  Operacional
                </h1>
                <p className="text-xs text-white/30 mt-1">{members.length} membro{members.length !== 1 ? "s" : ""} cadastrado{members.length !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={openNewMember}
                className="px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-white/80 hover:bg-white/[0.12] hover:text-white transition-all duration-200"
              >
                + Novo Membro
              </button>
            </div>

            {/* Empty state with seed button */}
            {members.length === 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-12 text-center">
                <p className="text-white/40 text-sm mb-2">Nenhum membro cadastrado ainda.</p>
                <p className="text-white/25 text-xs mb-6">
                  Comece cadastrando os sócios Juan Mansilha e Rodrigo Lopes.
                </p>
                <button
                  onClick={seedPartners}
                  disabled={seedingPartners}
                  className="px-6 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold hover:bg-orange-500/30 transition-all duration-200 disabled:opacity-50"
                >
                  {seedingPartners ? "Cadastrando..." : "Cadastrar Sócios"}
                </button>
              </div>
            )}

            {/* Team Grid */}
            {members.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => openEditMember(m)}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-5 text-left hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200 group"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.nome}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-white/50">{getInitials(m.nome)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
                          {m.nome}
                        </p>
                        <p className="text-xs text-white/40 truncate">{m.cargo}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${TIPO_COLORS[m.tipo]}`}>
                        {TIPO_LABELS[m.tipo]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${STATUS_COLORS[m.status]}`}>
                        {STATUS_LABELS[m.status]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">Salário</span>
                        <span className="text-xs font-semibold text-white/70">{formatCurrency(m.salario)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">Admissão</span>
                        <span className="text-xs text-white/50">{formatDate(m.data_admissao)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════ TAB: FOLHA DE PAGAMENTO ════════════════════════════ */}
        {tab === "folha" && (
          <div>
            {/* Month selector + Generate */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPayrollMonth(subMonths(payrollMonth, 1))}
                  className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-white/80 min-w-[160px] text-center capitalize">
                  {format(payrollMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                <button
                  onClick={() => setPayrollMonth(addMonths(payrollMonth, 1))}
                  className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              <button
                onClick={generatePayroll}
                disabled={generatingPayroll}
                className="px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-white/80 hover:bg-white/[0.12] hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                {generatingPayroll ? "Gerando..." : "Gerar Folha"}
              </button>
            </div>

            {/* Payroll Table */}
            {loadingPayroll ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : payroll.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-12 text-center">
                <p className="text-white/40 text-sm">
                  Nenhuma folha gerada para {format(payrollMonth, "MMMM yyyy", { locale: ptBR })}.
                </p>
                <p className="text-white/25 text-xs mt-1">Clique em &ldquo;Gerar Folha&rdquo; para criar.</p>
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Membro", "Cargo", "Tipo", "Salário Base", "Bônus", "Descontos", "Total", "Status", "Ações"].map((h) => (
                          <th key={h} className="px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payroll.map((p) => (
                        <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-xs font-semibold text-white/80 whitespace-nowrap">
                            {p.team_members?.nome || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-white/50 whitespace-nowrap">{p.team_members?.cargo || "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${TIPO_COLORS[p.team_members?.tipo || "clt"]}`}>
                              {TIPO_LABELS[p.team_members?.tipo || "clt"]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-white/60 whitespace-nowrap">{formatCurrency(p.amount)}</td>
                          <td className="px-4 py-3 text-xs text-emerald-400/70 whitespace-nowrap">
                            {p.bonus > 0 ? `+${formatCurrency(p.bonus)}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-red-400/70 whitespace-nowrap">
                            {p.deductions > 0 ? `-${formatCurrency(p.deductions)}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-white/80 whitespace-nowrap">{formatCurrency(p.total)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${PAYROLL_STATUS_COLORS[p.status]}`}>
                              {p.status === "pago" ? "Pago" : "Pendente"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {p.status === "pendente" && (
                                <button
                                  onClick={() => markAsPaid(p)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20 transition-all"
                                >
                                  Pagar
                                </button>
                              )}
                              <button
                                onClick={() => openPayrollEdit(p)}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-[10px] font-semibold hover:bg-white/[0.08] hover:text-white/70 transition-all"
                              >
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/[0.08]">
                        <td colSpan={6} className="px-4 py-3 text-xs font-semibold text-white/50 text-right">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-white/90">{formatCurrency(payrollTotal)}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════ TAB: RESUMO ════════════════════════════ */}
        {tab === "resumo" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Folha Mensal</p>
                <p className="text-lg font-bold text-white/90">{formatCurrency(totalFolha)}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Membros Ativos</p>
                <p className="text-lg font-bold text-white/90">{activeMembers.length}</p>
              </div>
              {(["clt", "pj", "freelancer", "socio"] as const).map((t) => (
                <div key={t} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-5">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{TIPO_LABELS[t]}</p>
                  <p className="text-lg font-bold text-white/90">{countByType[t]}</p>
                </div>
              ))}
            </div>

            {/* Upcoming payments */}
            {upcomingPayments.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-6">
                <h3 className="text-xs font-semibold text-white/60 mb-4 uppercase tracking-wider">
                  Próximos Pagamentos (7 dias)
                </h3>
                <div className="space-y-2">
                  {upcomingPayments.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white/40">{getInitials(m.nome)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white/80">{m.nome}</p>
                          <p className="text-[10px] text-white/40">Dia {m.dia_pagamento}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-white/60">{formatCurrency(m.salario)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost breakdown by type */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-6">
              <h3 className="text-xs font-semibold text-white/60 mb-5 uppercase tracking-wider">
                Custo por Tipo
              </h3>
              <div className="space-y-4">
                {(["clt", "pj", "freelancer", "socio"] as const).map((t) => (
                  <div key={t}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white/70">{TIPO_LABELS[t]}</span>
                      <span className="text-xs text-white/50">{formatCurrency(costByType[t])}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t === "clt" ? "bg-blue-500/60" : t === "pj" ? "bg-emerald-500/60" : t === "freelancer" ? "bg-purple-500/60" : "bg-orange-500/60"
                        }`}
                        style={{ width: `${maxCostByType > 0 ? (costByType[t] / maxCostByType) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            {payrollHistory.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-6">
                <h3 className="text-xs font-semibold text-white/60 mb-5 uppercase tracking-wider">
                  Histórico de Pagamentos
                </h3>
                <div className="space-y-3">
                  {payrollHistory.map((h) => {
                    const maxHist = Math.max(...payrollHistory.map((x) => x.total), 1);
                    const [y, mo] = h.month.split("-");
                    const d = new Date(Number(y), Number(mo) - 1, 1);
                    return (
                      <div key={h.month}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-white/60 capitalize">
                            {format(d, "MMM yyyy", { locale: ptBR })}
                          </span>
                          <span className="text-xs font-semibold text-white/70">{formatCurrency(h.total)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-white/20 transition-all duration-500"
                            style={{ width: `${(h.total / maxHist) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════ MEMBER MODAL ════════════════════════════ */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMemberModal(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white/90 font-[family-name:var(--font-instrument)]">
                  {editingMember ? "Editar Membro" : "Novo Membro"}
                </h2>
                <button onClick={() => setShowMemberModal(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Nome + Cargo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Nome</label>
                    <input
                      type="text"
                      value={memberForm.nome}
                      onChange={(e) => setMemberForm({ ...memberForm, nome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Cargo</label>
                    <input
                      type="text"
                      value={memberForm.cargo}
                      onChange={(e) => setMemberForm({ ...memberForm, cargo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Cargo / Função"
                    />
                  </div>
                </div>

                {/* Email + Telefone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Telefone</label>
                    <input
                      type="text"
                      value={memberForm.telefone}
                      onChange={(e) => setMemberForm({ ...memberForm, telefone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {/* CPF + PIX */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">CPF</label>
                    <input
                      type="text"
                      value={memberForm.cpf}
                      onChange={(e) => setMemberForm({ ...memberForm, cpf: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">PIX</label>
                    <input
                      type="text"
                      value={memberForm.pix}
                      onChange={(e) => setMemberForm({ ...memberForm, pix: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Chave PIX"
                    />
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-2">Tipo</label>
                  <div className="flex items-center gap-2">
                    {(["clt", "pj", "freelancer", "socio"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setMemberForm({ ...memberForm, tipo: t })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all duration-200 ${
                          memberForm.tipo === t
                            ? TIPO_COLORS[t]
                            : "border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                      >
                        {TIPO_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Salário + Dia pagamento */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Salário (R$)</label>
                    <input
                      type="number"
                      value={memberForm.salario || ""}
                      onChange={(e) => setMemberForm({ ...memberForm, salario: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Dia Pagamento</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={memberForm.dia_pagamento || ""}
                      onChange={(e) => setMemberForm({ ...memberForm, dia_pagamento: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Data Admissão</label>
                    <input
                      type="date"
                      value={memberForm.data_admissao || ""}
                      onChange={(e) => setMemberForm({ ...memberForm, data_admissao: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Data Demissão</label>
                    <input
                      type="date"
                      value={memberForm.data_demissao || ""}
                      onChange={(e) => setMemberForm({ ...memberForm, data_demissao: e.target.value || null })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-2">Status</label>
                  <div className="flex items-center gap-2">
                    {(["ativo", "inativo", "ferias"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setMemberForm({ ...memberForm, status: s })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all duration-200 ${
                          memberForm.status === s
                            ? STATUS_COLORS[s]
                            : "border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Avatar URL (opcional)</label>
                  <input
                    type="text"
                    value={memberForm.avatar_url || ""}
                    onChange={(e) => setMemberForm({ ...memberForm, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="https://..."
                  />
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Observações</label>
                  <textarea
                    value={memberForm.observacoes || ""}
                    onChange={(e) => setMemberForm({ ...memberForm, observacoes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    placeholder="Notas internas..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
                <div>
                  {editingMember && (
                    <button
                      onClick={deleteMember}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Excluir
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white/40 hover:text-white/60 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveMember}
                    disabled={savingMember || !memberForm.nome}
                    className="px-5 py-2 rounded-xl bg-white/[0.1] border border-white/[0.12] text-xs font-semibold text-white/90 hover:bg-white/[0.15] transition-all disabled:opacity-40"
                  >
                    {savingMember ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════ PAYROLL EDIT MODAL ════════════════════════════ */}
      {showPayrollModal && editingPayroll && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPayrollModal(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white/90 font-[family-name:var(--font-instrument)]">
                  Editar Pagamento
                </h2>
                <button onClick={() => setShowPayrollModal(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Member name */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Membro</label>
                  <p className="text-xs font-semibold text-white/70">{editingPayroll.team_members?.nome || "—"}</p>
                </div>

                {/* Base salary */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Salário Base</label>
                  <p className="text-xs font-semibold text-white/70">{formatCurrency(editingPayroll.amount)}</p>
                </div>

                {/* Bonus */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Bônus (R$)</label>
                  <input
                    type="number"
                    value={payrollForm.bonus || ""}
                    onChange={(e) => setPayrollForm({ ...payrollForm, bonus: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                {/* Deductions */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Descontos (R$)</label>
                  <input
                    type="number"
                    value={payrollForm.deductions || ""}
                    onChange={(e) => setPayrollForm({ ...payrollForm, deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                {/* Total (auto) */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Total</label>
                  <p className="text-sm font-bold text-white/90">
                    {formatCurrency(editingPayroll.amount + (Number(payrollForm.bonus) || 0) - (Number(payrollForm.deductions) || 0))}
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Notas</label>
                  <textarea
                    value={payrollForm.notes}
                    onChange={(e) => setPayrollForm({ ...payrollForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    placeholder="Observações..."
                  />
                </div>

                {/* Status toggle */}
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-2">Status</label>
                  <div className="flex items-center gap-2">
                    {(["pendente", "pago"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setPayrollForm({ ...payrollForm, status: s })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all duration-200 ${
                          payrollForm.status === s
                            ? PAYROLL_STATUS_COLORS[s]
                            : "border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                      >
                        {s === "pago" ? "Pago" : "Pendente"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowPayrollModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/40 hover:text-white/60 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePayrollEdit}
                  className="px-5 py-2 rounded-xl bg-white/[0.1] border border-white/[0.12] text-xs font-semibold text-white/90 hover:bg-white/[0.15] transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
