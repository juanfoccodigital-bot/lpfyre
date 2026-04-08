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
    subtitle: "Sua operação vai deixar de depender de você.",
    body: (
      <div className="space-y-5">
        <p className="text-sm sm:text-base font-light text-white/50 leading-relaxed">
          Vamos construir <span className="text-white font-medium">automações inteligentes e agentes de IA</span> que trabalham 24h no seu negócio — atendendo, qualificando, triando e fazendo follow-up sem intervenção humana.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: "🤖", text: "Agentes de IA sob medida" },
            { icon: "⚡", text: "Automações 24h" },
            { icon: "💬", text: "Chatbots inteligentes" },
            { icon: "🔗", text: "Integração total" },
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
    subtitle: "Da análise à automação rodando.",
    body: (
      <div className="space-y-3">
        {[
          { step: "01", title: "Mapeamento de Processos", desc: "Identificamos todos os fluxos manuais e repetitivos: atendimento, qualificação, follow-up, agendamento, triagem.", time: "Semana 1" },
          { step: "02", title: "Desenho da Arquitetura", desc: "Projetamos os fluxos automatizados com n8n, APIs e agentes de IA. Apresentamos o mapa antes de construir.", time: "Semana 1-2" },
          { step: "03", title: "Construção & Integração", desc: "Desenvolvimento dos fluxos, chatbots, agentes e conexão com suas ferramentas (CRM, WhatsApp, e-mail, etc).", time: "Semana 2-3" },
          { step: "04", title: "Testes & Validação", desc: "Rodamos cenários reais de teste. Ajustamos respostas, fluxos e tratativas de exceção.", time: "Semana 3-4" },
          { step: "05", title: "Go-live & Monitoramento", desc: "Automações ao vivo. Monitoramos performance, taxas de resposta e pontos de melhoria contínua.", time: "Semana 4+" },
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
          { title: "Chatbot de Atendimento", desc: "Resposta instantânea no WhatsApp/Instagram com IA. Tira dúvidas, envia informações e agenda reuniões automaticamente." },
          { title: "Qualificação Automática de Leads", desc: "IA que identifica se o lead é qualificado antes de chegar ao seu time comercial. Elimina tempo perdido com curiosos." },
          { title: "Follow-up Inteligente", desc: "Sequências automáticas de mensagem para leads que não responderam. Cadência personalizada por perfil." },
          { title: "Agendamento Automatizado", desc: "Lead escolhe horário disponível e a reunião é criada automaticamente no calendário do time." },
          { title: "Notificações & Alertas", desc: "Time avisado em tempo real quando um lead quente entra. Integração com Slack, WhatsApp ou e-mail." },
          { title: "Integrações Personalizadas", desc: "Conexão entre suas ferramentas: CRM, planilhas, e-mail marketing, ERP, e o que mais precisar." },
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
    body: (
      <div className="space-y-3">
        {[
          { title: "Mapeamento dos processos atuais", desc: "Como funciona hoje o atendimento, qualificação e follow-up. Pode ser por call ou documento." },
          { title: "Acesso às ferramentas atuais", desc: "CRM, WhatsApp Business API, e-mail, planilhas — tudo que usam hoje." },
          { title: "FAQ e respostas padrão", desc: "Perguntas frequentes, objeções comuns, informações sobre produtos/serviços." },
          { title: "Regras de qualificação", desc: "Critérios para definir lead quente vs. frio. O que torna alguém pronto para comprar?" },
          { title: "Fluxo de vendas atual", desc: "Etapas do funil comercial, tempo médio de fechamento, gargalos conhecidos." },
          { title: "Disponibilidade para testes", desc: "Alguém do time disponível para testar os fluxos antes do go-live." },
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
            { icon: "💬", title: "WhatsApp", desc: "Grupo exclusivo para alinhamentos rápidos e aprovações." },
            { icon: "📹", title: "Calls semanais", desc: "Reunião semanal de 30 min na fase de construção. Quinzenal após go-live." },
            { icon: "📋", title: "Board de progresso", desc: "Acompanhe em tempo real o que está sendo construído e o status de cada automação." },
            { icon: "🔔", title: "Alertas de conclusão", desc: "Você é notificado a cada entrega finalizada e pronta para teste." },
            { icon: "📂", title: "Portal do Cliente", desc: "Pasta exclusiva no Google Drive com todos os entregáveis, documentos, relatórios e materiais do projeto." },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-xl mb-2 block">{item.icon}</span>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
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
          { num: "3", title: "Call de mapeamento", desc: "Entendemos seus processos atuais em detalhes (60 min)." },
          { num: "4", title: "Enviar acessos e materiais", desc: "Ferramentas, FAQ, regras de qualificação." },
          { num: "5", title: "Validar arquitetura proposta", desc: "Apresentamos o mapa dos fluxos para sua aprovação." },
          { num: "6", title: "Fase de construção", desc: "Desenvolvemos, integramos e testamos internamente." },
          { num: "7", title: "Testes com seu time", desc: "Rodamos cenários reais antes de ativar para clientes." },
          { num: "8", title: "Go-live", desc: "Automações ativas. Monitoramento contínuo." },
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
          <p className="text-sm font-medium text-white/60">Sua operação vai funcionar no piloto automático.</p>
          <p className="text-xs font-light text-white/30 mt-2">Qualquer dúvida, fale diretamente no grupo do WhatsApp.</p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingAutomacao() {
  return (
    <OnboardingSlides
      slides={slides}
      coverTitle={
        <>
          Onboarding <br />
          <span className="text-gradient italic">Automação & IA</span>
        </>
      }
      coverSubtitle="Tudo o que você precisa saber para iniciar sua operação de automação e inteligência artificial com a FYRE Automação & I.A."
    />
  );
}
