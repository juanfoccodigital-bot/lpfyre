"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { USERS_MAP } from "@/lib/types";
import { getSession } from "@/lib/admin-auth";
import { format, parseISO, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

/* ──────────────────── Types ──────────────────── */

interface ChecklistItem {
  text: string;
  done: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  client_id: string | null;
  due_date: string | null;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "pendente" | "em_andamento" | "concluido";
  checklist: ChecklistItem[] | null;
  created_at: string;
  updated_at: string;
}

interface ClientOption {
  id: string;
  nome: string;
  empresa: string | null;
}

interface TaskForm {
  title: string;
  description: string;
  assigned_to: string;
  client_id: string;
  due_date: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "pendente" | "em_andamento" | "concluido";
  checklist: ChecklistItem[];
}

const emptyForm: TaskForm = {
  title: "",
  description: "",
  assigned_to: Object.keys(USERS_MAP)[0],
  client_id: "",
  due_date: "",
  priority: "media",
  status: "pendente",
  checklist: [],
};

const PRIORITY_CONFIG = {
  urgente: { label: "Urgente", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  alta: { label: "Alta", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  media: { label: "Média", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  baixa: { label: "Baixa", bg: "bg-white/10", text: "text-white/50", border: "border-white/10" },
};

const STATUS_CONFIG = {
  pendente: { label: "Pendentes", dot: "bg-orange-400", bg: "bg-orange-500/20", text: "text-orange-400" },
  em_andamento: { label: "Em Andamento", dot: "bg-blue-400", bg: "bg-blue-500/20", text: "text-blue-400" },
  concluido: { label: "Concluídas", dot: "bg-green-400", bg: "bg-green-500/20", text: "text-green-400" },
};

type ViewMode = "lista" | "kanban";
type StatusKey = "pendente" | "em_andamento" | "concluido";
const STATUS_KEYS: StatusKey[] = ["pendente", "em_andamento", "concluido"];

/* ──────────────────── Kanban Sub-Components ──────────────────── */

function KanbanCard({
  task,
  onEdit,
  getDueDateColor,
  overlay,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  getDueDateColor: (d: string | null) => string;
  overlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pConfig = PRIORITY_CONFIG[task.priority];
  const assignedUser = USERS_MAP[task.assigned_to];
  const checklistDone = task.checklist ? task.checklist.filter((c) => c.done).length : 0;
  const checklistTotal = task.checklist ? task.checklist.length : 0;

  const inner = (
    <div
      className={`rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-3.5 hover:bg-white/[0.05] transition-all cursor-grab active:cursor-grabbing ${
        overlay ? "shadow-2xl ring-1 ring-orange-500/20" : ""
      }`}
    >
      {/* Priority badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${pConfig.bg} ${pConfig.text}`}
        >
          {pConfig.label}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`font-semibold text-sm leading-snug mb-2 ${
          task.status === "concluido" ? "text-white/40 line-through" : "text-white/90"
        }`}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && (
        <p
          className="text-[11px] text-white/25 line-clamp-2 mb-2.5"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {task.description}
        </p>
      )}

      {/* Checklist progress */}
      {checklistTotal > 0 && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-400/60 transition-all"
              style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
            />
          </div>
          <span
            className="text-[10px] text-white/30 shrink-0"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {checklistDone}/{checklistTotal}
          </span>
        </div>
      )}

      {/* Footer: avatar + due date */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          {assignedUser && (
            <>
              <img
                src={`/images/${assignedUser.username === "juanmansilha" ? "juan" : "rodrigo"}.jpg`}
                alt={assignedUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
              />
              <span
                className="text-[11px] text-white/40"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {assignedUser.name.split(" ")[0]}
              </span>
            </>
          )}
        </div>

        {task.due_date && (
          <span
            className={`text-[11px] ${getDueDateColor(task.due_date)}`}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {format(parseISO(task.due_date), "dd MMM", { locale: ptBR })}
          </span>
        )}
      </div>
    </div>
  );

  if (overlay) return inner;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
    >
      {inner}
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onEdit,
  getDueDateColor,
}: {
  status: StatusKey;
  tasks: Task[];
  onEdit: (t: Task) => void;
  getDueDateColor: (d: string | null) => string;
}) {
  const config = STATUS_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[300px] w-[340px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
        <h2
          className="text-white/70 text-lg"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {config.label}
        </h2>
        <span
          className="text-xs text-white/30 font-medium bg-white/[0.05] px-2 py-0.5 rounded-full"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl border transition-colors p-2 space-y-2 min-h-[200px] ${
          isOver
            ? "border-orange-500/30 bg-orange-500/[0.04]"
            : "border-white/[0.04] bg-white/[0.01]"
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              getDueDateColor={getDueDateColor}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <p
              className="text-white/15 text-xs"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Arraste tarefas aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────── Component ──────────────────── */

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("lista");

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [filterUser, setFilterUser] = useState<string>("todos");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState("");

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    concluido: true,
  });

  // Drag state
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  /* ──── DnD sensors ──── */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  /* ──── Fetch ──── */

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    setTasks((data as Task[]) || []);
  }, []);

  useEffect(() => {
    async function init() {
      const session = getSession();
      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      const [, clRes] = await Promise.all([
        fetchTasks(),
        supabase.from("clients").select("id, nome, empresa").order("nome"),
      ]);
      setClients((clRes.data as ClientOption[]) || []);
      setLoading(false);
    }
    init();
  }, [fetchTasks]);

  /* ──── Filtered & grouped ──── */

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== "todas" && t.status !== filterStatus) return false;
      if (filterUser !== "todos" && t.assigned_to !== filterUser) return false;
      return true;
    });
  }, [tasks, filterStatus, filterUser]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {
      pendente: [],
      em_andamento: [],
      concluido: [],
    };
    filteredTasks.forEach((t) => {
      if (groups[t.status]) groups[t.status].push(t);
    });
    return groups;
  }, [filteredTasks]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todas: tasks.length, pendente: 0, em_andamento: 0, concluido: 0 };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return counts;
  }, [tasks]);

  /* ──── Handlers ──── */

  function openNewModal() {
    setEditingTask(null);
    setForm({ ...emptyForm });
    setNewChecklistText("");
    setShowModal(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to,
      client_id: task.client_id || "",
      due_date: task.due_date || "",
      priority: task.priority,
      status: task.status,
      checklist: task.checklist ? [...task.checklist] : [],
    });
    setNewChecklistText("");
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      assigned_to: form.assigned_to,
      client_id: form.client_id || null,
      due_date: form.due_date || null,
      priority: form.priority,
      status: form.status,
      checklist: form.checklist.length > 0 ? form.checklist : null,
      updated_at: new Date().toISOString(),
    };

    if (editingTask) {
      const { error } = await supabase.from("tasks").update(payload).eq("id", editingTask.id);
      if (error) { alert("Erro: " + error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("tasks").insert(payload);
      if (error) { alert("Erro: " + error.message); setSaving(false); return; }
    }

    setShowModal(false);
    setSaving(false);
    await fetchTasks();
  }

  async function handleDelete() {
    if (!editingTask) return;
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", editingTask.id);
    if (error) { alert("Erro: " + error.message); return; }
    setShowModal(false);
    await fetchTasks();
  }

  async function handleQuickComplete(task: Task) {
    const newStatus = task.status === "concluido" ? "pendente" : "concluido";
    const { error } = await supabase.from("tasks").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", task.id);
    if (error) { alert("Erro: " + error.message); return; }
    await fetchTasks();
  }

  async function handleQuickStatusChange(task: Task, newStatus: string) {
    const { error } = await supabase.from("tasks").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", task.id);
    if (error) { alert("Erro: " + error.message); return; }
    await fetchTasks();
  }

  function addChecklistItem() {
    if (!newChecklistText.trim()) return;
    setForm({ ...form, checklist: [...form.checklist, { text: newChecklistText.trim(), done: false }] });
    setNewChecklistText("");
  }

  function toggleChecklistItem(index: number) {
    const updated = [...form.checklist];
    updated[index] = { ...updated[index], done: !updated[index].done };
    setForm({ ...form, checklist: updated });
  }

  function removeChecklistItem(index: number) {
    const updated = form.checklist.filter((_, i) => i !== index);
    setForm({ ...form, checklist: updated });
  }

  function toggleGroup(status: string) {
    setCollapsedGroups((prev) => ({ ...prev, [status]: !prev[status] }));
  }

  function getDueDateColor(dateStr: string | null): string {
    if (!dateStr) return "text-white/40";
    const date = parseISO(dateStr);
    if (isToday(date)) return "text-orange-400";
    if (isPast(date)) return "text-red-400";
    return "text-white/50";
  }

  function getClientName(clientId: string | null): string | null {
    if (!clientId) return null;
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.nome}${client.empresa ? ` — ${client.empresa}` : ""}` : null;
  }

  /* ──── Drag & Drop Handlers ──── */

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine the target column. `over.id` could be a column id or a task id.
    let targetStatus: StatusKey | null = null;

    if (STATUS_KEYS.includes(over.id as StatusKey)) {
      targetStatus = over.id as StatusKey;
    } else {
      // over.id is another task's id — find which column that task belongs to
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus || targetStatus === task.status) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    // Persist to Supabase
    await supabase
      .from("tasks")
      .update({ status: targetStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId);

    await fetchTasks();
  }

  function handleDragOver(event: DragOverEvent) {
    // No-op for now; we handle everything in handleDragEnd
  }

  /* ──── Loading ──── */

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  /* ──────────────────── Render ──────────────────── */

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:px-8">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl text-white/90 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Tarefas
            </h1>
            <p
              className="text-white/40 text-sm mt-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {statusCounts.pendente} pendentes · {statusCounts.em_andamento} em andamento
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
              <button
                onClick={() => setViewMode("lista")}
                className={`px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "lista"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                Lista
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "kanban"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Kanban
              </button>
            </div>

            <button
              onClick={openNewModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 transition-all text-sm font-medium"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova Tarefa
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[1200px] mx-auto mb-6 space-y-3">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "todas", label: "Todas" },
            { key: "pendente", label: "Pendentes" },
            { key: "em_andamento", label: "Em Andamento" },
            { key: "concluido", label: "Concluídas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === f.key
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60"
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] opacity-60">{statusCounts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* User filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterUser("todos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterUser === "todos"
                ? "bg-white/10 text-white border border-white/20"
                : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60"
            }`}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Todos
          </button>
          {Object.entries(USERS_MAP).map(([id, user]) => (
            <button
              key={id}
              onClick={() => setFilterUser(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                filterUser === id
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60"
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <img
                src={`/images/${user.username === "juanmansilha" ? "juan" : "rodrigo"}.jpg`}
                alt={user.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              {user.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ──────────────────── KANBAN VIEW ──────────────────── */}
      {viewMode === "kanban" && (
        <div className="max-w-[1200px] mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
              {STATUS_KEYS.map((status) => {
                if (filterStatus !== "todas" && filterStatus !== status) return null;
                return (
                  <KanbanColumn
                    key={status}
                    status={status}
                    tasks={groupedTasks[status] || []}
                    onEdit={openEditModal}
                    getDueDateColor={getDueDateColor}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="w-[340px]">
                  <KanbanCard
                    task={activeTask}
                    onEdit={() => {}}
                    getDueDateColor={getDueDateColor}
                    overlay
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {filteredTasks.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/30 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Nenhuma tarefa encontrada.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────── LIST VIEW ──────────────────── */}
      {viewMode === "lista" && (
        <div className="max-w-[1200px] mx-auto space-y-6">
          {(["pendente", "em_andamento", "concluido"] as const).map((status) => {
            const config = STATUS_CONFIG[status];
            const tasksInGroup = groupedTasks[status] || [];
            const isCollapsed = collapsedGroups[status];

            if (filterStatus !== "todas" && filterStatus !== status) return null;
            if (tasksInGroup.length === 0 && filterStatus === "todas") return null;

            return (
              <div key={status}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(status)}
                  className="flex items-center gap-3 mb-3 group"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                  <h2
                    className="text-white/70 text-lg group-hover:text-white/90 transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {config.label}
                  </h2>
                  <span className="text-xs text-white/30 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {tasksInGroup.length}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white/30 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Tasks */}
                {!isCollapsed && (
                  <div className="space-y-2">
                    {tasksInGroup.length === 0 ? (
                      <p className="text-white/20 text-sm pl-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Nenhuma tarefa.
                      </p>
                    ) : (
                      tasksInGroup.map((task) => {
                        const pConfig = PRIORITY_CONFIG[task.priority];
                        const assignedUser = USERS_MAP[task.assigned_to];
                        const clientName = getClientName(task.client_id);
                        const checklistDone = task.checklist ? task.checklist.filter((c) => c.done).length : 0;
                        const checklistTotal = task.checklist ? task.checklist.length : 0;

                        return (
                          <div
                            key={task.id}
                            onClick={() => openEditModal(task)}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              {/* Quick complete checkbox */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickComplete(task);
                                }}
                                className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                                  task.status === "concluido"
                                    ? "bg-green-500/30 border-green-500/50 text-green-400"
                                    : "border-white/20 hover:border-white/40 text-transparent hover:text-white/20"
                                }`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    {/* Priority badge */}
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${pConfig.bg} ${pConfig.text}`}>
                                      {pConfig.label}
                                    </span>
                                    {/* Title */}
                                    <h3
                                      className={`font-semibold text-sm leading-tight ${
                                        task.status === "concluido" ? "text-white/40 line-through" : "text-white/90"
                                      }`}
                                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    >
                                      {task.title}
                                    </h3>
                                  </div>

                                  {/* Quick status change */}
                                  <select
                                    value={task.status}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(task, e.target.value);
                                    }}
                                    className="shrink-0 text-[10px] font-medium bg-transparent border border-white/10 rounded-lg px-1.5 py-0.5 text-white/50 focus:outline-none cursor-pointer appearance-none"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                  >
                                    <option value="pendente" className="bg-[#111]">Pendente</option>
                                    <option value="em_andamento" className="bg-[#111]">Em Andamento</option>
                                    <option value="concluido" className="bg-[#111]">Concluído</option>
                                  </select>
                                </div>

                                {/* Description */}
                                {task.description && (
                                  <p className="text-xs text-white/30 truncate mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                    {task.description}
                                  </p>
                                )}

                                {/* Meta row */}
                                <div className="flex items-center gap-3 flex-wrap">
                                  {/* Assigned user */}
                                  {assignedUser && (
                                    <div className="flex items-center gap-1.5">
                                      <img
                                        src={`/images/${assignedUser.username === "juanmansilha" ? "juan" : "rodrigo"}.jpg`}
                                        alt={assignedUser.name}
                                        className="w-4 h-4 rounded-full object-cover"
                                      />
                                      <span className="text-[11px] text-white/40" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        {assignedUser.name.split(" ")[0]}
                                      </span>
                                    </div>
                                  )}

                                  {/* Client */}
                                  {clientName && (
                                    <span className="text-[11px] text-white/30" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                      {clientName}
                                    </span>
                                  )}

                                  {/* Due date */}
                                  {task.due_date && (
                                    <span className={`text-[11px] ${getDueDateColor(task.due_date)}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                      {format(parseISO(task.due_date), "dd/MM/yyyy")}
                                    </span>
                                  )}

                                  {/* Checklist progress */}
                                  {checklistTotal > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-green-400/60 transition-all"
                                          style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] text-white/30" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        {checklistDone}/{checklistTotal}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/30 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Nenhuma tarefa encontrada.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────── New/Edit Task Modal ──────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl text-white/90"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Título *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors"
                  placeholder="Ex: Criar posts para cliente X"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors resize-none"
                  placeholder="Detalhes da tarefa..."
                />
              </div>

              {/* Assigned to */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Responsável
                </label>
                <div className="flex gap-2">
                  {Object.entries(USERS_MAP).map(([id, user]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setForm({ ...form, assigned_to: id })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                        form.assigned_to === id
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-white/[0.03] text-white/40 border border-white/[0.06]"
                      }`}
                    >
                      <img
                        src={`/images/${user.username === "juanmansilha" ? "juan" : "rodrigo"}.jpg`}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      {user.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Cliente (opcional)
                </label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors"
                >
                  <option value="" className="bg-[#111]">Nenhum cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111]">
                      {c.nome} {c.empresa ? `— ${c.empresa}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Data de entrega
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Prioridade
                </label>
                <div className="flex gap-2">
                  {(["baixa", "media", "alta", "urgente"] as const).map((p) => {
                    const pc = PRIORITY_CONFIG[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          form.priority === p
                            ? `${pc.bg} ${pc.text} border ${pc.border}`
                            : "bg-white/[0.03] text-white/40 border border-white/[0.06]"
                        }`}
                      >
                        {pc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Status
                </label>
                <div className="flex gap-2">
                  {(["pendente", "em_andamento", "concluido"] as const).map((s) => {
                    const sc = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          form.status === s
                            ? `${sc.bg} ${sc.text} border border-current/30`
                            : "bg-white/[0.03] text-white/40 border border-white/[0.06]"
                        }`}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Checklist
                </label>

                {form.checklist.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {form.checklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 group/item">
                        <button
                          type="button"
                          onClick={() => toggleChecklistItem(i)}
                          className={`shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center ${
                            item.done
                              ? "bg-green-500/30 border-green-500/50 text-green-400"
                              : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          {item.done && (
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-xs ${item.done ? "text-white/30 line-through" : "text-white/70"}`}>
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(i)}
                          className="opacity-0 group-hover/item:opacity-100 text-white/20 hover:text-red-400 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors"
                    placeholder="Novo item..."
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-all text-xs font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {editingTask && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-medium"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Excluir
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 transition-all text-sm font-semibold disabled:opacity-50"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {saving ? "Salvando..." : editingTask ? "Salvar alterações" : "Criar tarefa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
