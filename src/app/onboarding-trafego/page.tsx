"use client";

import OnboardingSlides, { type OnboardingSlide } from "@/components/OnboardingSlides";

const slides: OnboardingSlide[] = [
  {
    id: "cover",
    isCover: true,
    title: "",
  },
  {
    id: "boas-vindas",
    label: "Bem-vindo",
    title: (
      <>
        Bem-vindo à <span className="text-gradient italic">FYRE</span>
      </>
    ),
    subtitle: "Você tomou a decisão certa. Agora, vamos construir juntos.",
    body: (
      <div className="space-y-5">
        <p className="text-sm sm:text-base font-light text-white/50 leading-relaxed">
          A partir de agora, seu processo comercial deixa de ser manual e passa a ser um <span className="text-white font-medium">sistema inteligente e automatizado</span>. Funis, nutrição, follow-up e qualificação — tudo funcionando 24h com IA.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: "📈", text: "Funis automatizados" },
            { icon: "🤖", text: "Nutrição com IA" },
            { icon: "⚡", text: "Follow-up inteligente" },
            { icon: "🎯", text: "Qualificação automática" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs sm:text-sm text-white/60 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "como-funciona",
    label: "Processo",
    title: (
      <>
        Como <span className="text-gradient italic">funciona</span>
      </>
    ),
    subtitle: "Nosso processo de automação comercial em 5 etapas.",
    body: (
      <div className="space-y-3">
        {[
          { step: "01", title: "Diagnóstico Comercial", desc: "Mapeamos seu funil atual, processos de vendas, cadências de follow-up e pontos de perda. Identificamos gargalos e oportunidades de automação.", time: "Semana 1" },
          { step: "02", title: "Arquitetura dos Funis", desc: "Desenhamos os funis automatizados: captura, nutrição, qualificação e handoff para o time comercial. Tudo com IA integrada.", time: "Semana 1-2" },
          { step: "03", title: "Construção & Integração", desc: "Desenvolvemos os fluxos de automação, cadências de nutrição, sequências de follow-up e integração com CRM e WhatsApp.", time: "Semana 2-3" },
          { step: "04", title: "Testes & Otimização", desc: "Rodamos cenários reais de teste. Ajustamos mensagens, timings, regras de qualificação e gatilhos de ação.", time: "Semana 3-4" },
          { step: "05", title: "Go-live & Monitoramento", desc: "Funis ao vivo. Monitoramos taxas de conversão, qualificação e resposta. Otimização contínua baseada em dados.", time: "Semanal" },
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-lg sm:text-xl font-black text-white/20">{item.step}</span>
              <span className="text-[8px] font-semibold tracking-wider uppercase text-white/15 mt-1">{item.time}</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "o-que-vamos-construir",
    label: "Entregas",
    title: (
      <>
        O que vamos <span className="text-gradient italic">construir</span>
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          { title: "Funis de Captura & Nutrição", desc: "Fluxos automatizados que capturam leads e os nutrem com conteúdo relevante até estarem prontos para comprar." },
          { title: "Qualificação Automática com IA", desc: "Agentes de IA que identificam o perfil do lead, classificam por temperatura e priorizam os mais prontos para o time comercial." },
          { title: "Follow-up Inteligente", desc: "Cadências automatizadas de follow-up via WhatsApp, e-mail e SMS. Mensagens personalizadas por estágio do funil." },
          { title: "Automação de Agendamento", desc: "Lead qualificado agenda direto na agenda do vendedor. Confirmações, lembretes e reagendamento automáticos." },
          { title: "Pipeline Comercial Automatizado", desc: "Leads movidos automaticamente entre etapas do funil com base em ações, respostas e comportamento." },
          { title: "Alertas & Notificações em Tempo Real", desc: "Time comercial notificado instantaneamente quando um lead quente entra ou realiza uma ação importante." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <div className="w-2 h-2 rounded-full bg-white/20 mt-1.5 flex-shrink-0 group-hover:bg-white/50 transition-colors" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "o-que-precisamos",
    label: "O que Precisamos",
    title: (
      <>
        Precisamos de <span className="text-gradient italic">você</span>
      </>
    ),
    subtitle: "Itens necessários para iniciar a operação.",
    body: (
      <div className="space-y-3">
        {[
          { title: "Fluxo comercial atual documentado", desc: "Como funciona o processo de vendas hoje: etapas, responsáveis, tempos médios e gargalos conhecidos." },
          { title: "Acesso ao CRM / WhatsApp Business", desc: "Para integração dos funis automatizados com suas ferramentas de vendas atuais." },
          { title: "Regras de qualificação de leads", desc: "Critérios que definem um lead quente vs. frio. Perfil ideal de cliente, objeções comuns." },
          { title: "Scripts e cadências atuais", desc: "Mensagens de follow-up, scripts de venda, e-mails de nutrição que já usam (se houver)." },
          { title: "FAQ e informações de produtos/serviços", desc: "Para alimentar os agentes de IA com conhecimento sobre sua oferta." },
          { title: "Ponto focal comercial disponível", desc: "Alguém do time de vendas para validar fluxos, testar automações e dar feedback." },
          { title: "Metas comerciais", desc: "Número de leads, taxa de conversão desejada, ticket médio e metas de faturamento." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-sm bg-white/15" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/35 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "comunicacao",
    label: "Comunicação",
    title: (
      <>
        Como vamos nos <span className="text-gradient italic">comunicar</span>
      </>
    ),
    body: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "💬", title: "WhatsApp", desc: "Grupo exclusivo com o time. Comunicação rápida para dúvidas e aprovações." },
            { icon: "📹", title: "Reuniões", desc: "Call semanal na fase de construção. Quinzenal após go-live (30 min)." },
            { icon: "📋", title: "Board de progresso", desc: "Kanban compartilhado com status de cada automação e funil." },
            { icon: "📊", title: "Relatórios", desc: "Report quinzenal com métricas de conversão, qualificação e performance dos funis." },
            { icon: "📂", title: "Portal do Cliente", desc: "Pasta exclusiva no Google Drive com todos os entregáveis, documentos, relatórios e materiais do projeto." },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-xl mb-2 block">{item.icon}</span>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/8 bg-white/[0.03]">
          <p className="text-xs font-medium text-white/50 leading-relaxed">
            <span className="text-white font-bold">Tempo de resposta:</span> Mensagens respondidas em até 4h em horário comercial (seg-sex, 9h-18h). Urgências são tratadas prioritariamente.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "expectativas",
    label: "Expectativas",
    title: (
      <>
        O que <span className="text-gradient italic">esperar</span>
      </>
    ),
    subtitle: "Transparência desde o dia zero.",
    body: (
      <div className="space-y-4">
        {[
          { title: "Primeiros 7 dias", desc: "Diagnóstico completo do processo comercial. Mapeamento de funil, gargalos e oportunidades de automação.", color: "border-l-white/20" },
          { title: "Primeiros 30 dias", desc: "Primeiros funis e automações rodando. Cadências de follow-up ativas. Coleta de dados para otimização.", color: "border-l-white/30" },
          { title: "30 a 60 dias", desc: "Otimização baseada em dados reais. Ajuste de mensagens, timings e regras de qualificação. Taxas de conversão melhorando.", color: "border-l-white/40" },
          { title: "60 a 90 dias", desc: "Operação comercial automatizada e madura. Funis otimizados, IA calibrada, time focado apenas em fechamento.", color: "border-l-white/50" },
          { title: "90 dias em diante", desc: "Escala controlada. Processo previsível, métricas consolidadas. Foco em aumentar volume e melhorar conversão.", color: "border-l-white/60" },
        ].map((item) => (
          <div key={item.title} className={`pl-4 border-l-2 ${item.color} py-2`}>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
            <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
          </div>
        ))}
        <div className="p-4 rounded-xl border border-white/8 bg-white/[0.03] mt-4">
          <p className="text-[11px] font-light text-white/40 italic leading-relaxed">
            Importante: resultados em automação comercial são construídos com dados e refinamento contínuo. Quanto mais tempo de operação, mais inteligente o sistema fica e melhores os resultados.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "proximos-passos",
    label: "Próximos Passos",
    title: (
      <>
        Vamos <span className="text-gradient italic">começar</span>
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          { num: "1", title: "Criação do grupo no WhatsApp", desc: "Grupo exclusivo com o time FYRE para comunicação direta e aprovações." },
          { num: "2", title: "Acesso ao Portal do Cliente", desc: "Pasta no Google Drive com todos os documentos, entregas e materiais do projeto." },
          { num: "3", title: "Call de diagnóstico comercial", desc: "Mapeamento completo do funil, processos e metas (60 min)." },
          { num: "4", title: "Enviar acessos e materiais", desc: "CRM, WhatsApp Business, scripts, cadências atuais — conforme slide anterior." },
          { num: "5", title: "Validar arquitetura dos funis", desc: "Apresentamos o mapa dos funis automatizados para sua aprovação." },
          { num: "6", title: "Fase de construção", desc: "Desenvolvemos, integramos e testamos internamente." },
          { num: "7", title: "Go-live", desc: "Funis e automações comerciais ativas. Monitoramento contínuo." },
        ].map((item) => (
          <div key={item.num} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-2xl font-black text-white/15 min-w-[32px] text-center">{item.num}</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
        <div className="text-center mt-8 p-6 rounded-2xl border border-white/8 bg-white/[0.03]">
          <p className="text-sm font-medium text-white/60">
            Seu processo comercial vai funcionar no piloto automático.
          </p>
          <p className="text-xs font-light text-white/30 mt-2">
            Qualquer dúvida, fale diretamente no grupo do WhatsApp.
          </p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingTrafego() {
  return (
    <OnboardingSlides
      slides={slides}
      coverTitle={
        <>
          Onboarding <br />
          <span className="text-gradient italic">Automação Comercial</span>
        </>
      }
      coverSubtitle="Tudo o que você precisa saber para iniciar sua operação de automação comercial com a FYRE Automação & I.A."
    />
  );
}
