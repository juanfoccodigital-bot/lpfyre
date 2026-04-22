"use client";

import { useState } from "react";
import { createLeadPublic } from "@/lib/supabase";

type Quadrant = "amplificar" | "manter" | "automatizar" | "pilotar" | null;

interface Task {
  id: string;
  label: string;
  icon: string;
  quadrant: Quadrant;
}

const initialTasks: Task[] = [
  { id: "whatsapp", label: "Responder WhatsApp", icon: "💬", quadrant: null },
  { id: "followup", label: "Fazer follow-up", icon: "🔄", quadrant: null },
  { id: "agendamento", label: "Confirmar agendamentos", icon: "📅", quadrant: null },
  { id: "qualificacao", label: "Qualificar leads", icon: "🎯", quadrant: null },
  { id: "propostas", label: "Enviar propostas", icon: "📄", quadrant: null },
  { id: "relatorios", label: "Montar relatórios", icon: "📊", quadrant: null },
  { id: "email", label: "Disparar e-mails", icon: "✉️", quadrant: null },
  { id: "onboarding", label: "Onboarding de clientes", icon: "🚀", quadrant: null },
];

const quadrants: { id: Quadrant; label: string; sublabel: string; action: string; color: string; border: string; bg: string }[] = [
  {
    id: "amplificar",
    label: "Amplificar",
    sublabel: "Time gosta + IA faz bem",
    action: "IA como copiloto",
    color: "text-[#CFFF00]",
    border: "border-[#CFFF00]/20",
    bg: "bg-[#CFFF00]/[0.03]",
  },
  {
    id: "manter",
    label: "Manter Humano",
    sublabel: "Time gosta + IA faz pouco",
    action: "Não automatizar agora",
    color: "text-white/50",
    border: "border-white/10",
    bg: "bg-white/[0.02]",
  },
  {
    id: "automatizar",
    label: "Automatizar Já",
    sublabel: "Time odeia + IA faz bem",
    action: "ROI imediato",
    color: "text-[#00FF2B]",
    border: "border-[#00FF2B]/25",
    bg: "bg-[#00FF2B]/[0.04]",
  },
  {
    id: "pilotar",
    label: "Pilotar",
    sublabel: "Time odeia + IA faz pouco",
    action: "Testar antes de escalar",
    color: "text-white/40",
    border: "border-white/8",
    bg: "bg-white/[0.01]",
  },
];

