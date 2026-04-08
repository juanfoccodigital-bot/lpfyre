"use client";

import { useState } from "react";
import { createProposta, listarPropostas, type PropostaData } from "@/lib/supabase";

const SERVICOS = [
  "Automação & Inteligência Artificial",
  "Automação de Marketing & Comercial",
  "Sistemas & CRM Sob Medida",
  "Construção de Sites & Estrutura Digital",
  "Projetos de Automação Completos",
  "FYRE HUB — Produtos & SaaS",
];

const TONS = [
  { value: "profissional", label: "Profissional & Direto" },
  { value: "consultivo", label: "Consultivo & Estratégico" },
  { value: "premium", label: "Premium & Exclusivo" },
  { value: "amigavel", label: "Próximo & Amigável" },
];

const PAGAMENTOS = [
  { value: "avista", label: "À vista" },
  { value: "5050", label: "50/50 (entrada + 30 dias)" },
  { value: "mensal", label: "Mensal recorrente" },
  { value: "parcelado", label: "Parcelado no cartão" },
  { value: "projeto", label: "Valor único de projeto" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Fechamento() {
  const [form, setForm] = useState({
    cliente_nome: "",
    cliente_empresa: "",
    servicos: [] as string[],
    tom: "profissional",
    valor: "",
    valor_desconto: "",
    forma_pagamento: "mensal",
    parcelas: "",
    validade_dias: "7",
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const [gerado, setGerado] = useState<string | null>(null);
  const [propostas, setPropostas] = useState<PropostaData[]>([]);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleServico = (s: string) => {
    setForm((prev) => ({
      ...prev,
      servicos: prev.servicos.includes(s)
        ? prev.servicos.filter((x) => x !== s)
        : [...prev.servicos, s],
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.cliente_nome.trim()) { setError("Nome do cliente é obrigatório."); return; }
    if (!form.cliente_empresa.trim()) { setError("Empresa é obrigatória."); return; }
    if (form.servicos.length === 0) { setError("Selecione ao menos um serviço."); return; }
    if (!form.valor) { setError("Valor é obrigatório."); return; }

    setLoading(true);

    try {
      const slug = `proposta-${slugify(form.cliente_empresa)}-${Date.now().toString(36)}`;

      await createProposta({
        slug,
        cliente_nome: form.cliente_nome.trim(),
        cliente_empresa: form.cliente_empresa.trim(),
        servicos: form.servicos,
        tom: form.tom,
        valor: parseFloat(form.valor),
        valor_desconto: form.valor_desconto ? parseFloat(form.valor_desconto) : null,
        forma_pagamento: form.forma_pagamento,
        parcelas: form.parcelas ? parseInt(form.parcelas) : null,
        validade_dias: parseInt(form.validade_dias),
        observacoes: form.observacoes,
      });

      setGerado(`${window.location.origin}/proposta/${slug}`);
    } catch {
      setError("Erro ao salvar proposta. Verifique o Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const loadPropostas = async () => {
    const list = await listarPropostas();
    setPropostas(list);
    setShowList(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo-fyre.png" alt="FYRE" className="h-5 w-auto opacity-60" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">Gerador de Propostas</span>
          </div>
          <button
            onClick={loadPropostas}
            className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors border border-white/10 rounded-full px-4 py-2 hover:border-white/20"
          >
            Ver Propostas
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Se foi gerado */}
        {gerado ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full border-2 border-green-500/30 bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="text-2xl font-[family-name:var(--font-instrument)] text-white mb-2">Proposta gerada!</h2>
            <p className="text-sm text-white/40 mb-8">Link pronto para enviar ao cliente.</p>

            <div className="glass-card rounded-2xl p-5 mb-6 mx-auto max-w-lg">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={gerado}
                  className="flex-1 bg-transparent text-sm text-white/70 font-mono outline-none truncate"
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(gerado); }}
                  className="flex-shrink-0 px-4 py-2 bg-white text-black text-[11px] font-bold tracking-wider uppercase rounded-lg hover:bg-white/90 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <a
                href={gerado}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 hover:text-white transition-colors border border-white/10 rounded-full px-5 py-2.5 hover:border-white/30"
              >
                Abrir Proposta
              </a>
              <button
                onClick={() => { setGerado(null); setForm({ ...form, cliente_nome: "", cliente_empresa: "", valor: "", valor_desconto: "", observacoes: "", parcelas: "" }); }}
                className="text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 hover:text-white transition-colors border border-white/10 rounded-full px-5 py-2.5 hover:border-white/30"
              >
                Nova Proposta
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2">
              Nova <span className="text-gradient italic">Proposta</span>
            </h1>
            <p className="text-sm font-light text-white/30 mb-10">Preencha os dados abaixo para gerar a proposta comercial personalizada.</p>

            {/* Form */}
            <div className="space-y-8">

              {/* Cliente */}
              <div className="space-y-4">
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block">Dados do Cliente</span>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Nome do decisor</label>
                    <input
                      type="text"
                      value={form.cliente_nome}
                      onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })}
                      placeholder="Ex: João Silva"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Empresa</label>
                    <input
                      type="text"
                      value={form.cliente_empresa}
                      onChange={(e) => setForm({ ...form, cliente_empresa: e.target.value })}
                      placeholder="Ex: Tech Solutions LTDA"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Serviços */}
              <div>
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-4">Serviços</span>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICOS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleServico(s)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all duration-300 ${
                        form.servicos.includes(s)
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/8 bg-white/[0.02] text-white/40 hover:border-white/15 hover:bg-white/[0.04]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tom */}
              <div>
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-4">Tom de Voz</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, tom: t.value })}
                      className={`p-3 rounded-xl border text-center text-[11px] font-medium transition-all duration-300 ${
                        form.tom === t.value
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/8 bg-white/[0.02] text-white/40 hover:border-white/15"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valores */}
              <div className="space-y-4">
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block">Valores</span>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Valor (R$)</label>
                    <input
                      type="number"
                      value={form.valor}
                      onChange={(e) => setForm({ ...form, valor: e.target.value })}
                      placeholder="Ex: 5000"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Valor com desconto (R$) <span className="text-white/15">opcional</span></label>
                    <input
                      type="number"
                      value={form.valor_desconto}
                      onChange={(e) => setForm({ ...form, valor_desconto: e.target.value })}
                      placeholder="Ex: 4500"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="space-y-4">
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block">Forma de Pagamento</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAGAMENTOS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setForm({ ...form, forma_pagamento: p.value })}
                      className={`p-3 rounded-xl border text-center text-[11px] font-medium transition-all duration-300 ${
                        form.forma_pagamento === p.value
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/8 bg-white/[0.02] text-white/40 hover:border-white/15"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {form.forma_pagamento === "parcelado" && (
                  <div className="max-w-xs">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Quantidade de parcelas</label>
                    <input
                      type="number"
                      value={form.parcelas}
                      onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
                      placeholder="Ex: 6"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Validade */}
              <div className="max-w-xs">
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-4">Validade da Proposta</span>
                <div className="grid grid-cols-3 gap-2">
                  {["3", "5", "7", "10", "15", "30"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, validade_dias: d })}
                      className={`p-2.5 rounded-xl border text-center text-[11px] font-medium transition-all duration-300 ${
                        form.validade_dias === d
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/8 bg-white/[0.02] text-white/40 hover:border-white/15"
                      }`}
                    >
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-4">Observações <span className="text-white/15">opcional</span></span>
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Anotações internas, condições especiais, contexto da negociação..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="cta-button w-full sm:w-auto group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "GERANDO..." : "GERAR PROPOSTA"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Lista de propostas */}
        {showList && (
          <div className="mt-16 border-t border-white/5 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-[family-name:var(--font-instrument)] text-white">
                Propostas <span className="text-gradient italic">geradas</span>
              </h2>
              <button onClick={() => setShowList(false)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Fechar</button>
            </div>
            {propostas.length === 0 ? (
              <p className="text-sm text-white/30">Nenhuma proposta encontrada.</p>
            ) : (
              <div className="space-y-2">
                {propostas.map((p) => (
                  <a
                    key={p.slug}
                    href={`/proposta/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.cliente_empresa}</h4>
                      <p className="text-[10px] text-white/30">{p.cliente_nome} &middot; {p.servicos.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        R${(p.valor_desconto || p.valor).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-[9px] text-white/20">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
