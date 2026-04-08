import { NextRequest, NextResponse } from "next/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

const FYRE_CONTEXT = `Você é um especialista da FYRE Automação & I.A — empresa de tecnologia especializada em automação e inteligência artificial.

SOBRE A FYRE:
- NÃO é agência. É empresa de tecnologia.
- Nome vem de Firefly (vagalume) — luz própria, precisão, destaque
- Cores: verde neon #00FF88, preto, branco
- Fundadores: Juan Mansilha (Estratégia & Performance, 8+ anos, 500+ processos automatizados) e Rodrigo Lopes (Automação & IA)
- Serviços: Automação & IA, Automação Comercial, Sistemas & CRM Sob Medida, Sites & Estrutura Digital, Projetos de Automação, FYRE HUB (SaaS)
- Público: empresários que faturam R$50k+/mês e querem escalar com estrutura
- Metodologia: Método A.R.Q.U.E. (Análise, Reconhecimento, Qualificação, Unificação, Escala)
- Tom de voz: Direto, técnico com clareza, confiante, provocativo
- Diferenciais: constrói sistema não pacote, cliente fica com ativo, dados reais, automação + tech juntos

REGRAS:
- Responda SEMPRE em português do Brasil
- Seja direto e prático — entregue resultado pronto pra usar
- Use o tom de voz da FYRE quando em Modo FYRE
- Formate com markdown (títulos, bullets, negrito)
- Seja específico e acionável, nunca genérico`;

export async function POST(req: NextRequest) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const body = await req.json();

  // ─── CHAT MODE (conversational agent) ───
  if (body.action === "chat") {
    const { agentSystemPrompt, messages: chatMessages, mode: chatMode, clientContext, userName } = body;

    let sysPrompt = FYRE_CONTEXT + "\n\n" + agentSystemPrompt;

    if (userName) {
      sysPrompt += `\n\nVocê está conversando com ${userName}. Use o nome dele(a) às vezes pra tornar a conversa pessoal.`;
    }

    if (chatMode === "cliente" && clientContext) {
      sysPrompt += `\n\nCONTEXTO DO CLIENTE:\n- Nome: ${clientContext.nome}\n- Empresa: ${clientContext.empresa}\n- Serviços: ${clientContext.servicos?.join(", ")}\n- Segmento: ${clientContext.especialidade || "não informado"}\n\nUse esses dados para personalizar a resposta.`;
    }

    if (chatMode === "generico") {
      sysPrompt = agentSystemPrompt;
    }

    const apiMessages = [
      { role: "system", content: sysPrompt },
      ...chatMessages,
    ];

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: apiMessages,
          temperature: 0.8,
          max_tokens: 4000,
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ error: "Sem resposta da IA", details: data }, { status: 500 });
      }
      return NextResponse.json({ output: content });
    } catch (err) {
      return NextResponse.json({ error: "Erro na API", details: String(err) }, { status: 500 });
    }
  }

  // ─── LEGACY MODE (department + function) ───
  const { department, functionName, inputs, mode, clientContext } = body;

  let systemPrompt = FYRE_CONTEXT;

  if (mode === "cliente" && clientContext) {
    systemPrompt += `\n\nCONTEXTO DO CLIENTE:\n- Nome: ${clientContext.nome}\n- Empresa: ${clientContext.empresa}\n- Serviços: ${clientContext.servicos?.join(", ")}\n- Segmento: ${clientContext.especialidade || "não informado"}\n\nUse esses dados para personalizar a resposta.`;
  }

  if (mode === "generico") {
    systemPrompt = "Você é um especialista em negócios e marketing digital. Responda em português do Brasil, de forma direta e prática. Formate com markdown.";
  }

  const userPrompt = buildPrompt(department, functionName, inputs);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Sem resposta da IA", details: data }, { status: 500 });
    }
    return NextResponse.json({ output: content });
  } catch (err) {
    return NextResponse.json({ error: "Erro na API", details: String(err) }, { status: 500 });
  }
}

