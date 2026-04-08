"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/admin-auth";

// ─── AGENTS ───

const AGENTS = [
  {
    key: "estrategia",
    name: "Luna",
    role: "Estrategista de Growth",
    icon: "🧠",
    avatar: "L",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=10b981",
    color: "#10b981",
    greeting: "E aí, {user}! Sou a Luna, sua estrategista. Me conta o que tá rolando no negócio que eu te ajudo a destrinchar. 🧠",
    skills: ["Diagnóstico de Negócio", "Plano 90 Dias", "Identificar Gargalos", "Análise SWOT", "Sugerir KPIs"],
    systemPrompt: "Você é Luna, estrategista de growth da FYRE Automação & I.A. Sua personalidade: calma, confiante, fala como uma consultora sênior que já viu de tudo. Usa expressões como 'olha só', 'o ponto é', 'vou ser direta'. Sempre faz perguntas antes de dar diagnóstico. Nunca responde no automático — analisa profundamente. Usa analogias de negócio. Termina respostas longas com 'Quer que eu aprofunde em algum ponto?' ou 'Me conta mais sobre X'. Tom: mentora que realmente se importa.",
  },
  {
    key: "trafego",
    name: "Blaze",
    role: "Gestor de Tráfego",
    icon: "🎯",
    avatar: "B",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Blaze&backgroundColor=f97316",
    color: "#f97316",
    greeting: "Fala, {user}! Blaze aqui. Bora falar de tráfego? Me diz o que precisa que já saio montando. 🎯",
    skills: ["Campanha Meta Ads", "Campanha Google Ads", "Sugerir Públicos", "Analisar Métricas", "Calculadora CAC/ROAS", "Teste A/B"],
    systemPrompt: "Você é Blaze, gestor de tráfego da FYRE. Personalidade: energético, direto, fala rápido como quem tá no meio de uma otimização. Usa 'cara', 'mano', 'olha isso'. Vive falando de números — CTR, CPC, ROAS. Fica animado quando os números são bons, fica irritado com desperdício de verba. Expressões: 'bora escalar isso', 'tá queimando dinheiro aqui', 'esse público tá voando'. Sempre pede budget antes de sugerir qualquer coisa.",
  },
  {
    key: "copy",
    name: "Nina",
    role: "Copywriter Sênior",
    icon: "✍️",
    avatar: "N",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina&backgroundColor=8b5cf6",
    color: "#8b5cf6",
    greeting: "Oi, {user}! Aqui é a Nina, sua copy preferida (modéstia à parte 😄). O que vamos escrever hoje?",
    skills: ["Copy de Anúncio", "Headlines", "Página de Vendas", "Sequência de Emails", "Scripts WhatsApp", "Bio Instagram", "Roteiro VSL"],
    systemPrompt: "Você é Nina, copywriter sênior da FYRE. Personalidade: criativa, um pouco dramática, apaixonada por palavras. Fala como quem tá sempre tendo uma ideia genial. Usa 'ai que delícia de headline', 'essa copy tá fraca, vou turbinar', 'o segredo é o hook'. Sempre entrega 3 variações e pergunta qual preferiu. Adora provocar: 'confia em mim, essa aqui vai converter'. Tom: artista que entende de vendas.",
  },
  {
    key: "social",
    name: "Mia",
    role: "Social Media Manager",
    icon: "📱",
    avatar: "M",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=ec4899",
    color: "#ec4899",
    greeting: "Oii {user}! Mia aqui ✨ Bora criar conteúdo incrível? Me conta o que você precisa!",
    skills: ["Calendário de Conteúdo", "Ideias de Posts", "Legendas Prontas", "Roteiro de Reels", "Sequência de Stories", "Análise de Perfil", "Hashtags"],
    systemPrompt: "Você é Mia, social media da FYRE. Personalidade: jovem, antenada, fala com naturalidade. Usa 'genteee', 'isso tá muito bom', 'tendência'. Entende de algoritmo e engajamento. Sugere trends do momento. Fala em 'viralizar', 'engajamento', 'constância'. Sempre pensa em formatos: 'isso seria perfeito pra reels' ou 'faz um carrossel com isso'. Tom: amiga criativa que manja de rede social.",
  },
  {
    key: "automacao",
    name: "Axel",
    role: "Especialista em Automação",
    icon: "🤖",
    avatar: "A",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Axel&backgroundColor=06b6d4",
    color: "#06b6d4",
    greeting: "E aí {user}! Axel na área. Tem algum processo manual te incomodando? Porque eu AMO automatizar essas coisas. 🤖",
    skills: ["Fluxo de Automação", "Script de Chatbot", "Sequência Follow-up", "Sugerir Integrações", "Prompt Engineering", "Fluxo de Qualificação"],
    systemPrompt: "Você é Axel, especialista em automação da FYRE. Personalidade: nerd de processos, fala como engenheiro. Usa 'trigger', 'workflow', 'webhook'. Fica empolgado quando vê um processo manual: 'isso aqui a gente automatiza em 10 minutos'. Sempre desenha fluxos passo a passo. Expressões: 'bora automatizar', 'zero trabalho manual', 'deixa a máquina trabalhar'. Tom: engenheiro apaixonado por eficiência.",
  },
  {
    key: "vendas",
    name: "Kael",
    role: "Closer de Vendas",
    icon: "💰",
    avatar: "K",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kael&backgroundColor=22c55e",
    color: "#22c55e",
    greeting: "Fala, {user}! Kael aqui, seu closer favorito. Bora fechar negócio ou treinar pitch? 💰",
    skills: ["Script de Vendas", "Simular Objeções", "Texto de Proposta", "Follow-up", "Pitch de Elevador", "Script Cold Call", "Roleplay (Treino)"],
    systemPrompt: "Você é Kael, closer de vendas da FYRE. Personalidade: carismático, confiante, fala como vendedor nato. Usa 'parceiro', 'vamo fechar', 'a objeção não é o problema, a falta de valor é'. Conhece o ProspectaFYRE de cor. No roleplay, vira um cliente difícil de verdade — cético, faz objeções reais, não facilita. Expressões: 'esse deal tá no bolso', 'nunca perde a venda no follow-up'. Tom: mentor de vendas que já fechou milhões.",
  },
  {
    key: "rh",
    name: "Iris",
    role: "Head de People",
    icon: "🧑‍💼",
    avatar: "I",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Iris&backgroundColor=3b82f6",
    color: "#3b82f6",
    greeting: "Olá, {user}! Iris aqui. Me conta: precisa de ajuda com people, contratação ou onboarding?",
    skills: ["Descrição de Vaga", "Perguntas de Entrevista", "Avaliar Candidato", "Checklist Onboarding", "Feedback de Performance"],
    systemPrompt: "Você é Iris, head de people da FYRE. Personalidade: empática, organizada, fala com cuidado. Usa 'olha, o mais importante é o fit cultural', 'vamos estruturar isso'. Se preocupa com as pessoas mas é exigente com resultados. Expressões: 'cultura come estratégia no café da manhã', 'a pessoa certa no lugar certo muda tudo'. Tom: líder de RH humanizada que não aceita mediocridade.",
  },
  {
    key: "financeiro",
    name: "Rex",
    role: "Controller Financeiro",
    icon: "📊",
    avatar: "R",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rex&backgroundColor=eab308",
    color: "#eab308",
    greeting: "Oi {user}. Rex aqui. Me passa os números que eu analiso. Sem número, sem resposta 📊",
    skills: ["Precificação", "Cálculo de Margem", "Projeção 12 Meses", "Ponto de Equilíbrio", "DRE Simplificado"],
    systemPrompt: "Você é Rex, controller financeiro da FYRE. Personalidade: sério, preciso, fala em números. Usa 'me passa os dados', 'margem tá apertada', 'vamos olhar o cenário'. Nunca responde sem número — sempre pede dados. Fica desconfortável com achismo. Expressões: 'número não mente', 'vou rodar 3 cenários', 'cuidado com o fluxo de caixa'. Tom: CFO confiável que protege o dinheiro.",
  },
  {
    key: "criativo",
    name: "Zara",
    role: "Diretora de Arte",
    icon: "🎨",
    avatar: "Z",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara&backgroundColor=d946ef",
    color: "#d946ef",
    greeting: "Oi {user}! Zara aqui 🎨 Qual projeto criativo vamos desenvolver? Me inspira!",
    skills: ["Briefing Criativo", "Direção de Arte", "Paleta de Cores", "Estilo Foto/Vídeo", "Conceitos de Criativos"],
    systemPrompt: "Você é Zara, diretora de arte da FYRE. Personalidade: artística, visual, fala com referências. Usa 'imagina isso', 'a vibe é', 'clean e moderno'. Pensa em cores, tipografia, composição. Sempre descreve visuais de forma vivida. Expressões: 'menos é mais', 'o design comunica antes da copy', 'esse mood tá perfeito'. Tom: diretora criativa que traduz conceitos em visual.",
  },
  {
    key: "tech",
    name: "Dev",
    role: "Tech Lead",
    icon: "🌐",
    avatar: "D",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev&backgroundColor=0ea5e9",
    color: "#0ea5e9",
    greeting: "Fala {user}! Dev aqui. O que vamos buildar hoje? 🌐",
    skills: ["Estrutura de Site", "Briefing de Sistema", "Sugerir Stack", "User Stories", "Checklist de Lançamento", "Estratégia SEO"],
    systemPrompt: "Você é Dev, tech lead da FYRE. Personalidade: pragmático, focado, fala como dev sênior. Usa 'vamo buildar', 'qual o stack?', 'isso escala'. Prefere Next.js + Supabase + Tailwind. Pensa em performance, DX e deploy. Expressões: 'ship fast', 'isso resolve com um webhook', 'já deployou?'. Tom: dev que resolve rápido e documenta depois.",
  },
  {
    key: "produto",
    name: "Edu",
    role: "Product Manager",
    icon: "📦",
    avatar: "E",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edu&backgroundColor=f59e0b",
    color: "#f59e0b",
    greeting: "E aí {user}! Edu aqui. Tá pensando em lançar algo? Curso, eBook, oferta? Me conta! 📦",
    skills: ["Estrutura de Curso", "Outline de eBook", "Escada de Valor", "Oferta Irresistível", "Naming de Produto"],
    systemPrompt: "Você é Edu, product manager da FYRE. Personalidade: visionário, estratégico, fala em oportunidades. Usa 'o mercado tá pedindo isso', 'o LTV dessa escada é brutal', 'validou a oferta?'. Pensa em MRR, churn, upsell. Expressões: 'produto bom se vende sozinho... com o funil certo', 'escada de valor é o caminho'. Tom: PM que conecta produto com receita.",
  },
  {
    key: "arque",
    name: "Arque",
    role: "Consultor A.R.Q.U.E.",
    icon: "📋",
    avatar: "Q",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arque&backgroundColor=00FF88",
    color: "#00FF88",
    greeting: "Olá {user}. Sou o Arque, consultor do Método A.R.Q.U.E. Vou analisar seu negócio pilar por pilar. Me conta sobre a empresa. 📋",
    skills: ["Diagnóstico Completo", "Relatório Executivo", "Plano de Ação", "Comparativo Antes/Depois", "Priorização de Ações"],
    systemPrompt: "Você é Arque, consultor sênior do Método A.R.Q.U.E. da FYRE. Personalidade: sábio, metódico, fala como consultor premium. Usa 'vamos analisar pilar por pilar', 'a nota do seu R tá baixa', 'aqui tá o gargalo'. Sempre avalia os 5 pilares com nota de 1-10. Nunca dá resposta superficial. Expressões: 'estrutura antes de velocidade', 'o diagnóstico não mente', 'escala sem base desmorona'. Tom: consultor que cobra caro porque entrega resultado.",
  },
];

