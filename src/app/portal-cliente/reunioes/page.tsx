"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";
import { Meeting, normalizeMeeting } from "@/lib/types";

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-orange-500/20 text-orange-400",
  concluido: "bg-green-500/20 text-green-400",
  cancelado: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
  );
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base text-white font-semibold font-[family-name:var(--font-montserrat)]">
          {meeting.title}
        </h3>
        <span
          className={`text-[10px] px-2.5 py-1 rounded-full font-[family-name:var(--font-montserrat)] flex-shrink-0 ml-3 ${
            STATUS_COLORS[meeting.status] || "bg-white/10 text-white/60"
          }`}
        >
          {STATUS_LABELS[meeting.status] || meeting.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-white/60 font-[family-name:var(--font-montserrat)]">
            {formatDateTime(meeting.scheduled_at)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-white/60 font-[family-name:var(--font-montserrat)]">
            {meeting.duration_minutes} minutos
          </span>
        </div>
      </div>

      {meeting.notes && (
        <p className="text-xs text-white/30 mb-4 font-[family-name:var(--font-montserrat)] leading-relaxed">
          {meeting.notes}
        </p>
      )}

      {meeting.meeting_link && meeting.status === "agendado" && (
        <a
          href={meeting.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium font-[family-name:var(--font-montserrat)] hover:bg-orange-500/20 transition-colors"
        >
          <svg
            className="w-4 h-4"
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
          Entrar na reunião
        </a>
      )}
    </div>
  );
}

export default function PortalReunioesPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente");
      return;
    }

    const clientId = session.client_id;

    async function fetchData() {
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .eq("client_id", clientId)
        .order("scheduled_at", { ascending: false });

      setMeetings((data || []).map((m: any) => normalizeMeeting(m)) as Meeting[]);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcoming: Meeting[] = [];
    const past: Meeting[] = [];

    for (const m of meetings) {
      const meetingDate = new Date(m.scheduled_at);
      if (m.status === "agendado" && meetingDate >= now) {
        upcoming.push(m);
      } else {
        past.push(m);
      }
    }

    // Sort upcoming ascending (nearest first)
    upcoming.sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

    return { upcoming, past };
  }, [meetings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl lg:text-5xl text-white mb-1">
          Reuniões
        </h1>
        <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          Suas reuniões com a equipe FYRE
        </p>
      </div>

      {/* Upcoming */}
      <div className="mb-10">
        <h2 className="text-[10px] uppercase tracking-wider text-white/40 mb-4 font-[family-name:var(--font-montserrat)]">
          Próximas
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhuma reunião próxima agendada.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <h2 className="text-[10px] uppercase tracking-wider text-white/40 mb-4 font-[family-name:var(--font-montserrat)]">
          Anteriores
        </h2>
        {past.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
              Nenhuma reunião anterior.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {past.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
