"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/admin-auth";
import type { Lead } from "@/lib/types";
import { USERS_MAP, KANBAN_COLUMNS } from "@/lib/types";
import KanbanBoard from "@/components/admin/KanbanBoard";
import LeadModal from "@/components/admin/LeadModal";

const userEntries = Object.entries(USERS_MAP);

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLead, setIsNewLead] = useState(false);

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter leads by assigned user and search
  const filteredLeads = leads.filter((l) => {
    if (filterUser !== "all" && l.assigned_to !== filterUser) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        l.nome?.toLowerCase().includes(q) ||
        l.empresa?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.telefone?.toLowerCase().includes(q) ||
        l.cidade?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Update lead (both in Supabase and local state)
  const handleUpdateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );

      const { error } = await supabase
        .from("leads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar lead:", error);
        fetchLeads(); // revert on error
      } else if (updates.status) {
        // Log activity for status changes
        const session = getSession();
        const newStatusLabel =
          KANBAN_COLUMNS.find((c) => c.key === updates.status)?.label ||
          updates.status;
        await supabase.from("lead_notes").insert({
          lead_id: id,
          author_id: session?.id,
          content: `Moveu para ${newStatusLabel}`,
        });
      }
    },
    [fetchLeads]
  );

  // Save from modal (edit or create)
  const handleSaveLead = useCallback(
    async (formData: Partial<Lead>) => {
      if (isNewLead) {
        // Create
        const { data, error } = await supabase
          .from("leads")
          .insert({
            nome: formData.nome || "Novo Lead",
            empresa: formData.empresa || null,
            email: formData.email || null,
            telefone: formData.telefone || null,
            especialidade: formData.especialidade || null,
            faturamento: formData.faturamento || null,
            cidade: formData.cidade || null,
            estado: formData.estado || null,
            observacoes: formData.observacoes || null,
            fonte: formData.fonte || null,
            assigned_to: formData.assigned_to || userEntries[0]?.[0] || "",
            status: "lead_novo",
            resposta: false,
            archived: false,
            kanban_order: leads.length,
          })
          .select()
          .single();

        if (error) {
          alert("Erro ao criar lead: " + error.message);
          return;
        }
        // Refetch all leads to ensure the new one appears in the correct position
        await fetchLeads();
      } else if (selectedLead) {
        // Update
        const { id, created_at, ...rest } = formData as Lead;
        await handleUpdateLead(selectedLead.id, rest);
      }

      setModalOpen(false);
      setSelectedLead(null);
      setIsNewLead(false);
    },
    [isNewLead, selectedLead, leads.length, handleUpdateLead, fetchLeads]
  );

  // Delete lead (archive)
  const handleDeleteLead = useCallback(
    async (id: string) => {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setModalOpen(false);
      setSelectedLead(null);

      await supabase
        .from("leads")
        .update({ archived: true, updated_at: new Date().toISOString() })
        .eq("id", id);
    },
    []
  );

  // Open card detail
  const handleCardClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsNewLead(false);
    setModalOpen(true);
  }, []);

  // Open new lead modal
  const handleNewLead = () => {
    setSelectedLead(null);
    setIsNewLead(true);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-montserrat)]">
      <div className="px-6 py-6 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">
              CRM
            </h1>
            <p className="text-xs text-white/30 mt-0.5">
              {leads.length} leads ativos
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter by user */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setFilterUser("all")}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  filterUser === "all"
                    ? "bg-white/[0.1] text-white/80"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                Todos
              </button>
              {userEntries.map(([id, u]) => (
                <button
                  key={id}
                  onClick={() => setFilterUser(id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    filterUser === id
                      ? "bg-white/[0.1] text-white/80"
                      : "text-white/30 hover:text-white/50"
                  }`}
                >
                  {u.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar lead..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Add new lead */}
            <button
              onClick={handleNewLead}
              className="cta-button !text-xs !py-2 !px-4 group"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Novo Lead
            </button>
          </div>
        </div>

        {/* Board */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white/20 text-sm">Carregando...</div>
          </div>
        ) : (
          <KanbanBoard
            leads={filteredLeads}
            onUpdateLead={handleUpdateLead}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      {/* Lead Modal */}
      <LeadModal
        lead={selectedLead}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLead(null);
          setIsNewLead(false);
        }}
        onSave={handleSaveLead}
        onDelete={handleDeleteLead}
        isNew={isNewLead}
      />
    </div>
  );
}