const CONVERSATION_RULES = "\n\nREGRAS DE CONVERSA:\n- Fale de forma natural, como num WhatsApp com um colega de trabalho\n- Use parágrafos curtos (2-3 linhas max)\n- NÃO use markdown headers (##) em conversas casuais — só quando entregar um trabalho formal\n- Faça perguntas de volta pra manter o diálogo\n- Reaja ao que o usuário disse ('boa!', 'entendi', 'hmm, interessante')\n- Se o pedido for vago, PERGUNTE antes de responder — não assuma\n- Quando entregar um trabalho (copy, script, plano), aí sim formate bem com markdown\n- Misture informalidade com profissionalismo\n- Nunca responda com mais de 400 palavras a menos que seja um entregável";

// ─── TYPES ───

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  saved?: boolean;
  attachments?: {name: string, type: string, dataUrl: string}[];
}

// ─── MARKDOWN RENDERER ───

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function renderMarkdown(text: string) {
  const html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-white/5 border border-white/10 rounded-lg p-4 my-3 overflow-x-auto"><code class="text-sm text-emerald-300">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-emerald-300 px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-5 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-white/30">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="ml-2 my-0.5">$1</div>')
    .replace(/\n{2,}/g, '<div class="h-3"></div>')
    .replace(/\n/g, "<br/>");
  return sanitizeHtml(html);
}

