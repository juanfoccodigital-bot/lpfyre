"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/* ────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────── */

interface FormData {
  // Step 1
  nome_empresa: string;
  responsavel: string;
  email: string;
  whatsapp: string;
  site_atual: string;
  instagram: string;
  cidade: string;
  estado: string;
  cnpj: string;
  // Step 2
  segmento: string;
  descricao_negocio: string;
  tempo_empresa: string;
  faturamento: string;
  ticket_medio: string;
  funcionarios: string;
  // Step 3
  investiu_trafego: string;
  investimento_mensal: string;
  plataformas: string[];
  trabalhou_agencia: string;
  experiencia_agencia: string;
  como_clientes_chegam: string[];
  tem_crm: string;
  qual_crm: string;
  // Step 4
  desafios: string[];
  objetivo_fyre: string;
  visao_12_meses: string;
  tentou_nao_funcionou: string;
  // Step 5
  cliente_ideal: string;
  faixa_etaria: string[];
  genero: string;
  classe_social: string[];
  regiao_atuacao: string;
  cliente_valoriza: string[];
  // Step 6
  servicos_interesse: string[];
  urgencia_servicos: string;
  orcamento_marketing: string;
  // Step 7
  tem_bm_meta: string;
  tem_google_ads: string;
  tem_google_analytics: string;
  tem_identidade_visual: string;
  algo_mais: string;
  como_conheceu: string;
}

const INITIAL_FORM: FormData = {
  nome_empresa: "",
  responsavel: "",
  email: "",
  whatsapp: "",
  site_atual: "",
  instagram: "",
  cidade: "",
  estado: "",
  cnpj: "",
  segmento: "",
  descricao_negocio: "",
  tempo_empresa: "",
  faturamento: "",
  ticket_medio: "",
  funcionarios: "",
  investiu_trafego: "",
  investimento_mensal: "",
  plataformas: [],
  trabalhou_agencia: "",
  experiencia_agencia: "",
  como_clientes_chegam: [],
  tem_crm: "",
  qual_crm: "",
  desafios: [],
  objetivo_fyre: "",
  visao_12_meses: "",
  tentou_nao_funcionou: "",
  cliente_ideal: "",
  faixa_etaria: [],
  genero: "",
  classe_social: [],
  regiao_atuacao: "",
  cliente_valoriza: [],
  servicos_interesse: [],
  urgencia_servicos: "",
  orcamento_marketing: "",
  tem_bm_meta: "",
  tem_google_ads: "",
  tem_google_analytics: "",
  tem_identidade_visual: "",
  algo_mais: "",
  como_conheceu: "",
};

const STEP_TITLES = [
  "Dados da Empresa",
  "Sobre o Negócio",
  "Marketing Atual",
  "Objetivos & Desafios",
  "Público-Alvo",
  "Serviços de Interesse",
  "Acessos & Extras",
];

/* ────────────────────────────────────────────────────────
   SPINNING LOGO
   ──────────────────────────────────────────────────────── */

