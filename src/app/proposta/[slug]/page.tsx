"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProposta, type PropostaData } from "@/lib/supabase";

const PAGAMENTO_LABELS: Record<string, string> = {
  avista: "À vista",
  "5050": "50% na entrada + 50% em 30 dias",
  mensal: "Mensal recorrente",
  parcelado: "Parcelado no cartão",
  projeto: "Valor único de projeto",
};

const TOM_INTRO: Record<string, { greeting: string; closing: string }> = {
  profissional: {
    greeting: "Prezado(a)",
    closing: "Estamos à disposição para dar o próximo passo.",
  },
  consultivo: {
    greeting: "Olá",
    closing: "Após análise do seu cenário, acreditamos que essa é a melhor estrutura para alcançar seus objetivos.",
  },
  premium: {
    greeting: "É um prazer apresentar esta proposta exclusiva para",
    closing: "Esta proposta foi desenhada sob medida para a realidade da sua operação.",
  },
  amigavel: {
    greeting: "E aí",
    closing: "Bora construir algo incrível juntos?",
  },
};

const SERVICO_ICONS: Record<string, string> = {
  "Automação de Marketing & Comercial": "⚡",
  "Automação & Inteligência Artificial": "🤖",
  "Consultoria Estratégica (A.R.Q.U.E.)": "📋",
  "Branding & Posicionamento": "🎨",
  "Site / Landing Page": "💻",
  "Sistema Personalizado": "🛠️",
  "CRM & Unificação Operacional": "🔗",
  "Ecossistema 360°": "🔥",
};

