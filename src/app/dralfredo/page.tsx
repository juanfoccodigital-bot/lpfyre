"use client";

import { useState, useRef, useEffect } from "react";

/* ─── TYPES ─── */
interface WaMsg {
  from: "patient" | "bot";
  msg: string;
  time: string;
  delay?: number;
}

/* ─── CONVERSATIONS ─── */
const atendimentoMsgs: WaMsg[] = [
  { from: "patient", msg: "Oi boa tarde", time: "14:02" },
  { from: "bot", msg: "Boa tarde! 😊 Seja bem-vindo(a) à clínica do Dr. Alfredo!", time: "14:02" },
  { from: "bot", msg: "Como posso te ajudar hoje?", time: "14:02" },
  { from: "patient", msg: "Queria saber sobre implante dentario", time: "14:03" },
  { from: "bot", msg: "Ótimo! O Dr. Alfredo é especialista em implantes dentários 🦷", time: "14:03" },
  { from: "bot", msg: "Só pra eu entender melhor sua situação, me conta:\n\nÉ pra você ou pra outra pessoa?", time: "14:03" },
  { from: "patient", msg: "Pra mim mesmo", time: "14:03" },
  { from: "bot", msg: "Entendi! E qual a sua situação atual?\n\n1️⃣ Perdi um ou mais dentes\n2️⃣ Uso prótese e quero trocar por implante\n3️⃣ Tenho dente comprometido\n4️⃣ Quero saber valores", time: "14:03" },
  { from: "patient", msg: "4", time: "14:04" },
  { from: "bot", msg: "O valor do implante varia de acordo com cada caso. O Dr. Alfredo faz uma avaliação personalizada pra definir o melhor tratamento 👨‍⚕️", time: "14:04" },
  { from: "bot", msg: "A avaliação inicial é gratuita e sem compromisso!", time: "14:04" },
  { from: "bot", msg: "Pra eu agendar, preciso de algumas informações:\n\n📋 Seu nome completo?\n📱 Telefone pra contato?", time: "14:04" },
  { from: "patient", msg: "Carlos Eduardo, 41 98765-1234", time: "14:05" },
  { from: "bot", msg: "Perfeito Carlos! ✅", time: "14:05" },
  { from: "bot", msg: "Qual dia e horário fica melhor pra você?\n\n📅 Temos disponibilidade:\n• Segunda a sexta: 8h às 18h\n• Sábado: 8h às 12h", time: "14:05" },
  { from: "patient", msg: "Terça feira de manha pode ser?", time: "14:05" },
  { from: "bot", msg: "Terça de manhã — anotado! 📝", time: "14:06" },
  { from: "bot", msg: "Resumo:\n\n👤 Carlos Eduardo\n📱 41 98765-1234\n🦷 Implante dentário — avaliação\n📅 Terça-feira pela manhã\n\nA equipe do Dr. Alfredo vai confirmar o horário exato em instantes!", time: "14:06" },
  { from: "bot", msg: "Enquanto isso, tem alguma dúvida sobre o procedimento? Posso te explicar como funciona 😊", time: "14:06" },
];

