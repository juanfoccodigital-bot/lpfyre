"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Client, FinancialTransaction } from "@/lib/types";

const CATEGORIES = [
  { value: "mensalidade", label: "Mensalidade" },
  { value: "projeto", label: "Projeto" },
  { value: "ferramenta", label: "Ferramenta" },
  { value: "imposto", label: "Imposto" },
  { value: "salario", label: "Salario" },
  { value: "outro", label: "Outro" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
  );
}

interface TransactionWithClient extends FinancialTransaction {
  clients?: { nome: string; empresa: string | null } | null;
}

interface NewTransaction {
  type: string;
  description: string;
  amount: string;
  category: string;
  client_id: string;
  due_date: string;
  is_recurring: boolean;
  recurrence_day: string;
}

const emptyForm: NewTransaction = {
  type: "receita",
  description: "",
  amount: "",
  category: "mensalidade",
  client_id: "",
  due_date: "",
  is_recurring: false,
  recurrence_day: "",
};

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<TransactionWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewTransaction>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchTransactions = useCallback(async () => {
    const { data } = await supabase
      .from("financial_transactions")
      .select("*, clients(nome, empresa)")
      .order("due_date", { ascending: false });
    setTransactions((data as TransactionWithClient[]) || []);
  }, []);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from("clients").select("*");
    setClients(data || []);
  }, []);

  // Check and create recurring transactions for current month
  const processRecurring = useCallback(
    async (txns: TransactionWithClient[]) => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const recurring = txns.filter((t) => t.is_recurring);
      const created: boolean[] = [];

      for (const tx of recurring) {
        // Check if a transaction for the same client+category already exists this month
        const existsThisMonth = txns.some((t) => {
          if (t.id === tx.id) return false;
          if (t.client_id !== tx.client_id || t.category !== tx.category)
            return false;
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        // Also check if the original itself is this month
        if (tx.due_date) {
          const origDate = new Date(tx.due_date);
          if (
            origDate.getFullYear() === currentYear &&
            origDate.getMonth() === currentMonth
          ) {
            continue;
          }
        }

        if (!existsThisMonth) {
          const day = tx.recurrence_day || 1;
          const dueDate = new Date(currentYear, currentMonth, day);
          const { error } = await supabase
            .from("financial_transactions")
            .insert({
              client_id: tx.client_id,
              type: tx.type,
              category: tx.category,
              description: tx.description,
              amount: tx.amount,
              status: "pendente",
              due_date: dueDate.toISOString().split("T")[0],
              is_recurring: true,
              recurrence_day: tx.recurrence_day,
            });
          if (!error) created.push(true);
        }
      }

      if (created.length > 0) {
        // Refresh transactions if new ones were created
        await fetchTransactions();
      }
    },
    [fetchTransactions]
  );

  useEffect(() => {
    async function init() {
      const [txRes, clRes] = await Promise.all([
        supabase
          .from("financial_transactions")
          .select("*, clients(nome, empresa)")
          .order("due_date", { ascending: false }),
        supabase.from("clients").select("*"),
      ]);

      const txData = (txRes.data as TransactionWithClient[]) || [];
      setTransactions(txData);
      setClients(clRes.data || []);
      setLoading(false);

      // Process recurring after initial load
      await processRecurring(txData);
    }
    init();
  }, [processRecurring]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Month filter
      if (filterMonth && t.due_date) {
        const d = new Date(t.due_date);
        const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (txMonth !== filterMonth) return false;
      }
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      return true;
    });
  }, [transactions, filterMonth, filterType, filterStatus]);

  // Summary
  const summary = useMemo(() => {
    const receita = filtered
      .filter((t) => t.type === "receita" && t.status === "pago")
      .reduce((s, t) => s + t.amount, 0);
    const despesa = filtered
      .filter((t) => t.type === "despesa" && t.status === "pago")
      .reduce((s, t) => s + t.amount, 0);
    const pendente = filtered
      .filter((t) => t.status === "pendente")
      .reduce((s, t) => s + t.amount, 0);
    // Saldo is CUMULATIVE (all time, not filtered by month)
    const saldoReceita = transactions
      .filter((t) => t.type === "receita" && t.status === "pago")
      .reduce((s, t) => s + t.amount, 0);
    const saldoDespesa = transactions
      .filter((t) => t.type === "despesa" && t.status === "pago")
      .reduce((s, t) => s + t.amount, 0);
    const saldo = saldoReceita - saldoDespesa;
    return { receita, despesa, pendente, saldo };
  }, [filtered, transactions]);

  async function handleMarkPaid(id: string) {
    const { error } = await supabase
      .from("financial_transactions")
      .update({ status: "pago", paid_date: new Date().toISOString() })
      .eq("id", id);
    if (error) { alert("Erro: " + error.message); return; }
    await fetchTransactions();
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta transacao?")) return;
    const { error } = await supabase.from("financial_transactions").delete().eq("id", id);
    if (error) { alert("Erro: " + error.message); return; }
    await fetchTransactions();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      type: form.type,
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      client_id: form.client_id || null,
      due_date: form.due_date || null,
      status: "pendente",
      is_recurring: form.is_recurring,
      recurrence_day: form.is_recurring
        ? parseInt(form.recurrence_day) || null
        : null,
    };

    if (isNaN(payload.amount)) { alert("Valor invalido."); setSaving(false); return; }
    const { error } = await supabase.from("financial_transactions").insert(payload);
    if (error) { alert("Erro: " + error.message); setSaving(false); return; }
    setForm({ ...emptyForm });
    setShowModal(false);
    setSaving(false);
    await fetchTransactions();
  }

  // Edit modal state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewTransaction>({ ...emptyForm });

  function startEdit(tx: TransactionWithClient) {
    setEditId(tx.id);
    setEditForm({
      type: tx.type,
      description: tx.description,
      amount: String(tx.amount),
      category: tx.category || "outro",
      client_id: tx.client_id || "",
      due_date: tx.due_date ? tx.due_date.split("T")[0] : "",
      is_recurring: tx.is_recurring,
      recurrence_day: tx.recurrence_day ? String(tx.recurrence_day) : "",
    });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);

    await supabase
      .from("financial_transactions")
      .update({
        type: editForm.type,
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        client_id: editForm.client_id || null,
        due_date: editForm.due_date || null,
        is_recurring: editForm.is_recurring,
        recurrence_day: editForm.is_recurring
          ? parseInt(editForm.recurrence_day) || null
          : null,
      })
      .eq("id", editId);

    setEditId(null);
    setSaving(false);
    await fetchTransactions();
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500/20 text-green-400";
      case "pendente":
        return "bg-yellow-500/20 text-yellow-400";
      case "atrasado":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-white/10 text-white/50";
    }
  };

  const inputClasses =
    "w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-white/20 font-[family-name:var(--font-montserrat)]";
  const labelClasses =
    "text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block font-[family-name:var(--font-montserrat)]";

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 lg:p-10">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-12 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-[family-name:var(--font-instrument)] text-4xl lg:text-5xl text-white mb-1">
            Financeiro
          </h1>
          <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
            Controle de receitas e despesas
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ ...emptyForm });
            setShowModal(true);
          }}
          className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/90 transition-colors font-[family-name:var(--font-montserrat)]"
        >
          + Nova Transacao
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-[family-name:var(--font-montserrat)]">
            Receita Total
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-green-400 font-[family-name:var(--font-montserrat)]">
            {formatCurrency(summary.receita)}
          </p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-[family-name:var(--font-montserrat)]">
            Despesas
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-red-400 font-[family-name:var(--font-montserrat)]">
            {formatCurrency(summary.despesa)}
          </p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-[family-name:var(--font-montserrat)]">
            Pendentes
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-yellow-400 font-[family-name:var(--font-montserrat)]">
            {formatCurrency(summary.pendente)}
          </p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-[family-name:var(--font-montserrat)]">
            Saldo
          </p>
          <p
            className={`text-2xl lg:text-3xl font-bold font-[family-name:var(--font-montserrat)] ${summary.saldo >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {formatCurrency(summary.saldo)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 font-[family-name:var(--font-montserrat)] [color-scheme:dark]"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 font-[family-name:var(--font-montserrat)] appearance-none cursor-pointer"
        >
          <option value="all" className="bg-black">
            Todos os tipos
          </option>
          <option value="receita" className="bg-black">
            Receita
          </option>
          <option value="despesa" className="bg-black">
            Despesa
          </option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 font-[family-name:var(--font-montserrat)] appearance-none cursor-pointer"
        >
          <option value="all" className="bg-black">
            Todos os status
          </option>
          <option value="pendente" className="bg-black">
            Pendente
          </option>
          <option value="pago" className="bg-black">
            Pago
          </option>
          <option value="atrasado" className="bg-black">
            Atrasado
          </option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhuma transacao encontrada para os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {[
                    "Data",
                    "Descrição",
                    "Cliente",
                    "Categoria",
                    "Valor",
                    "Status",
                    "Ações",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] uppercase tracking-wider text-white/40 px-5 py-4 font-[family-name:var(--font-montserrat)] font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 text-sm text-white/60 font-[family-name:var(--font-montserrat)]">
                      {formatDate(tx.due_date)}
                    </td>
                    <td className="px-5 py-4 text-sm text-white font-[family-name:var(--font-montserrat)]">
                      {tx.description}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/60 font-[family-name:var(--font-montserrat)]">
                      {tx.clients?.nome || tx.clients?.empresa || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-white/40 capitalize font-[family-name:var(--font-montserrat)]">
                        {tx.category || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-bold font-[family-name:var(--font-montserrat)] ${tx.type === "receita" ? "text-green-400" : "text-red-400"}`}
                      >
                        {tx.type === "despesa" ? "- " : "+ "}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-[family-name:var(--font-montserrat)] ${statusBadge(tx.status)}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {tx.status !== "pago" && (
                          <button
                            onClick={() => handleMarkPaid(tx.id)}
                            className="text-[10px] uppercase tracking-wider text-green-400 hover:text-green-300 transition-colors font-[family-name:var(--font-montserrat)]"
                            title="Marcar como pago"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(tx)}
                          className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors font-[family-name:var(--font-montserrat)]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-[10px] uppercase tracking-wider text-red-400/60 hover:text-red-400 transition-colors font-[family-name:var(--font-montserrat)]"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-black border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-[family-name:var(--font-instrument)] text-2xl text-white mb-6">
              Nova Transacao
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className={labelClasses}>Tipo</label>
                <div className="flex gap-2">
                  {["receita", "despesa"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-colors font-[family-name:var(--font-montserrat)] ${
                        form.type === t
                          ? t === "receita"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-white/[0.05] text-white/40 border border-white/[0.08]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClasses}>Descrição</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Ex: Mensalidade cliente X"
                  className={inputClasses}
                />
              </div>

              {/* Amount */}
              <div>
                <label className={labelClasses}>Valor (R$)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className={inputClasses}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelClasses}>Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-black">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client */}
              <div>
                <label className={labelClasses}>Cliente (opcional)</label>
                <select
                  value={form.client_id}
                  onChange={(e) =>
                    setForm({ ...form, client_id: e.target.value })
                  }
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-black">
                    Nenhum
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-black">
                      {c.nome}
                      {c.empresa ? ` — ${c.empresa}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className={labelClasses}>Data de vencimento</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                  className={`${inputClasses} [color-scheme:dark]`}
                />
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, is_recurring: !form.is_recurring })
                  }
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.is_recurring ? "bg-white/30" : "bg-white/[0.08]"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.is_recurring ? "left-5" : "left-1"}`}
                  />
                </button>
                <span className="text-sm text-white/60 font-[family-name:var(--font-montserrat)]">
                  Recorrente
                </span>
              </div>

              {form.is_recurring && (
                <div>
                  <label className={labelClasses}>Dia da recorrencia</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.recurrence_day}
                    onChange={(e) =>
                      setForm({ ...form, recurrence_day: e.target.value })
                    }
                    placeholder="Ex: 10"
                    className={inputClasses}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/40 text-xs uppercase tracking-wider font-bold hover:border-white/20 hover:text-white/60 transition-colors font-[family-name:var(--font-montserrat)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-xs uppercase tracking-wider font-bold hover:bg-white/90 transition-colors disabled:opacity-50 font-[family-name:var(--font-montserrat)]"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditId(null)}
          />
          <div className="relative bg-black border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-[family-name:var(--font-instrument)] text-2xl text-white mb-6">
              Editar Transacao
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className={labelClasses}>Tipo</label>
                <div className="flex gap-2">
                  {["receita", "despesa"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, type: t })}
                      className={`flex-1 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-colors font-[family-name:var(--font-montserrat)] ${
                        editForm.type === t
                          ? t === "receita"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-white/[0.05] text-white/40 border border-white/[0.08]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClasses}>Descrição</label>
                <input
                  type="text"
                  required
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>

              {/* Amount */}
              <div>
                <label className={labelClasses}>Valor (R$)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelClasses}>Categoria</label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-black">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client */}
              <div>
                <label className={labelClasses}>Cliente (opcional)</label>
                <select
                  value={editForm.client_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, client_id: e.target.value })
                  }
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-black">
                    Nenhum
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-black">
                      {c.nome}
                      {c.empresa ? ` — ${c.empresa}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className={labelClasses}>Data de vencimento</label>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, due_date: e.target.value })
                  }
                  className={`${inputClasses} [color-scheme:dark]`}
                />
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      is_recurring: !editForm.is_recurring,
                    })
                  }
                  className={`w-10 h-6 rounded-full transition-colors relative ${editForm.is_recurring ? "bg-white/30" : "bg-white/[0.08]"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${editForm.is_recurring ? "left-5" : "left-1"}`}
                  />
                </button>
                <span className="text-sm text-white/60 font-[family-name:var(--font-montserrat)]">
                  Recorrente
                </span>
              </div>

              {editForm.is_recurring && (
                <div>
                  <label className={labelClasses}>Dia da recorrencia</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editForm.recurrence_day}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        recurrence_day: e.target.value,
                      })
                    }
                    className={inputClasses}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/40 text-xs uppercase tracking-wider font-bold hover:border-white/20 hover:text-white/60 transition-colors font-[family-name:var(--font-montserrat)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-xs uppercase tracking-wider font-bold hover:bg-white/90 transition-colors disabled:opacity-50 font-[family-name:var(--font-montserrat)]"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
