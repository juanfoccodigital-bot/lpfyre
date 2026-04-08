"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Lead, LeadNote } from "@/lib/types";
import { KANBAN_COLUMNS, USERS_MAP, formatWhatsApp } from "@/lib/types";

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
  onDelete?: (id: string) => void;
  isNew?: boolean;
}

const userEntries = Object.entries(USERS_MAP);

export default function LeadModal({
  lead,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew = false,
}: LeadModalProps) {
  const [form, setForm] = useState<Partial<Lead>>({});
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    if (isOpen && lead && !isNew) {
      setForm({ ...lead });
      fetchNotes(lead.id);
    } else if (isOpen && isNew) {
      setForm({
        nome: "",
        empresa: "",
        email: "",
        telefone: "",
        especialidade: "",
        faturamento: null,
        cidade: "",
        estado: "",
        observacoes: "",
        fonte: "",
        assigned_to: userEntries[0]?.[0] || "",
        status: "lead_novo",
      });
      setNotes([]);
    }
    setConfirmDelete(false);
    setNewNote("");
  }, [isOpen, lead, isNew]);

  const fetchNotes = useCallback(async (leadId: string) => {
    setLoadingNotes(true);
    const { data } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    setNotes(data || []);
    setLoadingNotes(false);
  }, []);

  const addNote = async () => {
    if (!newNote.trim() || !lead?.id) return;
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({
        lead_id: lead.id,
        author_id: form.assigned_to || userEntries[0]?.[0] || "",
        content: newNote.trim(),
      })
      .select()
      .single();
    if (!error && data) {
      setNotes((prev) => [data as LeadNote, ...prev]);
      setNewNote("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (lead?.id && onDelete) {
      onDelete(lead.id);
    }
  };

  const updateField = (field: string, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const cleanPhone = formatWhatsApp(form.telefone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white/90 font-[family-name:var(--font-montserrat)]">
            {isNew ? "Novo Lead" : "Editar Lead"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Row: Nome + Empresa */}
          <div className="grid grid-cols-2 gap-4">
            <FieldInput
              label="Nome"
              value={form.nome || ""}
              onChange={(v) => updateField("nome", v)}
            />
            <FieldInput
              label="Empresa"
              value={form.empresa || ""}
              onChange={(v) => updateField("empresa", v)}
            />
          </div>

          {/* Row: Email + Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <FieldInput
              label="Email"
              value={form.email || ""}
              onChange={(v) => updateField("email", v)}
              type="email"
            />
            <div>
              <FieldInput
                label="Telefone"
                value={form.telefone || ""}
                onChange={(v) => updateField("telefone", v)}
              />
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Abrir WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Row: Especialidade + Faturamento */}
          <div className="grid grid-cols-2 gap-4">
            <FieldInput
              label="Especialidade / Nicho"
              value={form.especialidade || ""}
              onChange={(v) => updateField("especialidade", v)}
            />
            <FieldInput
              label="Faturamento"
              value={form.faturamento?.toString() || ""}
              onChange={(v) => updateField("faturamento", v ? Number(v) : null)}
              type="number"
            />
          </div>

          {/* Row: Cidade + Estado */}
          <div className="grid grid-cols-2 gap-4">
            <FieldInput
              label="Cidade"
              value={form.cidade || ""}
              onChange={(v) => updateField("cidade", v)}
            />
            <FieldInput
              label="Estado"
              value={form.estado || ""}
              onChange={(v) => updateField("estado", v)}
            />
          </div>

          {/* Row: Fonte */}
          <FieldInput
            label="Fonte"
            value={form.fonte || ""}
            onChange={(v) => updateField("fonte", v)}
          />

          {/* Row: Assigned + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
                Responsavel
              </label>
              <select
                value={form.assigned_to || ""}
                onChange={(e) => updateField("assigned_to", e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/30 transition-all appearance-none"
              >
                {userEntries.map(([id, u]) => (
                  <option key={id} value={id} className="bg-neutral-900">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
                Status
              </label>
              <select
                value={form.status || "lead_frio"}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/30 transition-all appearance-none"
              >
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col.key} value={col.key} className="bg-neutral-900">
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observacoes */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
              Observacoes
            </label>
            <textarea
              value={form.observacoes || ""}
              onChange={(e) => updateField("observacoes", e.target.value)}
              rows={3}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all resize-none"
            />
          </div>

          {/* Notes section (only for existing leads) */}
          {!isNew && lead?.id && (
            <div className="border-t border-white/[0.06] pt-5">
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white/40 mb-3">
                Historico / Notas
              </h3>

              {/* Add note */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="Adicionar nota..."
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all"
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-white/[0.08] border border-white/10 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/[0.12] hover:text-white/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>

              {/* Notes list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {loadingNotes && (
                  <p className="text-xs text-white/20">Carregando notas...</p>
                )}
                {!loadingNotes && notes.length === 0 && (
                  <p className="text-xs text-white/20">Nenhuma nota ainda.</p>
                )}
                {notes.map((note) => {
                  const author = USERS_MAP[note.author_id];
                  return (
                    <div
                      key={note.id}
                      className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2"
                    >
                      <p className="text-sm text-white/70">{note.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/25">
                          {author?.name.split(" ")[0] || "—"}
                        </span>
                        <span className="text-[10px] text-white/15">
                          {new Date(note.created_at).toLocaleDateString("pt-BR")}{" "}
                          {new Date(note.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 bg-white/[0.02] backdrop-blur-xl border-t border-white/[0.06]">
          <div>
            {!isNew && onDelete && (
              <button
                onClick={handleDelete}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  confirmDelete
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-white/30 hover:text-red-400"
                }`}
              >
                {confirmDelete ? "Confirmar exclusao?" : "Excluir"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-white/40 hover:text-white/70 px-4 py-2 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="cta-button !text-xs !py-2 !px-6 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable field input ── */
function FieldInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
      />
    </div>
  );
}