// ─── TYPING INDICATOR ───

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
}

// ─── PAGE COMPONENT ───

export default function TimeIAPage() {
  const [selectedAgent, setSelectedAgent] = useState<(typeof AGENTS)[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"fyre" | "cliente" | "generico">("fyre");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [attachments, setAttachments] = useState<{name: string, type: string, dataUrl: string}[]>([]);
  const [convoFilter, setConvoFilter] = useState<"mine" | "all">("mine");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get session on mount
  useEffect(() => {
    const s = getSession();
    setSession(s);
  }, []);

  // Fetch clients on mount
  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase
        .from("clients")
        .select("id, nome, empresa, servicos, especialidade")
        .eq("status", "ativo");
      if (data) setClients(data);
    }
    fetchClients();
  }, []);

  // Fetch saved conversations
  useEffect(() => {
    async function fetchConversations() {
      const { data } = await supabase
        .from("ai_outputs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setSavedConversations(data);
    }
    fetchConversations();
  }, []);

  // Fetch ai_conversations (filtered by user or all)
  useEffect(() => {
    async function fetchConvos() {
      let query = supabase
        .from("ai_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (convoFilter === "mine" && session?.id) {
        query = query.eq("created_by", session.id);
      }
      const { data } = await query;
      if (data) setConversations(data);
    }
    fetchConvos();
  }, [convoFilter, session]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Select agent
  function handleSelectAgent(agent: (typeof AGENTS)[0]) {
    setSelectedAgent(agent);
    setActiveConversationId(null);
    const greeting = agent.greeting.replace("{user}", session?.display_name?.split(" ")[0] || "");
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "agent",
        content: greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
    setAttachments([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // Load a saved conversation
  function handleLoadConversation(conv: any) {
    const agent = AGENTS.find((a) => a.key === conv.agent_key);
    if (!agent) return;
    setSelectedAgent(agent);
    setActiveConversationId(conv.id);
    setMessages(conv.messages || []);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // Delete a conversation
  async function handleDeleteConversation(convId: string) {
    await supabase.from("ai_conversations").delete().eq("id", convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConversationId === convId) {
      setActiveConversationId(null);
      setMessages([]);
      setSelectedAgent(null);
    }
  }

  // New conversation
  function handleNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setAttachments([]);
    if (selectedAgent) {
      const greeting = selectedAgent.greeting.replace("{user}", session?.display_name?.split(" ")[0] || "");
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: greeting,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }

  // Back to home
  function handleBack() {
    setSelectedAgent(null);
    setMessages([]);
    setInput("");
    setActiveConversationId(null);
  }

  // Handle file attachment
  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [...prev, { name: file.name, type: file.type, dataUrl: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  // Send message
  async function handleSend(customMessage?: string) {
    const msg = customMessage || input.trim();
    if ((!msg && attachments.length === 0) || !selectedAgent || loading) return;

    // Build content with attachments
    let fullContent = msg;
    const currentAttachments = [...attachments];
    if (currentAttachments.length > 0) {
      const attachmentLabels = currentAttachments.map((a) =>
        a.type.startsWith("image/") ? `[Imagem anexada: ${a.name}]` : `[Arquivo anexado: ${a.name}]`
      ).join("\n");
      fullContent = fullContent ? `${fullContent}\n\n${attachmentLabels}` : attachmentLabels;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: fullContent,
      timestamp: new Date().toISOString(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    setLoading(true);

    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const chatMessages = newMessages.map((m) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/ai/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          agent: selectedAgent.key,
          agentSystemPrompt: selectedAgent.systemPrompt + CONVERSATION_RULES,
          messages: chatMessages,
          mode,
          clientContext: mode === "cliente" ? selectedClient : null,
          userName: session?.display_name || "usuário",
        }),
      });

      const data = await res.json();
      const agentReply: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        content: data.output || data.error || "Sem resposta",
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, agentReply];
      setMessages((prev) => [...prev, agentReply]);

      // Auto-save conversation
      try {
        if (activeConversationId) {
          await supabase
            .from("ai_conversations")
            .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
            .eq("id", activeConversationId);
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversationId ? { ...c, messages: updatedMessages, updated_at: new Date().toISOString() } : c))
          );
        } else {
          const { data } = await supabase
            .from("ai_conversations")
            .insert({
              agent_key: selectedAgent.key,
              title: msg.slice(0, 60),
              messages: updatedMessages,
              created_by: session?.id,
            })
            .select()
            .single();
          if (data) {
            setActiveConversationId(data.id);
            setConversations((prev) => [data, ...prev]);
          }
        }
      } catch {}
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: "Erro de conexão. Tente novamente.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Skill chip click
  function handleSkillClick(skill: string) {
    handleSend(`Preciso de ajuda com: ${skill}`);
  }

  // Copy message
  function handleCopy(msg: Message) {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Save message to Supabase
  async function handleSave(msg: Message) {
    const session = getSession();
    await supabase.from("ai_outputs").insert({
      department: selectedAgent?.key,
      function_name: "chat",
      inputs: { conversation: messages.map((m) => ({ role: m.role, content: m.content })) },
      output: msg.content,
      client_id: mode === "cliente" ? selectedClient?.id : null,
      created_by: session?.id,
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, saved: true } : m))
    );
  }

  // Delete message
  function handleDelete(msgId: string) {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  }

  // Edit message
  function handleEditStart(msg: Message) {
    setEditingMsg(msg.id);
    setEditText(msg.content);
  }

  function handleEditSave(msgId: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, content: editText } : m))
    );
    setEditingMsg(null);
    setEditText("");
  }

  // Refine last response
  function handleRefine() {
    handleSend("Refine e melhore a última resposta. Seja mais detalhado e específico.");
  }

  // Key handler for textarea
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  // ─── CHAT VIEW ───
  if (selectedAgent) {
    return (
      <div className="flex h-[calc(100vh-80px)] bg-black">
        {/* Mobile sidebar overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } fixed md:relative md:translate-x-0 z-40 md:z-auto w-[280px] h-full bg-black/95 md:bg-white/[0.02] border-r border-white/10 flex flex-col transition-transform duration-200`}
        >
          {/* Sidebar header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <button
              onClick={handleNewConversation}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: "rgba(0,255,136,0.12)", color: "#00FF88", fontFamily: "Montserrat, sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Nova Conversa
            </button>
            <button
              onClick={() => setShowSidebar(false)}
              className="ml-2 md:hidden text-white/40 hover:text-white/70 p-1"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.5 4.5l-9 9M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Conversation filter toggle */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5">
            <button
              onClick={() => setConvoFilter("mine")}
              className={`flex-1 text-[10px] py-1.5 rounded-lg transition-colors ${convoFilter === "mine" ? "bg-white/10 text-white/70" : "text-white/25 hover:text-white/40"}`}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Minhas Conversas
            </button>
            <button
              onClick={() => setConvoFilter("all")}
              className={`flex-1 text-[10px] py-1.5 rounded-lg transition-colors ${convoFilter === "all" ? "bg-white/10 text-white/70" : "text-white/25 hover:text-white/40"}`}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Todas
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2">
            {conversations.length === 0 && (
              <div className="text-center text-white/20 text-xs py-8 px-4">Nenhuma conversa salva</div>
            )}
            {conversations.map((conv) => {
              const agent = AGENTS.find((a) => a.key === conv.agent_key);
              return (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-white/[0.08] border border-white/10"
                      : "hover:bg-white/[0.04] border border-transparent"
                  }`}
                  onClick={() => handleLoadConversation(conv)}
                >
                  {agent?.avatarUrl ? (
                    <img src={agent.avatarUrl} alt={agent.name} className="w-7 h-7 rounded-full flex-shrink-0" />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0"
                      style={{ backgroundColor: agent?.color || "#666" }}
                    >
                      {agent?.avatar || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 text-xs font-medium truncate" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      {conv.title || "Sem título"}
                    </div>
                    <div className="text-white/25 text-[10px]">
                      {agent?.name} &middot; {new Date(conv.updated_at || conv.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1 flex-shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile sidebar */}
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden text-white/50 hover:text-white transition-colors p-1"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              <button
                onClick={handleBack}
                className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Voltar
              </button>
              <div className="w-px h-5 bg-white/10" />
              {selectedAgent.avatarUrl ? (
                <img src={selectedAgent.avatarUrl} alt={selectedAgent.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
                  style={{ backgroundColor: selectedAgent.color }}
                >
                  {selectedAgent.avatar}
                </div>
              )}
              <div>
                <span className="text-white font-semibold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {selectedAgent.name}
                </span>
                <span className="text-white/40 text-xs ml-2">{selectedAgent.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode indicator */}
              <span
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{
                  borderColor: mode === "fyre" ? "#00FF88" : mode === "cliente" ? "#f97316" : "#6b7280",
                  color: mode === "fyre" ? "#00FF88" : mode === "cliente" ? "#f97316" : "#9ca3af",
                  backgroundColor: mode === "fyre" ? "rgba(0,255,136,0.08)" : mode === "cliente" ? "rgba(249,115,22,0.08)" : "rgba(107,114,128,0.08)",
                }}
              >
                {mode === "fyre" ? "FYRE" : mode === "cliente" ? selectedClient?.nome || "Cliente" : "Genérico"}
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-[10%] py-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {msg.role === "agent" ? (
                /* Agent message */
                <div
                  className="flex gap-3 group"
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => setHoveredMsg(null)}
                >
                  {selectedAgent.avatarUrl ? (
                    <img src={selectedAgent.avatarUrl} alt={selectedAgent.name} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-black mt-1"
                      style={{ backgroundColor: selectedAgent.color }}
                    >
                      {selectedAgent.avatar}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/30 mb-1.5 font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      {selectedAgent.name}
                    </div>
                    {editingMsg === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white/80 text-sm resize-none focus:outline-none focus:border-white/30 min-h-[100px]"
                          rows={5}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSave(msg.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingMsg(null)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="rounded-2xl rounded-tl-md px-4 py-3 text-sm text-white/70 leading-relaxed border border-white/[0.06]"
                        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
                      >
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      </div>
                    )}

                    {/* Skill chips after greeting */}
                    {idx === 0 && msg.role === "agent" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedAgent.skills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleSkillClick(skill)}
                            className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                            style={{
                              borderColor: selectedAgent.color + "40",
                              color: selectedAgent.color,
                              background: selectedAgent.color + "10",
                            }}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message actions */}
                    {editingMsg !== msg.id && (
                      <div
                        className="flex items-center gap-1 mt-2 transition-opacity duration-200"
                        style={{ opacity: hoveredMsg === msg.id ? 1 : 0 }}
                      >
                        <button
                          onClick={() => handleCopy(msg)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                        >
                          {copiedId === msg.id ? "Copiado!" : "Copiar"}
                        </button>
                        <button
                          onClick={() => handleSave(msg)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                        >
                          {msg.saved ? "Salvo" : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleEditStart(msg)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-white/30 hover:text-red-400/60 hover:bg-red-500/10 transition-colors"
                        >
                          Excluir
                        </button>
                        {idx === messages.length - 1 && (
                          <button
                            onClick={handleRefine}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-white/30 hover:text-emerald-400/60 hover:bg-emerald-500/10 transition-colors"
                          >
                            Refinar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* User message */
                <div className="flex justify-end">
                  <div className="max-w-[75%]">
                    {/* Attachment thumbnails */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 justify-end">
                        {msg.attachments.map((att, ai) =>
                          att.type.startsWith("image/") ? (
                            <img
                              key={ai}
                              src={att.dataUrl}
                              alt={att.name}
                              className="w-32 h-32 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setExpandedImage(att.dataUrl)}
                            />
                          ) : (
                            <div key={ai} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-white/50">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 1H3a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V4L7 1z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              {att.name}
                            </div>
                          )
                        )}
                      </div>
                    )}
                    <div className="rounded-2xl rounded-tr-md px-4 py-3 text-sm text-white/90 leading-relaxed bg-white/[0.08] border border-white/[0.06]">
                      {msg.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <img src={selectedAgent.avatarUrl} alt={selectedAgent.name} className="w-8 h-8 rounded-full" />
              <div className="bg-white/[0.03] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/40">{selectedAgent.name} está digitando</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-white/10 bg-black/80 backdrop-blur-xl px-4 md:px-6 lg:px-[10%] py-3">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group">
                  {att.type.startsWith("image/") ? (
                    <img src={att.dataUrl} alt={att.name} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-white/50">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 1H3a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V4L7 1z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {att.name}
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2 focus-within:border-white/20 transition-colors">
            {/* File upload */}
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileAttach}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white/30 hover:text-white/60 p-1.5 flex-shrink-0 transition-colors"
              title="Anexar arquivo"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15.75 8.625l-7.08 7.08a4.125 4.125 0 01-5.835-5.835l7.08-7.08a2.75 2.75 0 013.89 3.89l-7.072 7.071a1.375 1.375 0 01-1.944-1.944l6.543-6.544" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para ${selectedAgent.name}...`}
              className="flex-1 bg-transparent text-white/80 text-sm placeholder-white/20 resize-none focus:outline-none max-h-[160px] py-1.5"
              rows={2}
              disabled={loading}
            />
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20"
                style={{
                  backgroundColor: (input.trim() || attachments.length > 0) ? "#00FF88" : "transparent",
                  color: (input.trim() || attachments.length > 0) ? "#000" : "rgba(255,255,255,0.2)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-white/15">Shift + Enter para nova linha</span>
            {input.length > 0 && <span className="text-[10px] text-white/15">{input.length}</span>}
          </div>
        </div>
        </div>{/* end main chat area */}

        {/* Expanded image modal */}
        {expandedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-pointer"
            onClick={() => setExpandedImage(null)}
          >
            <img src={expandedImage} alt="Imagem expandida" className="max-w-full max-h-full object-contain rounded-xl" />
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
              onClick={() => setExpandedImage(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── HOME VIEW ───
  return (
    <div className="min-h-[calc(100vh-80px)] bg-black px-4 md:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-4xl md:text-5xl text-white mb-3"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Time I.A
        </h1>
        <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Converse com especialistas de IA treinados no método FYRE
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
          {(
            [
              { key: "fyre", label: "FYRE", emoji: "🔥" },
              { key: "cliente", label: "Cliente", emoji: "👤" },
              { key: "generico", label: "Genérico", emoji: "🌐" },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-xs px-4 py-2 rounded-full transition-all ${
                mode === m.key
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/50"
              }`}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Client dropdown */}
        {mode === "cliente" && (
          <select
            value={selectedClient?.id || ""}
            onChange={(e) => {
              const c = clients.find((cl) => cl.id === e.target.value);
              setSelectedClient(c || null);
            }}
            className="text-xs bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-white/60 focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <option value="" className="bg-black">Selecionar cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-black text-white">
                {c.nome} — {c.empresa}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 max-w-7xl mx-auto mb-12">
        {AGENTS.map((agent) => (
          <button
            key={agent.key}
            onClick={() => handleSelectAgent(agent)}
            className="group relative p-4 rounded-2xl border border-white/[0.06] text-left transition-all duration-300 hover:border-white/15 hover:scale-[1.02]"
            style={{
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${agent.color}10, transparent 70%)`,
              }}
            />
            <div className="relative">
              {agent.avatarUrl ? (
                <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full mb-3" />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black mb-3"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.avatar}
                </div>
              )}
              <div
                className="text-white font-semibold text-sm mb-0.5"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {agent.name}
              </div>
              <div className="text-white/30 text-[11px] mb-2">{agent.role}</div>
              <div className="text-white/15 text-[10px]">
                {agent.skills.length} skills
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent conversations */}
      {savedConversations.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-white/50 text-xs uppercase tracking-widest mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Conversas Recentes
          </h2>
          <div className="space-y-2">
            {savedConversations.map((conv: any) => {
              const agent = AGENTS.find((a) => a.key === conv.department);
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    if (agent) {
                      handleSelectAgent(agent);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                >
                  {agent?.avatarUrl ? (
                    <img src={agent.avatarUrl} alt={agent.name} className="w-7 h-7 rounded-full flex-shrink-0" />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                      style={{ backgroundColor: agent?.color || "#666" }}
                    >
                      {agent?.avatar || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white/60 text-xs font-medium truncate">
                      {agent?.name || conv.department} — {conv.function_name}
                    </div>
                    <div className="text-white/20 text-[11px] truncate">
                      {conv.output?.slice(0, 80)}...
                    </div>
                  </div>
                  <div className="text-white/15 text-[10px] flex-shrink-0">
                    {new Date(conv.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
