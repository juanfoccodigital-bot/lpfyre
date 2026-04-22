"use client";

import { useState, useRef, useEffect } from "react";
import { uploadOnboardingFile, createOnboardingBriefing } from "@/lib/supabase";

/* ─── ONBOARDING FORM STEPS (ClinPro + Trafego) ─── */
const ONBOARDING_STEPS = [
  {
    id: "dados_contato",
    title: "Dados de Contato",
    fields: [
      { name: "nome_responsavel", label: "Nome completo do responsavel", type: "text", required: true },
      { name: "cargo", label: "Cargo / funcao na empresa", type: "text", required: true },
      { name: "whatsapp", label: "WhatsApp principal", type: "tel", required: true },
      { name: "whatsapp_secundario", label: "WhatsApp secundario (opcional)", type: "tel", required: false },
      { name: "email", label: "E-mail principal", type: "email", required: true },
      { name: "email_secundario", label: "E-mail secundario (opcional)", type: "email", required: false },
      { name: "horario_contato", label: "Melhor horario para contato", type: "text", required: true },
      { name: "canal_preferido", label: "Prefere contato por (WhatsApp / E-mail / Ligacao)", type: "text", required: true },
    ],
  },
  {
    id: "dados_empresa",
    title: "Dados da Empresa",
    fields: [
      { name: "nome_fantasia", label: "Nome fantasia da empresa", type: "text", required: true },
      { name: "razao_social", label: "Razao social", type: "text", required: false },
      { name: "cnpj", label: "CNPJ", type: "text", required: false },
      { name: "segmento", label: "Segmento de atuacao (ex: clinica odontologica, estetica)", type: "text", required: true },
      { name: "nicho", label: "Nicho especifico dentro do segmento", type: "text", required: true },
      { name: "cidade_estado", label: "Cidade / Estado", type: "text", required: true },
      { name: "filiais", label: "Possui filiais? Se sim, quantas e onde", type: "text", required: false },
      { name: "site", label: "Site da empresa (URL)", type: "url", required: false },
      { name: "instagram", label: "Instagram da empresa", type: "text", required: false },
      { name: "outras_redes", label: "Outras redes sociais ativas", type: "text", required: false },
      { name: "tempo_existencia", label: "Tempo de existencia da empresa", type: "text", required: false },
      { name: "num_funcionarios", label: "Numero de funcionarios", type: "text", required: false },
      { name: "faturamento_medio", label: "Faturamento medio mensal (faixa aproximada)", type: "text", required: false },
    ],
  },
  {
    id: "equipe_projeto",
    title: "Equipe do Projeto",
    fields: [
      { name: "ponto_focal_nome", label: "Ponto focal para duvidas - Nome", type: "text", required: true },
      { name: "ponto_focal_cargo", label: "Ponto focal - Cargo", type: "text", required: true },
      { name: "ponto_focal_whatsapp", label: "Ponto focal - WhatsApp", type: "tel", required: true },
      { name: "validador_nome", label: "Responsavel por validar agentes - Nome", type: "text", required: true },
      { name: "validador_cargo", label: "Validador - Cargo", type: "text", required: true },
      { name: "validador_whatsapp", label: "Validador - WhatsApp", type: "tel", required: true },
      { name: "outros_envolvidos", label: "Outros envolvidos (nome, cargo, contato)", type: "textarea", required: false },
    ],
  },
  {
    id: "sobre_empresa",
    title: "Sobre a Empresa",
    fields: [
      { name: "descricao_empresa", label: "Descreva em 3 a 5 frases o que sua empresa faz", type: "textarea", required: true },
      { name: "problema_principal", label: "Qual e o principal problema que voces resolvem para o cliente?", type: "textarea", required: true },
      { name: "diferenciais", label: "O que diferencia voces da concorrencia?", type: "textarea", required: true },
      { name: "valores_empresa", label: "Quais sao os valores da empresa?", type: "textarea", required: false },
      { name: "slogan", label: "Slogan ou frase de posicionamento", type: "text", required: false },
    ],
  },
  {
    id: "produtos_servicos",
    title: "Produtos e Servicos",
    fields: [
      { name: "produto_1", label: "Produto/Servico 1 - Nome, descricao, preco, duracao, publico", type: "textarea", required: true },
      { name: "produto_2", label: "Produto/Servico 2 (se houver)", type: "textarea", required: false },
      { name: "produto_3", label: "Produto/Servico 3 (se houver)", type: "textarea", required: false },
      { name: "produtos_extras", label: "Mais produtos/servicos (descreva todos)", type: "textarea", required: false },
      { name: "carro_chefe", label: "Qual e o carro-chefe?", type: "text", required: true },
    ],
  },
  {
    id: "publico_alvo",
    title: "Publico-Alvo",
    fields: [
      { name: "cliente_tipico", label: "Quem e o cliente tipico? Descreva o perfil", type: "textarea", required: true },
      { name: "genero", label: "Genero predominante", type: "text", required: false },
      { name: "faixa_etaria", label: "Faixa etaria", type: "text", required: true },
      { name: "classe_social", label: "Classe social / poder aquisitivo", type: "text", required: false },
      { name: "localizacao", label: "Localizacao (local, regional, nacional)", type: "text", required: true },
      { name: "dores_cliente", label: "Principais dores do cliente", type: "textarea", required: true },
      { name: "criterio_escolha", label: "O que o cliente mais valoriza (preco, qualidade, rapidez)?", type: "textarea", required: true },
      { name: "perfil_nao_atender", label: "Perfil de cliente que NAO querem atender", type: "textarea", required: false },
    ],
  },
  {
    id: "trafego_pago",
    title: "Trafego Pago",
    fields: [
      { name: "trafego_investimento_atual", label: "Ja investem em trafego pago? Se sim, quanto por mes?", type: "text", required: true },
      { name: "trafego_plataformas_atuais", label: "Em quais plataformas ja anunciaram? (Google, Meta, TikTok, etc)", type: "text", required: true },
      { name: "trafego_orcamento_mensal", label: "Orcamento mensal disponivel para investir em anuncios (verba de midia)", type: "text", required: true },
      { name: "trafego_objetivo_principal", label: "Objetivo principal dos anuncios (agendamentos, vendas, leads, branding)", type: "text", required: true },
      { name: "trafego_servico_anunciar", label: "Quais servicos/produtos querem anunciar? (por ordem de prioridade)", type: "textarea", required: true },
      { name: "trafego_regiao_alvo", label: "Regiao/cidades alvo dos anuncios (raio de alcance)", type: "text", required: true },
      { name: "trafego_publico_excluir", label: "Algum publico que deve ser EXCLUIDO dos anuncios?", type: "textarea", required: false },
      { name: "trafego_concorrentes", label: "Principais concorrentes na regiao (nomes, sites, instagrams)", type: "textarea", required: false },
      { name: "trafego_sazonalidade", label: "Existe sazonalidade no negocio? Meses fortes e fracos?", type: "textarea", required: false },
      { name: "trafego_ofertas", label: "Ofertas ou promocoes ativas para usar nos anuncios", type: "textarea", required: false },
      { name: "trafego_materiais", label: "Tem fotos/videos profissionais da clinica e equipe? (Sim/Nao - descreva)", type: "textarea", required: true },
      { name: "trafego_social_media", label: "Tem social media? Se sim, quem cuida e com qual frequencia posta?", type: "textarea", required: false },
      { name: "trafego_resultados_anteriores", label: "Resultados de campanhas anteriores (se houver): custo por lead, ROAS, etc", type: "textarea", required: false },
    ],
  },
  {
    id: "captacao_atendimento",
    title: "Captacao e Atendimento Atual",
    fields: [
      { name: "canais_leads", label: "De onde vem os leads hoje? (Instagram, Google, WhatsApp, etc)", type: "textarea", required: true },
      { name: "canal_mais_leads", label: "Qual canal traz MAIS leads?", type: "text", required: true },
      { name: "volume_leads", label: "Volume medio de leads por dia/semana/mes", type: "text", required: true },
      { name: "quem_atende", label: "Quem atende os leads hoje? (nome, cargo, qtd)", type: "textarea", required: true },
      { name: "tempo_resposta", label: "Tempo medio de resposta ao lead atualmente", type: "text", required: true },
      { name: "script_atendimento", label: "Existe script de atendimento? Compartilhe", type: "textarea", required: false },
      { name: "perguntas_frequentes", label: "10 perguntas mais frequentes dos leads", type: "textarea", required: true },
      { name: "objecoes_comuns", label: "Objecoes mais comuns dos leads", type: "textarea", required: true },
      { name: "como_lidam_objecoes", label: "Como lidam com essas objecoes hoje?", type: "textarea", required: false },
    ],
  },
  {
    id: "vendas_agendamento",
    title: "Vendas e Agendamento",
    fields: [
      { name: "processo_venda", label: "Descreva o processo de venda do inicio ao fim", type: "textarea", required: true },
      { name: "taxa_conversao", label: "Taxa de conversao aproximada", type: "text", required: false },
      { name: "ticket_medio", label: "Ticket medio por venda", type: "text", required: true },
      { name: "canal_fechamento", label: "Fechamento por WhatsApp, presencial ou outro?", type: "text", required: true },
      { name: "etapa_perde_leads", label: "Etapa do funil onde perdem mais leads", type: "text", required: false },
      { name: "follow_up_atual", label: "Fazem follow-up com leads que nao responderam? Como?", type: "textarea", required: false },
      { name: "ferramenta_agenda", label: "Ferramenta de agendamento (Google Calendar, sistema, etc)", type: "text", required: false },
      { name: "info_agendamento", label: "Informacoes necessarias para agendar", type: "textarea", required: false },
      { name: "politica_cancelamento", label: "Politica de cancelamento e remarcacao", type: "textarea", required: false },
    ],
  },
  {
    id: "agente_config",
    title: "Configuracao do Agente de I.A",
    fields: [
      { name: "nome_agente", label: "Nome do agente de atendimento (ex: Ana, Luna, Assistente FYRE)", type: "text", required: true },
      { name: "apresentacao_agente", label: "O agente se apresenta como: Assistente virtual / Atendente da equipe", type: "text", required: true },
      { name: "genero_agente", label: "Genero do agente (Feminino / Masculino / Neutro)", type: "text", required: true },
      { name: "tom_voz", label: "Tom de voz (Formal / Profissional amigavel / Informal / Divertido)", type: "text", required: true },
      { name: "uso_emojis", label: "O agente pode usar emojis? (Bastante / Moderado / Nunca)", type: "text", required: true },
      { name: "uso_girias", label: "O agente pode usar girias?", type: "text", required: false },
      { name: "expressoes_usar", label: "Expressoes que sao 'a cara' da empresa e o agente DEVE usar", type: "textarea", required: false },
      { name: "expressoes_nao_usar", label: "Expressoes que o agente NUNCA deve usar", type: "textarea", required: false },
      { name: "horario_funcionamento", label: "Horario de funcionamento do agente (24h ou especifico)", type: "text", required: true },
      { name: "fora_horario", label: "O que fazer fora do horario?", type: "textarea", required: false },
    ],
  },
  {
    id: "escalonamento_faq",
    title: "Escalonamento e FAQ",
    fields: [
      { name: "situacoes_transferir", label: "Em quais situacoes o agente DEVE transferir para humano?", type: "textarea", required: true },
      { name: "transferir_para", label: "Para quem transferir? (nome, cargo, WhatsApp de cada)", type: "textarea", required: true },
      { name: "hierarquia_escalonamento", label: "Hierarquia de escalonamento (primeiro tenta A, depois B...)", type: "textarea", required: false },
      { name: "mensagem_transferencia", label: "Mensagem ao transferir", type: "textarea", required: false },
      { name: "primeira_mensagem", label: "Primeira mensagem que o agente envia ao lead", type: "textarea", required: true },
      { name: "info_coletar", label: "Informacoes obrigatorias a coletar do lead (nome, tel, etc)", type: "textarea", required: true },
      { name: "faq_completo", label: "Perguntas frequentes + respostas EXATAS para o agente", type: "textarea", required: true },
      { name: "politica_precos", label: "O agente pode informar precos? Como?", type: "textarea", required: true },
      { name: "formas_pagamento", label: "Formas de pagamento aceitas", type: "text", required: true },
    ],
  },
  {
    id: "qualificacao",
    title: "Qualificacao e Follow-up",
    fields: [
      { name: "lead_quente", label: "Criterios de lead QUENTE (pronto para comprar)", type: "textarea", required: true },
      { name: "lead_morno", label: "Criterios de lead MORNO", type: "textarea", required: false },
      { name: "lead_frio", label: "Criterios de lead FRIO", type: "textarea", required: false },
      { name: "perguntas_qualificacao", label: "Perguntas de qualificacao para o agente fazer", type: "textarea", required: true },
      { name: "follow_up_timing", label: "Timing dos follow-ups (ex: 1o: 2h, 2o: 24h, 3o: 3 dias)", type: "textarea", required: true },
      { name: "follow_up_mensagens", label: "Mensagens modelo para cada follow-up", type: "textarea", required: true },
      { name: "apos_ultimo_followup", label: "Apos ultimo follow-up sem resposta, o que fazer?", type: "textarea", required: false },
    ],
  },
  {
    id: "pos_venda",
    title: "Pos-Venda e Materiais",
    fields: [
      { name: "mensagem_pos_compra", label: "Mensagem apos compra/atendimento", type: "textarea", required: false },
      { name: "tempo_pos_atendimento", label: "Quanto tempo apos atendimento enviar mensagem?", type: "text", required: false },
      { name: "pedir_avaliacao", label: "Pedir avaliacao? Se sim, qual mensagem e para onde direcionar?", type: "textarea", required: false },
      { name: "cuidados_pos", label: "Orientacoes pos-servico para o cliente", type: "textarea", required: false },
      { name: "ciclo_recompra", label: "Existe ciclo de recompra? Qual?", type: "text", required: false },
      { name: "cross_sell", label: "Sugestoes de cross-sell/upsell", type: "textarea", required: false },
      { name: "programa_indicacao", label: "Programa de indicacao/referral? Como funciona?", type: "textarea", required: false },
      { name: "materiais_enviar", label: "Materiais que o agente pode enviar (catalogo, tabela, fotos, videos)", type: "textarea", required: false },
      { name: "endereco_completo", label: "Endereco completo + link Google Maps + como chegar", type: "textarea", required: true },
      { name: "o_que_nao_fazer", label: "O que o agente NAO pode fazer ou falar?", type: "textarea", required: true },
    ],
  },
  {
    id: "integracoes",
    title: "Integracoes e Sistemas",
    fields: [
      { name: "sistemas_atuais", label: "Sistemas/ferramentas usados hoje (CRM, gestao, agenda, etc)", type: "textarea", required: true },
      { name: "integracao_obrigatoria", label: "Sistemas que PRECISAM integrar com os agentes", type: "textarea", required: false },
      { name: "onde_salvar_dados", label: "Onde os dados dos leads devem ser salvos?", type: "text", required: false },
      { name: "notificacoes", label: "Quando a equipe deve ser notificada? Por qual canal?", type: "textarea", required: true },
      { name: "relatorios", label: "Querem relatorios automaticos? Frequencia e metricas", type: "textarea", required: false },
      { name: "trafego_acesso_meta", label: "Acesso ao Gerenciador de Anuncios do Meta (e-mail admin)", type: "text", required: true },
      { name: "trafego_acesso_google", label: "Acesso ao Google Ads (e-mail admin) - se aplicavel", type: "text", required: false },
      { name: "trafego_pixel_instalado", label: "Pixel do Meta ja instalado no site? (Sim/Nao)", type: "text", required: false },
      { name: "trafego_google_tag", label: "Google Tag Manager instalado? (Sim/Nao)", type: "text", required: false },
      { name: "observacoes_finais", label: "Algo mais que acham importante mencionar?", type: "textarea", required: false },
    ],
  },
];