const SERVICO_DESC: Record<string, string> = {
  "Automação de Marketing & Comercial": "Funis automatizados de captura, nutrição e qualificação de leads com IA. Follow-up inteligente, agendamento automático e pipeline comercial no piloto automático.",
  "Automação & Inteligência Artificial": "Chatbots, agentes de IA, qualificação automática, follow-up inteligente e integrações — sua operação funcionando 24h sem depender de você.",
  "Consultoria Estratégica (A.R.Q.U.E.)": "Diagnóstico completo com o Método A.R.Q.U.E. Mapeamento de gargalos, definição de KPIs e plano de escala personalizado para sua realidade.",
  "Branding & Posicionamento": "Reposicionamento estratégico para aumentar percepção de valor, reduzir fricção de venda e construir autoridade real no seu mercado.",
  "Site / Landing Page": "Desenvolvimento com design premium, copy estratégica, SEO técnico, performance otimizada e rastreamento integrado. Projetado para converter.",
  "Sistema Personalizado": "Plataforma sob medida com desenvolvimento ágil, integrações nativas, dashboard personalizado e documentação completa.",
  "CRM & Unificação Operacional": "Integração de tráfego, CRM, atendimento e vendas em um ecossistema centralizado com dados em tempo real para decisões precisas.",
  "Ecossistema 360°": "Pacote completo: tráfego, automação, IA, branding, site, CRM e estratégia — tudo integrado, conectado e otimizado para escala.",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function PropostaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [proposta, setProposta] = useState<PropostaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getProposta(slug);
      if (!data) setNotFound(true);
      else setProposta(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative w-20 h-20">
          <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
            <defs><path id="cpLoad" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" /></defs>
            <text className="fill-white/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
              <textPath href="#cpLoad">FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/logo-fyre-circle.png" alt="FYRE" className="w-5 h-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !proposta) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
        <div>
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-6 w-auto opacity-30 mx-auto mb-6" />
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] text-white mb-2">Proposta não encontrada</h1>
          <p className="text-sm text-white/30">O link pode estar incorreto ou a proposta foi removida.</p>
        </div>
      </div>
    );
  }

  const tom = TOM_INTRO[proposta.tom] || TOM_INTRO.profissional;
  const createdAt = proposta.created_at ? new Date(proposta.created_at) : new Date();
  const validUntil = addDays(createdAt, proposta.validade_dias);
  const isExpired = new Date() > validUntil;
  const valorFinal = proposta.valor_desconto || proposta.valor;
  const hasDiscount = proposta.valor_desconto && proposta.valor_desconto < proposta.valor;
  const discount = hasDiscount ? Math.round(((proposta.valor - proposta.valor_desconto!) / proposta.valor) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_60%)]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.015] blur-[120px] bg-white" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] rounded-full opacity-[0.01] blur-[100px] bg-white" />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="py-8 sm:py-12 flex items-center justify-between border-b border-white/5">
          <img src="/images/logo-fyre.png" alt="FYRE Automação & I.A" className="h-5 sm:h-6 w-auto opacity-50" />
          <div className="text-right">
            <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/20 block">Proposta Comercial</span>
            <span className="text-[10px] text-white/15">{createdAt.toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        {/* ═══ GREETING ═══ */}
        <div className="py-10 sm:py-16 border-b border-white/5">
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
                <defs><path id="cpProp" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" /></defs>
                <text className="fill-white/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
                  <textPath href="#cpProp">FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/images/logo-fyre-circle.png" alt="FYRE" className="w-6 h-auto" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-instrument)] tracking-tight text-center leading-tight">
            {tom.greeting === "É um prazer apresentar esta proposta exclusiva para" ? (
              <>
                {tom.greeting} <br />
                <span className="text-gradient italic">{proposta.cliente_empresa}</span>
              </>
            ) : (
              <>
                {tom.greeting}, <span className="text-gradient italic">{(proposta.cliente_nome || "").split(" ")[0]}</span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-base font-light text-white/35 text-center mt-4 max-w-lg mx-auto leading-relaxed">
            Preparamos esta proposta comercial exclusiva para a <span className="text-white/60 font-medium">{proposta.cliente_empresa}</span>.
          </p>
        </div>

        {/* ═══ O CENÁRIO ATUAL ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2">O Cenário</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-6">
            Por que agora é o <span className="text-gradient italic">momento</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: "73%", desc: "dos leads gerados por agências nunca são contactados a tempo" },
              { value: "R$2.4B", desc: "desperdiçados em ads sem estratégia no Brasil em 2024" },
              { value: "5x", desc: "mais ROI para empresas que usam automação vs. as que não usam" },
              { value: "47%", desc: "de redução no CAC com IA e qualificação automática" },
            ].map((s) => (
              <div key={s.value} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                <div className="text-xl sm:text-2xl font-black text-white mb-1">{s.value}</div>
                <p className="text-[9px] sm:text-[10px] font-light text-white/35 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-light text-white/30 leading-relaxed italic text-center">
            Empresários que se estruturam agora dominam. Os que demoram, competem por preço.
          </p>
        </div>

        {/* ═══ ESCOPO DO PROJETO ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-6">Escopo do Projeto</span>
          <div className="space-y-3">
            {proposta.servicos.map((s) => (
              <div key={s} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-xl flex-shrink-0">{SERVICO_ICONS[s] || "⚡"}</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-1">{s}</h3>
                    <p className="text-[11px] sm:text-xs font-light text-white/40 leading-relaxed">{SERVICO_DESC[s] || ""}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ POR QUE A FYRE ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2">Diferenciais</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-8">
            Por que a <span className="text-gradient italic">FYRE</span>
          </h2>
          <div className="space-y-3">
            {[
              { title: "Não vendemos pacote. Construímos sistema.", desc: "Cada operação é desenhada sob medida para o seu negócio. Nada genérico, nada de template." },
              { title: "Você fica com o ativo.", desc: "Se encerrar a parceria, toda a estrutura, automações e processos ficam com você. Sem dependência." },
              { title: "Dados reais, não métricas de vaidade.", desc: "Nosso dashboard mostra CAC, LTV, ROAS e margem — não curtidas e alcance." },
              { title: "Marketing + Tecnologia na mesma mesa.", desc: "Somos os dois. Estratégia e execução técnica integradas, sem telefone sem fio." },
              { title: "Velocidade de entrega.", desc: "Primeiras automações e campanhas no ar em até 15 dias úteis. Sem enrolação." },
            ].map((d) => (
              <div key={d.title} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-white/20 mt-1.5 flex-shrink-0 group-hover:bg-white/50 transition-colors" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{d.title}</h4>
                  <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ TRACK RECORD ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-6">Track Record</span>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
            {[
              { value: "320+", label: "Projetos Entregues" },
              { value: "R$15M+", label: "Em Ads Gerenciados" },
              { value: "8+", label: "Anos de Mercado" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 sm:p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[8px] sm:text-[9px] font-semibold tracking-[0.15em] uppercase text-white/25">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "4.2x", label: "ROAS médio", desc: "Retorno sobre investimento em ads" },
              { value: "-38%", label: "Redução de CAC", desc: "Com automação e qualificação" },
              { value: "<2min", label: "Tempo de resposta", desc: "Com IA vs. 3.5h sem" },
              { value: "92%", label: "Retenção de clientes", desc: "Resultado fideliza" },
            ].map((item) => (
              <div key={item.value} className="p-3 sm:p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                <div className="text-lg sm:text-xl font-black text-white mb-0.5">{item.value}</div>
                <div className="text-[9px] sm:text-[10px] font-medium text-white/40">{item.label}</div>
                <div className="text-[8px] sm:text-[9px] text-white/20 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ QUEBRA DE OBJEÇÕES ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2">Transparência</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-8">
            Talvez você esteja <span className="text-gradient italic">pensando...</span>
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "\"Já contratei agência e não funcionou.\"",
                a: "Agência vende serviço. Nós construímos sistema. A diferença é que entregamos estrutura — não dependência. Se a parceria acabar, você fica com tudo.",
              },
              {
                q: "\"É um investimento alto.\"",
                a: "O investimento se paga quando você para de perder dinheiro com leads não atendidos, funil quebrado e decisões no feeling. Nosso diagnóstico mostra exatamente quanto você perde por mês.",
              },
              {
                q: "\"Não tenho tempo pra mais um projeto.\"",
                a: "Justamente. Se você não tem tempo, é porque está preso na operação. A FYRE existe para te tirar de lá. Nós executamos — você aprova.",
              },
              {
                q: "\"Quanto tempo até ver resultado?\"",
                a: "Primeiras automações e campanhas no ar em até 15 dias. Resultados mensuráveis a partir de 30 dias. Escala real entre 60-90 dias. Cada dia sem estrutura é dinheiro deixado na mesa.",
              },
            ].map((obj) => (
              <div key={obj.q} className="p-4 sm:p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                <p className="text-xs sm:text-sm font-semibold text-white/70 mb-2">{obj.q}</p>
                <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{obj.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ INVESTIMENTO ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-6">Investimento</span>

          <div className="p-6 sm:p-10 rounded-2xl border border-white/8 bg-white/[0.03] text-center">
            {hasDiscount && (
              <div className="mb-3">
                <span className="text-sm text-white/25 line-through">{formatCurrency(proposta.valor)}</span>
                <span className="ml-2 text-[10px] font-bold tracking-wider uppercase bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full">-{discount}%</span>
              </div>
            )}
            <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              {formatCurrency(valorFinal)}
            </div>
            <div className="mt-3 text-xs font-medium text-white/40">
              {PAGAMENTO_LABELS[proposta.forma_pagamento] || proposta.forma_pagamento}
              {proposta.forma_pagamento === "parcelado" && proposta.parcelas && (
                <span> em {proposta.parcelas}x de {formatCurrency(valorFinal / proposta.parcelas)}</span>
              )}
              {proposta.forma_pagamento === "mensal" && <span>/mês</span>}
            </div>
            {proposta.forma_pagamento === "5050" && (
              <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-[9px] font-semibold tracking-wider uppercase text-white/25 block mb-1">Entrada</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(valorFinal / 2)}</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-[9px] font-semibold tracking-wider uppercase text-white/25 block mb-1">30 dias</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(valorFinal / 2)}</span>
                </div>
              </div>
            )}
            {proposta.forma_pagamento === "parcelado" && proposta.parcelas && (
              <div className="mt-4 text-[11px] text-white/25">
                {proposta.parcelas}x de <span className="text-white/50 font-semibold">{formatCurrency(valorFinal / proposta.parcelas)}</span> no cartão
              </div>
            )}
          </div>

          {/* Validade */}
          <div className={`mt-4 p-4 rounded-xl border text-center ${isExpired ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-white/[0.02]"}`}>
            <span className={`text-[11px] font-medium ${isExpired ? "text-red-400" : "text-white/40"}`}>
              {isExpired
                ? "Esta proposta expirou em " + validUntil.toLocaleDateString("pt-BR")
                : `Proposta válida até ${validUntil.toLocaleDateString("pt-BR")} (${proposta.validade_dias} dias)`
              }
            </span>
          </div>
        </div>

        {/* ═══ O QUE ESTÁ INCLUSO ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2">Além do Escopo</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-8">
            Incluso na <span className="text-gradient italic">parceria</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "💬", title: "Grupo exclusivo WhatsApp", desc: "Comunicação direta com o time FYRE. Sem intermediários." },
              { icon: "📂", title: "Portal do Cliente", desc: "Pasta exclusiva no Google Drive com todas as entregas e documentos." },
              { icon: "📊", title: "Relatórios periódicos", desc: "Números reais com CAC, ROAS, LTV e margem. Zero métrica de vaidade." },
              { icon: "📹", title: "Calls de alinhamento", desc: "Reuniões de acompanhamento, revisão e planejamento." },
              { icon: "🔧", title: "Suporte prioritário", desc: "Respostas em até 4h em horário comercial." },
              { icon: "📋", title: "Documentação completa", desc: "Tudo documentado. Se a parceria acabar, o ativo é seu." },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-lg mb-2 block">{item.icon}</span>
                <h4 className="text-[11px] sm:text-xs font-bold text-white mb-0.5">{item.title}</h4>
                <p className="text-[9px] sm:text-[10px] font-light text-white/35 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ GARANTIA ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <div className="p-6 sm:p-8 rounded-2xl border border-white/8 bg-white/[0.03] text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Nosso Compromisso</h3>
            <p className="text-xs sm:text-sm font-light text-white/40 leading-relaxed max-w-md mx-auto mb-4">
              Se nos primeiros 30 dias você sentir que não estamos entregando valor real, sentamos juntos, revisamos a estratégia e ajustamos tudo — sem custo adicional.
            </p>
            <p className="text-[11px] font-medium text-white/50">
              Nosso objetivo é construir parceria de longo prazo. Resultado sustenta a relação.
            </p>
          </div>
        </div>

        {/* ═══ PRÓXIMOS PASSOS ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2">Após o Fechamento</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-8">
            Próximos <span className="text-gradient italic">passos</span>
          </h2>
          <div className="space-y-3">
            {[
              { num: "1", title: "Assinatura do contrato", desc: "Enviamos o contrato digital para formalização da parceria." },
              { num: "2", title: "Pagamento conforme acordado", desc: "Conforme condições definidas nesta proposta." },
              { num: "3", title: "Criação do grupo no WhatsApp", desc: "Grupo exclusivo com o time FYRE para comunicação direta e aprovações." },
              { num: "4", title: "Acesso ao Portal do Cliente", desc: "Pasta exclusiva no Google Drive com todos os materiais, entregas e documentos." },
              { num: "5", title: "Coleta de dados e acessos", desc: "Enviaremos um briefing completo e a lista de acessos necessários." },
              { num: "6", title: "Call de kickoff", desc: "Reunião de alinhamento: metas, prazos, expectativas e cronograma detalhado." },
              { num: "7", title: "Início da operação", desc: "O trabalho começa. Primeiras entregas em até 7 dias úteis após o kickoff." },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-xl font-black text-white/15 min-w-[28px] text-center">{item.num}</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{item.title}</h4>
                  <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FOUNDERS ═══ */}
        <div className="py-10 sm:py-14 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2">Quem Está Com Você</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-8">
            Os <span className="text-gradient italic">Fundadores</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                name: "Juan Mansilha",
                image: "/images/juan.jpg",
                bio: "+8 anos no digital, R$10M+ gerenciados em anúncios. Especialista em auditoria 360° de negócios, tráfego, funil e posicionamento.",
              },
              {
                name: "Rodrigo Lopes",
                image: "/images/rodrigo.jpg",
                bio: "Especialista em automação e inteligência artificial. Constrói sistemas reais com n8n, IA e integração de processos para resultados mensuráveis.",
              },
            ].map((f) => (
              <div key={f.name} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 mx-auto mb-3">
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold text-white">{f.name}</p>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/25 mt-0.5">Founder</p>
                <p className="text-[11px] font-light text-white/40 leading-relaxed mt-3">{f.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CLOSING ═══ */}
        <div className="py-10 sm:py-16 text-center">
          <p className="text-base sm:text-lg font-light text-white/50 italic mb-4 max-w-md mx-auto leading-relaxed font-[family-name:var(--font-instrument)]">
            &ldquo;{tom.closing}&rdquo;
          </p>
          <div className="separator my-8 max-w-xs mx-auto" />
          <img src="/images/logo-fyre.png" alt="FYRE" className="h-5 w-auto mx-auto opacity-20 mb-4" />
          <p className="text-[9px] text-white/10 tracking-wider">
            &copy; {new Date().getFullYear()} FYRE Automação & I.A &middot; Documento confidencial &middot; {proposta.cliente_empresa}
          </p>
        </div>
      </div>
    </div>
  );
}