const faqMsgs: WaMsg[] = [
  { from: "patient", msg: "Oi doutor fiz implante ontem", time: "21:45" },
  { from: "bot", msg: "Olá! Que bom que fez seu implante com o Dr. Alfredo! 😊\n\nComo está se sentindo?", time: "21:45" },
  { from: "patient", msg: "To bem mas to com duvida", time: "21:45" },
  { from: "patient", msg: "Posso comer feijao?", time: "21:46" },
  { from: "bot", msg: "Boa pergunta! Sobre alimentação pós-implante:\n\n🚫 Nas primeiras 48h evite alimentos duros e muito quentes\n\n⚠️ Feijão: pode sim, mas amassadinho e em temperatura morna, tá? Nada de feijão fervendo 😅\n\n✅ Prefira alimentos pastosos nos primeiros dias", time: "21:46" },
  { from: "patient", msg: "E carne posso comer?", time: "21:47" },
  { from: "bot", msg: "Nos primeiros 3-4 dias, evite carnes que precisem de muita mastigação (churrasco, bife) 🥩\n\n✅ Pode: carne moída, frango desfiado, peixe\n🚫 Evite: carnes duras, churrasco, costela\n\nDepois de 5-7 dias já pode voltar ao normal, com cuidado na região do implante!", time: "21:47" },
  { from: "patient", msg: "Cerveja pode? Kkk", time: "21:48" },
  { from: "bot", msg: "Hahaha essa é clássica! 🍺😄\n\n🚫 Álcool é contraindicado nos primeiros 7 dias, Carlos. Ele pode:\n\n• Interferir na cicatrização\n• Reagir com a medicação\n• Aumentar sangramento\n\nAguenta firme uma semana que depois tá liberado! 💪", time: "21:48" },
  { from: "patient", msg: "E sorvete?", time: "21:49" },
  { from: "bot", msg: "Sorvete PODE sim! ✅🍦\n\nInclusive gelado ajuda a reduzir o inchaço. Mas atenção:\n\n✅ Sorvete de massa, picolé\n⚠️ Evite casquinha crocante\n🚫 Nada de morder o picolé na região do implante\n\nCome pela lateral oposta ao implante 😉", time: "21:49" },
  { from: "patient", msg: "Boa haha obrigado doutor", time: "21:50" },
  { from: "bot", msg: "Imagina Carlos! Qualquer dúvida é só mandar aqui, tô disponível 24h 😊\n\nLembra dos cuidados:\n💊 Tome a medicação nos horários certos\n🧊 Gelo nas primeiras 48h (20min sim, 20min não)\n😴 Durma com a cabeça elevada\n\nBoa recuperação! 🙏", time: "21:50" },
];

