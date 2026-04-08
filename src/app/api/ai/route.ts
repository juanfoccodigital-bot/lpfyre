import { NextRequest, NextResponse } from "next/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { action, prompt, topic, mode } = body;

  // Generate post text + caption
  if (action === "generate-text") {
    const systemPrompt = `Você é um especialista em social media para a FYRE Automação & I.A, uma empresa de tecnologia especializada em automação e inteligência artificial.

Tom de voz: Direto, técnico com clareza, confiante e provocativo. Use dados quando possível. Nunca use "somos a melhor agência" — a FYRE é empresa de tecnologia, não agência.

Cores da marca: Verde neon (#00FF88), verde profundo (#0A3D2A), preto.
Nome vem de Firefly (vagalume) — luz própria, precisão, destaque.

Responda em JSON válido com:
{
  "headline": "Texto curto e impactante para o post (max 8 palavras)",
  "body": "Texto complementar para o post (1-2 frases curtas)",
  "caption": "Legenda completa do Instagram com emojis, hashtags e CTA. Max 300 caracteres.",
  "hashtags": "#fyre #fyreautomacao #automacao + 5 hashtags relevantes"
}`;

    const userPrompt = mode === "carrossel"
      ? `Crie conteúdo para um CARROSSEL de Instagram sobre: ${topic}. Gere 4 slides. Responda em JSON com array "slides" onde cada slide tem "headline" e "body", mais "caption" e "hashtags" gerais.`
      : `Crie conteúdo para um POST ESTÁTICO de Instagram sobre: ${topic}`;

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
          response_format: { type: "json_object" },
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      return NextResponse.json({ result: JSON.parse(content || "{}") });
    } catch (err) {
      return NextResponse.json({ error: "Erro ao gerar texto", details: String(err) }, { status: 500 });
    }
  }

  // Generate image with DALL-E
  if (action === "generate-image") {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Professional dark background image for Instagram post (portrait 4:5 ratio). Theme: ${prompt}. Style: modern, minimal, dark with subtle green neon accents (#00FF88). No text in the image. High quality, cinematic photography feel. Portrait orientation.`,
          n: 1,
          size: "1024x1792",
          quality: "hd",
        }),
      });

      const data = await res.json();
      const imageUrl = data.data?.[0]?.url;
      if (!imageUrl) {
        return NextResponse.json({ error: "Imagem não gerada", details: data }, { status: 500 });
      }
      return NextResponse.json({ imageUrl });
    } catch (err) {
      return NextResponse.json({ error: "Erro ao gerar imagem", details: String(err) }, { status: 500 });
    }
  }

  // Generate content calendar
  if (action === "generate-calendar") {
    const { weeks, theme, tone, frequency } = body;
    const systemPrompt = `Você é o estrategista de conteúdo da FYRE Automação & I.A — empresa de tecnologia especializada em automação e inteligência artificial.

A FYRE:
- Vem de Firefly (vagalume) — luz própria, precisão, destaque
- Cores: verde neon #00FF88, preto, branco
- Tom: direto, técnico com clareza, confiante, provocativo
- Público: empresários que faturam R$50k+/mês, querem escalar com estrutura
- Serviços: Automação & IA, Automação Comercial, Sistemas & CRM Sob Medida, Sites & Estrutura Digital, Projetos de Automação, FYRE HUB (SaaS)
- Diferenciais: não é agência, constrói sistema, dados reais, cliente fica com o ativo

Crie um calendário de postagens para Instagram.

Responda em JSON com:
{
  "posts": [
    {
      "date": "2026-03-25",
      "day_of_week": "Terça",
      "type": "carrossel" | "estatico" | "reels" | "stories",
      "theme": "titulo do tema",
      "headline": "texto principal do post (max 8 palavras)",
      "body": "texto complementar (1-2 frases)",
      "caption": "legenda completa com emojis e CTA (max 300 chars)",
      "hashtags": "#fyre + 5 hashtags relevantes",
      "notes": "dica de produção ou referência visual"
    }
  ]
}`;

    const userPrompt = `Crie um calendário de ${weeks || 4} semanas de conteúdo para Instagram.
Tema principal: ${theme || "marketing digital e crescimento empresarial"}
Tom de voz: ${tone || "profissional e provocativo"}
Frequência: ${frequency || "3x por semana (seg, qua, sex)"}
Começando a partir de amanhã.
Cada post deve ser variado entre educativo, provocativo, case/prova social, bastidor e CTA direto.`;

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
          temperature: 0.85,
          response_format: { type: "json_object" },
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      return NextResponse.json({ result: JSON.parse(content || "{}") });
    } catch (err) {
      return NextResponse.json({ error: "Erro ao gerar calendário", details: String(err) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