/* ─── PLAN FEATURES: AI AGENTS ─── */
const AI_FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
    title: "Agente de Atendimento",
    desc: "Responde leads 24h com inteligencia artificial. Saudacao personalizada, coleta de dados e FAQ automatizado.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "Agente de Qualificacao",
    desc: "Classifica leads em quente, morno e frio automaticamente. Perguntas estrategicas para filtrar oportunidades reais.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
      </svg>
    ),
    title: "Agente de Follow-up",
    desc: "Recontata leads que nao responderam em intervalos estrategicos. Nunca mais perca uma venda por falta de acompanhamento.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: "Agente de Confirmacao",
    desc: "Confirma agendamentos automaticamente. Lembretes 24h e 2h antes. Reduz no-show em ate 70%.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    title: "Agente de Pos-Atendimento",
    desc: "Cuida do cliente apos a consulta. Pede avaliacao, envia orientacoes e reativa para retorno.",
  },
];

/* ─── TRAFFIC FEATURES ─── */
const TRAFEGO_FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
      </svg>
    ),
    title: "Gestao de Trafego Pago",
    desc: "Campanhas estrategicas no Meta Ads e Google Ads. Segmentacao precisa para atrair pacientes qualificados da sua regiao.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
      </svg>
    ),
    title: "Otimizacao e Relatorios",
    desc: "Otimizacao semanal de campanhas com base em dados reais. Relatorios mensais com metricas de performance.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Sugestoes para Social Media",
    desc: "Direcionamentos estrategicos de conteudo, pautas e sugestoes para o social media da clinica potencializar os resultados do trafego.",
  },
];