function SpinningLogo({ size = "w-24 h-24", imgSize = "w-6" }: { size?: string; imgSize?: string }) {
  const spinText = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";
  return (
    <div className={`relative ${size}`}>
      <svg
        className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]"
        viewBox="0 0 100 100"
      >
        <defs>
          <path id="cpBriefing" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-white/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
          <textPath href="#cpBriefing">{spinText}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <img src="/images/logo-fyre-circle.png" alt="FYRE" className={`${imgSize} h-auto`} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   STEP INDICATOR
   ──────────────────────────────────────────────────────── */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              i === current
                ? "bg-white text-black scale-110"
                : i < current
                ? "bg-white/20 text-white/60"
                : "border border-white/10 text-white/20"
            }`}
          >
            {i < current ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div className={`w-4 sm:w-8 h-px transition-all duration-500 ${i < current ? "bg-white/20" : "bg-white/5"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   FORM FIELD COMPONENTS
   ──────────────────────────────────────────────────────── */

const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors font-[family-name:var(--font-montserrat)]";
const labelClass = "block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2";
const textareaClass = `${inputClass} min-h-[100px] resize-none`;

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-white/20">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-white/20">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={textareaClass}
      />
    </div>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
  required = false,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-white/20">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 border ${
              value === opt
                ? "bg-white text-black border-white"
                : "bg-white/[0.03] text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  required = false,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
}) {
  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  };

  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-white/20">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 border flex items-center gap-2 ${
              values.includes(opt)
                ? "bg-white text-black border-white"
                : "bg-white/[0.03] text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center flex-shrink-0 ${
              values.includes(opt) ? "bg-black border-black" : "border-white/30"
            }`}>
              {values.includes(opt) && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   FORM STEPS
   ──────────────────────────────────────────────────────── */

function Step1({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <TextInput label="Nome da empresa" value={form.nome_empresa} onChange={(v) => update("nome_empresa", v)} placeholder="Ex: FYRE Automação & I.A" required />
      <TextInput label="Nome do responsável" value={form.responsavel} onChange={(v) => update("responsavel", v)} placeholder="Seu nome completo" required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextInput label="E-mail" value={form.email} onChange={(v) => update("email", v)} placeholder="seu@email.com" type="email" required />
        <TextInput label="WhatsApp" value={form.whatsapp} onChange={(v) => update("whatsapp", v)} placeholder="(00) 00000-0000" type="tel" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextInput label="Site atual" value={form.site_atual} onChange={(v) => update("site_atual", v)} placeholder="www.seusite.com.br" />
        <TextInput label="Instagram" value={form.instagram} onChange={(v) => update("instagram", v)} placeholder="@seuinstagram" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextInput label="Cidade" value={form.cidade} onChange={(v) => update("cidade", v)} placeholder="Sua cidade" />
        <TextInput label="Estado" value={form.estado} onChange={(v) => update("estado", v)} placeholder="UF" />
      </div>
      <TextInput label="CNPJ" value={form.cnpj} onChange={(v) => update("cnpj", v)} placeholder="00.000.000/0000-00" />
    </div>
  );
}

function Step2({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <TextInput label="Segmento / Nicho" value={form.segmento} onChange={(v) => update("segmento", v)} placeholder="Ex: Odontologia, E-commerce, SaaS..." required />
      <TextArea label="Descreva seu negócio em uma frase" value={form.descricao_negocio} onChange={(v) => update("descricao_negocio", v)} placeholder="O que sua empresa faz e para quem..." required />
      <RadioGroup
        label="Há quanto tempo a empresa existe?"
        options={["Menos de 1 ano", "1-3 anos", "3-5 anos", "5-10 anos", "Mais de 10 anos"]}
        value={form.tempo_empresa}
        onChange={(v) => update("tempo_empresa", v)}
        required
      />
      <RadioGroup
        label="Faturamento mensal médio"
        options={["Até R$20k", "R$20k-50k", "R$50k-100k", "R$100k-300k", "R$300k-500k", "R$500k-1M", "Acima de R$1M", "Prefiro não informar"]}
        value={form.faturamento}
        onChange={(v) => update("faturamento", v)}
        required
      />
      <TextInput label="Ticket médio do seu produto/serviço" value={form.ticket_medio} onChange={(v) => update("ticket_medio", v)} placeholder="Ex: R$500" />
      <RadioGroup
        label="Quantos funcionários?"
        options={["Só eu", "2-5", "6-15", "16-50", "50+"]}
        value={form.funcionarios}
        onChange={(v) => update("funcionarios", v)}
        required
      />
    </div>
  );
}

function Step3({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateArray = (key: keyof FormData, value: string[]) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <RadioGroup
        label="Já investiu em marketing digital?"
        options={["Sim", "Não"]}
        value={form.investiu_trafego}
        onChange={(v) => update("investiu_trafego", v)}
        required
      />
      {form.investiu_trafego === "Sim" && (
        <TextInput label="Quanto investe por mês?" value={form.investimento_mensal} onChange={(v) => update("investimento_mensal", v)} placeholder="Ex: R$3.000/mês" />
      )}
      <CheckboxGroup
        label="Quais plataformas/ferramentas já usou?"
        options={["Meta Ads", "Google Ads", "Automação (n8n, Zapier, etc)", "CRM", "Chatbots / IA", "Nenhuma"]}
        values={form.plataformas}
        onChange={(v) => updateArray("plataformas", v)}
      />
      <RadioGroup
        label="Já trabalhou com empresa de tecnologia/automação?"
        options={["Sim", "Não"]}
        value={form.trabalhou_agencia}
        onChange={(v) => update("trabalhou_agencia", v)}
      />
      {form.trabalhou_agencia === "Sim" && (
        <TextArea label="Qual foi a experiência?" value={form.experiencia_agencia} onChange={(v) => update("experiencia_agencia", v)} placeholder="Conte sobre sua experiência..." />
      )}
      <CheckboxGroup
        label="Como os clientes chegam até você hoje?"
        options={["Indicação", "Redes sociais", "Google", "Marketing digital", "Outros"]}
        values={form.como_clientes_chegam}
        onChange={(v) => updateArray("como_clientes_chegam", v)}
      />
      <RadioGroup
        label="Tem CRM?"
        options={["Sim", "Não"]}
        value={form.tem_crm}
        onChange={(v) => update("tem_crm", v)}
      />
      {form.tem_crm === "Sim" && (
        <TextInput label="Qual CRM?" value={form.qual_crm} onChange={(v) => update("qual_crm", v)} placeholder="Ex: HubSpot, Pipedrive, RD Station..." />
      )}
    </div>
  );
}

function Step4({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateArray = (key: keyof FormData, value: string[]) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <CheckboxGroup
        label="Quais são seus 3 maiores desafios hoje?"
        options={[
          "Gerar leads qualificados",
          "Converter leads em clientes",
          "Reter clientes",
          "Escalar sem perder margem",
          "Sair da operação",
          "Posicionamento/Branding",
          "Automação de processos",
          "Criar presença digital",
          "Outro",
        ]}
        values={form.desafios}
        onChange={(v) => updateArray("desafios", v)}
        required
      />
      <TextArea label="Qual o principal objetivo com a FYRE?" value={form.objetivo_fyre} onChange={(v) => update("objetivo_fyre", v)} placeholder="O que você espera alcançar..." required />
      <TextArea label="Onde você se vê em 12 meses?" value={form.visao_12_meses} onChange={(v) => update("visao_12_meses", v)} placeholder="Sua visão de futuro..." required />
      <TextArea label="O que já tentou que não funcionou?" value={form.tentou_nao_funcionou} onChange={(v) => update("tentou_nao_funcionou", v)} placeholder="Opcional — nos ajuda a evitar caminhos já testados" />
    </div>
  );
}

function Step5({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateArray = (key: keyof FormData, value: string[]) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <TextArea label="Quem é seu cliente ideal?" value={form.cliente_ideal} onChange={(v) => update("cliente_ideal", v)} placeholder="Descreva o perfil do seu melhor cliente..." required />
      <CheckboxGroup
        label="Faixa etária"
        options={["18-25", "25-35", "35-45", "45-55", "55+"]}
        values={form.faixa_etaria}
        onChange={(v) => updateArray("faixa_etaria", v)}
        required
      />
      <RadioGroup
        label="Gênero predominante"
        options={["Masculino", "Feminino", "Ambos"]}
        value={form.genero}
        onChange={(v) => update("genero", v)}
        required
      />
      <CheckboxGroup
        label="Classe social"
        options={["A", "B", "C", "D/E"]}
        values={form.classe_social}
        onChange={(v) => updateArray("classe_social", v)}
        required
      />
      <RadioGroup
        label="Região de atuação"
        options={["Local", "Estadual", "Nacional", "Internacional"]}
        value={form.regiao_atuacao}
        onChange={(v) => update("regiao_atuacao", v)}
        required
      />
      <CheckboxGroup
        label="O que seu cliente mais valoriza?"
        options={["Preço", "Qualidade", "Atendimento", "Rapidez", "Exclusividade", "Status", "Conveniência"]}
        values={form.cliente_valoriza}
        onChange={(v) => updateArray("cliente_valoriza", v)}
        required
      />
    </div>
  );
}

function Step6({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateArray = (key: keyof FormData, value: string[]) => setForm((prev) => ({ ...prev, [key]: value }));

  const servicos = [
    { name: "Automação & IA", desc: "Fluxos automatizados, chatbots, agentes de IA e integrações inteligentes." },
    { name: "Automação Comercial", desc: "Funis automatizados, nutrição de leads, follow-up e qualificação com IA." },
    { name: "Sistemas & CRM", desc: "Dashboards, portais, CRM e centralização de dados e processos." },
    { name: "Site / Landing Page", desc: "Desenvolvimento de páginas de alta conversão." },
    { name: "Projetos Completos", desc: "Consultoria estratégica, diagnóstico completo e plano de escala personalizado." },
    { name: "FYRE HUB", desc: "Plataforma centralizada com dados, métricas e integrações em um único lugar." },
    { name: "Ecossistema 360°", desc: "Solução completa integrando todos os serviços." },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          Quais serviços te interessam? <span className="text-white/20">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {servicos.map((s) => {
            const selected = form.servicos_interesse.includes(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  updateArray(
                    "servicos_interesse",
                    selected
                      ? form.servicos_interesse.filter((v) => v !== s.name)
                      : [...form.servicos_interesse, s.name]
                  );
                }}
                className={`p-4 rounded-xl text-left transition-all duration-300 border ${
                  selected
                    ? "bg-white/[0.08] border-white/30"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 mt-0.5 rounded-[4px] border flex items-center justify-center flex-shrink-0 ${
                    selected ? "bg-white border-white" : "border-white/20"
                  }`}>
                    {selected && (
                      <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-1 transition-colors ${selected ? "text-white" : "text-white/60"}`}>{s.name}</p>
                    <p className="text-[10px] text-white/30 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <TextArea label="Tem urgência em algum deles?" value={form.urgencia_servicos} onChange={(v) => update("urgencia_servicos", v)} placeholder="Opcional — informe qual serviço tem mais prioridade" />
      <RadioGroup
        label="Orçamento mensal disponível para investimento"
        options={["Até R$2k", "R$2k-5k", "R$5k-10k", "R$10k-20k", "R$20k-50k", "Acima de R$50k", "A definir"]}
        value={form.orcamento_marketing}
        onChange={(v) => update("orcamento_marketing", v)}
        required
      />
    </div>
  );
}

