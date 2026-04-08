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
          A FYRE Automação & I.A é uma empresa de <span className="text-white font-medium">tecnologia focada em automação e inteligência artificial</span>. Combinamos automação, IA e estratégia para transformar negócios em operações inteligentes e escaláveis.
        </p>
        <p className="text-sm sm:text-base font-light text-white/50 leading-relaxed">
          Este onboarding vai te mostrar como trabalhamos, o que precisamos de você e o que esperar a partir de agora.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: "🤝", text: "Parceria real" },
            { icon: "📊", text: "Transparência total" },
            { icon: "⚡", text: "Velocidade de entrega" },
            { icon: "🎯", text: "Foco em resultado" },
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
    id: "como-trabalhamos",
    label: "Como Trabalhamos",
    title: (
      <>
        Nossa forma de <span className="text-gradient italic">trabalhar</span>
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          { title: "Diagnóstico primeiro, ação depois", desc: "Nunca começamos sem entender. Mapeamos seu negócio, identificamos gargalos e construímos um plano sob medida." },
          { title: "Entregas incrementais", desc: "Nada de esperar 3 meses para ver resultado. Trabalhamos em ciclos curtos com entregas semanais ou quinzenais." },
          { title: "Dados, não achismo", desc: "Cada decisão é baseada em métricas reais. Nada de intuição ou métrica de vaidade." },
          { title: "Você fica com o ativo", desc: "Tudo o que construímos é seu. Se encerrar a parceria, leva tudo: sistemas, automações, acessos." },
          { title: "Comunicação direta", desc: "Fala direto com quem faz. Sem camadas de atendimento, sem telefone sem fio." },
          { title: "Melhoria contínua", desc: "Não entregamos e sumimos. Monitoramos, otimizamos e evoluímos constantemente." },
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
    id: "processo",
    label: "Processo",
    title: (
      <>
        Etapas do <span className="text-gradient italic">projeto</span>
      </>
    ),
    subtitle: "Do kickoff à operação.",
    body: (
      <div className="space-y-3">
        {[
          { step: "01", title: "Kickoff & Alinhamento", desc: "Reunião inicial para alinhar metas, prazos, expectativas e definir responsáveis de cada lado.", time: "Semana 1" },
          { step: "02", title: "Diagnóstico & Planejamento", desc: "Mapeamento completo da situação atual, definição de prioridades e cronograma de entregas.", time: "Semana 1-2" },
          { step: "03", title: "Execução & Entregas", desc: "Início da operação com entregas semanais. Você acompanha e valida cada etapa.", time: "Contínuo" },
          { step: "04", title: "Revisão & Otimização", desc: "Análise de resultados, ajustes de rota e refinamento de estratégia.", time: "Quinzenal" },
          { step: "05", title: "Escala", desc: "Com a base rodando, identificamos oportunidades para ampliar resultado.", time: "Mês 2+" },
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
            { icon: "💬", title: "WhatsApp", desc: "Grupo exclusivo com o time FYRE. Comunicação rápida para dúvidas e alinhamentos." },
            { icon: "📹", title: "Reuniões", desc: "Calls quinzenais de alinhamento e revisão de resultados." },
            { icon: "📧", title: "E-mail", desc: "Relatórios, documentos formais e entregas." },
            { icon: "📊", title: "Relatórios", desc: "Report periódico com números reais e próximos passos." },
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
            <span className="text-white font-bold">Compromisso:</span> Respondemos em até 4h em horário comercial. Urgências são tratadas imediatamente.
          </p>
        </div>
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
    subtitle: "Para que tudo funcione, precisamos da sua colaboração.",
    body: (
      <div className="space-y-3">
        {[
          { title: "Acessos às ferramentas atuais", desc: "CRM, WhatsApp Business, sistemas internos, planilhas — tudo que usam hoje." },
          { title: "Briefing preenchido", desc: "Enviaremos um formulário completo nas próximas 24h." },
          { title: "Ponto focal definido", desc: "Uma pessoa do seu lado responsável por aprovações e alinhamentos." },
          { title: "Disponibilidade para calls", desc: "Reuniões quinzenais de 30 min. Agenda flexível." },
          { title: "Feedback rápido", desc: "Quanto mais rápido você valida, mais rápido entregamos. Objetivo: 48h para aprovações." },
          { title: "Confiança no processo", desc: "Resultados são construídos. Dê tempo para os dados trabalharem a favor." },
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
    id: "quem-somos",
    label: "Seu Time",
    title: (
      <>
        Quem está <span className="text-gradient italic">com você</span>
      </>
    ),
    body: (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Juan Mansilha", title: "Founder", role: "Estratégia & Negócios", image: "/images/juan.jpg", handle: "@juanmansilha.mkt", desc: "+8 anos no digital. Responsável pela estratégia de negócios, posicionamento e gestão de projetos." },
            { name: "Rodrigo Lopes", title: "Founder", role: "Automação & IA", image: "/images/rodrigo.jpg", handle: "@rodrigohacking", desc: "Especialista em automação e IA. Responsável por sistemas, integrações e processos inteligentes." },
          ].map((f) => (
            <div key={f.name} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 mx-auto mb-3">
                <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-sm font-bold text-white">{f.name}</h4>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mt-0.5">{f.title}</p>
              <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-white/20 mt-0.5 mb-2">{f.role}</p>
              <p className="text-[11px] font-light text-white/40 leading-relaxed">{f.desc}</p>
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
          { num: "3", title: "Preencher o briefing", desc: "Enviaremos o link nas próximas 24h." },
          { num: "4", title: "Enviar acessos necessários", desc: "Conforme lista do slide anterior." },
          { num: "5", title: "Definir ponto focal", desc: "Quem será o responsável do seu lado?" },
          { num: "6", title: "Agendar call de kickoff", desc: "Alinhamento completo de metas e estratégia (30-45 min)." },
          { num: "7", title: "Início da operação", desc: "A partir do kickoff, o trabalho começa. Primeiras entregas em até 7 dias úteis." },
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
          <p className="text-sm font-medium text-white/60">Estamos animados para começar.</p>
          <p className="text-xs font-light text-white/30 mt-2">Qualquer dúvida, fale diretamente no grupo do WhatsApp.</p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingGeral() {
  return (
    <OnboardingSlides
      slides={slides}
      coverTitle={
        <>
          Bem-vindo à <br />
          <span className="text-gradient italic">FYRE Automação & I.A</span>
        </>
      }
      coverSubtitle="Onboarding — Tudo o que você precisa saber para iniciar nossa parceria."
    />
  );
}