const INCLUDED = [
  { label: "Sistema de Atendimento ClinPro", desc: "Plataforma completa para gestao de atendimento" },
  { label: "5 Agentes de I.A", desc: "Atendimento, Qualificacao, Follow-up, Confirmacao e Pos-Atendimento" },
  { label: "Gestao de Trafego Pago Completa", desc: "Meta Ads + Google Ads com otimizacao semanal e relatorios" },
  { label: "Sugestoes Estrategicas para Social Media", desc: "Direcionamentos de conteudo e pautas para potencializar os resultados" },
  { label: "R$300 em Tokens de I.A/mes", desc: "Incluso no plano. Excedente cobrado na fatura seguinte" },
  { label: "Suporte Prioritario", desc: "Suporte direto via WhatsApp com a equipe FYRE" },
  { label: "Grupo Exclusivo", desc: "Acesso ao grupo de clientes ClinPro para networking e dicas" },
  { label: "Atualizacoes Continuas", desc: "Novas funcionalidades e melhorias sem custo adicional" },
  { label: "Treinamento da Equipe", desc: "Onboarding completo para voce e sua equipe usarem o sistema" },
  { label: "Dashboard de Metricas", desc: "Acompanhe leads, conversoes, agendamentos, ROAS e mais em tempo real" },
];

