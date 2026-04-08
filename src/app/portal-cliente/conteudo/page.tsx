"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";

interface ContentPost {
  id: string;
  client_id: string;
  image_url: string | null;
  caption: string;
  scheduled_date: string;
  status: string;
  feedback: string | null;
  post_type?: string;
  texto_arte?: string;
  direcao_criativa?: string;
  designer?: string;
  created_at: string;
  updated_at: string;
}

const POST_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  estatico: { label: "Estatico", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  carrossel: { label: "Carrossel", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  video: { label: "Video", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  reels: { label: "Reels", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  stories: { label: "Stories", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

function isVideoUrl(url: string | null, postType?: string): boolean {
  if (postType === "video" || postType === "reels") return true;
  if (!url) return false;
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url);
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  em_analise: { label: "Em Analise", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  aprovado: { label: "Aprovado", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  em_progresso: { label: "Em Progresso", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  agendado: { label: "Agendado", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  postado: { label: "Postado", color: "bg-white/10 text-white/40 border-white/10" },
};

const STATUS_ORDER = ["em_analise", "aprovado", "em_progresso", "agendado", "postado"];

type ViewMode = "lista" | "calendario" | "cards";

export default function ConteudoPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [feedback, setFeedback] = useState("");
  const [updating, setUpdating] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente/login");
      return;
    }

    async function fetchPosts() {
      const { data } = await supabase
        .from("client_content")
        .select("*")
        .eq("client_id", session!.client_id)
        .order("scheduled_date", { ascending: true });
      setPosts((data as ContentPost[]) || []);
      setLoading(false);
    }

    fetchPosts();
  }, [router]);

  async function handleUpdateStatus(postId: string, newStatus: string, comment?: string) {
    setUpdating(true);
    const updatePayload: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
    if (comment !== undefined) updatePayload.feedback = comment;

    const { error } = await supabase
      .from("client_content")
      .update(updatePayload)
      .eq("id", postId);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, status: newStatus, feedback: comment ?? p.feedback } : p
        )
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => prev ? { ...prev, status: newStatus, feedback: comment ?? prev.feedback } : null);
      }
    }
    setUpdating(false);
  }

  function groupByStatus(items: ContentPost[]) {
    const groups: Record<string, ContentPost[]> = {};
    for (const status of STATUS_ORDER) {
      const filtered = items.filter((p) => p.status === status);
      if (filtered.length > 0) groups[status] = filtered;
    }
    const remaining = items.filter((p) => !STATUS_ORDER.includes(p.status));
    if (remaining.length > 0) groups["outros"] = remaining;
    return groups;
  }

  // Calendar helpers
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function navigateMonth(dir: number) {
    let newMonth = calMonth + dir;
    let newYear = calYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCalMonth(newMonth);
    setCalYear(newYear);
  }

  const MONTH_NAMES = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const glassCard = "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredPosts = posts.filter((p) => {
    if (typeFilter !== "todos" && p.post_type !== typeFilter) return false;
    if (statusFilter !== "todos" && p.status !== statusFilter) return false;
    return true;
  });
  const grouped = groupByStatus(filteredPosts);

  // Calendar: posts indexed by date string "YYYY-MM-DD"
  const postsByDate: Record<string, ContentPost[]> = {};
  filteredPosts.forEach((p) => {
    const dateKey = p.scheduled_date?.split("T")[0];
    if (dateKey) {
      if (!postsByDate[dateKey]) postsByDate[dateKey] = [];
      postsByDate[dateKey].push(p);
    }
  });

  function openPost(post: ContentPost) {
    setSelectedPost(post);
    setFeedback(post.feedback || "");
  }

  // ---- RENDER: Calendar View ----
  function renderCalendar() {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfWeek(calYear, calMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h3 className="text-sm font-bold text-white tracking-wider uppercase font-[family-name:var(--font-montserrat)]">
            {MONTH_NAMES[calMonth]} {calYear}
          </h3>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-white/20 uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="min-h-[80px]" />;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayPosts = postsByDate[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().split("T")[0];

            return (
              <div
                key={dateStr}
                className={`min-h-[80px] rounded-xl p-1.5 border transition-all ${
                  isToday
                    ? "bg-white/[0.06] border-white/[0.12]"
                    : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
                }`}
              >
                <span className={`text-[10px] font-bold ${isToday ? "text-white" : "text-white/30"}`}>
                  {day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayPosts.map((post) => {
                    const typeConf = post.post_type ? POST_TYPE_CONFIG[post.post_type] : null;
                    const statusConf = STATUS_CONFIG[post.status];
                    return (
                      <button
                        key={post.id}
                        onClick={() => openPost(post)}
                        className={`w-full text-left px-1.5 py-0.5 rounded-md text-[9px] font-semibold truncate border transition-all hover:opacity-80 ${statusConf?.color || "bg-white/10 text-white/40 border-white/10"}`}
                        title={post.texto_arte || post.caption}
                      >
                        {typeConf && <span className="mr-1">{typeConf.label.charAt(0)}</span>}
                        {post.texto_arte || post.caption?.slice(0, 20) || "Post"}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- RENDER: List View ----
  function renderList() {
    return (
      <div className={`${glassCard} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Data", "Tipo", "Texto na Arte", "Legenda", "Status", "Acoes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-montserrat)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-white/30 font-[family-name:var(--font-montserrat)]">
                    Nenhum post encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const typeConf = post.post_type ? POST_TYPE_CONFIG[post.post_type] : null;
                  const statusConf = STATUS_CONFIG[post.status];
                  return (
                    <tr
                      key={post.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => openPost(post)}
                    >
                      <td className="px-4 py-3 text-xs text-white/50 font-[family-name:var(--font-montserrat)] whitespace-nowrap">
                        {new Date(post.scheduled_date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        {typeConf ? (
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase border ${typeConf.color}`}>
                            {typeConf.label}
                          </span>
                        ) : (
                          <span className="text-xs text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/60 font-[family-name:var(--font-montserrat)] max-w-[200px] truncate">
                        {post.texto_arte || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40 font-[family-name:var(--font-montserrat)] max-w-[250px] truncate">
                        {post.caption || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusConf?.color || "bg-white/10 text-white/40 border-white/10"}`}>
                          {statusConf?.label || post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {post.status === "em_analise" && (
                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleUpdateStatus(post.id, "aprovado")}
                              className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-bold hover:bg-green-500/30 transition-all"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => openPost(post)}
                              className="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-[10px] font-bold hover:bg-yellow-500/30 transition-all"
                            >
                              Comentar
                            </button>
                            <button
                              onClick={() => {
                                openPost(post);
                              }}
                              className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/30 transition-all"
                            >
                              Rejeitar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ---- RENDER: Cards View (grouped by status) ----
  function renderCards() {
    if (filteredPosts.length === 0) {
      return (
        <div className={`${glassCard} p-8 text-center`}>
          <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">
            Nenhum post encontrado com os filtros selecionados.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        {Object.entries(grouped).map(([status, items]) => {
          const config = STATUS_CONFIG[status] || { label: status, color: "bg-white/10 text-white/40 border-white/10" };
          return (
            <div key={status}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-white/20">{items.length} post{items.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((post) => (
                  <div
                    key={post.id}
                    className={`${glassCard} p-4 text-left hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 group`}
                  >
                    {/* Clickable area */}
                    <button
                      onClick={() => openPost(post)}
                      className="w-full text-left"
                    >
                      {/* Thumbnail */}
                      {post.image_url && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden mb-3 bg-white/[0.03] relative">
                          {isVideoUrl(post.image_url, post.post_type) ? (
                            <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                              <svg className="w-10 h-10 text-pink-400/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          ) : (
                            <img
                              src={post.image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      {/* Date + Type */}
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] text-white/30 font-[family-name:var(--font-montserrat)]">
                          {new Date(post.scheduled_date).toLocaleDateString("pt-BR")}
                        </p>
                        {post.post_type && POST_TYPE_CONFIG[post.post_type] && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase border ${POST_TYPE_CONFIG[post.post_type].color}`}>
                            {POST_TYPE_CONFIG[post.post_type].label}
                          </span>
                        )}
                      </div>
                      {/* Texto na Arte */}
                      {post.texto_arte && (
                        <p className="text-xs text-white/80 font-semibold font-[family-name:var(--font-montserrat)] mb-1 line-clamp-1">
                          {post.texto_arte}
                        </p>
                      )}
                      {/* Caption */}
                      <p className="text-sm text-white/60 font-[family-name:var(--font-montserrat)] line-clamp-2">
                        {post.caption}
                      </p>
                      {/* Direcao Criativa */}
                      {post.direcao_criativa && (
                        <p className="text-[10px] text-white/30 font-[family-name:var(--font-montserrat)] mt-1 line-clamp-1 italic">
                          {post.direcao_criativa}
                        </p>
                      )}
                      {/* Status */}
                      <div className="mt-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${STATUS_CONFIG[post.status]?.color || "bg-white/10 text-white/40 border-white/10"}`}>
                          {STATUS_CONFIG[post.status]?.label || post.status}
                        </span>
                      </div>
                    </button>

                    {/* Inline approval buttons for em_analise */}
                    {post.status === "em_analise" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                        <button
                          onClick={() => handleUpdateStatus(post.id, "aprovado")}
                          disabled={updating}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-bold tracking-wider uppercase hover:bg-green-500/30 transition-all disabled:opacity-50"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => openPost(post)}
                          disabled={updating}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-[10px] font-bold tracking-wider uppercase hover:bg-yellow-500/30 transition-all disabled:opacity-50"
                        >
                          Comentar
                        </button>
                        <button
                          onClick={() => openPost(post)}
                          disabled={updating}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-bold tracking-wider uppercase hover:bg-red-500/30 transition-all disabled:opacity-50"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] text-white">
            Conteudo
          </h1>
          <p className="text-xs text-white/40 mt-1 font-[family-name:var(--font-montserrat)]">
            Calendario de conteudo e aprovacao de posts
          </p>
        </div>

        {/* View Toggle + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
            {([
              { key: "lista" as ViewMode, label: "Lista" },
              { key: "calendario" as ViewMode, label: "Calendario" },
              { key: "cards" as ViewMode, label: "Cards" },
            ]).map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={`px-4 py-2 text-xs font-semibold transition-all ${
                  viewMode === v.key
                    ? "bg-white/10 text-white"
                    : "bg-white/[0.02] text-white/30 hover:text-white/60"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "todos", label: "Todos" },
              { value: "estatico", label: "Estatico" },
              { value: "carrossel", label: "Carrossel" },
              { value: "stories", label: "Stories" },
              { value: "reels", label: "Reels" },
              { value: "video", label: "Video" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  typeFilter === t.value
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-white/[0.08] self-stretch" />

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "todos", label: "Todos" },
              { value: "em_analise", label: "Em Analise" },
              { value: "aprovado", label: "Aprovado" },
              { value: "rejeitado", label: "Rejeitado" },
              { value: "em_progresso", label: "Em Progresso" },
              { value: "agendado", label: "Agendado" },
              { value: "postado", label: "Postado" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  statusFilter === s.value
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <div className={`${glassCard} p-8 text-center`}>
            <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhum conteudo disponivel ainda. Seus posts serao listados aqui conforme forem criados pela equipe FYRE.
            </p>
          </div>
        ) : (
          <>
            {viewMode === "cards" && renderCards()}
            {viewMode === "lista" && renderList()}
            {viewMode === "calendario" && renderCalendar()}
          </>
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${glassCard} p-6`}>
              {/* Close button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              {/* Media */}
              {selectedPost.image_url && (
                <div className="w-full rounded-xl overflow-hidden mb-5 bg-white/[0.03]">
                  {isVideoUrl(selectedPost.image_url, selectedPost.post_type) ? (
                    <video
                      src={selectedPost.image_url}
                      controls
                      className="w-full h-auto"
                    />
                  ) : (
                    <img
                      src={selectedPost.image_url}
                      alt="Post preview"
                      className="w-full h-auto"
                    />
                  )}
                </div>
              )}

              {/* Status badge + Post type */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_CONFIG[selectedPost.status]?.color || "bg-white/10 text-white/40 border-white/10"}`}>
                  {STATUS_CONFIG[selectedPost.status]?.label || selectedPost.status}
                </span>
                {selectedPost.post_type && POST_TYPE_CONFIG[selectedPost.post_type] && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${POST_TYPE_CONFIG[selectedPost.post_type].color}`}>
                    {POST_TYPE_CONFIG[selectedPost.post_type].label}
                  </span>
                )}
                <span className="text-xs text-white/30 font-[family-name:var(--font-montserrat)]">
                  {new Date(selectedPost.scheduled_date).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {/* Texto na Arte */}
              {selectedPost.texto_arte && (
                <div className="mb-4">
                  <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1 font-[family-name:var(--font-montserrat)]">
                    Texto na Arte
                  </label>
                  <p className="text-sm text-white/80 font-semibold font-[family-name:var(--font-montserrat)]">
                    {selectedPost.texto_arte}
                  </p>
                </div>
              )}

              {/* Caption */}
              <div className="mb-4">
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1 font-[family-name:var(--font-montserrat)]">
                  Legenda
                </label>
                <p className="text-sm text-white/70 font-[family-name:var(--font-montserrat)] whitespace-pre-wrap leading-relaxed">
                  {selectedPost.caption}
                </p>
              </div>

              {/* Direcao Criativa */}
              {selectedPost.direcao_criativa && (
                <div className="mb-4">
                  <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1 font-[family-name:var(--font-montserrat)]">
                    Direcao Criativa
                  </label>
                  <p className="text-sm text-white/60 font-[family-name:var(--font-montserrat)] whitespace-pre-wrap leading-relaxed italic">
                    {selectedPost.direcao_criativa}
                  </p>
                </div>
              )}

              {/* Designer */}
              {selectedPost.designer && (
                <div className="mb-6">
                  <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1 font-[family-name:var(--font-montserrat)]">
                    Designer
                  </label>
                  <p className="text-sm text-white/50 font-[family-name:var(--font-montserrat)]">
                    {selectedPost.designer}
                  </p>
                </div>
              )}

              {/* Approved badge */}
              {selectedPost.status === "aprovado" && (
                <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-400 font-semibold font-[family-name:var(--font-montserrat)]">Aprovado</span>
                </div>
              )}

              {/* Feedback area - always visible */}
              <div className="mb-4">
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1.5 font-[family-name:var(--font-montserrat)]">
                  Comentarios / Feedback
                </label>
                <textarea
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 min-h-[80px] font-[family-name:var(--font-montserrat)]"
                  placeholder="Escreva seu feedback aqui..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={selectedPost.status !== "em_analise"}
                />
              </div>

              {/* Action buttons */}
              {selectedPost.status === "em_analise" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedPost.id, "aprovado", feedback)}
                    disabled={updating}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 text-xs font-bold tracking-wider uppercase hover:bg-green-500/30 transition-all disabled:opacity-50 font-[family-name:var(--font-montserrat)]"
                  >
                    {updating ? "..." : "Aprovar"}
                  </button>
                  <button
                    onClick={() => {
                      if (!feedback.trim()) {
                        alert("Por favor, adicione um comentario antes de rejeitar.");
                        return;
                      }
                      handleUpdateStatus(selectedPost.id, "rejeitado", feedback);
                    }}
                    disabled={updating}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold tracking-wider uppercase hover:bg-red-500/30 transition-all disabled:opacity-50 font-[family-name:var(--font-montserrat)]"
                  >
                    {updating ? "..." : "Rejeitar"}
                  </button>
                </div>
              )}

              {/* Show existing feedback if not em_analise */}
              {selectedPost.status !== "em_analise" && selectedPost.feedback && (
                <div className="mt-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1 font-[family-name:var(--font-montserrat)]">Seu feedback</p>
                  <p className="text-xs text-white/50 font-[family-name:var(--font-montserrat)]">{selectedPost.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