export default function DiagnosticoIA() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [step, setStep] = useState<"intro" | "matrix" | "questions" | "contact" | "done">("intro");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [answers, setAnswers] = useState({ odeia: "", padrao: "", consequencia: "" });
  const [contact, setContact] = useState({ nome: "", whatsapp: "", email: "" });
  const [sending, setSending] = useState(false);

  const assignedCount = tasks.filter((t) => t.quadrant !== null).length;
  const autoTasks = tasks.filter((t) => t.quadrant === "automatizar");
  const ampTasks = tasks.filter((t) => t.quadrant === "amplificar");
  const pilotTasks = tasks.filter((t) => t.quadrant === "pilotar");

  const placeTask = (taskId: string, quadrant: Quadrant) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, quadrant } : t)));
    setSelectedTask(null);
  };

  const handleSubmit = async () => {
    if (!contact.whatsapp.trim() || !contact.email.trim()) return;
    setSending(true);

    const diagnostico = tasks
      .filter((t) => t.quadrant)
      .map((t) => `${t.label}: ${t.quadrant}`)
      .join(", ");

    try {
      await createLeadPublic({
        empresa: contact.nome,
        segmento: "Diagnóstico IA",
        faturamento: "",
        desafio: `Automatizar: ${autoTasks.map((t) => t.label).join(", ") || "nenhum"}. Respostas: odeia=${answers.odeia}, padrao=${answers.padrao}, consequencia=${answers.consequencia}`,
        servico: diagnostico,
        whatsapp: contact.whatsapp,
        email: contact.email,
      });
    } catch {
      console.error("Erro ao salvar");
    }

    setSending(false);
    setStep("done");
  };

  return (
    <section id="contato" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00FF2B]/[0.02] rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
            Diagnóstico Gratuito
          </span>
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Pronto para{" "}
            <span className="text-gradient-fyre italic">escalar?</span>
          </h2>
          <p className="mt-4 text-sm font-light text-white/30 max-w-lg mx-auto">
            Descubra quais tarefas do seu negócio devem ser automatizadas
            com IA agora — e quais podem esperar.
          </p>
        </div>

        {/* Main card */}
        <div className="glass-card rounded-3xl overflow-hidden reveal-scale">

          {/* ── STEP: INTRO ── */}
          {step === "intro" && (
            <div className="p-8 sm:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#00FF2B]/50 mb-5 border border-[#00FF2B]/15 px-3 py-1.5 rounded-full bg-[#00FF2B]/[0.04]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF2B] animate-pulse" />
                    Matriz IA x Time
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] text-white mb-4 leading-tight">
                    Onde seu time perde tempo com tarefas que a <span className="text-gradient-fyre italic">IA faz melhor?</span>
                  </h3>
                  <p className="text-sm font-light text-white/40 leading-relaxed mb-6">
                    Posicione as tarefas do seu negócio na nossa matriz inteligente.
                    Em 2 minutos você descobre exatamente o que automatizar primeiro
                    para ter ROI imediato.
                  </p>
                  <button onClick={() => setStep("matrix")} className="cta-button">
                    INICIAR DIAGNÓSTICO
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Matrix preview */}
                <div className="grid grid-cols-2 gap-3">
                  {quadrants.map((q) => (
                    <div key={q.id} className={`${q.bg} ${q.border} border rounded-xl p-4 sm:p-5`}>
                      <p className={`text-xs font-bold ${q.color} mb-1`}>{q.label}</p>
                      <p className="text-[10px] text-white/25 leading-snug">{q.sublabel}</p>
                      <p className="text-[9px] font-semibold text-white/15 mt-2 uppercase tracking-wider">{q.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: MATRIX ── */}
          {step === "matrix" && (
            <div className="p-6 sm:p-10 lg:p-12">
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-white/60">
                  Posicione as tarefas nos quadrantes
                </p>
                <span className="text-[11px] font-medium text-white/20">
                  {assignedCount}/{tasks.length} posicionadas
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-[3px] bg-white/[0.06] rounded-full mb-8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(assignedCount / tasks.length) * 100}%`,
                    background: "linear-gradient(90deg, #00FF2B, #CFFF00)",
                    boxShadow: "0 0 8px rgba(0,255,43,0.4)",
                  }}
                />
              </div>

              {/* Unassigned tasks */}
              {tasks.some((t) => !t.quadrant) && (
                <div className="mb-8">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/20 mb-3">
                    Tarefas para posicionar — clique e escolha o quadrante
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tasks
                      .filter((t) => !t.quadrant)
                      .map((task) => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
                            selectedTask === task.id
                              ? "border-[#00FF2B]/40 bg-[#00FF2B]/[0.08] text-[#00FF2B] shadow-[0_0_15px_rgba(0,255,43,0.08)]"
                              : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/15"
                          }`}
                        >
                          <span>{task.icon}</span>
                          {task.label}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Quadrants grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Axis labels */}
                <div className="sm:col-span-2 flex items-center justify-center gap-2 mb-1">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/15">IA faz bem →</span>
                </div>

                {quadrants.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (selectedTask) placeTask(selectedTask, q.id);
                    }}
                    className={`${q.bg} ${q.border} border rounded-xl p-4 sm:p-5 text-left transition-all duration-300 min-h-[120px] ${
                      selectedTask ? "hover:scale-[1.02] hover:shadow-lg cursor-pointer" : "cursor-default"
                    } ${selectedTask && q.id === "automatizar" ? "ring-1 ring-[#00FF2B]/20" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-xs font-bold ${q.color}`}>{q.label}</p>
                      {q.id === "automatizar" && (
                        <span className="text-[8px] font-bold tracking-wider uppercase text-[#00FF2B]/40 bg-[#00FF2B]/[0.06] px-2 py-0.5 rounded-full">
                          ROI
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/20 mb-3">{q.sublabel}</p>

                    {/* Tasks in this quadrant */}
                    <div className="space-y-1.5">
                      {tasks
                        .filter((t) => t.quadrant === q.id)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04]"
                          >
                            <span className="text-[11px] font-medium text-white/50">
                              {task.icon} {task.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                placeTask(task.id, null);
                              }}
                              className="text-white/15 hover:text-white/40 transition-colors"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                    </div>
                  </button>
                ))}

                {/* Axis label bottom */}
                <div className="sm:col-span-2 flex items-center justify-start gap-2 mt-1">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/15">↑ Time odeia</span>
                </div>
              </div>

              {/* Continue button */}
              {assignedCount >= 3 && (
                <div className="text-center mt-8">
                  <button onClick={() => setStep("questions")} className="cta-button">
                    VER MEU DIAGNÓSTICO
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <p className="text-[10px] text-white/15 mt-2">Mínimo 3 tarefas posicionadas</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: QUESTIONS ── */}
          {step === "questions" && (
            <div className="p-8 sm:p-12">
              {/* Results summary */}
              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#00FF2B]/[0.04] border border-[#00FF2B]/15 rounded-xl p-5 text-center">
                  <p className="text-3xl font-black text-[#00FF2B]">{autoTasks.length}</p>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#00FF2B]/50 mt-1">Automatizar já</p>
                </div>
                <div className="bg-[#CFFF00]/[0.03] border border-[#CFFF00]/10 rounded-xl p-5 text-center">
                  <p className="text-3xl font-black text-[#CFFF00]">{ampTasks.length}</p>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#CFFF00]/40 mt-1">Amplificar</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-center">
                  <p className="text-3xl font-black text-white/50">{pilotTasks.length}</p>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/20 mt-1">Pilotar</p>
                </div>
              </div>

              {autoTasks.length > 0 && (
                <div className="bg-[#00FF2B]/[0.03] border border-[#00FF2B]/10 rounded-xl p-5 mb-8">
                  <p className="text-xs font-bold text-[#00FF2B]/70 mb-2">Tarefas prontas para automação imediata:</p>
                  <p className="text-sm text-white/50">
                    {autoTasks.map((t) => t.label).join(", ")}
                  </p>
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-1">Últimas perguntas</h3>
              <p className="text-xs text-white/30 mb-6">Isso nos ajuda a montar seu diagnóstico personalizado.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-white/30 uppercase tracking-wider block mb-2">
                    Quais tarefas seu time mais odeia fazer no dia a dia?
                  </label>
                  <input
                    type="text"
                    value={answers.odeia}
                    onChange={(e) => setAnswers({ ...answers, odeia: e.target.value })}
                    placeholder="Ex: responder WhatsApp, confirmar agenda..."
                    className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white text-sm placeholder:text-white/15 outline-none focus:border-[#00FF2B]/25 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/30 uppercase tracking-wider block mb-2">
                    Essas tarefas são sempre iguais ou variam muito?
                  </label>
                  <div className="flex gap-3">
                    {["Sempre iguais", "Variam um pouco", "Variam muito"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, padrao: opt })}
                        className={`flex-1 px-4 py-3 rounded-xl border text-xs font-medium transition-all duration-300 ${
                          answers.padrao === opt
                            ? "border-[#00FF2B]/30 bg-[#00FF2B]/[0.06] text-[#00FF2B]"
                            : "border-white/[0.06] bg-white/[0.01] text-white/40 hover:border-white/15"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/30 uppercase tracking-wider block mb-2">
                    O que acontece quando essas tarefas não são feitas?
                  </label>
                  <input
                    type="text"
                    value={answers.consequencia}
                    onChange={(e) => setAnswers({ ...answers, consequencia: e.target.value })}
                    placeholder="Ex: perde lead, cliente reclama, demora no atendimento..."
                    className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white text-sm placeholder:text-white/15 outline-none focus:border-[#00FF2B]/25 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button onClick={() => setStep("contact")} className="cta-button w-full justify-center">
                  RECEBER MEU DIAGNÓSTICO COMPLETO
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: CONTACT ── */}
          {step === "contact" && (
            <div className="p-8 sm:p-12 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-1 text-center">Quase lá!</h3>
              <p className="text-sm text-white/30 mb-8 text-center">
                Preencha para receber seu diagnóstico completo com recomendações personalizadas.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={contact.nome}
                  onChange={(e) => setContact({ ...contact, nome: e.target.value })}
                  placeholder="Seu nome / Empresa"
                  className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white text-sm placeholder:text-white/15 outline-none focus:border-[#00FF2B]/25 transition-all"
                  autoFocus
                />
                <input
                  type="text"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white text-sm placeholder:text-white/15 outline-none focus:border-[#00FF2B]/25 transition-all"
                />
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white text-sm placeholder:text-white/15 outline-none focus:border-[#00FF2B]/25 transition-all"
                />
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="cta-button w-full justify-center mt-2"
                >
                  {sending ? "ENVIANDO..." : "ENVIAR DIAGNÓSTICO"}
                  {!sending && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === "done" && (
            <div className="p-8 sm:p-12">
              <div className="text-center mb-10">
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,255,43,0.1), rgba(207,255,0,0.05))",
                    border: "1px solid rgba(0,255,43,0.2)",
                    boxShadow: "0 0 30px rgba(0,255,43,0.1)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00FF2B" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Diagnóstico enviado!</h3>
                <p className="text-sm font-light text-white/45 max-w-sm mx-auto mb-6">
                  Identificamos <span className="text-[#00FF2B] font-semibold">{autoTasks.length} tarefas</span> prontas
                  para automação imediata no seu negócio. Nosso time vai entrar em contato em até 5 minutos.
                </p>
                {autoTasks.length > 0 && (
                  <div className="inline-flex flex-wrap gap-2 justify-center">
                    {autoTasks.map((t) => (
                      <span key={t.id} className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#00FF2B]/50 border border-[#00FF2B]/15 px-3 py-1.5 rounded-full bg-[#00FF2B]/[0.04]">
                        {t.icon} {t.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sugestões de automação */}
              <div className="border-t border-white/[0.04] pt-8">
                <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/30 mb-4 text-center">
                  O que a FYRE pode automatizar pra você
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: "🤖", title: "Agente de Atendimento IA", desc: "Responde, qualifica e direciona leads 24h pelo WhatsApp" },
                    { icon: "🔄", title: "Follow-up Automático", desc: "Sequências inteligentes que nutrem leads até o fechamento" },
                    { icon: "📅", title: "Agendamento Inteligente", desc: "Confirmação, lembrete e reagendamento sem intervenção humana" },
                    { icon: "📊", title: "Dashboard em Tempo Real", desc: "Métricas de vendas, leads e conversão atualizando sozinhas" },
                    { icon: "🎯", title: "Qualificação por IA", desc: "Lead scoring automático — só chega pro time o que é quente" },
                    { icon: "💬", title: "Recuperação de Leads", desc: "Reengaja leads frios com mensagens personalizadas por IA" },
                    { icon: "📄", title: "Propostas Automatizadas", desc: "Gera e envia propostas com dados do CRM em segundos" },
                    { icon: "🔗", title: "Integrações via API", desc: "WhatsApp, CRM, e-mail, pagamento — tudo conectado" },
                    { icon: "🚀", title: "Onboarding Automático", desc: "Novos clientes recebem boas-vindas, acesso e materiais sozinhos" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 hover:border-[#00FF2B]/15 hover:bg-[#00FF2B]/[0.02] transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors mb-1">{item.title}</p>
                          <p className="text-[11px] font-light text-white/30 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