function buildPrompt(dept: string, fn: string, inputs: Record<string, string>): string {
  const i = inputs || {};
  const base = Object.entries(i).map(([k, v]) => `${k}: ${v}`).join("\n");

  const prompts: Record<string, Record<string, string>> = {
    estrategia: {
      diagnostico: `Faça um diagnóstico completo de negócio com base nestas informações:\n${base}\n\nAnalise: posicionamento, funil, canais, processos, oportunidades. Use o framework A.R.Q.U.E. Seja específico e acionável.`,
      plano_90dias: `Crie um plano de crescimento de 90 dias para:\n${base}\n\nDivida em 3 fases (30/60/90 dias) com ações específicas, KPIs e responsáveis.`,
      gargalos: `Identifique os principais gargalos do funil de vendas com base em:\n${base}\n\nPara cada gargalo: causa, impacto estimado em R$ e solução.`,
      swot: `Faça uma análise SWOT completa para:\n${base}\n\nForças, Fraquezas, Oportunidades e Ameaças com ações para cada.`,
      kpis: `Sugira os KPIs mais importantes para:\n${base}\n\nPara cada KPI: nome, fórmula, benchmark do mercado e meta sugerida.`,
    },
    trafego: {
      campanha_meta: `Crie a estrutura completa de uma campanha Meta Ads:\n${base}\n\nInclua: objetivo, públicos (3 segmentações), orçamento sugerido, estrutura de conjuntos, criativos sugeridos, copy.`,
      campanha_google: `Crie a estrutura completa de uma campanha Google Ads:\n${base}\n\nInclua: tipo de campanha, palavras-chave, negativar, extensões, landing page sugerida, orçamento.`,
      publicos: `Sugira públicos de segmentação para anúncios:\n${base}\n\nCrie 5 públicos diferentes: demográficos, interesses, lookalike, remarketing, custom. Com justificativa para cada.`,
      analise_metricas: `Analise estas métricas de campanha e sugira ações:\n${base}\n\nIdentifique o que está bom, o que está ruim e sugira 5 otimizações específicas em ordem de prioridade.`,
      calculadora: `Calcule as métricas de performance com base em:\n${base}\n\nCalcule: CAC, ROAS, LTV, CPL, CPA, margem. Sugira se vale escalar ou otimizar.`,
      teste_ab: `Crie um roteiro de teste A/B para:\n${base}\n\nDefina: hipótese, variáveis, métricas de sucesso, duração sugerida e critérios de decisão.`,
    },
    copy: {
      anuncio: `Crie 3 variações de copy para anúncio:\n${base}\n\nPara cada: headline (max 40 chars), texto primário (max 125 chars), descrição, CTA. Uma versão provocativa, uma educativa, uma com prova social.`,
      headline: `Crie 10 headlines impactantes para:\n${base}\n\nVarie entre: curiosidade, dor, resultado, provocação, autoridade. Max 60 caracteres cada.`,
      pagina_vendas: `Crie a estrutura completa de uma página de vendas para:\n${base}\n\nSeções: headline, sub, problema, agitação, solução, benefícios, prova social, oferta, garantia, FAQ, CTA. Com copy pra cada seção.`,
      email_sequence: `Crie uma sequência de 5 emails para:\n${base}\n\nEmail 1: Boas-vindas, Email 2: Educação, Email 3: Case/Prova, Email 4: Oferta, Email 5: Urgência. Com assunto + corpo de cada.`,
      whatsapp: `Crie scripts de WhatsApp para:\n${base}\n\nCrie: abordagem inicial, follow-up D+1, follow-up D+3, reativação, mensagem pós-venda.`,
      bio_instagram: `Crie 5 opções de bio de Instagram para:\n${base}\n\nCada uma com: nome/título, descrição, CTA. Max 150 caracteres.`,
      vsl: `Crie o roteiro de um VSL (Video Sales Letter) para:\n${base}\n\nEstrutura: Hook (30s), Problema (1min), Agitação (1min), Solução (2min), Prova (1min), Oferta (1min), CTA (30s). Com texto de cada parte.`,
    },
    social: {
      calendario: `Crie um calendário de conteúdo de 4 semanas para Instagram:\n${base}\n\n3 posts por semana. Para cada: data, tipo (carrossel/estático/reels), tema, headline, legenda com emojis e CTA, hashtags.`,
      ideias: `Gere 20 ideias de posts para Instagram:\n${base}\n\nPara cada: título do post, formato sugerido (carrossel/reels/estático), hook da primeira frase, CTA.`,
      legendas: `Crie 5 legendas de Instagram para:\n${base}\n\nCada uma com: gancho inicial forte, desenvolvimento, CTA, emojis, hashtags. Variando tom: educativo, provocativo, pessoal, técnico, storytelling.`,
      reels: `Crie 3 roteiros de Reels para:\n${base}\n\nCada roteiro com: hook (3s), desenvolvimento (12-20s), CTA (5s). Com texto e ação de câmera.`,
      stories: `Crie uma sequência de 7 stories para:\n${base}\n\nStory 1: gancho, 2-5: conteúdo, 6: prova social, 7: CTA. Com texto e sugestão de visual.`,
      analise_perfil: `Analise e sugira melhorias para este perfil de Instagram:\n${base}\n\nAvalie: bio, destaques, feed, conteúdo, CTA, frequência. Sugira 10 melhorias em ordem de prioridade.`,
      hashtags: `Sugira hashtags otimizadas para:\n${base}\n\nCrie 3 grupos: alta concorrência (5), média (10), nicho (15). Total 30 hashtags.`,
    },
    automacao: {
      fluxo: `Desenhe um fluxo de automação para:\n${base}\n\nDescreva: trigger, condições, ações, integrações necessárias, ferramentas sugeridas. Formato passo-a-passo.`,
      chatbot: `Crie o script de um chatbot para:\n${base}\n\nFluxo completo: saudação, qualificação (3-5 perguntas), direcionamento, encerramento. Com mensagens exatas.`,
      followup: `Crie uma sequência de follow-up automático:\n${base}\n\nD+0 até D+14 com: canal (WhatsApp/email), mensagem exata, condição de parada. 7 touchpoints.`,
      integracoes: `Sugira integrações para otimizar:\n${base}\n\nPara cada: ferramenta A → ferramenta B, o que automatiza, impacto esperado, complexidade.`,
      prompt_engineering: `Crie prompts otimizados para:\n${base}\n\nGere 5 prompts prontos pra usar, cada um com: contexto, instrução, formato de saída, exemplo.`,
      qualificacao: `Crie um fluxo de qualificação automática de leads para:\n${base}\n\nPerguntas de qualificação, scoring, regras de routing, ações automáticas por score.`,
    },
    vendas: {
      script: `Crie um script de vendas completo para:\n${base}\n\nEstrutura: abertura, rapport, qualificação (5 perguntas), apresentação, proposta, fechamento, objeções. Com falas exatas.`,
      objecoes: `Simule um cliente fazendo objeções para:\n${base}\n\nGere 8 objeções comuns com a melhor resposta para cada. Tom confiante mas não agressivo.`,
      proposta: `Crie o texto de uma proposta comercial para:\n${base}\n\nInclua: contexto, diagnóstico do problema, solução proposta, escopo, investimento, diferenciais, próximos passos.`,
      followup: `Crie 5 mensagens de follow-up personalizadas para:\n${base}\n\nD+1 (lembrete), D+3 (valor), D+7 (urgência), D+14 (última chance), D+30 (reativação).`,
      pitch: `Crie um pitch de elevador (60 segundos) para:\n${base}\n\nEstrutura: quem somos, pra quem, o que fazemos, diferencial, CTA. Memorável e direto.`,
      cold_call: `Crie um script de cold call para:\n${base}\n\nPrimeiros 30 segundos críticos, qualificação rápida, gancho de interesse, agendamento. Com objeções de porta.`,
      roleplay: `Simule ser um cliente potencial com estas características:\n${base}\n\nFaça perguntas difíceis, coloque objeções, seja cético mas justo. Eu vou responder e você avalia minha performance.`,
    },
    rh: {
      vaga: `Crie uma descrição de vaga completa para:\n${base}\n\nInclua: sobre a empresa, sobre a vaga, responsabilidades, requisitos, diferenciais, benefícios, como se candidatar. Tom atrativo.`,
      entrevista: `Gere perguntas de entrevista para:\n${base}\n\n15 perguntas divididas em: técnicas (5), comportamentais (5), culturais (5). Com o que observar em cada resposta.`,
      avaliacao: `Avalie este candidato para a vaga:\n${base}\n\nAnalise: fit técnico, fit cultural, red flags, pontos fortes, recomendação (contratar/não/talvez). Nota de 0-10.`,
      onboarding: `Crie um checklist de onboarding para:\n${base}\n\nSemana 1 a 4 com: tarefas, responsáveis, materiais, marcos de sucesso.`,
      feedback: `Crie um modelo de feedback de performance para:\n${base}\n\nPontos fortes, áreas de desenvolvimento, metas próximo período, plano de ação.`,
    },
    financeiro: {
      precificacao: `Crie um modelo de precificação para:\n${base}\n\nAnalise: custos, margem desejada, valor percebido, preço de mercado, sugestão de preço e justificativa.`,
      margem: `Calcule margens e lucratividade para:\n${base}\n\nReceita, custos fixos, custos variáveis, margem bruta, margem líquida, ponto de equilíbrio.`,
      projecao: `Crie uma projeção financeira de 12 meses para:\n${base}\n\nMês a mês: receita, custos, lucro. Com cenários otimista, realista e pessimista.`,
      equilibrio: `Calcule o ponto de equilíbrio para:\n${base}\n\nQuantos clientes/vendas precisa, faturamento mínimo, prazo estimado para atingir.`,
      dre: `Crie um DRE simplificado para:\n${base}\n\nReceita bruta, impostos, receita líquida, custos, despesas operacionais, EBITDA, lucro líquido.`,
    },
    criativo: {
      briefing: `Crie um briefing criativo completo para:\n${base}\n\nObjetivo, público, tom, referências, formatos, mensagem chave, CTA, restrições.`,
      direcao_arte: `Crie uma direção de arte para:\n${base}\n\nEstilo visual, paleta de cores, tipografia sugerida, elementos gráficos, mood, referências visuais.`,
      paleta: `Sugira uma paleta de cores para:\n${base}\n\nCor primária, secundária, accent, neutras. Com hex codes, psicologia de cada cor e aplicações.`,
      foto_video: `Sugira estilo de foto e vídeo para:\n${base}\n\nTipos de conteúdo, estilo de fotografia, iluminação, cenários, edição, filtros. Com referências.`,
      criativo_ad: `Crie 5 conceitos de criativos para anúncios:\n${base}\n\nPara cada: conceito visual, copy overlay, formato (imagem/vídeo/carrossel), CTA.`,
    },
    tech: {
      estrutura_site: `Crie a estrutura completa de um site para:\n${base}\n\nPáginas, seções de cada página, hierarquia de conteúdo, CTAs, integrações necessárias.`,
      briefing_sistema: `Crie um briefing técnico de sistema para:\n${base}\n\nRequisitos funcionais, não-funcionais, user stories, integrações, stack sugerida, timeline.`,
      stack: `Sugira a stack tecnológica ideal para:\n${base}\n\nFrontend, backend, banco, hosting, ferramentas. Com justificativa de cada escolha.`,
      user_stories: `Crie user stories para o desenvolvimento de:\n${base}\n\nFormato: "Como [persona], quero [ação] para [benefício]". Priorize por impacto.`,
      checklist_lancamento: `Crie um checklist de lançamento para:\n${base}\n\nPré-lançamento, lançamento, pós-lançamento. SEO, performance, analytics, testes.`,
      seo: `Crie uma estratégia de SEO on-page para:\n${base}\n\nTitle tags, meta descriptions, H1-H6, URLs, internal linking, schema markup. Com exemplos.`,
    },
    produto: {
      curso: `Crie a estrutura completa de um curso/mentoria sobre:\n${base}\n\nMódulos, aulas por módulo, duração, metodologia, materiais de apoio, certificação.`,
      ebook: `Crie o outline de um eBook sobre:\n${base}\n\nCapítulos, subtópicos, gancho de cada capítulo, CTA final. Com sugestão de título.`,
      escada_valor: `Crie uma escada de valor (product ladder) para:\n${base}\n\nDo gratuito ao high-ticket: nome do produto, preço, entrega, objetivo de cada nível.`,
      oferta: `Crie uma oferta irresistível para:\n${base}\n\nProduto principal, bônus, ancoragem de preço, garantia, urgência, stack de valor.`,
      naming: `Crie 10 opções de nome para:\n${base}\n\nPara cada: nome, justificativa, domínio sugerido, tagline.`,
    },
    arque: {
      diagnostico_completo: `Aplique o Método A.R.Q.U.E. completo para diagnosticar:\n${base}\n\nAnalise cada pilar:\nA — Análise & Arquitetura: mapeie a jornada do clique ao caixa\nR — Reconhecimento & Branding: avalie posicionamento e percepção\nQ — Qualificação Autônoma: analise processos de atendimento e qualificação\nU — Unificação Operacional: verifique integração de ferramentas e dados\nE — Escala & Perenidade: avalie capacidade de crescimento sustentável\n\nPara cada pilar: nota de 1-10, diagnóstico, ações prioritárias.`,
      relatorio: `Crie um relatório de consultoria A.R.Q.U.E. para:\n${base}\n\nFormato executivo: resumo, análise por pilar, recomendações top 5, roadmap de implementação, ROI estimado.`,
      plano_acao: `Crie um plano de ação baseado no A.R.Q.U.E. para:\n${base}\n\nPara cada pilar: ações específicas, prazo, responsável, KPI de sucesso, investimento estimado.`,
      comparativo: `Crie um comparativo antes/depois da implementação A.R.Q.U.E.:\n${base}\n\nMétricas atuais vs projetadas: CAC, LTV, ROAS, tempo de resposta, conversão, faturamento.`,
      priorizacao: `Priorize as ações de melhoria para:\n${base}\n\nUse matriz de impacto x esforço. Top 10 ações ordenadas por ROI. Com justificativa.`,
    },
  };

  return prompts[dept]?.[fn] || `Você é especialista em ${dept}. Execute a função "${fn}" com base em:\n${base}\n\nSeja específico, prático e acionável.`;
}
