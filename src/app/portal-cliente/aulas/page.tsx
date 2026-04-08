"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";
import { ClientLesson } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  trafego: "bg-orange-500/20 text-orange-400",
  automacao: "bg-blue-500/20 text-blue-400",
  vendas: "bg-green-500/20 text-green-400",
  marketing: "bg-purple-500/20 text-purple-400",
  estrategia: "bg-cyan-500/20 text-cyan-400",
  gestao: "bg-amber-500/20 text-amber-400",
  design: "bg-pink-500/20 text-pink-400",
  geral: "bg-white/10 text-white/50",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
  );
}

export default function PortalAulasPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<ClientLesson[]>([]);
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
        .from("client_lessons")
        .select("*")
        .or(`client_id.eq.${clientId},client_id.is.null`)
        .eq("published", true)
        .order("sort_order");

      setLessons((data as ClientLesson[]) || []);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const groupedLessons = useMemo(() => {
    const groups: Record<string, ClientLesson[]> = {};
    for (const lesson of lessons) {
      const cat = lesson.category || "geral";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(lesson);
    }
    return groups;
  }, [lessons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
          Aulas
        </h1>
        <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          Conteúdos exclusivos para você
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 backdrop-blur-sm text-center">
          <svg
            className="w-12 h-12 text-white/10 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
            Conteúdos exclusivos serão disponibilizados em breve.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedLessons).map(([category, categoryLessons]) => (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-[family-name:var(--font-montserrat)] capitalize ${
                    CATEGORY_COLORS[category] || CATEGORY_COLORS.geral
                  }`}
                >
                  {category}
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Lessons */}
              <div className="space-y-4">
                {categoryLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm"
                  >
                    <h3 className="text-lg text-white font-semibold font-[family-name:var(--font-montserrat)] mb-2">
                      {lesson.title}
                    </h3>

                    {lesson.description && (
                      <p className="text-sm text-white/40 font-[family-name:var(--font-montserrat)] mb-4">
                        {lesson.description}
                      </p>
                    )}

                    {/* Video embed */}
                    {lesson.video_url && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-white/[0.06]">
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                          <iframe
                            src={lesson.video_url}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={lesson.title}
                          />
                        </div>
                      </div>
                    )}

                    {/* Content text */}
                    {lesson.content && (
                      <div className="text-sm text-white/50 font-[family-name:var(--font-montserrat)] leading-relaxed whitespace-pre-line">
                        {lesson.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
