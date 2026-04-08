"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SlideData {
  headline: string;
  body: string;
}

interface ContentPost {
  id: string;
  date: string;
  day_of_week: string;
  type: string;
  theme: string;
  headline: string;
  body: string;
  caption: string;
  hashtags: string;
  notes: string;
  slides: SlideData[] | null; // for carrossel
  status: string;
  created_at: string;
}

function buildCreateLink(post: ContentPost): string {
  const params = new URLSearchParams();
  if (post.type === "carrossel" && post.slides && post.slides.length > 0) {
    params.set("mode", "carrossel");
    params.set("slides", JSON.stringify(post.slides));
  } else {
    params.set("headline", post.headline || "");
    params.set("body", post.body || "");
  }
  params.set("caption", post.caption || "");
  params.set("hashtags", post.hashtags || "");
  return `/admin/instagram?${params.toString()}`;
}

const STATUS_OPTIONS = [
  { key: "rascunho", label: "Rascunho", color: "bg-white/10 text-white/50" },
  { key: "aprovado", label: "Aprovado", color: "bg-blue-500/20 text-blue-400" },
  { key: "criado", label: "Criado", color: "bg-amber-500/20 text-amber-400" },
  { key: "publicado", label: "Publicado", color: "bg-green-500/20 text-green-400" },
];

