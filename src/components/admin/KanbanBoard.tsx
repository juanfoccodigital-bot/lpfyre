"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";
import type { Lead } from "@/lib/types";
import { KANBAN_COLUMNS } from "@/lib/types";

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onCardClick: (lead: Lead) => void;
}

function DroppableColumn({
  columnKey,
  children,
}: {
  columnKey: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[60px] space-y-2 transition-colors duration-200 ${
        isOver ? "bg-white/[0.03] rounded-lg" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function KanbanBoard({
  leads,
  onUpdateLead,
  onCardClick,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const leadsByColumn = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const col of KANBAN_COLUMNS) {
      map[col.key] = [];
    }
    for (const lead of leads) {
      if (map[lead.status]) {
        map[lead.status].push(lead);
      } else {
        // fallback: put unknown statuses into lead_novo
        map["lead_novo"]?.push(lead);
      }
    }
    return map;
  }, [leads]);

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId) || null,
    [leads, activeId]
  );

  function findColumnOfLead(leadId: string): string | null {
    for (const [colKey, colLeads] of Object.entries(leadsByColumn)) {
      if (colLeads.some((l) => l.id === leadId)) return colKey;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    // Not needed for cross-column moves since we handle in dragEnd
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetColumn: string | null = null;

    // Check if dropped on a column directly
    const isColumn = KANBAN_COLUMNS.some((c) => c.key === overId);
    if (isColumn) {
      targetColumn = overId;
    } else {
      // Dropped on another card — find that card's column
      targetColumn = findColumnOfLead(overId);
    }

    if (!targetColumn) return;

    const sourceColumn = findColumnOfLead(activeLeadId);
    if (sourceColumn === targetColumn) return;

    // Update lead status
    onUpdateLead(activeLeadId, { status: targetColumn });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-0 flex-1">
        {KANBAN_COLUMNS.map((col) => {
          const columnLeads = leadsByColumn[col.key] || [];
          const ids = columnLeads.map((l) => l.id);

          return (
            <div
              key={col.key}
              className="flex-shrink-0 min-w-[240px] w-[240px] flex flex-col bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-sm"
            >
              {/* Column header */}
              <div className="px-3 py-3 border-b border-white/[0.05]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{col.icon}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${col.color}`}
                    >
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                    {columnLeads.length}
                  </span>
                </div>
                <p className="text-[9px] text-white/20 leading-snug line-clamp-2">{col.hint}</p>
              </div>

              {/* Column body */}
              <div className="flex-1 overflow-y-auto p-2 max-h-[calc(100vh-260px)]">
                <SortableContext
                  items={ids}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn columnKey={col.key}>
                    {columnLeads.map((lead) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => onCardClick(lead)}
                      />
                    ))}
                    {columnLeads.length === 0 && (
                      <div className="text-center py-6 text-white/10 text-xs">
                        Nenhum lead
                      </div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeLead ? (
          <div className="bg-white/[0.06] border border-white/[0.12] rounded-xl p-3 shadow-2xl backdrop-blur-xl w-[230px] opacity-90">
            <p className="text-sm font-semibold text-white/90 truncate">
              {activeLead.nome}
            </p>
            {activeLead.empresa && (
              <p className="text-xs text-white/40 truncate mt-0.5">
                {activeLead.empresa}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