function Step7({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <RadioGroup
        label="Tem Business Manager / Meta Ads?"
        options={["Sim", "Não", "Não sei"]}
        value={form.tem_bm_meta}
        onChange={(v) => update("tem_bm_meta", v)}
      />
      <RadioGroup
        label="Tem Google Ads?"
        options={["Sim", "Não"]}
        value={form.tem_google_ads}
        onChange={(v) => update("tem_google_ads", v)}
      />
      <RadioGroup
        label="Tem Google Analytics?"
        options={["Sim", "Não"]}
        value={form.tem_google_analytics}
        onChange={(v) => update("tem_google_analytics", v)}
      />
      <RadioGroup
        label="Tem identidade visual (logo, cores)?"
        options={["Sim", "Não", "Parcialmente"]}
        value={form.tem_identidade_visual}
        onChange={(v) => update("tem_identidade_visual", v)}
      />
      <TextArea label="Algo mais que gostaria de compartilhar?" value={form.algo_mais} onChange={(v) => update("algo_mais", v)} placeholder="Opcional — qualquer informação extra que ache relevante" />
      <RadioGroup
        label="Como conheceu a FYRE?"
        options={["Instagram", "Indicação", "Google", "LinkedIn", "Outro"]}
        value={form.como_conheceu}
        onChange={(v) => update("como_conheceu", v)}
        required
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────────────────── */

export default function BriefingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 7;

  const validateStep = (): boolean => {
    setError(null);
    switch (step) {
      case 0:
        if (!form.nome_empresa.trim()) { setError("Nome da empresa é obrigatório."); return false; }
        if (!form.responsavel.trim()) { setError("Nome do responsável é obrigatório."); return false; }
        if (!form.email.trim()) { setError("E-mail é obrigatório."); return false; }
        if (!form.whatsapp.trim()) { setError("WhatsApp é obrigatório."); return false; }
        return true;
      case 1:
        if (!form.segmento.trim()) { setError("Segmento é obrigatório."); return false; }
        if (!form.descricao_negocio.trim()) { setError("Descreva seu negócio."); return false; }
        if (!form.tempo_empresa) { setError("Selecione há quanto tempo a empresa existe."); return false; }
        if (!form.faturamento) { setError("Selecione o faturamento mensal."); return false; }
        if (!form.funcionarios) { setError("Selecione quantos funcionários."); return false; }
        return true;
      case 2:
        if (!form.investiu_trafego) { setError("Informe se já investiu em marketing digital."); return false; }
        return true;
      case 3:
        if (form.desafios.length === 0) { setError("Selecione ao menos um desafio."); return false; }
        if (!form.objetivo_fyre.trim()) { setError("Informe seu objetivo com a FYRE."); return false; }
        if (!form.visao_12_meses.trim()) { setError("Informe sua visão para 12 meses."); return false; }
        return true;
      case 4:
        if (!form.cliente_ideal.trim()) { setError("Descreva seu cliente ideal."); return false; }
        if (form.faixa_etaria.length === 0) { setError("Selecione ao menos uma faixa etária."); return false; }
        if (!form.genero) { setError("Selecione o gênero predominante."); return false; }
        if (form.classe_social.length === 0) { setError("Selecione ao menos uma classe social."); return false; }
        if (!form.regiao_atuacao) { setError("Selecione a região de atuação."); return false; }
        if (form.cliente_valoriza.length === 0) { setError("Selecione o que seu cliente mais valoriza."); return false; }
        return true;
      case 5:
        if (form.servicos_interesse.length === 0) { setError("Selecione ao menos um serviço."); return false; }
        if (!form.orcamento_marketing) { setError("Selecione o orçamento de investimento."); return false; }
        return true;
      case 6:
        if (!form.como_conheceu) { setError("Informe como conheceu a FYRE."); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setError(null);
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      const { nome_empresa, responsavel, email, whatsapp, ...rest } = form;

      const { error: dbError } = await supabase.from("briefings").insert({
        nome_empresa,
        responsavel,
        email,
        whatsapp,
        responses: rest,
      });

      if (dbError) throw dbError;

      setSubmitted(true);
    } catch (err) {
      console.error("Erro ao enviar briefing:", err);
      setError("Erro ao enviar briefing. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /* ── SUCCESS SCREEN ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 font-[family-name:var(--font-montserrat)]">
        <div className="text-center space-y-8 max-w-md">
          <div className="flex justify-center">
            <SpinningLogo size="w-28 h-28" imgSize="w-8" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-instrument)] text-white">
              Briefing enviado com sucesso!
            </h1>
            <p className="text-sm text-white/40 leading-relaxed">
              Nossa equipe vai analisar e entrar em contato em até 24h.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white/60">{form.nome_empresa}</p>
                <p className="text-[10px] text-white/30">{form.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── FORM ── */
  const renderStep = () => {
    switch (step) {
      case 0: return <Step1 form={form} setForm={setForm} />;
      case 1: return <Step2 form={form} setForm={setForm} />;
      case 2: return <Step3 form={form} setForm={setForm} />;
      case 3: return <Step4 form={form} setForm={setForm} />;
      case 4: return <Step5 form={form} setForm={setForm} />;
      case 5: return <Step6 form={form} setForm={setForm} />;
      case 6: return <Step7 form={form} setForm={setForm} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black font-[family-name:var(--font-montserrat)]">
      {/* ── HEADER ── */}
      <div className="pt-12 pb-6 flex flex-col items-center gap-6 px-6">
        <SpinningLogo size="w-20 h-20 sm:w-24 sm:h-24" imgSize="w-5 sm:w-6" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-instrument)] text-white">
            Briefing Estratégico
          </h1>
          <p className="text-xs sm:text-sm text-white/30 max-w-md leading-relaxed">
            Preencha com o máximo de detalhes para construirmos a melhor estratégia.
          </p>
        </div>
      </div>

      {/* ── PROGRESS ── */}
      <div className="px-6 pb-2">
        <StepIndicator current={step} total={totalSteps} />
        <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest font-semibold">
          Etapa {step + 1} de {totalSteps} &mdash; {STEP_TITLES[step]}
        </p>
      </div>

      {/* ── FORM CARD ── */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
          {/* Section title */}
          <h2 className="text-xl sm:text-2xl font-[family-name:var(--font-instrument)] text-white mb-8">
            {STEP_TITLES[step]}
          </h2>

          {/* Fields */}
          {renderStep()}

          {/* Error */}
          {error && (
            <div className="mt-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
            {step > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:border-white/20 hover:text-white/70 transition-all"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  "Enviar Briefing"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
