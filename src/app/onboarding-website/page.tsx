"use client";

import OnboardingSlides, { type OnboardingSlide } from "@/components/OnboardingSlides";

const slides: OnboardingSlide[] = [
  {
    id: "cover",
    isCover: true,
    title: "",
  },
  {
    id: "boas-vindas",
    label: "Bem-vindo",
    title: (
      <>
        Bem-vindo à <span className="text-gradient italic">FYRE</span>
      </>
    ),
    subtitle: "Seu novo site será uma máquina de conversão.",
    body: (
      <div className="space-y-5">
        <p className="text-sm sm:text-base font-light text-white/50 leading-relaxed">
          Não criamos sites bonitos. Criamos <span className="text-white font-medium">plataformas estratégicas projetadas para converter</span>. Design, copy, performance e rastreamento — tudo pensado para gerar resultado.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: "🎨", text: "Design premium" },
            { icon: "⚡", text: "Performance otimizada" },
            { icon: "📱", text: "100% responsivo" },
            { icon: "📊", text: "Rastreamento integrado" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs sm:text-sm text-white/60 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "como-funciona",
    label: "Processo",
    title: (
      <>
        Como <span className="text-gradient italic">funciona</span>
      </>
    ),
    subtitle: "Do briefing ao site no ar.",
    body: (
      <div className="space-y-3">
        {[
          { step: "01", title: "Briefing & Estratégia", desc: "Entendemos seu negócio, público e objetivos. Definimos estrutura de páginas, hierarquia de conteúdo e metas de conversão.", time: "Semana 1" },
          { step: "02", title: "Wireframe & Arquitetura", desc: "Desenhamos a estrutura do site: navegação, seções, CTAs e fluxo do usuário. Você aprova antes do design.", time: "Semana 1-2" },
          { step: "03", title: "Design & Copy", desc: "Design de alta fidelidade + textos estratégicos com gatilhos de conversão. Cada pixel com propósito.", time: "Semana 2-3" },
          { step: "04", title: "Desenvolvimento", desc: "Construção com Next.js, performance otimizada, SEO técnico e responsividade total. Código limpo e escalável.", time: "Semana 3-4" },
          { step: "05", title: "Testes & Launch", desc: "QA completo, testes em dispositivos, velocidade e rastreamento. Deploy e monitoramento pós-launch.", time: "Semana 4-5" },
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-lg sm:text-xl font-black text-white/20">{item.step}</span>
              <span className="text-[8px] font-semibold tracking-wider uppercase text-white/15 mt-1">{item.time}</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "o-que-precisamos",
    label: "O que Precisamos",
    title: (
      <>
        Precisamos de <span className="text-gradient italic">você</span>
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          { title: "Identidade visual", desc: "Logo em alta resolução, paleta de cores, tipografia. Se não tiver brandbook, trabalhamos com o que houver." },
          { title: "Conteúdo e textos base", desc: "Sobre a empresa, serviços, diferenciais, depoimentos. Refinamos e criamos a copy final." },
          { title: "Fotos e vídeos", desc: "Materiais visuais do negócio, equipe, produtos. Se não tiver, orientamos uma sessão ou usamos banco de imagens." },
          { title: "Referências visuais", desc: "Sites que você admira ou que representam o estilo desejado. Ajuda no alinhamento criativo." },
          { title: "Domínio e hospedagem", desc: "Se já tem domínio, envie os dados de acesso. Se não tem, ajudamos a registrar." },
          { title: "Integrações necessárias", desc: "Google Analytics, WhatsApp, formulários, CRM, chatbot — tudo que precisa estar conectado." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-sm bg-white/15" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/35 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "entregas",
    label: "Entregas",
    title: (
      <>
        O que você <span className="text-gradient italic">recebe</span>
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          { title: "Site responsivo e otimizado", desc: "Funciona perfeitamente em desktop, tablet e mobile. Nota 90+ no PageSpeed." },
          { title: "SEO técnico implementado", desc: "Meta tags, sitemap, schema markup, URLs otimizadas e performance de carregamento." },
          { title: "Pixels e rastreamento", desc: "Google Analytics, Meta Pixel, Tag Manager — tudo configurado e testado." },
          { title: "Copy estratégica", desc: "Textos escritos para converter, não apenas informar. Gatilhos, CTAs e hierarquia de informação." },
          { title: "Painel de gestão (se aplicável)", desc: "Para sites com conteúdo dinâmico: blog, portfólio, depoimentos." },
          { title: "Documentação de entrega", desc: "Acessos, senhas, instruções de manutenção e guia de edição básica." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <div className="w-2 h-2 rounded-full bg-white/20 mt-1.5 flex-shrink-0 group-hover:bg-white/50 transition-colors" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "comunicacao",
    label: "Comunicação",
    title: (
      <>
        Como vamos nos <span className="text-gradient italic">comunicar</span>
      </>
    ),
    body: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "💬", title: "WhatsApp", desc: "Grupo exclusivo para alinhamentos, dúvidas e aprovações rápidas." },
            { icon: "📹", title: "Calls de aprovação", desc: "Reunião a cada entrega de etapa para validação e feedback." },
            { icon: "🎨", title: "Figma compartilhado", desc: "Acesso ao design em tempo real. Comente diretamente nas telas." },
            { icon: "🔗", title: "Link de preview", desc: "Site em ambiente de staging para você testar antes do launch." },
            { icon: "📂", title: "Portal do Cliente", desc: "Pasta exclusiva no Google Drive com todos os entregáveis, documentos, relatórios e materiais do projeto." },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-xl mb-2 block">{item.icon}</span>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/8 bg-white/[0.03]">
          <p className="text-xs font-medium text-white/50 leading-relaxed">
            <span className="text-white font-bold">Rodadas de revisão:</span> Cada etapa inclui até 2 rodadas de ajustes. Feedbacks claros e objetivos aceleram a entrega.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "proximos-passos",
    label: "Próximos Passos",
    title: (
      <>
        Vamos <span className="text-gradient italic">começar</span>
      </>
    ),
    body: (
      <div className="space-y-3">
        {[
          { num: "1", title: "Criação do grupo no WhatsApp", desc: "Grupo exclusivo com o time FYRE para comunicação direta e aprovações." },
          { num: "2", title: "Acesso ao Portal do Cliente", desc: "Pasta no Google Drive com todos os documentos, entregas e materiais do projeto." },
          { num: "3", title: "Preencher o briefing criativo", desc: "Enviaremos o formulário nas próximas 24h." },
          { num: "4", title: "Enviar materiais visuais", desc: "Logo, fotos, vídeos e referências." },
          { num: "5", title: "Call de kickoff", desc: "Alinhamento de estratégia, público e objetivos (45 min)." },
          { num: "6", title: "Aprovação do wireframe", desc: "Estrutura e navegação antes de ir pro design." },
          { num: "7", title: "Acompanhar no Figma", desc: "Design compartilhado para feedback em tempo real." },
        ].map((item) => (
          <div key={item.num} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-2xl font-black text-white/15 min-w-[32px] text-center">{item.num}</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] sm:text-xs font-light text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
        <div className="text-center mt-8 p-6 rounded-2xl border border-white/8 bg-white/[0.03]">
          <p className="text-sm font-medium text-white/60">Seu site vai ser uma máquina de conversão.</p>
          <p className="text-xs font-light text-white/30 mt-2">Qualquer dúvida, fale diretamente no grupo do WhatsApp.</p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingWebsite() {
  return (
    <OnboardingSlides
      slides={slides}
      coverTitle={
        <>
          Onboarding <br />
          <span className="text-gradient italic">Website & Landing Page</span>
        </>
      }
      coverSubtitle="Tudo o que você precisa saber para iniciar o desenvolvimento do seu site com a FYRE Automação & I.A."
    />
  );
}
