"use client";

import { useState, useMemo } from "react";

/* ─── Funnel Calculator Logic (based on FYRE-Funil-Vendas.xlsx) ─── */

interface FunnelInputs {
  meta_receita: number;
  ticket_implementacao: number;
  ticket_mensalidade: number;
  mrr_atual: number;
  cpl: number;
  taxa_form_wa: number;
  taxa_wa_reuniao: number;
  show_rate: number;
  taxa_fechamento: number;
  budget_ads: number;
}

function calcFunnel(i: FunnelInputs) {
  const taxa_total = i.taxa_form_wa * i.taxa_wa_reuniao * i.show_rate * i.taxa_fechamento;
  const receita_faltante = Math.max(i.meta_receita - i.mrr_atual, 0);
  const vendas_necessarias = i.ticket_implementacao > 0 ? Math.ceil(receita_faltante / i.ticket_implementacao) : 0;
  const reunioes_realizadas_necessarias = i.taxa_fechamento > 0 ? Math.ceil(vendas_necessarias / i.taxa_fechamento) : 0;
  const reunioes_agendadas_necessarias = i.show_rate > 0 ? Math.ceil(reunioes_realizadas_necessarias / i.show_rate) : 0;
  const wa_contactados_necessarios = i.taxa_wa_reuniao > 0 ? Math.ceil(reunioes_agendadas_necessarias / i.taxa_wa_reuniao) : 0;
  const leads_necessarios = i.taxa_form_wa > 0 ? Math.ceil(wa_contactados_necessarios / i.taxa_form_wa) : 0;
  const budget_minimo = leads_necessarios * i.cpl;

  // Com budget atual
  const leads_budget = i.cpl > 0 ? Math.floor(i.budget_ads / i.cpl) : 0;
  const wa_budget = Math.floor(leads_budget * i.taxa_form_wa);
  const reunioes_ag_budget = Math.floor(wa_budget * i.taxa_wa_reuniao);
  const reunioes_re_budget = Math.floor(reunioes_ag_budget * i.show_rate);
  const vendas_budget = Math.floor(reunioes_re_budget * i.taxa_fechamento);

  const receita_projetos = vendas_budget * i.ticket_implementacao;
  const mrr_adicionado = vendas_budget * i.ticket_mensalidade;
  const receita_total = i.mrr_atual + receita_projetos + mrr_adicionado;

  const cac = vendas_budget > 0 ? i.budget_ads / vendas_budget : 0;
  const ltv_12 = i.ticket_implementacao + (i.ticket_mensalidade * 12);
  const ltv_cac = cac > 0 ? ltv_12 / cac : 0;
  const roi = i.budget_ads > 0 ? receita_total / i.budget_ads : 0;
  const payback = i.ticket_mensalidade > 0 ? cac / i.ticket_mensalidade : 0;

  return {
    taxa_total,
    receita_faltante,
    vendas_necessarias,
    reunioes_realizadas_necessarias,
    reunioes_agendadas_necessarias,
    wa_contactados_necessarios,
    leads_necessarios,
    budget_minimo,
    leads_budget,
    wa_budget,
    reunioes_ag_budget,
    reunioes_re_budget,
    vendas_budget,
    receita_projetos,
    mrr_adicionado,
    receita_total,
    cac,
    ltv_12,
    ltv_cac,
    roi,
    payback,
  };
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
const fmtR = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtP = (n: number) => `${(n * 100).toFixed(0)}%`;

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
      <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-white/25 mb-1">{label}</p>
      <p className={`text-xl font-bold tracking-tight ${color || "text-white/80"}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/20 mt-0.5">{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-white/30 w-36 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-7 bg-white/[0.03] rounded-lg overflow-hidden relative">
        <div className={`h-full ${color} rounded-lg transition-all duration-700`} style={{ width: `${pct}%` }} />
        <span className="absolute inset-0 flex items-center pl-3 text-[11px] font-bold text-white/70">{fmt(value)}</span>
      </div>
    </div>
  );
}

export default function FunilPage() {
  const [inputs, setInputs] = useState<FunnelInputs>({
    meta_receita: 15000,
    ticket_implementacao: 1997,
    ticket_mensalidade: 1497,
    mrr_atual: 5788,
    cpl: 22,
    taxa_form_wa: 0.85,
    taxa_wa_reuniao: 0.30,
    show_rate: 0.70,
    taxa_fechamento: 0.28,
    budget_ads: 2266,
  });

  const [activeTab, setActiveTab] = useState<"calculadora" | "cenarios">("calculadora");

  const r = useMemo(() => calcFunnel(inputs), [inputs]);

  const update = (key: keyof FunnelInputs, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) setInputs((prev) => ({ ...prev, [key]: num }));
  };

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-fyre/30 transition-all";
  const labelClass = "block text-[9px] font-semibold tracking-[0.12em] uppercase text-white/25 mb-1";

  // Cenarios
  const cenarios = useMemo(() => {
    const conservador = calcFunnel({ ...inputs, budget_ads: 1500, cpl: 30, taxa_form_wa: 0.80, taxa_wa_reuniao: 0.20, show_rate: 0.60, taxa_fechamento: 0.20, ticket_implementacao: 5000, ticket_mensalidade: 997 });
    const realista = calcFunnel(inputs);
    const otimista = calcFunnel({ ...inputs, budget_ads: 5000, cpl: 16, taxa_form_wa: 0.90, taxa_wa_reuniao: 0.40, show_rate: 0.80, taxa_fechamento: 0.35, ticket_implementacao: 7500, ticket_mensalidade: 1997 });
    return { conservador, realista, otimista };
  }, [inputs]);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Funil de Vendas</h1>
          <p className="text-xs text-white/30 mt-1">Calculadora baseada no modelo FYRE — Meta Ads → Forms → WhatsApp (Ayla) → Reunioes → Vendas</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] border border-white/[0.05] p-1">
          <button onClick={() => setActiveTab("calculadora")} className={`px-4 py-2 rounded-lg text-[11px] font-semibold transition-all ${activeTab === "calculadora" ? "bg-fyre text-white" : "text-white/35 hover:text-white/55"}`}>Calculadora</button>
          <button onClick={() => setActiveTab("cenarios")} className={`px-4 py-2 rounded-lg text-[11px] font-semibold transition-all ${activeTab === "cenarios" ? "bg-fyre text-white" : "text-white/35 hover:text-white/55"}`}>Cenarios</button>
        </div>
      </div>

      {activeTab === "calculadora" ? (
        <>
          {/* Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Meta */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-fyre/50 mb-4">Meta de Faturamento</p>
              <div className="space-y-3">
                <div><label className={labelClass}>Meta de receita/mes (R$)</label><input className={inputClass} type="number" value={inputs.meta_receita} onChange={(e) => update("meta_receita", e.target.value)} /></div>
                <div><label className={labelClass}>Ticket implementacao (R$)</label><input className={inputClass} type="number" value={inputs.ticket_implementacao} onChange={(e) => update("ticket_implementacao", e.target.value)} /></div>
                <div><label className={labelClass}>Ticket mensalidade (R$)</label><input className={inputClass} type="number" value={inputs.ticket_mensalidade} onChange={(e) => update("ticket_mensalidade", e.target.value)} /></div>
                <div><label className={labelClass}>MRR atual (R$)</label><input className={inputClass} type="number" value={inputs.mrr_atual} onChange={(e) => update("mrr_atual", e.target.value)} /></div>
              </div>
            </div>

            {/* Taxas */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-fyre/50 mb-4">Taxas de Conversao</p>
              <div className="space-y-3">
                <div><label className={labelClass}>CPL — Custo por Lead (R$)</label><input className={inputClass} type="number" value={inputs.cpl} onChange={(e) => update("cpl", e.target.value)} /></div>
                <div><label className={labelClass}>Form → WhatsApp (%)</label><input className={inputClass} type="number" step="0.01" value={inputs.taxa_form_wa} onChange={(e) => update("taxa_form_wa", e.target.value)} /></div>
                <div><label className={labelClass}>WhatsApp → Reuniao (%)</label><input className={inputClass} type="number" step="0.01" value={inputs.taxa_wa_reuniao} onChange={(e) => update("taxa_wa_reuniao", e.target.value)} /></div>
                <div><label className={labelClass}>Show Rate (%)</label><input className={inputClass} type="number" step="0.01" value={inputs.show_rate} onChange={(e) => update("show_rate", e.target.value)} /></div>
                <div><label className={labelClass}>Taxa de Fechamento (%)</label><input className={inputClass} type="number" step="0.01" value={inputs.taxa_fechamento} onChange={(e) => update("taxa_fechamento", e.target.value)} /></div>
              </div>
            </div>

            {/* Budget */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-fyre/50 mb-4">Budget & Resultados</p>
              <div className="space-y-3 mb-5">
                <div><label className={labelClass}>Budget mensal em ads (R$)</label><input className={inputClass} type="number" value={inputs.budget_ads} onChange={(e) => update("budget_ads", e.target.value)} /></div>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between"><span className="text-white/30">Budget diario</span><span className="text-white/60 font-semibold">{fmtR(inputs.budget_ads / 30)}</span></div>
                <div className="flex justify-between"><span className="text-white/30">Budget minimo p/ meta</span><span className="text-white/60 font-semibold">{fmtR(r.budget_minimo)}</span></div>
                <div className="flex justify-between"><span className="text-white/30">Taxa conversao total</span><span className="text-white/60 font-semibold">{(r.taxa_total * 100).toFixed(2)}%</span></div>
              </div>
            </div>
          </div>

          {/* Funnel Visual */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-8">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-fyre/50 mb-5">Funil Visual — Com Budget Atual</p>
            <div className="space-y-2.5">
              <FunnelBar label="Ads Investido" value={inputs.budget_ads} maxValue={inputs.budget_ads} color="bg-gradient-to-r from-blue-600 to-blue-400" />
              <FunnelBar label="Leads Gerados" value={r.leads_budget} maxValue={r.leads_budget} color="bg-gradient-to-r from-cyan-600 to-cyan-400" />
              <FunnelBar label="WA Contactados (Ayla)" value={r.wa_budget} maxValue={r.leads_budget} color="bg-gradient-to-r from-green-600 to-green-400" />
              <FunnelBar label="Reunioes Agendadas" value={r.reunioes_ag_budget} maxValue={r.leads_budget} color="bg-gradient-to-r from-yellow-600 to-yellow-400" />
              <FunnelBar label="Reunioes Realizadas" value={r.reunioes_re_budget} maxValue={r.leads_budget} color="bg-gradient-to-r from-orange-600 to-orange-400" />
              <FunnelBar label="Vendas Fechadas" value={r.vendas_budget} maxValue={r.leads_budget} color="bg-gradient-to-r from-fyre to-red-400" />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <MetricCard label="Receita Total" value={fmtR(r.receita_total)} sub="MRR + projetos + mensal" color="text-green-400" />
            <MetricCard label="Receita Projetos" value={fmtR(r.receita_projetos)} />
            <MetricCard label="MRR Adicionado" value={fmtR(r.mrr_adicionado)} />
            <MetricCard label="CAC" value={fmtR(r.cac)} sub="custo por cliente" color={r.cac > 1000 ? "text-red-400" : "text-green-400"} />
            <MetricCard label="LTV 12m" value={fmtR(r.ltv_12)} />
            <MetricCard label="LTV / CAC" value={`${r.ltv_cac.toFixed(1)}x`} sub="meta: acima de 10x" color={r.ltv_cac >= 10 ? "text-green-400" : "text-yellow-400"} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="ROI Ads" value={`${r.roi.toFixed(1)}x`} color={r.roi >= 5 ? "text-green-400" : "text-yellow-400"} />
            <MetricCard label="Payback CAC" value={`${r.payback.toFixed(1)} meses`} />
            <MetricCard label="Vendas / Mes" value={fmt(r.vendas_budget)} color="text-fyre" />
            <MetricCard label="Reunioes / Mes" value={fmt(r.reunioes_re_budget)} />
          </div>
        </>
      ) : (
        /* ─── CENARIOS ─── */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { key: "conservador" as const, label: "Conservador", color: "text-yellow-400", border: "border-yellow-500/20" },
              { key: "realista" as const, label: "Realista", color: "text-blue-400", border: "border-blue-500/20" },
              { key: "otimista" as const, label: "Otimista", color: "text-green-400", border: "border-green-500/20" },
            ]).map((c) => {
              const d = cenarios[c.key];
              return (
                <div key={c.key} className={`p-5 rounded-xl bg-white/[0.02] border ${c.border}`}>
                  <h3 className={`text-sm font-bold ${c.color} mb-4`}>{c.label}</h3>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between"><span className="text-white/30">Leads/mes</span><span className="text-white/60 font-semibold">{fmt(d.leads_budget)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">WA contactados</span><span className="text-white/60 font-semibold">{fmt(d.wa_budget)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">Reunioes agendadas</span><span className="text-white/60 font-semibold">{fmt(d.reunioes_ag_budget)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">Reunioes realizadas</span><span className="text-white/60 font-semibold">{fmt(d.reunioes_re_budget)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">Vendas/mes</span><span className={`font-bold ${c.color}`}>{fmt(d.vendas_budget)}</span></div>
                    <div className="border-t border-white/[0.05] my-2" />
                    <div className="flex justify-between"><span className="text-white/30">Receita projetos</span><span className="text-white/60 font-semibold">{fmtR(d.receita_projetos)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">MRR adicionado</span><span className="text-white/60 font-semibold">{fmtR(d.mrr_adicionado)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">Receita total</span><span className={`font-bold ${c.color}`}>{fmtR(d.receita_total)}</span></div>
                    <div className="border-t border-white/[0.05] my-2" />
                    <div className="flex justify-between"><span className="text-white/30">CAC</span><span className="text-white/60 font-semibold">{fmtR(d.cac)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">LTV 12m</span><span className="text-white/60 font-semibold">{fmtR(d.ltv_12)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">LTV/CAC</span><span className={`font-bold ${c.color}`}>{d.ltv_cac.toFixed(1)}x</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
