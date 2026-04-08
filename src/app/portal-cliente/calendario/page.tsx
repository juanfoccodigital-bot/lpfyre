"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";
import { Meeting, normalizeMeeting } from "@/lib/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContentPost {
  id: string;
  client_id: string;
  image_url: string | null;
  caption: string;
  scheduled_date: string;
  status: string;
  feedback: string | null;
  post_type?: string;
  created_at: string;
  updated_at: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
  );
}

export default function PortalCalendarioPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente");
      return;
    }

    const clientId = session.client_id;

    async function fetchData() {
      const [meetingsRes, contentRes] = await Promise.all([
        supabase
          .from("meetings")
          .select("*")
          .eq("client_id", clientId)
          .order("scheduled_at"),
        supabase
          .from("client_content")
          .select("*")
          .eq("client_id", clientId)
          .order("scheduled_date"),
      ]);

      setMeetings((meetingsRes.data || []).map((m: any) => normalizeMeeting(m)) as Meeting[]);
      setContentPosts((contentRes.data as ContentPost[]) || []);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    for (const m of meetings) {
      const key = format(new Date(m.scheduled_at), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [meetings]);

  const contentByDate = useMemo(() => {
    const map: Record<string, ContentPost[]> = {};
    for (const c of contentPosts) {
      if (!c.scheduled_date) continue;
      const key = c.scheduled_date.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(c);
    }
    return map;
  }, [contentPosts]);

  const selectedDayMeetings = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return meetingsByDate[key] || [];
  }, [selectedDay, meetingsByDate]);

  const selectedDayContent = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return contentByDate[key] || [];
  }, [selectedDay, contentByDate]);

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const STATUS_COLORS: Record<string, string> = {
    agendado: "bg-orange-500",
    concluido: "bg-green-500",
    cancelado: "bg-red-500",
  };

  const CONTENT_STATUS_COLORS: Record<string, string> = {
    em_analise: "bg-yellow-500/20 text-yellow-400",
    aprovado: "bg-green-500/20 text-green-400",
    rejeitado: "bg-red-500/20 text-red-400",
    em_progresso: "bg-blue-500/20 text-blue-400",
    agendado: "bg-purple-500/20 text-purple-400",
    postado: "bg-white/10 text-white/40",
  };

  const POST_TYPE_LABELS: Record<string, string> = {
    estatico: "Estático",
    carrossel: "Carrossel",
    video: "Vídeo",
    reels: "Reels",
    stories: "Stories",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-32 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl lg:text-5xl text-white mb-1">
          Calendário
        </h1>
        <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          Reuniões e conteúdo agendado
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-white/40 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-montserrat)] capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-white/40 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold tracking-wider uppercase text-white/20 py-2 font-[family-name:var(--font-montserrat)]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const key = format(day, "yyyy-MM-dd");
              const dayMeetings = meetingsByDate[key] || [];
              const dayContent = contentByDate[key] || [];
              const inMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const todayFlag = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all font-[family-name:var(--font-montserrat)] ${
                    !inMonth
                      ? "text-white/10"
                      : isSelected
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : todayFlag
                      ? "bg-white/[0.06] text-white"
                      : "text-white/50 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-sm">{format(day, "d")}</span>
                  {(dayMeetings.length > 0 || dayContent.length > 0) && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayMeetings.slice(0, 2).map((m, j) => (
                        <span
                          key={`m-${j}`}
                          className={`w-1.5 h-1.5 rounded-full ${
                            STATUS_COLORS[m.status] || "bg-white/30"
                          }`}
                        />
                      ))}
                      {dayContent.slice(0, 2).map((_, j) => (
                        <span
                          key={`c-${j}`}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-4 font-[family-name:var(--font-montserrat)]">
            {selectedDay
              ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR })
              : "Selecione um dia"}
          </h3>

          {!selectedDay ? (
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Clique em um dia para ver os eventos.
            </p>
          ) : selectedDayMeetings.length === 0 && selectedDayContent.length === 0 ? (
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhum evento neste dia.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Meetings */}
              {selectedDayMeetings.length > 0 && (
                <>
                  <p className="text-[9px] uppercase tracking-widest text-orange-400/60 font-bold font-[family-name:var(--font-montserrat)]">
                    Reuniões
                  </p>
                  {selectedDayMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-4 rounded-xl border border-orange-500/10 bg-orange-500/[0.03]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            STATUS_COLORS[meeting.status] || "bg-white/30"
                          }`}
                        />
                        <p className="text-sm text-white font-medium font-[family-name:var(--font-montserrat)] truncate">
                          {meeting.title}
                        </p>
                      </div>
                      <p className="text-xs text-white/40 mb-2 font-[family-name:var(--font-montserrat)]">
                        {format(new Date(meeting.scheduled_at), "HH:mm")} -{" "}
                        {meeting.duration_minutes}min
                      </p>
                      {meeting.description && (
                        <p className="text-xs text-white/30 mb-3 font-[family-name:var(--font-montserrat)]">
                          {meeting.description}
                        </p>
                      )}
                      {meeting.meeting_link && meeting.status === "agendado" && (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium font-[family-name:var(--font-montserrat)] hover:bg-orange-500/20 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Entrar
                        </a>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Content Posts */}
              {selectedDayContent.length > 0 && (
                <>
                  <p className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-bold font-[family-name:var(--font-montserrat)] mt-2">
                    Conteúdo
                  </p>
                  {selectedDayContent.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03]"
                    >
                      <div className="flex items-start gap-3">
                        {post.image_url && (
                          <img
                            src={post.image_url.split(",")[0]}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white/70 line-clamp-2 font-[family-name:var(--font-montserrat)]">
                            {post.caption}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${CONTENT_STATUS_COLORS[post.status] || "bg-white/10 text-white/40"}`}>
                              {post.status.replace("_", " ")}
                            </span>
                            {post.post_type && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-cyan-500/15 text-cyan-400/70">
                                {POST_TYPE_LABELS[post.post_type] || post.post_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
