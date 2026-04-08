"use client";

import OnboardingSlides, { type OnboardingSlide } from "@/components/OnboardingSlides";

const slides: OnboardingSlide[] = [
  /* ── 1. COVER ────────────────────────────────────────── */
  {
    id: "cover",
    isCover: true,
    title: "Onboarding Parceiro",
  },

  /* ── 2. BEM-VINDO AO TIME ────────────────────────────── */
  {
    id: "bem-vindo",
    label: "Introdução",
    title: "Bem-vindo ao time",
    subtitle: "Você agora faz parte da FYRE Automação & I.A.",
    body: (
      <div className="space-y-6 text-sm leading-relaxed text-white/50">
        <p>
          A FYRE é uma <span className="text-white/80 font-medium">empresa de tecnologia focada em automação e inteligência artificial</span> — não somos agência.
          Construímos sistemas inteligentes de automação, IA e processos sob medida para cada cliente.
        </p>
        <p>
          O nome <span className="text-white/80 font-medium">FYRE</span> vem de <em>Firefly</em> (vagalume) — luz própria, precisão e destaque
          em meio ao ruído do mercado.
        </p>

        <div className="pt-2">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-3">
            Nossos valores
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "🎯", text: "Resultado acima de promessa" },
              { icon: "📊", text: "Dados, não achismo" },
              { icon: "🔑", text: "Cliente fica com o ativo" },
              { icon: "⚡", text: "Velocidade de entrega" },
            ].map((v) => (
              <div key={v.text} className="flex items-start gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <span className="text-base mt-0.5">{v.icon}</span>
                <span className="text-white/60 text-sm">{v.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  /* ── 3. OS FUNDADORES ────────────────────────────────── */
  {
    id: "fundadores",
    label: "Liderança",
    title: "Os Fundadores",
    subtitle: "Quem está por trás da FYRE.",
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Juan */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-white/90">Juan Mansilha</h3>
            <span className="text-[11px] tracking-wide uppercase text-white/30">Founder — Estratégia &amp; Negócios</span>
          </div>
          <ul className="space-y-1.5 text-sm text-white/50">
            <li className="flex items-start gap-2"><span className="text-white/20 mt-1">▸</span>8+ anos no mercado digital</li>
            <li className="flex items-start gap-2"><span className="text-white/20 mt-1">▸</span>Experiência em estratégia e gestão de projetos</li>
            <li className="flex items-start gap-2"><span className="text-white/20 mt-1">▸</span>Foco: estratégia de negócios, posicionamento, gestão de projetos</li>
          </ul>
        </div>

        {/* Rodrigo */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-white/90">Rodrigo Lopes</h3>
            <span className="text-[11px] tracking-wide uppercase text-white/30">Founder — Automação &amp; IA</span>
          </div>
          <ul className="space-y-1.5 text-sm text-white/50">
            <li className="flex items-start gap-2"><span className="text-white/20 mt-1">▸</span>Especialista em automação e inteligência artificial</li>
            <li className="flex items-start gap-2"><span className="text-white/20 mt-1">▸</span>Foco: n8n, Claude Code, sistemas, integrações</li>
          </ul>
        </div>
      </div>
    ),
  },

  /* ── 4. O QUE FAZEMOS ────────────────────────────────── */
  {
    id: "servicos",
    label: "Serviços",
    title: "O que fazemos",
    subtitle: "Nosso portfólio de soluções em automação e tecnologia.",
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { title: "Automação & Inteligência Artificial", desc: "Fluxos n8n, chatbots, agentes IA, integrações entre sistemas." },
          { title: "Automação Comercial", desc: "Funis automatizados, nutrição de leads, follow-up inteligente, cadências de vendas." },
          { title: "Sistemas & CRM", desc: "CRM, pipelines comerciais, dashboards e unificação operacional." },
          { title: "Sites & Landing Pages", desc: "Landing pages, portais, plataformas — Next.js + Supabase." },
          { title: "Projetos Completos", desc: "Consultoria estratégica, diagnóstico e roadmap personalizado de automação." },
          { title: "FYRE HUB", desc: "Plataforma centralizada com dados, métricas e integrações em um único lugar." },
          { title: "Ecossistema 360°", desc: "Integração de todos os serviços em um sistema coeso e escalável." },
        ].map((s) => (
          <div key={s.title} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 space-y-1">
            <h4 className="text-sm font-semibold text-white/80">{s.title}</h4>
            <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    ),
  },

  /* ── 5. NOSSO CLIENTE IDEAL ──────────────────────────── */
  {
    id: "cliente-ideal",
    label: "ICP",
    title: "Nosso Cliente Ideal",
    subtitle: "Pra quem a FYRE foi feita.",
    body: (
      <div className="space-y-6 text-sm text-white/50 leading-relaxed">
        <ul className="space-y-2.5">
          {[
            "Empresários faturando R$50k+/mês",
            "Presos na operação, querem escalar com automação e tecnologia",
            "Já investiram em soluções sem resultado claro",
            "Precisam de sistema inteligente, não de pacote genérico",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="text-white/20 mt-0.5">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div>
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-3">
            Segmentos principais
          </span>
          <div className="flex flex-wrap gap-2">
            {["Clínicas", "E-commerces", "Construtoras", "SaaS", "Infoprodutores", "Indústria"].map((seg) => (
              <span key={seg} className="px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/[0.08] bg-white/[0.02]">
                {seg}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  /* ── 6. SISTEMA A.R.Q.U.E. ──────────────────────────── */
  {
    id: "arque",
    label: "Metodologia",
    title: "Método A.R.Q.U.E.",
    subtitle: "Nossa metodologia proprietária de crescimento.",
    body: (
      <div className="space-y-3">
        {[
          { letter: "A", name: "Análise & Arquitetura", desc: "Diagnóstico completo do negócio, mapeamento de processos, benchmarks e definição da arquitetura de automação." },
          { letter: "R", name: "Reconhecimento & Posicionamento", desc: "Posicionamento estratégico, identidade, narrativa e presença digital que gera autoridade." },
          { letter: "Q", name: "Qualificação Autônoma", desc: "Funis automatizados, qualificação com IA, lead scoring e nutrição inteligente." },
          { letter: "U", name: "Unificação Operacional", desc: "CRM centralizado, automações, integrações — todos os dados em um só lugar." },
          { letter: "E", name: "Escala & Perenidade", desc: "Otimização contínua, dashboards em tempo real, expansão de automações e crescimento sustentável." },
        ].map((step) => (
          <div key={step.letter} className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
            <span className="text-lg font-bold text-white/20 font-mono mt-0.5 shrink-0 w-6 text-center">{step.letter}</span>
            <div>
              <h4 className="text-sm font-semibold text-white/80">{step.name}</h4>
              <p className="text-xs text-white/40 leading-relaxed mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  /* ── 7. PROSPECTAFYRE ────────────────────────────────── */
  {
    id: "prospecta",
    label: "Comercial",
    title: "ProspectaFYRE",
    subtitle: "Nossa metodologia de vendas e funil comercial.",
    body: (
      <div className="space-y-6 text-sm text-white/50 leading-relaxed">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-3">
            11 Etapas do Funil
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              "Lead Novo (5 min)",
              "1° Contato",
              "2° Contato",
              "3° Contato",
              "Qualificação",
              "Agendado",
              "Aquecimento",
              "Rmkt",
              "Concluído",
              "Lead Frio",
              "Perdido",
            ].map((stage, i) => (
              <span key={stage} className="px-3 py-1.5 rounded-full text-xs border border-white/[0.08] bg-white/[0.02] text-white/50">
                <span className="text-white/20 font-mono mr-1.5">{String(i + 1).padStart(2, "0")}</span>
                {stage}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block">
            Regras de ouro
          </span>
          <ul className="space-y-2">
            {[
              "Lead novo = ligar em até 5 minutos",
              "3 tentativas de contato com materiais diferentes em cada",
              "Diagnóstico gratuito como porta de entrada",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2.5">
                <span className="text-white/20 mt-0.5">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },

  /* ── 8. FERRAMENTAS ──────────────────────────────────── */
  {
    id: "ferramentas",
    label: "Stack",
    title: "Ferramentas que usamos",
    subtitle: "O ecossistema tecnológico da FYRE.",
    body: (
      <div className="space-y-4 text-sm">
        {/* Portais */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block">Portais internos</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { name: "Portal Admin", path: "/admin", desc: "CRM, Clientes, Calendário, Financeiro, Tarefas, Instagram Creator, Conteúdo" },
              { name: "Portal Cliente", path: "/portal-cliente", desc: "Dashboard de projetos, reuniões, arquivos, atualizações" },
              { name: "Gerador de Propostas", path: "/fechamento", desc: "Criação e envio de propostas comerciais" },
              { name: "Briefing", path: "/briefing", desc: "Coleta de informações de novos clientes" },
            ].map((tool) => (
              <div key={tool.name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white/80">{tool.name}</h4>
                  <code className="text-[10px] text-white/20 font-mono">{tool.path}</code>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Infra */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block">Infraestrutura</span>
          <div className="flex flex-wrap gap-2">
            {[
              "Supabase (banco de dados)",
              "Vercel (deploy)",
              "n8n (automações)",
              "Claude / OpenAI (IA)",
            ].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/[0.08] bg-white/[0.02]">{t}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  /* ── 9. PROCESSOS INTERNOS ───────────────────────────── */
  {
    id: "processos",
    label: "Operação",
    title: "Processos internos",
    subtitle: "Como a FYRE funciona no dia a dia.",
    body: (
      <div className="space-y-3">
        {[
          { title: "Comunicação", desc: "WhatsApp — grupos separados por cliente + grupo interno do time." },
          { title: "Reuniões", desc: "Calls quinzenais de alinhamento com cada cliente e time." },
          { title: "Tarefas", desc: "/admin/tarefas — checklists com responsáveis e prazos." },
          { title: "Calendário", desc: "/admin/calendario — visão unificada de reuniões, tarefas e conteúdo." },
          { title: "Conteúdo", desc: "Calendário de posts com IA + criador de conteúdo Instagram integrado." },
          { title: "Financeiro", desc: "Receitas, despesas e recorrência controlados no portal admin." },
        ].map((p) => (
          <div key={p.title} className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
            <h4 className="text-sm font-semibold text-white/80 shrink-0 w-28">{p.title}</h4>
            <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    ),
  },

  /* ── 10. TOM DE VOZ ──────────────────────────────────── */
  {
    id: "tom-de-voz",
    label: "Branding",
    title: "Tom de voz FYRE",
    subtitle: "Como nos comunicamos com o mercado.",
    body: (
      <div className="space-y-6 text-sm text-white/50 leading-relaxed">
        <div className="space-y-2.5">
          {[
            { trait: "Direto", desc: "Sem enrolação. Cada frase tem peso." },
            { trait: "Técnico com clareza", desc: "Usamos termos de automação e IA — mas explicamos quando preciso." },
            { trait: "Confiante, não arrogante", desc: "Mostramos resultado, não prometemos milagre." },
            { trait: "Provocativo", desc: "Questionamos o status quo da tecnologia aplicada a negócios." },
          ].map((t) => (
            <div key={t.trait} className="flex items-start gap-3">
              <span className="text-white/20 mt-0.5">▸</span>
              <div>
                <span className="text-white/80 font-medium">{t.trait}:</span>{" "}
                <span className="text-white/50">{t.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-green-400/60 block">Como falar</span>
            <ul className="space-y-1.5 text-xs text-white/50">
              <li>&quot;Seu processo tem 3 gargalos. Vou mostrar.&quot;</li>
              <li>&quot;Automatizamos o follow-up e a conversão subiu 40%.&quot;</li>
              <li>&quot;Os dados mostram que a automação X performa melhor.&quot;</li>
            </ul>
          </div>
          <div className="bg-white/[0.03] border border-red-500/10 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-red-400/60 block">Como NÃO falar</span>
            <ul className="space-y-1.5 text-xs text-white/50">
              <li>&quot;Vamos bombar suas vendas!&quot;</li>
              <li>&quot;Garantimos 10x de retorno.&quot;</li>
              <li>&quot;Confia no processo.&quot;</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },

  /* ── 11. EXPECTATIVAS ────────────────────────────────── */
  {
    id: "expectativas",
    label: "Cultura",
    title: "Expectativas",
    subtitle: "O que esperamos de cada membro do time.",
    body: (
      <div className="space-y-3">
        {[
          { title: "Velocidade", desc: "Responder leads em até 5 minutos. Clientes em até 4 horas." },
          { title: "Qualidade", desc: "Dado > achismo. Sempre metrificar resultados e decisões." },
          { title: "Proatividade", desc: "Não esperar o cliente pedir. Antecipar problemas e oportunidades." },
          { title: "Transparência", desc: "Números reais, sem maquiar. Mesmo quando o resultado não é bom." },
          { title: "Ownership", desc: "Tratar cada cliente como se fosse seu próprio negócio." },
        ].map((e) => (
          <div key={e.title} className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
            <h4 className="text-sm font-semibold text-white/80 shrink-0 w-32">{e.title}</h4>
            <p className="text-xs text-white/40 leading-relaxed">{e.desc}</p>
          </div>
        ))}
      </div>
    ),
  },

  /* ── 12. PRÓXIMOS PASSOS ─────────────────────────────── */
  {
    id: "proximos-passos",
    label: "Ação",
    title: "Próximos passos",
    subtitle: "O que fazer agora para começar.",
    body: (
      <div className="space-y-5 text-sm text-white/50 leading-relaxed">
        <ol className="space-y-3">
          {[
            "Receber seus acessos ao Portal Admin (/admin)",
            "Conhecer os clientes ativos e seus respectivos grupos",
            "Revisar /modelo-de-vendas para entender os scripts comerciais",
            "Revisar /brand para absorver a identidade visual",
            "Participar da primeira reunião de alinhamento com o time",
            "Qualquer dúvida → falar no grupo interno do WhatsApp",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-white/15 font-mono text-xs mt-0.5 shrink-0 w-5 text-right">{String(i + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-center">
          <p className="text-white/60 font-medium">Bem-vindo à FYRE Automação & I.A.</p>
          <p className="text-white/30 text-xs mt-1">Agora é contigo. Vamos construir junto.</p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingParceiro() {
  return (
    <OnboardingSlides
      slides={slides}
      coverTitle={
        <>
          Bem-vindo à <br />
          <span className="text-gradient italic">FYRE Automação & I.A</span>
        </>
      }
      coverSubtitle="Onboarding de Parceiro — Tudo que você precisa saber para fazer parte do time."
    />
  );
}
