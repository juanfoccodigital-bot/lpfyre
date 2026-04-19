"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Quanto tempo demora pra ver resultado?",
    answer: "A maioria dos nossos clientes já sente impacto nas primeiras 2-4 semanas. Automações de atendimento e qualificação entram no ar rápido. Sistemas mais complexos (CRM completo, integrações múltiplas) levam de 30 a 60 dias pra ficar redondos.",
  },
  {
    question: "Preciso ter equipe técnica pra usar?",
    answer: "Não. Construímos tudo pra ser operado pelo seu time atual, mesmo que não tenha ninguém de tecnologia. Os sistemas são intuitivos e nós fazemos o treinamento completo. Se travar, nosso suporte resolve.",
  },
  {
    question: "Isso funciona pro meu nicho?",
    answer: "Se seu negócio tem atendimento, vendas ou operação que depende de pessoas — funciona. Já automatizamos e-commerces, clínicas, consultorias, SaaS, escritórios, franquias e prestadores de serviço. O sistema se adapta ao seu modelo.",
  },
  {
    question: "Qual a diferença entre vocês e uma agência?",
    answer: "Agência entrega campanha, post e relatório. Nós entregamos infraestrutura. Sistemas que fazem seu negócio funcionar sozinho: atendimento, qualificação, follow-up, CRM, dashboards, integrações — tudo conectado e automatizado. É tecnologia, não serviço.",
  },
  {
    question: "E se eu já uso outras ferramentas?",
    answer: "Integramos com o que você já tem. WhatsApp, RD Station, Hotmart, Shopify, Google Calendar, Stripe, PagSeguro — conectamos tudo via API. Não precisa trocar nada, a gente encaixa a automação na sua estrutura atual.",
  },
  {
    question: "Quanto custa?",
    answer: "Depende da complexidade do que você precisa. Temos planos a partir de R$1.297/mês. Mas o mais importante: o sistema se paga. Quando você automatiza atendimento, reduz CAC e aumenta conversão, o retorno vem no primeiro mês.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-16 sm:py-32 overflow-hidden">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 reveal">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/40 mb-4 block">
            Dúvidas
          </span>
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Perguntas{" "}
            <span className="text-gradient-fyre italic">frequentes</span>
          </h2>
        </div>

        {/* FAQ items */}
        <div className="space-y-3 reveal">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`glass-card rounded-xl overflow-hidden transition-all duration-500 ${
                  isOpen ? "border-[#00FF2B]/15" : ""
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors duration-300 pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border border-[#00FF2B]/20 flex items-center justify-center transition-all duration-300 ${
                      isOpen ? "bg-[#00FF2B]/10 rotate-45" : "group-hover:border-[#00FF2B]/40"
                    }`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isOpen ? "#00FF2B" : "rgba(255,255,255,0.3)"}
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </button>
                <div
                  className="overflow-hidden transition-all duration-500 ease-out"
                  style={{
                    maxHeight: isOpen ? "300px" : "0",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-6 pb-5">
                    <p className="text-sm font-light text-white/45 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA abaixo do FAQ */}
        <div className="text-center mt-12 reveal">
          <p className="text-sm font-light text-white/25 mb-4">
            Ainda tem dúvida?
          </p>
          <a href="#contato" className="cta-button-outline group">
            FALE COM A GENTE
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