/* ─── INTERACTIVE CHAT COMPONENT ─── */
function LiveChat() {
  const [msgs, setMsgs] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Olá! Sou o assistente virtual do Dr. Alfredo 👨‍⚕️" },
    { role: "bot", text: "Pode me perguntar qualquer coisa sobre implantes, procedimentos, pós-operatório, valores..." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("https://fyre-back.vercel.app/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer demo" },
        body: JSON.stringify({
          agentSystemPrompt: `Voce e o assistente virtual do Dr. Alfredo, dentista especialista em implantes dentarios e harmonizacao facial.

REGRAS:
- Responda como um assistente de clinica odontologica, amigavel e profissional
- Use emojis com moderacao
- Seja direto mas acolhedor
- Se perguntarem sobre valores, diga que varia por caso e ofereça avaliacao gratuita
- Se perguntarem sobre pos-operatorio/alimentacao, de orientacoes praticas
- Se for algo urgente ou dor forte, oriente a ligar pro consultorio
- Se o paciente quiser agendar, colete: nome, telefone, preferencia de dia/horario
- Responda em mensagens curtas e naturais, como no WhatsApp
- NUNCA invente procedimentos ou prometa resultados
- Mantenha respostas em ate 3-4 linhas quando possivel`,
          messages: [...msgs.map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })), { role: "user", content: userMsg }],
          mode: "generico",
        }),
      });
      const data = await res.json();
      setMsgs((prev) => [...prev, { role: "bot", text: data.output || "Desculpe, tive um problema. Tente novamente!" }]);
    } catch {
      setMsgs((prev) => [...prev, { role: "bot", text: "Ops, houve um erro de conexão. Tente novamente!" }]);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0b141a] shadow-2xl">
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00a884]/20 flex items-center justify-center text-sm">🤖</div>
        <div>
          <p className="text-sm font-semibold text-white/90">Assistente Dr. Alfredo</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
            <p className="text-[10px] text-[#00a884]">ao vivo — teste agora</p>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2 h-[380px] overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 ${m.role === "user" ? "bg-[#005c4b] rounded-tr-none" : "bg-[#1f2c34] rounded-tl-none"}`}>
              <p className="text-[12.5px] text-white/85 whitespace-pre-line leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1f2c34] rounded-lg rounded-tl-none px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Teste: pergunte sobre implantes..."
          className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none"
        />
        <button onClick={send} disabled={!input.trim() || loading} className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#00c49a] disabled:opacity-30 flex items-center justify-center transition-all">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── WHATSAPP MOCKUP (animated) ─── */
function WhatsAppDemo({ messages, title, subtitle }: { messages: WaMsg[]; title: string; subtitle: string }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(0);
    let i = 0;
    const show = () => {
      if (i >= messages.length) return;
      i++;
      setVisibleCount(i);
      setTimeout(show, messages[i - 1]?.from === "bot" ? 800 : 500);
    };
    const t = setTimeout(show, 600);
    return () => clearTimeout(t);
  }, [messages]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount]);

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0b141a] shadow-2xl">
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00a884]/20 flex items-center justify-center text-sm">🤖</div>
        <div>
          <p className="text-sm font-semibold text-white/90">{title}</p>
          <p className="text-[10px] text-[#00a884]">{subtitle}</p>
        </div>
      </div>
      <div ref={containerRef} className="p-3 space-y-1.5 h-[420px] overflow-y-auto">
        {messages.slice(0, visibleCount).map((m, i) => (
          <div key={i} className={`flex ${m.from === "patient" ? "justify-end" : "justify-start"}`} style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div className={`max-w-[85%] rounded-lg px-3 py-1.5 ${m.from === "patient" ? "bg-[#005c4b] rounded-tr-none" : "bg-[#1f2c34] rounded-tl-none"}`}>
              <p className="text-[12px] text-white/85 whitespace-pre-line leading-relaxed">{m.msg}</p>
              <p className="text-[8px] text-white/25 text-right mt-0.5 flex items-center justify-end gap-1">
                {m.time}
                {m.from === "patient" && <svg className="w-3 h-3 text-[#53bdeb]" viewBox="0 0 16 15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" /></svg>}
              </p>
            </div>
          </div>
        ))}
        {visibleCount < messages.length && (
          <div className="flex justify-start">
            <div className="bg-[#1f2c34] rounded-lg rounded-tl-none px-4 py-2.5">
              <span className="text-[10px] text-[#00a884] italic">digitando...</span>
            </div>
          </div>
        )}
      </div>
      <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
          <span className="text-[11px] text-white/20">Mensagem</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00a884]/50 flex items-center justify-center">
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>
        </div>
      </div>
    </div>
  );
}

/* ─── PLANS ─── */
const plans = [
  {
    id: "essencial",
    name: "Essencial",
    price: "1.297",
    tag: null,
    desc: "Atendimento automatico no WhatsApp 24h com IA treinada para sua clinica.",
    ideal: "Parar de perder pacientes por demora no atendimento",
    includes: [
      "1 Agente de IA no WhatsApp (atendimento + qualificacao)",
      "Resposta automatica em segundos, 24h por dia",
      "Qualificacao inteligente de pacientes",
      "Coleta de dados (nome, telefone, procedimento, horario)",
      "Transferencia para equipe com contexto completo",
      "Follow-up automatico em 24h, 48h e 72h",
      "Confirmacao automatica de consultas",
      "Notificacao instantanea para a equipe",
      "FYRE CRM com 1 pipeline + 2 usuarios",
      "FyreMax — IA pra criar conteudo e scripts",
      "Grupo exclusivo no WhatsApp com equipe FYRE",
      "Reuniao mensal de 45 min + relatorio",
    ],
    not: ["FAQ inteligente", "Reposicionamento digital", "Gestao de trafego"],
  },
  {
    id: "profissional",
    name: "Profissional",
    price: "1.997",
    tag: "Recomendado",
    desc: "Duas automacoes: atendimento de novos pacientes + FAQ de nutricao/pos-operatorio.",
    ideal: "Automatizar atendimento e acabar com perguntas repetitivas",
    includes: [
      "Tudo do Essencial +",
      "Agente de Atendimento avancado (scoring de pacientes)",
      "Agendamento automatico de consultas",
      "Agente FAQ Inteligente — numero dedicado",
      "Pacientes tiram duvidas 24h (\"posso comer X?\", \"posso fazer Y?\")",
      "Base de conhecimento com protocolos do Dr. Alfredo",
      "Nutricao pos-operatoria personalizada",
      "Follow-up ate 7 etapas",
      "Recuperacao de pacientes inativos (30 dias)",
      "Lembrete e confirmacao automatica",
      "FYRE CRM com 2 pipelines + 5 usuarios",
      "FyreMax — 3 acessos",
      "Dashboard diario + relatorio mensal detalhado",
    ],
    not: ["Gestao de trafego", "Reposicionamento digital"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "2.997",
    tag: "Completo",
    desc: "Automacao completa + reposicionamento no digital + trafego pago a partir do 2o mes.",
    ideal: "Dominar o digital e lotar a agenda com previsibilidade",
    includes: [
      "Tudo do Profissional +",
      "Reposicionamento digital completo",
      "12 posts profissionais/mes (arte + copy)",
      "Roteiros de video e ideias de Reels",
      "Identidade visual alinhada ao posicionamento",
      "Gestao de trafego pago (a partir do 2o mes)",
      "Campanhas Meta Ads segmentadas por procedimento",
      "Otimizacao continua de campanhas",
      "Automacao de marketing por segmento",
      "FYRE CRM completo + 10 usuarios",
      "FyreMax — 5 acessos",
      "Dashboard em tempo real + relatorio semanal",
      "Acesso ao FYRE Hub",
    ],
    not: [],
  },
];

/* ─── PAGE ─── */
export default function DrAlfredoPage() {
  const [activePlan, setActivePlan] = useState("profissional");
  const [activeDemo, setActiveDemo] = useState<"atendimento" | "faq" | "live">("atendimento");
  const [demoKey, setDemoKey] = useState(0);

  const switchDemo = (d: "atendimento" | "faq" | "live") => {
    setActiveDemo(d);
    setDemoKey((k) => k + 1);
  };

  return (
    <main className="min-h-screen bg-[#060606] text-white">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pb-16 pt-20 sm:pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-fyre/[0.04] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fyre/20 bg-fyre/[0.06] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-fyre animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-fyre/80">Apresentacao Exclusiva — Dr. Alfredo</span>
          </div>

          <h1 className="font-[family-name:var(--font-instrument)] text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
            Sua clinica no <span className="italic text-fyre">automatico</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm font-light text-white/35 leading-relaxed">
            Atendimento por IA 24h, FAQ inteligente pra pacientes e gestao completa.
            Construimos isso sob medida pra voce.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-white/30">
            {["Resposta em segundos", "24 horas por dia", "Pacientes qualificados", "Zero paciente perdido"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-fyre/60" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEMOS ─── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="text-center mb-8">
          <h2 className="font-[family-name:var(--font-instrument)] text-2xl sm:text-3xl tracking-tight">
            Veja <span className="italic text-fyre">funcionando</span>
          </h2>
          <p className="mt-2 text-xs text-white/25">Isso aqui a gente realmente construiu</p>

          <div className="mt-6 inline-flex items-center gap-1 rounded-xl bg-white/[0.03] border border-white/[0.05] p-1">
            {[
              { id: "atendimento" as const, label: "Atendimento" },
              { id: "faq" as const, label: "FAQ Nutricao" },
              { id: "live" as const, label: "🟢 Testar ao Vivo" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchDemo(tab.id)}
                className={`px-4 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                  activeDemo === tab.id
                    ? tab.id === "live" ? "bg-[#00a884] text-white" : "bg-fyre text-white"
                    : "text-white/35 hover:text-white/55"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Mockup */}
          <div>
            {activeDemo === "live" ? (
              <LiveChat />
            ) : activeDemo === "atendimento" ? (
              <WhatsAppDemo key={demoKey} messages={atendimentoMsgs} title="Assistente Dr. Alfredo" subtitle="online — atendimento automatico" />
            ) : (
              <WhatsAppDemo key={demoKey} messages={faqMsgs} title="FAQ Dr. Alfredo" subtitle="online — duvidas pos-operatorio" />
            )}
            {activeDemo !== "live" && (
              <button onClick={() => setDemoKey((k) => k + 1)} className="mt-3 mx-auto flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/40 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                Repetir animacao
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-5">
            {activeDemo === "live" ? (
              <>
                <div className="p-4 rounded-xl bg-[#00a884]/[0.06] border border-[#00a884]/20">
                  <h3 className="text-sm font-bold text-[#00a884] mb-1">Teste ao vivo</h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Esse chat esta conectado a uma IA real configurada como assistente do Dr. Alfredo.
                    Pergunte sobre implantes, precos, pos-operatorio, alimentacao...
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-white/20 font-semibold uppercase tracking-wider">Sugestoes de perguntas:</p>
                  {[
                    "Quanto custa um implante?",
                    "Fiz implante ontem, posso comer churrasco?",
                    "Quero agendar uma avaliacao",
                    "Posso tomar cafe quente apos o procedimento?",
                    "Quanto tempo demora pra cicatrizar?",
                    "Vocês parcelam?",
                  ].map((q) => (
                    <p key={q} className="text-[11px] text-white/30 pl-3 border-l border-white/[0.06]">{q}</p>
                  ))}
                </div>
              </>
            ) : activeDemo === "atendimento" ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Agente de Atendimento</h3>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Paciente manda mensagem a qualquer hora — a IA responde em segundos,
                    entende o que ele precisa, qualifica e agenda. Sua equipe so recebe o lead pronto.
                  </p>
                </div>
                {[
                  { icon: "⚡", t: "Resposta instantanea", d: "Nenhum paciente espera mais de 3 segundos" },
                  { icon: "🧠", t: "Entende o contexto", d: "Sabe sobre implantes, harmonizacao, precos, horarios" },
                  { icon: "📋", t: "Coleta dados naturalmente", d: "Nome, telefone, procedimento, horario — sem parecer formulario" },
                  { icon: "🔔", t: "Notifica sua equipe na hora", d: "Lead qualificado chega pronto pra confirmar" },
                  { icon: "🔄", t: "Follow-up automatico", d: "Nao respondeu? A IA tenta em 24h, 48h e 72h" },
                ].map((item) => (
                  <div key={item.t} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-white/75">{item.t}</p>
                      <p className="text-[10px] text-white/30">{item.d}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">FAQ Inteligente — Nutricao & Pos-Operatorio</h3>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Numero dedicado pra pacientes tirarem duvidas. "Posso comer feijao?", "Cerveja pode?",
                    "Quando posso treinar?" — a IA responde baseada nos seus protocolos.
                  </p>
                </div>
                {[
                  { icon: "🍽️", t: "Orientacao nutricional personalizada", d: "Baseada nos protocolos reais do Dr. Alfredo" },
                  { icon: "🕐", t: "Disponivel 24h — inclusive de madrugada", d: "Paciente com duvida as 3h da manha? A IA responde" },
                  { icon: "😊", t: "Tom humano e acolhedor", d: "Responde com empatia, humor leve e emojis naturais" },
                  { icon: "👨‍⚕️", t: "Escalonamento inteligente", d: "Duvida grave ou dor? Direciona pro contato do Dr." },
                  { icon: "📉", t: "Reduz 80% das mensagens repetitivas", d: "Sua equipe foca no que importa" },
                ].map((item) => (
                  <div key={item.t} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-white/75">{item.t}</p>
                      <p className="text-[10px] text-white/30">{item.d}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── FLOW ─── */}
      <section className="border-t border-white/[0.04] py-16">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center font-[family-name:var(--font-instrument)] text-2xl sm:text-3xl tracking-tight mb-10">
            Como <span className="italic text-fyre">funciona</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { s: "01", t: "Paciente manda mensagem", d: "Qualquer hora do dia", i: "📱" },
              { s: "02", t: "IA responde em segundos", d: "Qualifica e coleta dados", i: "🤖" },
              { s: "03", t: "Equipe recebe o lead", d: "Com todo o contexto pronto", i: "🔔" },
              { s: "04", t: "Consulta agendada", d: "Follow-up garante conversao", i: "✅" },
            ].map((s) => (
              <div key={s.s} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-xl block mb-2">{s.i}</span>
                <span className="text-[8px] font-bold text-fyre/30 tracking-[0.3em]">{s.s}</span>
                <h4 className="text-[11px] font-semibold mt-1 mb-0.5">{s.t}</h4>
                <p className="text-[9px] text-white/25">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLANS ─── */}
      <section className="border-t border-white/[0.04] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-instrument)] text-2xl sm:text-3xl tracking-tight">
              Escolha o <span className="italic text-fyre">plano ideal</span>
            </h2>
            <p className="mt-2 text-xs text-white/25">Tres opcoes pensadas pro momento da sua clinica</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 sm:hidden">
            {plans.map((p) => (
              <button key={p.id} onClick={() => setActivePlan(p.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activePlan === p.id ? "bg-fyre text-white" : "bg-white/[0.04] text-white/30"}`}
              >{p.name}</button>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                plan.tag === "Recomendado" ? "border-fyre/30 bg-gradient-to-b from-fyre/[0.07] to-transparent shadow-[0_0_40px_rgba(255,69,0,0.06)]"
                : plan.tag === "Completo" ? "border-orange-400/20 bg-gradient-to-b from-orange-500/[0.05] to-transparent"
                : "border-white/[0.05] bg-white/[0.015]"
              } ${activePlan !== plan.id ? "hidden sm:flex" : "flex"}`}>
                {plan.tag && (
                  <div className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${
                    plan.tag === "Recomendado" ? "bg-fyre text-white" : "bg-orange-500 text-white"
                  }`}>{plan.tag}</div>
                )}

                <h3 className="text-base font-bold">{plan.name}</h3>
                <p className="text-[10px] text-white/25 mt-0.5 mb-4">{plan.ideal}</p>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-[10px] text-white/25">R$</span>
                  <span className="font-[family-name:var(--font-instrument)] text-3xl tracking-tight">{plan.price}</span>
                  <span className="text-[10px] text-white/25">/mes</span>
                </div>

                <p className="text-[11px] text-white/30 font-light mb-5 leading-relaxed">{plan.desc}</p>

                <a href={`https://wa.me/5541997246413?text=Ola%20Juan%2C%20tenho%20interesse%20no%20plano%20${plan.name}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`mb-5 block rounded-xl py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] transition-all ${
                    plan.tag === "Recomendado" ? "bg-fyre text-white hover:bg-fyre-dark" : "border border-white/10 text-white/70 hover:bg-white hover:text-black"
                  }`}
                >Quero esse plano</a>

                <div className="space-y-1.5 flex-1">
                  {plan.includes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg className="w-3 h-3 text-fyre/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      <span className="text-[10px] text-white/40 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>

                {plan.not.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-1.5">
                    <span className="text-[8px] font-bold text-white/10 uppercase tracking-wider">Nao inclui</span>
                    {plan.not.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="w-3 h-3 text-white/8 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        <span className="text-[10px] text-white/15">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY FYRE ─── */}
      <section className="border-t border-white/[0.04] py-16">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center font-[family-name:var(--font-instrument)] text-2xl sm:text-3xl tracking-tight mb-8">
            Por que a <span className="italic text-fyre">FYRE</span>?
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { t: "Nao somos agencia", d: "Somos empresa de tecnologia. Construimos sistemas que ficam com voce." },
              { t: "IA treinada pro seu negocio", d: "Nao e bot generico. A IA sabe seus procedimentos, precos e protocolos." },
              { t: "Tudo na nossa infra", d: "CRM, IA, automacoes — seguro e controlado na infraestrutura FYRE." },
              { t: "Suporte real no WhatsApp", d: "Grupo exclusivo com nossa equipe. Sem ticket, sem fila." },
            ].map((item) => (
              <div key={item.t} className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                <h4 className="text-xs font-bold mb-1 text-white/80">{item.t}</h4>
                <p className="text-[10px] text-white/30 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-white/[0.04] py-20 relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fyre/[0.04] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-5 text-center">
          <h2 className="font-[family-name:var(--font-instrument)] text-3xl sm:text-4xl tracking-tight mb-3">
            Vamos <span className="italic text-fyre">comecar</span>?
          </h2>
          <p className="text-sm text-white/25 font-light mb-8">
            Essa solucao foi construida exclusivamente para sua clinica, Dr. Alfredo.
          </p>
          <a href="https://wa.me/5541997246413?text=Ola%20Juan%2C%20quero%20comecar%20com%20a%20automacao!"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-fyre hover:bg-fyre-dark text-white font-bold text-xs uppercase tracking-[0.14em] px-8 py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(255,69,0,0.2)]"
          >
            QUERO COMECAR AGORA
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
          <p className="mt-12 text-[8px] text-white/8 tracking-[0.3em] uppercase">FYRE Automacao & I.A</p>
        </div>
      </section>
    </main>
  );
}