const TYPE_COLORS: Record<string, string> = {
  carrossel: "bg-purple-500/20 text-purple-400",
  estatico: "bg-cyan-500/20 text-cyan-400",
  reels: "bg-pink-500/20 text-pink-400",
  stories: "bg-yellow-500/20 text-yellow-400",
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatDateFull(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export default function ConteudoPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<ContentPost | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [viewMode, setViewMode] = useState<"semana" | "calendario" | "lista">("semana");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Generator form
  const [genWeeks, setGenWeeks] = useState("4");
  const [genTheme, setGenTheme] = useState("");
  const [genTone, setGenTone] = useState("profissional e provocativo");
  const [genFreq, setGenFreq] = useState("3x por semana (seg, qua, sex)");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from("content_calendar")
      .select("*")
      .order("date", { ascending: true });
    setPosts((data || []) as ContentPost[]);
    setLoading(false);
  }

  async function generateCalendar() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-calendar",
          weeks: parseInt(genWeeks),
          theme: genTheme,
          tone: genTone,
          frequency: genFreq,
        }),
      });
      const data = await res.json();
      if (data.error) { alert("Erro: " + data.error); return; }

      const rawPosts = data.result?.posts;
      if (!rawPosts || !Array.isArray(rawPosts)) { alert("Resposta inesperada da IA. Tente novamente."); return; }
      const aiPosts = rawPosts;
      if (aiPosts.length === 0) { alert("Nenhum post gerado."); return; }

      // Save to Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inserts = aiPosts.map((p: any) => {
        const isCarousel = p.type === "carrossel";
        // For carrossel, generate 4 slides from the headline/body
        const slides = isCarousel ? (p.slides || [
          { headline: p.headline || "", body: p.body || "" },
          { headline: "Slide 2", body: "Edite este slide" },
          { headline: "Slide 3", body: "Edite este slide" },
          { headline: "CTA Final", body: "Agende seu diagnóstico" },
        ]) : null;
        return {
          date: p.date,
          day_of_week: p.day_of_week || "",
          type: p.type || "estatico",
          theme: p.theme || "",
          headline: p.headline || "",
          body: p.body || "",
          caption: p.caption || "",
          hashtags: p.hashtags || "",
          notes: p.notes || "",
          slides: slides ? JSON.stringify(slides) : null,
          status: "rascunho",
        };
      });

      const { error } = await supabase.from("content_calendar").insert(inserts);
      if (error) { alert("Erro ao salvar: " + error.message); return; }

      await fetchPosts();
      setShowGenerator(false);
    } catch (err) {
      alert("Erro ao gerar calendário. Tente novamente.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function updatePost(id: string, updates: Partial<ContentPost>) {
    // Serialize slides if present
    const toSave = { ...updates };
    if (toSave.slides && typeof toSave.slides !== "string") {
      (toSave as Record<string, unknown>).slides = JSON.stringify(toSave.slides);
    }
    await supabase.from("content_calendar").update(toSave).eq("id", id);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  async function deletePost(id: string) {
    if (!confirm("Excluir este post?")) return;
    await supabase.from("content_calendar").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  async function clearAll() {
    if (!confirm("Excluir TODOS os posts do calendário? Isso não pode ser desfeito.")) return;
    await supabase.from("content_calendar").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setPosts([]);
  }

  // Group posts by week
  const weeks: Record<string, ContentPost[]> = {};
  posts.forEach((p) => {
    const d = new Date(p.date + "T12:00:00");
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(p);
  });

  const glass = "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-[family-name:var(--font-instrument)] text-white">
            Calendário de <span className="italic">Conteúdo</span>
          </h1>
          <p className="text-xs text-white/30 mt-1 uppercase tracking-wider">
            {posts.length} post{posts.length !== 1 ? "s" : ""} planejado{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
            {(["semana", "calendario", "lista"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-4 py-2 text-xs font-semibold transition-all ${viewMode === v ? "bg-white/10 text-white" : "bg-white/[0.02] text-white/30 hover:text-white/60"}`}
              >
                {v === "semana" ? "Semana" : v === "calendario" ? "Calendário" : "Lista"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="bg-[#00FF88] text-black font-semibold rounded-xl px-5 py-2.5 text-xs uppercase tracking-wider hover:bg-[#00FF88]/90 transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Gerar com IA
          </button>
          {posts.length > 0 && (
            <button
              onClick={clearAll}
              className="text-red-400/60 hover:text-red-400 text-xs font-semibold border border-red-400/20 rounded-xl px-4 py-2.5 hover:border-red-400/40 transition-all"
            >
              Limpar Tudo
            </button>
          )}
        </div>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <div className={`${glass} p-6 mb-8`}>
          <h3 className="text-sm font-bold text-white mb-4">Gerar Calendário com IA</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Semanas</label>
              <select
                value={genWeeks}
                onChange={(e) => setGenWeeks(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="1" className="bg-black">1 semana</option>
                <option value="2" className="bg-black">2 semanas</option>
                <option value="4" className="bg-black">4 semanas</option>
                <option value="8" className="bg-black">8 semanas</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Tema Principal</label>
              <input
                value={genTheme}
                onChange={(e) => setGenTheme(e.target.value)}
                placeholder="Ex: automação, IA, processos comerciais..."
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Tom de Voz</label>
              <select
                value={genTone}
                onChange={(e) => setGenTone(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="profissional e provocativo" className="bg-black">Profissional & Provocativo</option>
                <option value="educativo e tecnico" className="bg-black">Educativo & Técnico</option>
                <option value="inspiracional e motivador" className="bg-black">Inspiracional & Motivador</option>
                <option value="casual e proximo" className="bg-black">Casual & Próximo</option>
                <option value="agressivo e direto" className="bg-black">Agressivo & Direto</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Frequência</label>
              <select
                value={genFreq}
                onChange={(e) => setGenFreq(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="3x por semana (seg, qua, sex)" className="bg-black">3x/semana</option>
                <option value="5x por semana (seg a sex)" className="bg-black">5x/semana</option>
                <option value="todos os dias" className="bg-black">Diário</option>
                <option value="2x por semana (ter, qui)" className="bg-black">2x/semana</option>
              </select>
            </div>
          </div>
          <button
            onClick={generateCalendar}
            disabled={generating}
            className="bg-[#00FF88] text-black font-bold rounded-xl px-6 py-3 text-sm hover:bg-[#00FF88]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Gerando calendário...
              </>
            ) : (
              "Gerar Calendário"
            )}
          </button>
        </div>
      )}

      {/* Status summary */}
      {posts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STATUS_OPTIONS.map((s) => {
            const count = posts.filter((p) => p.status === s.key).length;
            return (
              <div key={s.key} className={`${glass} p-4 text-center`}>
                <span className="text-2xl font-bold text-white">{count}</span>
                <span className={`block text-[10px] font-semibold tracking-wider uppercase mt-1 ${s.color.split(" ")[1]}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className={`${glass} p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Editar Post</h3>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Data</label>
                  <input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Tipo</label>
                  <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option value="estatico" className="bg-black">Estático</option>
                    <option value="carrossel" className="bg-black">Carrossel</option>
                    <option value="reels" className="bg-black">Reels</option>
                    <option value="stories" className="bg-black">Stories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Tema</label>
                <input value={editing.theme} onChange={(e) => setEditing({ ...editing, theme: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
              </div>

              {editing.type !== "carrossel" ? (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Headline</label>
                    <textarea value={editing.headline} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} rows={2}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Subtítulo</label>
                    <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={2}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none" />
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Slides do Carrossel</label>
                    <button
                      onClick={() => {
                        const current = editing.slides ? (typeof editing.slides === "string" ? JSON.parse(editing.slides) : editing.slides) : [];
                        setEditing({ ...editing, slides: [...current, { headline: `Slide ${current.length + 1}`, body: "" }] });
                      }}
                      className="text-[10px] text-[#00FF88] font-semibold"
                    >
                      + Slide
                    </button>
                  </div>
                  {(() => {
                    const slidesList: SlideData[] = editing.slides
                      ? (typeof editing.slides === "string" ? JSON.parse(editing.slides) : editing.slides)
                      : [{ headline: editing.headline, body: editing.body }];
                    return slidesList.map((slide, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-white/30">Slide {idx + 1}</span>
                          {slidesList.length > 1 && (
                            <button onClick={() => {
                              const updated = slidesList.filter((_, i) => i !== idx);
                              setEditing({ ...editing, slides: updated });
                            }} className="text-[10px] text-red-400/60 hover:text-red-400">Remover</button>
                          )}
                        </div>
                        <input
                          value={slide.headline}
                          onChange={(e) => {
                            const updated = [...slidesList];
                            updated[idx] = { ...updated[idx], headline: e.target.value };
                            setEditing({ ...editing, slides: updated });
                          }}
                          placeholder="Título do slide"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white outline-none mb-1.5"
                        />
                        <input
                          value={slide.body}
                          onChange={(e) => {
                            const updated = [...slidesList];
                            updated[idx] = { ...updated[idx], body: e.target.value };
                            setEditing({ ...editing, slides: updated });
                          }}
                          placeholder="Subtítulo"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    ));
                  })()}
                </div>
              )}

              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Legenda</label>
                <textarea value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} rows={3}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none" />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Hashtags</label>
                <input value={editing.hashtags} onChange={(e) => setEditing({ ...editing, hashtags: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Notas de produção</label>
                <input value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s.key} onClick={() => setEditing({ ...editing, status: s.key })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${editing.status === s.key ? s.color + " border border-current/30" : "bg-white/[0.04] text-white/30"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  const { id, created_at, ...rest } = editing;
                  await updatePost(id, rest);
                  setEditing(null);
                }}
                className="flex-1 bg-white text-black font-bold rounded-xl py-3 text-sm hover:bg-white/90 transition-colors"
              >
                Salvar
              </button>
              <Link
                href={buildCreateLink(editing)}
                className="flex items-center gap-2 px-5 py-3 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] font-bold rounded-xl text-sm hover:bg-[#00FF88]/20 transition-colors"
              >
                Criar Post
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <button onClick={() => deletePost(editing.id)}
                className="px-4 py-3 text-red-400/60 hover:text-red-400 text-sm font-semibold border border-red-400/20 rounded-xl hover:border-red-400/40 transition-all">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content views */}
      {posts.length === 0 ? (
        <div className={`${glass} p-16 text-center`}>
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-bold text-white mb-2">Nenhum post planejado</h3>
          <p className="text-sm text-white/30 mb-6">Clique em &quot;Gerar com IA&quot; para criar seu calendário de conteúdo automaticamente.</p>
        </div>
      ) : (
        <>
          {/* ═══ CALENDAR VIEW ═══ */}
          {viewMode === "calendario" && (() => {
            const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
            const firstDay = new Date(calYear, calMonth, 1);
            const lastDay = new Date(calYear, calMonth + 1, 0);
            const startDay = firstDay.getDay();
            const totalDays = lastDay.getDate();
            const cells: (number | null)[] = [];
            for (let i = 0; i < startDay; i++) cells.push(null);
            for (let d = 1; d <= totalDays; d++) cells.push(d);
            while (cells.length % 7 !== 0) cells.push(null);

            const postsByDay: Record<number, ContentPost[]> = {};
            posts.forEach((p) => {
              const d = new Date(p.date + "T12:00:00");
              if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
                const day = d.getDate();
                if (!postsByDay[day]) postsByDay[day] = [];
                postsByDay[day].push(p);
              }
            });

            const monthName = new Date(calYear, calMonth).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
                    className="text-white/30 hover:text-white transition-colors text-lg px-3">←</button>
                  <h3 className="text-lg font-[family-name:var(--font-instrument)] text-white capitalize">{monthName}</h3>
                  <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
                    className="text-white/30 hover:text-white transition-colors text-lg px-3">→</button>
                </div>
                <div className="grid grid-cols-7 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
                  {WEEKDAYS.map((wd) => (
                    <div key={wd} className="bg-white/[0.03] p-2 text-center text-[10px] font-bold text-white/30 uppercase tracking-wider">{wd}</div>
                  ))}
                  {cells.map((day, i) => {
                    const dayPosts = day ? (postsByDay[day] || []) : [];
                    const isToday = day && new Date().getDate() === day && new Date().getMonth() === calMonth && new Date().getFullYear() === calYear;
                    return (
                      <div key={i} className={`bg-black/40 min-h-[100px] p-1.5 ${!day ? "opacity-30" : ""} ${isToday ? "ring-1 ring-[#00FF88]/30" : ""}`}>
                        {day && (
                          <>
                            <span className={`text-xs font-bold ${isToday ? "text-[#00FF88]" : "text-white/40"}`}>{day}</span>
                            <div className="mt-1 space-y-0.5">
                              {dayPosts.map((p) => (
                                <div
                                  key={p.id}
                                  onClick={() => setEditing(p)}
                                  className={`text-[8px] font-semibold px-1.5 py-0.5 rounded cursor-pointer truncate ${TYPE_COLORS[p.type] || "bg-white/10 text-white/40"} hover:opacity-80 transition-opacity`}
                                  title={p.theme || p.headline}
                                >
                                  {p.type === "stories" ? "📱" : p.type === "carrossel" ? "📑" : p.type === "reels" ? "🎬" : "📷"} {p.theme || p.headline || p.type}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ═══ LIST VIEW ═══ */}
          {viewMode === "lista" && (
            <div className={`${glass} overflow-hidden`}>
              <div className="grid grid-cols-[100px_80px_1fr_100px_80px_80px] gap-0 text-[10px] font-bold text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
                <div className="p-3">Data</div>
                <div className="p-3">Tipo</div>
                <div className="p-3">Conteúdo</div>
                <div className="p-3">Status</div>
                <div className="p-3">Notas</div>
                <div className="p-3">Ações</div>
              </div>
              {posts.map((post) => (
                <div key={post.id} onClick={() => setEditing(post)}
                  className="grid grid-cols-[100px_80px_1fr_100px_80px_80px] gap-0 border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-all">
                  <div className="p-3 text-xs text-white/50">{formatDate(post.date)}</div>
                  <div className="p-3">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${TYPE_COLORS[post.type] || "bg-white/10 text-white/40"}`}>{post.type}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-white font-semibold truncate">{post.theme || post.headline}</p>
                    <p className="text-[10px] text-white/30 truncate">{post.headline}</p>
                  </div>
                  <div className="p-3">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${STATUS_OPTIONS.find((s) => s.key === post.status)?.color || ""}`}>
                      {STATUS_OPTIONS.find((s) => s.key === post.status)?.label || post.status}
                    </span>
                  </div>
                  <div className="p-3 text-[10px] text-white/20 truncate">{post.notes}</div>
                  <div className="p-3 flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); const next = STATUS_OPTIONS[(STATUS_OPTIONS.findIndex((s) => s.key === post.status) + 1) % STATUS_OPTIONS.length].key; updatePost(post.id, { status: next }); }}
                      className="text-[10px] text-white/30 hover:text-white border border-white/10 rounded px-1.5 py-0.5">↻</button>
                    <Link href={buildCreateLink(post)} onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-[#00FF88]/60 hover:text-[#00FF88] border border-[#00FF88]/20 rounded px-1.5 py-0.5">Criar</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ WEEK VIEW (original) ═══ */}
          {viewMode === "semana" && (
            <div className="space-y-8">
              {Object.entries(weeks).map(([weekKey, weekPosts]) => {
                const weekDate = new Date(weekKey + "T12:00:00");
                const weekEnd = new Date(weekDate);
                weekEnd.setDate(weekDate.getDate() + 6);
                return (
                  <div key={weekKey}>
                    <h3 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/25 mb-3">
                      Semana {formatDate(weekKey)} — {formatDate(weekEnd.toISOString().split("T")[0])}
                    </h3>
                    <div className="grid gap-3">
                      {weekPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setEditing(post)}
                          className={`${glass} p-4 sm:p-5 cursor-pointer hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 text-center min-w-[48px]">
                              <span className="text-xl font-bold text-white block leading-none">
                                {new Date(post.date + "T12:00:00").getDate()}
                              </span>
                              <span className="text-[9px] font-semibold text-white/25 uppercase">
                                {post.day_of_week?.slice(0, 3) || new Date(post.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${TYPE_COLORS[post.type] || "bg-white/10 text-white/40"}`}>
                                  {post.type}
                                </span>
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${STATUS_OPTIONS.find((s) => s.key === post.status)?.color || ""}`}>
                                  {STATUS_OPTIONS.find((s) => s.key === post.status)?.label || post.status}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white truncate">{post.theme || post.headline}</h4>
                              <p className="text-xs text-white/35 truncate mt-0.5">{post.headline}</p>
                              {post.notes && <p className="text-[10px] text-white/20 truncate mt-1 italic">{post.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus = STATUS_OPTIONS[(STATUS_OPTIONS.findIndex((s) => s.key === post.status) + 1) % STATUS_OPTIONS.length].key;
                                  updatePost(post.id, { status: nextStatus });
                                }}
                                className="text-[10px] text-white/30 hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-white/30 transition-all"
                                title="Mudar status"
                              >
                                ↻
                              </button>
                              <Link
                                href={buildCreateLink(post)}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-[#00FF88]/60 hover:text-[#00FF88] border border-[#00FF88]/20 rounded-lg px-2.5 py-1.5 hover:border-[#00FF88]/40 transition-all"
                                title="Criar no editor"
                              >
                                Criar
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
