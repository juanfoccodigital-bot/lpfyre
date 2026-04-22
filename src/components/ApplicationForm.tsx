"use client";

import { useState } from "react";
import { createLeadPublic } from "@/lib/supabase";

interface LeadData {
  faturamento?: string;
  segmento?: string;
  desafio?: string;
  servico?: string;
  nome?: string;
  whatsapp?: string;
  email?: string;
}

const steps = [
  {
    question: "Qual é o seu faturamento mensal atual?",
    subtitle: "Selecione a opção que melhor descreve sua situação.",
    field: "faturamento" as const,
    type: "options" as const,
    options: [
      "Ainda não faturo",
      "Até R$30.000",
      "R$30.000 a R$100.000",
      "R$100.000 a R$500.000",
      "Acima de R$500.000",
    ],
  },
  {
    question: "Qual segmento do seu negócio?",
    subtitle: "Isso nos ajuda a personalizar a solução.",
    field: "segmento" as const,
    type: "options" as const,
    options: [
      "E-commerce",
      "Serviços / Consultoria",
      "SaaS / Tecnologia",
      "Saúde / Estética",
      "Educação",
      "Varejo / Franquias",
      "Outro",
    ],
  },
  {
    question: "Qual o maior desafio da sua operação hoje?",
    subtitle: "Escolha o que mais trava seu crescimento.",
    field: "desafio" as const,
    type: "options" as const,
    options: [
      "Processos manuais travando tudo",
      "Custo de aquisição alto (CAC)",
      "Preso na operação, sem escalar",
      "Atendimento lento e desorganizado",
      "Falta de sistemas integrados",
      "Preciso de automação com IA",
    ],
  },
  {
    question: "O que mais te interessa?",
    subtitle: "Selecione o serviço principal.",
    field: "servico" as const,
    type: "options" as const,
    options: [
      "Automação de processos com IA",
      "Atendimento inteligente (WhatsApp)",
      "CRM & Automação de vendas",
      "Sites & Landing Pages",
      "Consultoria Estratégica",
      "Solução completa 360°",
    ],
  },
  {
    question: "Como podemos te chamar?",
    subtitle: "Seu nome e o da empresa.",
    field: "nome" as const,
    type: "text" as const,
    placeholder: "Seu nome / Empresa",
  },
  {
    question: "Seus dados de contato",
    subtitle: "Preencha para receber o contato do nosso time.",
    field: "whatsapp" as const,
    type: "contact" as const,
  },
];

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<LeadData>({});
  const [inputValue, setInputValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [whatsValue, setWhatsValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const totalSteps = steps.length;
  const progress = ((currentStep) / totalSteps) * 100;
  const step = steps[currentStep];

  const selectOption = (option: string) => {
    const newData = { ...data, [step.field]: option };
    setData(newData);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newData = { ...data, [step.field]: inputValue.trim() };
    setData(newData);
    setInputValue("");
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsValue.trim() || !emailValue.trim()) return;

    setSending(true);
    const finalData = { ...data, whatsapp: whatsValue.trim(), email: emailValue.trim() };
    setData(finalData);

    try {
      await createLeadPublic({
        empresa: finalData.nome || "",
        segmento: finalData.segmento || "",
        faturamento: finalData.faturamento || "",
        desafio: finalData.desafio || "",
        servico: finalData.servico || "",
        whatsapp: finalData.whatsapp || "",
        email: finalData.email || "",
      });
    } catch {
      console.error("Erro ao salvar lead");
    }

    setSending(false);
    setSubmitted(true);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <section id="aplicacao" className="relative py-16 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Card grande envolvendo tudo */}
        <div className="glass-card rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 reveal-scale">
          {/* Top subtitle */}
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-sm sm:text-base text-white/50">
              Cadastre-se e receba o{" "}
              <span className="text-[#00FF2B] font-semibold">
                contato do nosso time em até 5 minutos!
              </span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left — Title + descrição */}
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-[family-name:var(--font-instrument)] tracking-tight text-white leading-[1.05]">
                Preencha <span className="text-gradient-fyre italic">o Formulário</span> de aplicação
              </h2>
              <p className="mt-6 text-sm font-light text-white/35 leading-relaxed max-w-md">
                Responda algumas perguntas rápidas sobre o seu negócio.
                Nosso time vai analisar e montar uma proposta personalizada
                pra sua operação.
              </p>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Diagnóstico gratuito",
                  "Resposta em 5 min",
                  "Sem compromisso",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-white/30 border border-white/[0.06] px-3 py-1.5 rounded-full"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00FF2B" strokeWidth="2.5" className="opacity-50">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Multi-step form */}
            <div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                {!submitted ? (
                  <>
                    {/* Progress bar */}
                    <div className="px-6 pt-6">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${progress}%`,
                              background: "linear-gradient(90deg, #00FF2B, #CFFF00)",
                              boxShadow: "0 0 8px rgba(0,255,43,0.4)",
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-white/20 ml-4 whitespace-nowrap">
                          {currentStep + 1}/{totalSteps}
                        </span>
                      </div>
                    </div>

                    {/* Form content */}
                    <div className="p-6 sm:p-8">
                      {/* Back button */}
                      {currentStep > 0 && (
                        <button
                          onClick={goBack}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-white/25 hover:text-white/50 transition-colors mb-5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                          Voltar
                        </button>
                      )}

                      {/* Question */}
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                        {step.question}
                      </h3>
                      <p className="text-xs font-light text-white/30 mb-6">
                        {step.subtitle}
                      </p>

                      {/* Options */}
                      {step.type === "options" && (
                        <div className="space-y-2.5">
                          {step.options?.map((option) => {
                            const isSelected = data[step.field] === option;
                            return (
                              <button
                                key={option}
                                onClick={() => selectOption(option)}
                                className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-300 text-sm font-medium ${
                                  isSelected
                                    ? "border-[#00FF2B]/40 bg-[#00FF2B]/[0.06] text-[#00FF2B] shadow-[0_0_15px_rgba(0,255,43,0.06)]"
                                    : "border-white/[0.06] bg-white/[0.01] text-white/60 hover:border-white/15 hover:bg-white/[0.03] hover:text-white/80"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Text input */}
                      {step.type === "text" && (
                        <form onSubmit={handleTextSubmit} className="space-y-4">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={step.placeholder}
                            className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] text-white text-sm placeholder:text-white/20 outline-none focus:border-[#00FF2B]/25 transition-all"
                            autoFocus
                          />
                          <button type="submit" className="cta-button w-full justify-center">
                            CONTINUAR
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </button>
                        </form>
                      )}

                      {/* Contact inputs */}
                      {step.type === "contact" && (
                        <form onSubmit={handleContactSubmit} className="space-y-3">
                          <input
                            type="text"
                            value={whatsValue}
                            onChange={(e) => setWhatsValue(e.target.value)}
                            placeholder="(00) 00000-0000"
                            className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] text-white text-sm placeholder:text-white/20 outline-none focus:border-[#00FF2B]/25 transition-all"
                            autoFocus
                          />
                          <input
                            type="email"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] text-white text-sm placeholder:text-white/20 outline-none focus:border-[#00FF2B]/25 transition-all"
                          />
                          <button
                            type="submit"
                            disabled={sending}
                            className="cta-button w-full justify-center mt-2"
                          >
                            {sending ? "ENVIANDO..." : "ENVIAR APLICAÇÃO"}
                            {!sending && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                              </svg>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-8 sm:p-12 text-center">
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
                    <h3 className="text-xl font-bold text-white mb-2">
                      Aplicação enviada!
                    </h3>
                    <p className="text-sm font-light text-white/45 max-w-sm mx-auto">
                      Nosso time vai analisar seu perfil e entrar em contato
                      em até 5 minutos pelo WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
