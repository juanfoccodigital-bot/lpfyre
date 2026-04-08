"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, uploadFile } from "@/lib/supabase";
import { getPortalSession } from "@/lib/portal-auth";
import { ClientFile } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

const FILE_TYPE_COLORS: Record<string, string> = {
  contrato: "bg-purple-500/20 text-purple-400",
  relatorio: "bg-blue-500/20 text-blue-400",
  nota_fiscal: "bg-green-500/20 text-green-400",
  outro: "bg-white/10 text-white/50",
};

const FILE_TYPE_LABELS: Record<string, string> = {
  contrato: "Contrato",
  relatorio: "Relatorio",
  nota_fiscal: "Nota Fiscal",
  outro: "Outro",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
  );
}

function detectFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["pdf", "doc", "docx"].includes(ext)) return "contrato";
  if (["xls", "xlsx", "csv"].includes(ext)) return "relatorio";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "outro";
  return "outro";
}

export default function PortalArquivosPage() {
  const router = useRouter();
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState("auto");

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.push("/portal-cliente");
      return;
    }

    const cId = session.client_id;
    setClientId(cId);

    async function fetchData() {
      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("client_id", cId)
        .order("created_at", { ascending: false });

      setFiles((data as ClientFile[]) || []);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. Maximo 10MB.");
      return;
    }
    setUploading(true);
    const result = await uploadFile(file, clientId);
    if (!result) {
      alert("Erro ao fazer upload do arquivo.");
      setUploading(false);
      return;
    }
    const fileType = selectedFileType === "auto" ? detectFileType(file.name) : selectedFileType;
    const { data, error } = await supabase
      .from("files")
      .insert({
        client_id: clientId,
        name: file.name,
        file_url: result.url,
        file_type: fileType,
        uploaded_by: null,
      })
      .select()
      .single();
    if (error) { alert("Erro ao salvar arquivo: " + error.message); setUploading(false); return; }
    if (data) setFiles((prev) => [data as ClientFile, ...prev]);
    setUploading(false);
    setSelectedFileType("auto");
    e.target.value = "";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-10">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
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
          Arquivos
        </h1>
        <p className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          Seus documentos e arquivos
        </p>
      </div>

      {/* Upload zone */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 font-[family-name:var(--font-montserrat)]">
            Enviar Arquivo
          </p>
          <select
            className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none focus:border-white/30 transition-all"
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
          >
            <option value="auto">Tipo: Auto-detectar</option>
            <option value="contrato">Contrato</option>
            <option value="relatorio">Relatorio</option>
            <option value="nota_fiscal">Nota Fiscal</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <label className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all block">
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          {uploading ? (
            <>
              <svg className="w-8 h-8 text-white/20 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs text-white/40 font-[family-name:var(--font-montserrat)]">Enviando arquivo...</p>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-xs text-white/40 font-[family-name:var(--font-montserrat)]">Clique ou arraste um arquivo</p>
              <p className="text-[10px] text-white/20 mt-1">PDF, DOC, XLS, IMG ate 10MB</p>
            </>
          )}
        </label>
      </div>

      {files.length === 0 ? (
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
              d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            />
          </svg>
          <p className="text-white/30 text-sm font-[family-name:var(--font-montserrat)]">
            Nenhum arquivo disponivel ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const typeKey = file.file_type || "outro";
            return (
              <div
                key={file.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm flex flex-col"
              >
                {/* File icon */}
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                {/* Name + type */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm text-white font-medium font-[family-name:var(--font-montserrat)] line-clamp-2">
                    {file.name}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-[family-name:var(--font-montserrat)] ${
                      FILE_TYPE_COLORS[typeKey] || FILE_TYPE_COLORS.outro
                    }`}
                  >
                    {FILE_TYPE_LABELS[typeKey] || typeKey}
                  </span>
                </div>

                {/* Date */}
                <p className="text-xs text-white/30 mb-4 font-[family-name:var(--font-montserrat)]">
                  {formatDate(file.created_at)}
                </p>

                {/* Action */}
                <div className="mt-auto">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-xs font-medium font-[family-name:var(--font-montserrat)] hover:bg-white/[0.08] hover:text-white transition-colors"
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Abrir / Baixar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
