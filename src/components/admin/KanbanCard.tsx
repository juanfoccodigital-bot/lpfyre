"use client";

import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "@/lib/types";
import { USERS_MAP, formatWhatsApp } from "@/lib/types";

interface KanbanCardProps {
  lead: Lead;
  onClick: () => void;
}

function LeadTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date().getTime();
      const created = new Date(createdAt).getTime();
      const diffMs = now - created;
      const diffMin = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;

      setElapsed(hours > 0 ? `${hours}h ${mins}m` : `${diffMin}m`);
      setIsOverdue(diffMin > 5);
      setIsCritical(diffMin > 30);
    }

    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 ${
        isOverdue
          ? "bg-red-500/20 text-red-400"
          : "bg-green-500/20 text-green-400"
      } ${isCritical ? "animate-pulse" : ""}`}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {elapsed}
    </span>
  );
}

export default function KanbanCard({ lead, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const assignedUser = USERS_MAP[lead.assigned_to];
  const cleanPhone = formatWhatsApp(lead.telefone);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 hover:bg-white/[0.05] transition-colors duration-200 cursor-pointer group"
      onClick={onClick}
    >
      {/* Timer badge for new leads */}
      {lead.status === "lead_novo" && lead.created_at && (
        <div className="mb-2">
          <LeadTimer createdAt={lead.created_at} />
        </div>
      )}

      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="mt-0.5 flex-shrink-0 text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <p className="text-sm font-semibold text-white/90 truncate">
            {lead.nome}
          </p>

          {/* Empresa */}
          {lead.empresa && (
            <p className="text-xs text-white/40 truncate mt-0.5">
              {lead.empresa}
            </p>
          )}

          {/* Phone + WhatsApp */}
          {lead.telefone && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[11px] text-white/30">{lead.telefone}</span>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-green-400 hover:text-green-300 transition-colors"
                title="Abrir WhatsApp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          )}

          {/* Bottom row: assigned + faturamento */}
          <div className="flex items-center justify-between mt-2">
            {assignedUser && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/40">
                {assignedUser.name.split(" ")[0]}
              </span>
            )}
            {lead.faturamento && (
              <span className="text-[10px] text-white/25">
                R$ {(lead.faturamento / 1000).toFixed(0)}k
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
