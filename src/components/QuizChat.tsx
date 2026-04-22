"use client";

import { useState, useRef, useEffect } from "react";
import { createLeadPublic } from "@/lib/supabase";

interface Message {
  type: "bot" | "user";
  text: string;
  options?: string[];
}

interface LeadData {
  empresa?: string;
  segmento?: string;
  faturamento?: string;
  desafio?: string;
  servico?: string;
  whatsapp?: string;
  email?: string;
}

const quizSteps = [
  {
    question:
      "Olá! Sou a assistente da FYRE Automação & I.A. Vou te ajudar a entender como podemos transformar o seu negócio. Qual o nome da sua empresa?",
    field: "empresa" as const,
    type: "text" as const,
  },
  {
    question: "Qual segmento de mercado vocês atuam?",
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
    question: "Qual a faixa de faturamento mensal atual?",
    field: "faturamento" as const,
    type: "options" as const,
    options: [
      "Até R$ 50 mil",
      "R$ 50 mil - R$ 200 mil",
      "R$ 200 mil - R$ 500 mil",
      "R$ 500 mil - R$ 1 milhão",
      "Acima de R$ 1 milhão",
    ],
  },
  {
    question: "Qual o maior desafio hoje no seu negócio?",
    field: "desafio" as const,
    type: "options" as const,
    options: [
      "Processos manuais travando a operação",
      "Custo de aquisição alto (CAC)",
      "Preso na operação, sem escalar",
      "Atendimento lento e desorganizado",
      "Falta de sistemas inteligentes integrados",
      "Preciso automatizar processos com IA",
    ],
  },
  {
    question: "O que mais te interessa dos nossos serviços?",
    field: "servico" as const,
    type: "options" as const,
    options: [
      "Automação de processos com IA",
      "Sistemas de atendimento inteligente",
      "Consultoria Estratégica",
      "Integração de APIs e sistemas",
      "CRM & Automação de vendas",
      "Solução completa de automação 360°",
    ],
  },
  {
    question:
      "Perfeito! Para eu poder te retornar com uma análise personalizada, me passa seu WhatsApp?",
    field: "whatsapp" as const,
    type: "text" as const,
    placeholder: "(00) 00000-0000",
  },
  {
    question: "E seu melhor e-mail?",
    field: "email" as const,
    type: "text" as const,
    placeholder: "seu@email.com",
  },
];

export default function QuizChat() {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [leadData, setLeadData] = useState<LeadData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startChat = () => {
    setChatStarted(true);
    simulateBotMessage(quizSteps[0].question, quizSteps[0].options);
  };

  const simulateBotMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { type: "bot", text, options }]);
    }, 1200);
  };

  const handleAnswer = async (answer: string) => {
    const step = quizSteps[currentStep];

    setMessages((prev) => [...prev, { type: "user", text: answer }]);

    const newData = { ...leadData, [step.field]: answer };
    setLeadData(newData);

    const nextStep = currentStep + 1;

    if (nextStep < quizSteps.length) {
      setCurrentStep(nextStep);
      const nextQuestion = quizSteps[nextStep];
      simulateBotMessage(nextQuestion.question, nextQuestion.options);
    } else {
      setIsTyping(true);

      try {
        await createLeadPublic(newData);
      } catch {
        console.error("Erro ao salvar lead");
        alert("Erro ao salvar suas informacoes. Por favor, tente novamente.");
      }

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `Perfeito, ${newData.empresa}! Recebemos suas informações. Em breve um dos nossos fundadores entrará em contato com você para uma conversa personalizada sobre o seu negócio. Prepare-se para transformar seus resultados!`,
          },
        ]);
        setCompleted(true);
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleAnswer(inputValue.trim());
    setInputValue("");
  };

  const currentStepData = quizSteps[currentStep];

  return (
    <section id="contato" className="relative py-16 sm:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00FF2B]/[0.02] rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
            Diagnóstico Gratuito
          </span>
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Pronto para{" "}
            <span className="text-gradient-fyre italic">escalar?</span>
          </h2>
          <p className="mt-4 text-sm font-light text-white/30 max-w-lg mx-auto">
            Responda algumas perguntas rápidas e descubra como o FYRE 360°
            pode transformar o seu negócio.
          </p>
        </div>

        {/* Chat container */}
        <div className="max-w-2xl mx-auto reveal-scale">
          <div className="glass-card rounded-3xl overflow-hidden">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-[#00FF2B]/[0.06] flex items-center gap-3">
              <div className="w-2 h-2 bg-[#00FF2B] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,43,0.5)]" />
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40">
                FYRE Assistente — Online
              </span>
            </div>

            {!chatStarted ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-[#00FF2B]/15 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,43,0.06)]">
                  <svg
                    className="w-7 h-7 text-[#00FF2B]/40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Diagnóstico Inteligente
                </h3>
                <p className="text-sm font-light text-white/40 mb-8 max-w-sm mx-auto">
                  Algumas perguntas rápidas para entender seu negócio e criar
                  uma análise personalizada.
                </p>
                <button onClick={startChat} className="cta-button">
                  INICIAR DIAGNÓSTICO
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <div
                  ref={chatRef}
                  className="p-6 h-[400px] overflow-y-auto flex flex-col gap-4"
                >
                  {messages.map((msg, i) => (
                    <div key={i}>
                      {msg.type === "bot" ? (
                        <div className="flex flex-col gap-3">
                          <div className="chat-bubble">
                            <p className="text-sm font-light text-white/70 leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                          {msg.options &&
                            i === messages.length - 1 &&
                            !completed && (
                              <div className="flex flex-col gap-2 max-w-[80%]">
                                {msg.options.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() => handleAnswer(opt)}
                                    className="chat-option"
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="chat-bubble-user">
                          <p className="text-sm font-medium text-white/80">
                            {msg.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="chat-bubble flex gap-1.5 py-4 px-5 w-fit">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  )}
                </div>

                {!completed &&
                  !isTyping &&
                  currentStepData?.type === "text" &&
                  messages.length > 0 &&
                  messages[messages.length - 1].type === "bot" && (
                    <form
                      onSubmit={handleSubmit}
                      className="px-6 py-4 border-t border-[#00FF2B]/[0.06] flex gap-3"
                    >
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={
                          currentStepData.placeholder || "Digite aqui..."
                        }
                        className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#00FF2B]/30 transition-colors"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-4 py-3 rounded-xl font-semibold text-sm text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,43,0.3)]"
                        style={{ background: "linear-gradient(135deg, #00FF2B, #CFFF00)" }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </button>
                    </form>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