export default function PropostaDrErick() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<{ nome: string; url: string; tipo: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const newFiles: { nome: string; url: string; tipo: string }[] = [];
    for (const file of Array.from(e.target.files)) {
      const result = await uploadOnboardingFile(file, "drerick");
      if (result) newFiles.push(result);
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    setSending(true);
    try {
      await createOnboardingBriefing({
        cliente_nome: formData.nome_responsavel || "Dr. Erick",
        cliente_empresa: formData.nome_fantasia || "Clinica Dr. Erick",
        cliente_email: formData.email || "",
        cliente_whatsapp: formData.whatsapp || "",
        proposta_ref: "drerick",
        respostas: formData,
        arquivos: files,
        status: "pendente",
      });
      setSubmitted(true);
    } catch {
      alert("Erro ao enviar. Tente novamente.");
    }
    setSending(false);
  };

  const scrollToForm = () => {
    setShowOnboarding(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" ref={topRef}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,43,0.03)_0%,transparent_60%)]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.02] blur-[150px] bg-[#00FF2B]" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full opacity-[0.015] blur-[120px] bg-[#CFFF00]" />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="py-8 sm:py-12 flex items-center justify-between border-b border-white/5">
          <img src="/images/logo-fyre.svg" alt="FYRE" className="h-6 sm:h-7 w-auto" />
          <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/20">Proposta Exclusiva</span>
        </div>

        {/* Hero */}
        <div className="py-16 sm:py-24 text-center border-b border-white/5 reveal">
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
                <defs><path id="cpHero" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" /></defs>
                <text className="fill-white/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
                  <textPath href="#cpHero">CLINPRO + TRAFEGO • CLINPRO + TRAFEGO • </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/images/logo-fyre-circle.png" alt="FYRE" className="w-6 h-auto" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/60">ClinPro</span>
            <span className="text-[10px] text-white/15">+</span>
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#CFFF00]/60">Trafego Pago</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-instrument)] tracking-tight leading-tight">
            Pacientes chegando e <br />
            <span className="text-gradient-fyre italic">convertendo no automatico</span>
          </h1>
          <p className="text-sm sm:text-base font-light text-white/35 mt-6 max-w-xl mx-auto leading-relaxed">
            Trafego pago estrategico para atrair pacientes qualificados + agentes de I.A que atendem, qualificam e convertem 24h por dia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a
              href="https://pay.hub.la/1LJiBPu21htxRizWPbu8"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
            >
              Comecar agora
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <button onClick={scrollToForm} className="cta-button-outline">
              Preencher briefing
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* AI Agents */}
        <div className="py-14 sm:py-20 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2 reveal">Seus Agentes de I.A</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-10 reveal">
            5 agentes trabalhando <span className="text-gradient-fyre italic">por voce</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#00FF2B] mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[11px] font-light text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic */}
        <div className="py-14 sm:py-20 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#CFFF00]/40 block mb-2 reveal">Trafego Pago</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-10 reveal">
            Pacientes chegando <span className="text-gradient-fyre italic">todo dia</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TRAFEGO_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#CFFF00]/[0.08] border border-[#CFFF00]/[0.15] flex items-center justify-center text-[#CFFF00] mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[11px] font-light text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works together */}
          <div className="mt-8 p-5 rounded-2xl border border-white/5 bg-white/[0.02] reveal">
            <h4 className="text-xs font-bold text-white mb-3 text-center">Como funciona junto</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
              {[
                { step: "1", label: "Anuncio atrai o paciente" },
                { step: "2", label: "Agente de I.A atende na hora" },
                { step: "3", label: "Qualifica e agenda automatico" },
                { step: "4", label: "Follow-up e confirmacao" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#00FF2B]/10 border border-[#00FF2B]/20 flex items-center justify-center text-[10px] font-bold text-[#00FF2B]">
                      {s.step}
                    </div>
                    <span className="text-[10px] text-white/50 whitespace-nowrap">{s.label}</span>
                  </div>
                  {i < 3 && (
                    <svg className="w-4 h-4 text-white/10 hidden sm:block mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Everything included */}
        <div className="py-14 sm:py-20 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2 reveal">Tudo Incluso</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-10 reveal">
            O que esta dentro do <span className="text-gradient-fyre italic">seu plano</span>
          </h2>

          <div className="space-y-3">
            {INCLUDED.map((item, i) => (
              <div key={item.label} className="flex items-start gap-4 p-4 sm:p-5 rounded-xl border border-white/5 bg-white/[0.02] reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <div className="w-5 h-5 rounded-full border border-[#00FF2B]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-[#00FF2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{item.label}</h4>
                  <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tokens explanation */}
        <div className="py-14 sm:py-20 border-b border-white/5">
          <div className="glass-card-glow rounded-2xl p-6 sm:p-8 reveal">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00FF2B]/10 border border-[#00FF2B]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#00FF2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">Sobre os Tokens de I.A</h3>
                <p className="text-xs font-light text-white/50 leading-relaxed">
                  Seu plano inclui <span className="text-white font-semibold">R$300 em tokens de I.A por mes</span> para uso dos agentes.
                  Isso cobre o uso normal de uma clinica. Caso o consumo ultrapasse esse valor em algum mes,
                  a diferenca sera <span className="text-white font-medium">cobrada na fatura seguinte</span>, sem surpresas.
                  Voce acompanha o consumo em tempo real pelo dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card-glow rounded-2xl p-6 sm:p-8 mt-4 reveal">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#CFFF00]/10 border border-[#CFFF00]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#CFFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">Sobre a Verba de Midia</h3>
                <p className="text-xs font-light text-white/50 leading-relaxed">
                  O valor do plano <span className="text-white font-medium">nao inclui a verba de midia</span> (o dinheiro investido diretamente nas plataformas de anuncios como Meta e Google).
                  A verba de midia e paga diretamente por voce nas plataformas. Nos cuidamos de toda a gestao, criacao e otimizacao das campanhas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Investment */}
        <div className="py-14 sm:py-20 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2 reveal">Investimento</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-10 reveal">
            Valor do <span className="text-gradient-fyre italic">plano</span>
          </h2>

          <div className="glass-card-glow rounded-2xl p-8 sm:p-10 text-center reveal animate-pulse-glow">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/60">ClinPro</span>
              <span className="text-[10px] text-white/15">+</span>
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#CFFF00]/60">Trafego</span>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-white/30 text-lg font-light">R$</span>
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white">2.497</span>
              <span className="text-white/30 text-sm font-light">/mes</span>
            </div>
            <div className="neon-line max-w-[60px] mx-auto my-6" />
            <p className="text-xs font-light text-white/40 max-w-md mx-auto leading-relaxed">
              Inclui 5 agentes de I.A, sistema ClinPro, gestao de trafego pago completa, sugestoes para social media, R$300 em tokens, suporte, grupo e atualizacoes.
            </p>
            <p className="text-[10px] text-white/25 mt-2">Verba de midia nao inclusa</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a
                href="https://pay.hub.la/1LJiBPu21htxRizWPbu8"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Quero comecar agora
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <button onClick={scrollToForm} className="cta-button-outline">
                Preencher briefing para montagem
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Why FYRE */}
        <div className="py-14 sm:py-20 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2 reveal">Diferenciais</span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-8 reveal">
            Por que a <span className="text-gradient-fyre italic">FYRE</span>
          </h2>
          <div className="space-y-3">
            {[
              { title: "Trafego + I.A na mesma operacao.", desc: "O lead que chega do anuncio e atendido na hora pelo agente. Zero tempo de espera, maxima conversao." },
              { title: "Construimos sistema, nao vendemos pacote.", desc: "Cada agente e campanha sao criados especificamente para o seu negocio. Nada generico." },
              { title: "Voce fica com o ativo.", desc: "Se encerrar, toda a estrutura fica com voce. Zero dependencia." },
              { title: "Dados reais, nao metricas de vaidade.", desc: "Dashboard com CPL, ROAS, taxa de conversao, custo por agendamento e mais." },
              { title: "Suporte humano real.", desc: "Equipe FYRE disponivel para ajustes, duvidas e otimizacoes constantes." },
              { title: "Velocidade de entrega.", desc: "Agentes e campanhas no ar em ate 10 dias uteis apos o briefing." },
            ].map((d, i) => (
              <div key={d.title} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="w-2 h-2 rounded-full bg-[#00FF2B]/30 mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{d.title}</h4>
                  <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ ONBOARDING FORM ═══ */}
        {showOnboarding && (
          <div ref={formRef} className="py-14 sm:py-20 border-b border-white/5">
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 block mb-2">Briefing de Onboarding</span>
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-3">
              Vamos construir seus <span className="text-gradient-fyre italic">agentes e campanhas</span>
            </h2>
            <p className="text-xs font-light text-white/35 mb-8 max-w-lg leading-relaxed">
              Preencha com calma. Cada resposta sera usada na programacao dos agentes de I.A e na criacao das campanhas de trafego pago.
            </p>

            {submitted ? (
              <div className="glass-card-glow rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#00FF2B]/10 border border-[#00FF2B]/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#00FF2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-[family-name:var(--font-instrument)] text-white mb-2">Briefing enviado com sucesso!</h3>
                <p className="text-xs font-light text-white/40 max-w-sm mx-auto">
                  A equipe FYRE ja recebeu suas informacoes e vai comecar a construcao dos seus agentes e campanhas.
                  Entraremos em contato em breve para alinhar os proximos passos.
                </p>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-white/40">
                      Etapa {currentStep + 1} de {ONBOARDING_STEPS.length}
                    </span>
                    <span className="text-[10px] font-medium text-[#00FF2B]/60">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #00FF2B, #CFFF00)",
                      }}
                    />
                  </div>
                </div>

                {/* Step title */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-[10px] text-white/30 mb-6">
                    Campos com <span className="text-[#00FF2B]">*</span> sao obrigatorios
                  </p>

                  <div className="space-y-4">
                    {step.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-[11px] font-medium text-white/50 mb-1.5">
                          {field.label} {field.required && <span className="text-[#00FF2B]">*</span>}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={formData[field.name] || ""}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            rows={4}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#00FF2B]/30 transition-colors resize-none"
                            placeholder="Digite aqui..."
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#00FF2B]/30 transition-colors"
                            placeholder="Digite aqui..."
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* File upload on last step */}
                  {isLastStep && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <label className="block text-[11px] font-medium text-white/50 mb-3">
                        Anexar arquivos (catalogos, fotos da clinica, tabelas de precos, logos, videos)
                      </label>
                      <label className="flex items-center justify-center gap-3 p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] cursor-pointer hover:border-[#00FF2B]/30 transition-colors">
                        <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-xs text-white/30">
                          {uploading ? "Enviando..." : "Clique para selecionar arquivos"}
                        </span>
                        <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                      {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] text-white/40">
                              <svg className="w-3.5 h-3.5 text-[#00FF2B]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                              {f.nome}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                    disabled={currentStep === 0}
                    className="text-xs font-medium text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Anterior
                  </button>

                  {isLastStep ? (
                    <button onClick={handleSubmit} disabled={sending} className="cta-button !w-auto">
                      {sending ? "Enviando..." : "Enviar briefing"}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep((s) => Math.min(ONBOARDING_STEPS.length - 1, s + 1))}
                      className="cta-button !w-auto"
                    >
                      Proximo
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-1.5 mt-8">
                  {ONBOARDING_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? "bg-[#00FF2B] w-6"
                          : i < currentStep
                          ? "bg-[#00FF2B]/30"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="py-10 text-center">
          <img src="/images/logo-fyre.svg" alt="FYRE" className="h-5 w-auto opacity-30 mx-auto mb-4" />
          <p className="text-[9px] text-white/15 tracking-[0.2em] uppercase">
            FYRE Automacao & I.A — Construindo sistemas inteligentes para escalar negocios
          </p>
        </div>
      </div>
    </div>
  );
}
