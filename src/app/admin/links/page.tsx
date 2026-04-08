"use client";

import { useState } from "react";

const sections = [
  {
    title: "Institucional",
    links: [
      {
        title: "Apresentacao FYRE",
        description: "Pagina de apresentacao institucional da FYRE Automação & I.A para novos leads e prospects.",
        path: "/apresentacao",
      },
      {
        title: "Manual da Marca",
        description: "Guia de identidade visual completo: logo, cores, tipografia, tom de voz, modos de uso.",
        path: "/brand",
      },
      {
        title: "Modelos de Vendas",
        description: "Estruturas de funil, scripts e fechamento — 3 modelos: Inbound, Outbound e Indicacao.",
        path: "/modelo-de-vendas",
      },
    ],
  },
  {
    title: "Comercial",
    links: [
      {
        title: "Gerar Proposta",
        description: "Gerador de propostas comerciais personalizadas com link unico.",
        path: "/fechamento",
      },
      {
        title: "Briefing Estrategico",
        description: "Formulario completo de briefing para coletar dados do cliente (7 etapas).",
        path: "/briefing",
      },
      {
        title: "Link na Bio",
        description: "Pagina de link na bio para Instagram com CTAs e solucoes.",
        path: "/bio",
      },
    ],
  },
  {
    title: "Onboarding",
    links: [
      {
        title: "Onboarding Geral",
        description: "Formulario de onboarding padrao para todos os clientes novos.",
        path: "/onboarding-geral",
      },
      {
        title: "Onboarding Trafego Pago",
        description: "Coleta de acessos e informacoes para gestao de trafego pago.",
        path: "/onboarding-trafego",
      },
      {
        title: "Onboarding Automacao",
        description: "Briefing e acessos para projetos de automacao e integracao.",
        path: "/onboarding-automacao",
      },
      {
        title: "Onboarding Website",
        description: "Briefing completo para criacao ou redesign de websites.",
        path: "/onboarding-website",
      },
      {
        title: "Onboarding Sistema",
        description: "Levantamento de requisitos para desenvolvimento de sistemas.",
        path: "/onboarding-sistema",
      },
      {
        title: "Onboarding 360",
        description: "Onboarding completo para clientes do pacote 360 (todos os servicos).",
        path: "/onboarding-360",
      },
    ],
  },
  {
    title: "Interno",
    links: [
      {
        title: "Onboarding Parceiro",
        description: "Onboarding para novos membros do time FYRE — empresa, processos, ferramentas, cultura.",
        path: "/onboarding-parceiro",
      },
      {
        title: "Modelos de Vendas",
        description: "Scripts, funis e cadencias — Inbound, Outbound e Indicacao.",
        path: "/modelo-de-vendas",
      },
      {
        title: "Manual da Marca",
        description: "Identidade visual, cores, tipografia, tom de voz.",
        path: "/brand",
      },
    ],
  },
];

export default function LinksPage() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  function getFullUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }

  async function handleCopy(path: string) {
    try {
      await navigator.clipboard.writeText(getFullUrl(path));
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch {
      alert("Link copiado!");
    }
  }

  const glassCard = "bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm";

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] tracking-tight text-white">
            Links Hub
          </h1>
          <p className="text-xs font-light text-white/40 mt-1">
            Todos os links publicos do portal FYRE
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30 mb-4">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.links.map((link) => (
                  <div
                    key={link.path}
                    className={`${glassCard} p-5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 group`}
                  >
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors mb-1.5">
                      {link.title}
                    </h3>
                    <p className="text-xs text-white/30 leading-relaxed mb-4">
                      {link.description}
                    </p>
                    <p className="text-[10px] text-white/15 font-mono mb-4 truncate">
                      {link.path}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(link.path)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          copiedPath === link.path
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {copiedPath === link.path ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Copiado
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            Copiar
                          </>
                        )}
                      </button>
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/50 text-xs font-semibold hover:text-white/80 hover:bg-white/10 transition-all duration-200"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Abrir
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
