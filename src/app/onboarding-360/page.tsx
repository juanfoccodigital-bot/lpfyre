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
        Bem-vindo ao <span className="text-gradient italic">Ecossistema 360°</span>
      </>
    ),
    subtitle: "Você contratou o pacote completo. Vamos transformar tudo.",
    body: (
      <div className="space-y-5">
        <p className="text-sm sm:text-base font-light text-white/50 leading-relaxed">
          Você está entrando no programa mais completo da FYRE Automação & I.A: <span className="text-white font-medium">automação, IA, automação comercial, sistemas, CRM, site e estratégia — tudo integrado</span>. Um ecossistema desenhado para tirar você da operação e colocar sua empresa no modo escala.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
          {[
            { icon: "🤖", text: "Automação & IA" },
            { icon: "📈", text: "Automação Comercial" },
            { icon: "🛠️", text: "Sistemas & CRM" },
            { icon: "💻", text: "Website" },
            { icon: "🔗", text: "FYRE HUB" },
            { icon: "🎯", text: "Projetos Completos" },
          ].map((item) => (
            <div key={item.text} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] sm:text-xs text-white/60 font-semibold">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "visao-geral",
    label: "Visão Geral",
    title: (
      <>
        O que está <span className="text-gradient italic">incluso</span>
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          { num: "01", title: "Automação & Inteligência Artificial", desc: "Chatbots, agentes de IA, qualificação automática, follow-up inteligente, agendamento e integrações — tudo rodando 24h." },
          { num: "02", title: "Automação Comercial", desc: "Funis automatizados, nutrição de leads, follow-up inteligente, cadências de vendas e processos comerciais otimizados com IA." },
          { num: "03", title: "Sistemas & CRM", desc: "CRM centralizado, pipelines comerciais, dashboards e unificação de dados em um ecossistema operacional completo." },
          { num: "04", title: "Sites & Landing Pages", desc: "Desenvolvimento de plataforma com design premium, copy estratégica, SEO técnico e rastreamento completo." },
          { num: "05", title: "Projetos Completos", desc: "Consultoria estratégica, diagnóstico de negócio, mapeamento de gargalos e plano de escala personalizado." },
          { num: "06", title: "FYRE HUB", desc: "Plataforma centralizada com todos os dados, métricas e integrações do ecossistema em um único lugar." },
        ].map((s) => (
          <div key={s.num} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-lg sm:text-xl font-black text-white/15 min-w-[32px] text-center">{s.num}</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{s.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "cronograma",
    label: "Cronograma",
    title: (
      <>
        Timeline <span className="text-gradient italic">do projeto</span>
      </>
    ),
    subtitle: "Visão macro das primeiras 12 semanas.",
    body: (
      <div className="space-y-4">
        {[
          { week: "SEM 1-2", title: "Diagnóstico & Setup", items: ["Kickoff completo", "Diagnóstico de processos", "Mapeamento de automações", "Setup de ferramentas e integrações"], color: "border-l-white/15" },
          { week: "SEM 2-4", title: "Fundação", items: ["Primeiras automações no ar", "Chatbot e fluxos básicos", "Wireframe do site aprovado", "CRM configurado"], color: "border-l-white/25" },
          { week: "SEM 4-8", title: "Construção", items: ["Automações avançadas com IA", "Funis comerciais automatizados", "Site em desenvolvimento", "Integrações implementadas"], color: "border-l-white/35" },
          { week: "SEM 8-12", title: "Escala", items: ["Automações maduras rodando", "Processos comerciais otimizados", "Site no ar com rastreamento", "Ecossistema 100% integrado"], color: "border-l-white/50" },
        ].map((phase) => (
          <div key={phase.week} className={`pl-4 border-l-2 ${phase.color} py-2`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/25 bg-white/5 px-2 py-0.5 rounded">{phase.week}</span>
              <h4 className="text-xs sm:text-sm font-bold text-white">{phase.title}</h4>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {phase.items.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-light text-white/40">{item}</span>
                </div>
              ))}
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
    subtitle: "Lista completa para iniciar todas as frentes.",
    body: (
      <div className="space-y-2">
        {[
          { cat: "Automação & IA", items: ["Mapeamento dos processos atuais", "FAQ e respostas padrão", "Acesso ao WhatsApp Business / CRM"] },
          { cat: "Comercial", items: ["Fluxo de vendas atual", "Regras de qualificação de leads", "Cadências e scripts existentes"] },
          { cat: "Site", items: ["Identidade visual (logo, cores)", "Conteúdo e fotos", "Domínio e hospedagem"] },
          { cat: "Geral", items: ["Ponto focal definido", "Acessos a ferramentas e sistemas atuais", "Briefing completo preenchido"] },
        ].map((group) => (
          <div key={group.cat} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-2">{group.cat}</span>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-sm bg-white/10" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-light text-white/45">{item}</span>
                </div>
              ))}
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
            { icon: "💬", title: "WhatsApp", desc: "Grupo exclusivo com todo o time FYRE. Alinhamentos rápidos e aprovações." },
            { icon: "📹", title: "Call semanal", desc: "Reunião semanal de 30-45 min para revisão de entregas e planejamento." },
            { icon: "📋", title: "Board de progresso", desc: "Kanban compartilhado com status de cada frente em tempo real." },
            { icon: "📊", title: "Report mensal", desc: "Relatório consolidado com métricas de todas as frentes e resultados gerais." },
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
            <span className="text-white font-bold">Prioridade máxima:</span> Como cliente 360°, você tem prioridade em todas as filas de atendimento e entrega.
          </p>
        </div>
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
            { name: "Juan Mansilha", title: "Founder", role: "Estratégia & Negócios", image: "/images/juan.jpg", desc: "Responsável pela estratégia geral, posicionamento, gestão de projetos e visão de negócio. Seu ponto de contato para alinhamentos estratégicos." },
            { name: "Rodrigo Lopes", title: "Founder", role: "Automação & IA", image: "/images/rodrigo.jpg", desc: "Responsável por automações, agentes de IA, desenvolvimento de sistemas e integrações técnicas." },
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
          { title: "Mês 1 — Fundação", desc: "Diagnóstico completo, setup de todas as frentes, primeiras automações no ar, fluxos básicos rodando. É o mês de maior intensidade de setup.", color: "border-l-white/20" },
          { title: "Mês 2 — Construção", desc: "Automações avançadas com IA, funis comerciais automatizados, site em desenvolvimento, integrações implementadas. Os dados começam a falar.", color: "border-l-white/30" },
          { title: "Mês 3 — Integração", desc: "Ecossistema conectado. Automações alimentam CRM, IA qualifica leads, site converte. Tudo falando a mesma língua.", color: "border-l-white/40" },
          { title: "Mês 4+ — Escala", desc: "Operação madura. Foco em escalar o que funciona, cortar o que não funciona, e aumentar margem. Previsibilidade real.", color: "border-l-white/60" },
        ].map((item) => (
          <div key={item.title} className={`pl-4 border-l-2 ${item.color} py-2`}>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
            <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
          </div>
        ))}
        <div className="p-4 rounded-xl border border-white/8 bg-white/[0.03] mt-2">
          <p className="text-[11px] font-light text-white/40 italic leading-relaxed">
            O ecossistema 360° é uma construção. Cada frente potencializa a outra. Quanto mais madura a operação, maior o efeito composto nos resultados.
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
          { num: "3", title: "Preencher o briefing completo", desc: "Enviaremos um formulário abrangente nas próximas 24h." },
          { num: "4", title: "Enviar todos os acessos", desc: "CRM, WhatsApp Business, sistemas, ferramentas — lista completa no slide anterior." },
          { num: "5", title: "Definir ponto focal", desc: "Uma pessoa do seu time para aprovar entregas e participar das calls." },
          { num: "6", title: "Call de kickoff (60 min)", desc: "Alinhamento geral: metas, prioridades, cronograma e expectativas." },
          { num: "7", title: "Início simultâneo das frentes", desc: "Automação, site, sistemas e estratégia começam a rodar em paralelo." },
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
          <p className="text-sm font-medium text-white/60">Você contratou o ecossistema completo.</p>
          <p className="text-xs font-light text-white/30 mt-2">Agora é com a gente. Vamos transformar seu negócio em uma operação inteligente e escalável.</p>
        </div>
      </div>
    ),
  },
];

export default function Onboarding360() {
  return (
    <OnboardingSlides
      slides={slides}
      coverTitle={
        <>
          Onboarding <br />
          <span className="text-gradient italic">Ecossistema 360°</span>
        </>
      }
      coverSubtitle="Onboarding completo — Automação, IA, automação comercial, sistemas, CRM, site e estratégia integrados."
    />
  );
}
