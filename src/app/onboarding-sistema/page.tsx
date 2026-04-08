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
    subtitle: "Vamos construir o sistema que o seu negócio precisa.",
    body: (
      <div className="space-y-5">
        <p className="text-sm sm:text-base font-light text-white/50 leading-relaxed">
          Você contratou o desenvolvimento de um <span className="text-white font-medium">sistema personalizado</span> — uma plataforma sob medida que vai resolver problemas reais da sua operação. Não usamos templates. Cada funcionalidade é desenhada para o seu negócio.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: "🛠️", text: "Desenvolvimento sob medida" },
            { icon: "🔗", text: "Integrações nativas" },
            { icon: "📱", text: "Responsivo & PWA" },
            { icon: "🔒", text: "Seguro & escalável" },
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
    subtitle: "Do conceito ao sistema rodando.",
    body: (
      <div className="space-y-3">
        {[
          { step: "01", title: "Discovery & Levantamento", desc: "Mapeamos todos os requisitos: funcionalidades, usuários, fluxos, integrações e regras de negócio.", time: "Semana 1-2" },
          { step: "02", title: "Arquitetura & Prototipação", desc: "Definimos stack tecnológica, banco de dados, APIs e criamos protótipos navegáveis para validação.", time: "Semana 2-3" },
          { step: "03", title: "Desenvolvimento — Sprints", desc: "Construção em ciclos semanais. Entregas incrementais para você acompanhar e validar a cada sprint.", time: "Semana 3-8" },
          { step: "04", title: "Testes & QA", desc: "Testes de funcionalidade, performance, segurança e usabilidade. Correção de bugs e refinamentos.", time: "Semana 8-9" },
          { step: "05", title: "Deploy & Treinamento", desc: "Sistema no ar, documentação técnica e treinamento do time para uso da plataforma.", time: "Semana 9-10" },
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
          { title: "Descrição detalhada do problema", desc: "O que o sistema precisa resolver? Quais processos manuais ele vai substituir?" },
          { title: "Lista de funcionalidades desejadas", desc: "Tudo que o sistema precisa fazer. Separamos em essencial, importante e nice-to-have." },
          { title: "Tipos de usuário", desc: "Quem vai usar o sistema? Admin, operador, cliente final? Quais permissões cada um tem?" },
          { title: "Integrações necessárias", desc: "WhatsApp, gateway de pagamento, ERP, CRM, APIs externas. Liste tudo que precisa conectar." },
          { title: "Dados e relatórios", desc: "Que dados o sistema precisa armazenar? Que relatórios são necessários?" },
          { title: "Referências", desc: "Sistemas similares que você usa ou admira. Ajuda no alinhamento de expectativas." },
          { title: "Ponto focal disponível", desc: "Alguém do time com conhecimento do negócio para tirar dúvidas durante o desenvolvimento." },
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
            { icon: "💬", title: "WhatsApp", desc: "Grupo exclusivo para dúvidas rápidas e alinhamentos diários." },
            { icon: "📹", title: "Sprint reviews", desc: "Call semanal para apresentar entregas, coletar feedback e planejar próximo ciclo." },
            { icon: "📋", title: "Board de sprints", desc: "Kanban compartilhado com todas as tarefas, status e prioridades." },
            { icon: "🔗", title: "Ambiente de staging", desc: "Versão de testes para você validar cada entrega antes de ir pra produção." },
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
            <span className="text-white font-bold">Metodologia ágil:</span> Entregas semanais permitem ajustes rápidos. Você participa do processo e valida a cada ciclo.
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
          { num: "3", title: "Call de discovery", desc: "Mapeamento completo de requisitos e regras de negócio (60-90 min)." },
          { num: "4", title: "Enviar documentação existente", desc: "Processos, planilhas, fluxos atuais — tudo que ajude a entender a operação." },
          { num: "5", title: "Validar escopo e prioridades", desc: "Apresentamos o documento de requisitos para sua aprovação." },
          { num: "6", title: "Aprovar protótipos", desc: "Wireframes e fluxos de navegação antes de começar a codar." },
          { num: "7", title: "Início das sprints", desc: "Desenvolvimento começa. Entregas semanais com validação." },
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
          <p className="text-sm font-medium text-white/60">Vamos construir algo que realmente resolve.</p>
          <p className="text-xs font-light text-white/30 mt-2">Qualquer dúvida, fale diretamente no grupo do WhatsApp.</p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingSistema() {
  return (
    <OnboardingSlides
      slides={slides}
      coverTitle={
        <>
          Onboarding <br />
          <span className="text-gradient italic">Sistema Personalizado</span>
        </>
      }
      coverSubtitle="Tudo o que você precisa saber para iniciar o desenvolvimento do seu sistema sob medida com a FYRE Automação & I.A."
    />
  );
}
