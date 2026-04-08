"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toJpeg } from "html-to-image";
import { aiContent } from "@/lib/fyre-api";

/* ─── Types ─── */
interface Slide {
  headline: string;
  body: string;
  image: string;
}

const DEFAULT_SLIDE: Slide = { headline: "", body: "", image: "" };

const FONT_OPTIONS = [
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Instrument Serif", value: "'Instrument Serif', serif" },
];

const LOGO_POSITIONS = [
  { label: "Circular Centro", value: "top-center" },
  { label: "SVG Esq.", value: "top-left-svg" },
  { label: "Topo Esq.", value: "top-left" },
  { label: "Topo Dir.", value: "top-right" },
  { label: "Inf. Esq.", value: "bottom-left" },
  { label: "Inf. Dir.", value: "bottom-right" },
] as const;

type LogoPos = (typeof LOGO_POSITIONS)[number]["value"];

/* ─── Helpers ─── */
function logoStyle(pos: LogoPos): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", width: 80, height: "auto", opacity: 0.8, zIndex: 20 };
  switch (pos) {
    case "top-left": return { ...base, top: 32, left: 32 };
    case "top-right": return { ...base, top: 32, right: 32 };
    case "bottom-left": return { ...base, bottom: 32, left: 32 };
    case "bottom-right": return { ...base, bottom: 32, right: 32 };
    default: return { ...base, top: 32, left: 32 };
  }
}

/* ─── Component ─── */
export default function InstagramPostCreator() {
  const searchParams = useSearchParams();

  // Mode
  const [aiMode, setAiMode] = useState(true);
  const [isCarousel, setIsCarousel] = useState(false);

  // AI
  const [topic, setTopic] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  // Content — static
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  // Load from query params (from Calendário de Conteúdo)
  useEffect(() => {
    const mode = searchParams.get("mode");
    const slidesParam = searchParams.get("slides");
    const h = searchParams.get("headline");
    const b = searchParams.get("body");
    const c = searchParams.get("caption");
    const ht = searchParams.get("hashtags");

    if (mode === "carrossel" && slidesParam) {
      try {
        const parsed = JSON.parse(slidesParam);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIsCarousel(true);
          setSlides(parsed.map((s: { headline?: string; body?: string }) => ({
            headline: s.headline || "",
            body: s.body || "",
            image: "",
          })));
          setActiveSlide(0);
        }
      } catch { /* ignore */ }
    } else if (h || b) {
      if (h) setHeadline(h);
      if (b) setBody(b);
    }

    if (c) setCaption(c);
    if (ht) setHashtags(ht);
    if (h || b || c || ht || slidesParam) setAiMode(false);
  }, [searchParams]);
  const [image, setImage] = useState("");

  // Carousel
  const [slides, setSlides] = useState<Slide[]>([{ ...DEFAULT_SLIDE }]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Styling
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[1].value);
  const [headlineSize, setHeadlineSize] = useState(89);
  const [bodySize, setBodySize] = useState(34);
  const [headlineWeight, setHeadlineWeight] = useState(400);
  const [headlineItalic, setHeadlineItalic] = useState(false);
  const [lineHeight, setLineHeight] = useState(97);
  const [logoPos, setLogoPos] = useState<LogoPos>("top-center");
  const [logoSize, setLogoSize] = useState(60);
  const [gradientEnabled, setGradientEnabled] = useState(true);
  const [gradientOpacity, setGradientOpacity] = useState(1);

  // Text position
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [textPosY, setTextPosY] = useState(72);
  const [textPadding, setTextPadding] = useState(56);

  // Image position
  const [imageZoom, setImageZoom] = useState(100); // 100 = normal
  const [imagePosX, setImagePosX] = useState(50); // 0-100%
  const [imagePosY, setImagePosY] = useState(50); // 0-100%

  // Preview
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.35);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate preview scale based on container width
  useEffect(() => {
    function updateScale() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setPreviewScale(Math.min(w / 1080, 0.5));
      }
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  /* ─── Derived state for carousel ─── */
  const currentHeadline = isCarousel ? (slides[activeSlide]?.headline ?? "") : headline;
  const currentBody = isCarousel ? (slides[activeSlide]?.body ?? "") : body;
  const currentImage = isCarousel ? (slides[activeSlide]?.image ?? "") : image;

  /* ─── AI calls ─── */
  const generateText = useCallback(async () => {
    if (!topic.trim()) return;
    setLoadingText(true);
    try {
      const data = await aiContent({ action: "generate-text", topic, mode: isCarousel ? "carrossel" : "estatico" });
      if (data.error) { alert("Erro da IA: " + data.error); return; }
      const r = data.result || {};
      if (isCarousel && r.slides) {
        setSlides(r.slides.map((s: { headline: string; body: string }) => ({ headline: s.headline || "", body: s.body || "", image: "" })));
        setActiveSlide(0);
      } else {
        setHeadline(r.headline || "");
        setBody(r.body || "");
      }
      if (r.caption) setCaption(r.caption);
      if (r.hashtags) setHashtags(r.hashtags);
    } catch (err) {
      console.error("Erro ao gerar texto:", err);
      alert("Erro ao conectar com a IA. Tente novamente.");
    } finally {
      setLoadingText(false);
    }
  }, [topic, isCarousel]);

  const generateImage = useCallback(async () => {
    if (!topic.trim()) return;
    setLoadingImage(true);
    try {
      const data = await aiContent({ action: "generate-image", prompt: topic });
      if (data.imageUrl) {
        if (isCarousel) {
          updateSlide(activeSlide, "image", data.imageUrl);
        } else {
          setImage(data.imageUrl);
        }
      } else {
        alert("Erro ao gerar imagem. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
    } finally {
      setLoadingImage(false);
    }
  }, [topic, isCarousel, activeSlide]);

  /* ─── Carousel helpers ─── */
  function updateSlide(index: number, key: keyof Slide, value: string) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  }

  function addSlide() {
    if (slides.length >= 10) return;
    setSlides((prev) => [...prev, { ...DEFAULT_SLIDE }]);
    setActiveSlide(slides.length);
  }

  function removeSlide(index: number) {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setActiveSlide((prev) => Math.min(prev, slides.length - 2));
  }

  /* ─── Image upload ─── */
  function handleFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isCarousel) {
        updateSlide(activeSlide, "image", result);
      } else {
        setImage(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileChange(file);
  }

  /* ─── Export: clone the canvas div at full size ─── */
  async function handleDownload() {
    const node = canvasRef.current;
    if (!node) return;

    // Clone the node at full 1080x1350 size
    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.width = "1080px";
    clone.style.height = "1350px";
    clone.style.zIndex = "-1";
    clone.style.opacity = "1";
    document.body.appendChild(clone);

    // Wait for images inside clone to load
    const imgs = clone.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 150));

    try {
      const dataUrl = await toJpeg(clone, {
        quality: 0.95,
        width: 1080,
        height: 1350,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `fyre-post${isCarousel ? `-slide-${activeSlide + 1}` : ""}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export error:", err);
      alert("Erro ao exportar. Tente novamente.");
    } finally {
      document.body.removeChild(clone);
    }
  }

  async function handleDownloadAll() {
    const original = activeSlide;
    for (let i = 0; i < slides.length; i++) {
      setActiveSlide(i);
      await new Promise((r) => setTimeout(r, 400));
      await handleDownload();
    }
    setActiveSlide(original);
  }

  function copyCaption() {
    const text = `${caption}\n\n${hashtags}`;
    navigator.clipboard.writeText(text);
  }

  /* ─── UI ─── */
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header */}
      <div className="border-b border-white/[0.08] px-6 py-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Criador de Posts Instagram
        </h1>
        <p className="text-sm text-white/40 mt-1">Editor visual para feed 1080x1350</p>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* ═══ LEFT PANEL — Editor Controls ═══ */}
        <div className="w-full lg:w-[40%] border-r border-white/[0.08] overflow-y-auto" style={{ maxHeight: "calc(100vh - 73px)" }}>
          <div className="p-6 space-y-6">

            {/* Mode Toggles */}
            <div className="flex gap-3">
              <TogglePill active={aiMode} label="IA" onClick={() => setAiMode(true)} />
              <TogglePill active={!aiMode} label="Manual" onClick={() => setAiMode(false)} />
              <div className="w-px bg-white/10 mx-1" />
              <TogglePill active={!isCarousel} label="Estatico" onClick={() => setIsCarousel(false)} />
              <TogglePill active={isCarousel} label="Carrossel" onClick={() => setIsCarousel(true)} />
            </div>

            {/* AI Section */}
            {aiMode && (
              <GlassCard title="Geracao com IA">
                <label className="block text-xs text-white/50 mb-1">Sobre o que e o post?</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Como dobrar vendas com trafego pago"
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00FF88]/40 transition-colors"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={generateText}
                    disabled={loadingText || !topic.trim()}
                    className="flex-1 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#00FF88]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loadingText ? <Spinner /> : "Gerar com IA"}
                  </button>
                  <button
                    onClick={generateImage}
                    disabled={loadingImage || !topic.trim()}
                    className="flex-1 bg-white/[0.06] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-white/[0.1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loadingImage ? <Spinner /> : "Gerar Imagem IA"}
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Carousel Tabs */}
            {isCarousel && (
              <GlassCard title="Slides do Carrossel">
                <div className="flex gap-2 flex-wrap">
                  {slides.map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveSlide(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          activeSlide === i
                            ? "bg-[#00FF88] text-black"
                            : "bg-white/[0.06] text-white/60 hover:text-white"
                        }`}
                      >
                        Slide {i + 1}
                      </button>
                      {slides.length > 1 && (
                        <button
                          onClick={() => removeSlide(i)}
                          className="text-white/20 hover:text-red-400 text-xs transition-colors"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSlide}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] border border-dashed border-white/[0.15] text-white/40 hover:text-white/70 transition-colors"
                  >
                    + Slide
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Text Inputs */}
            <GlassCard title="Textos">
              <label className="block text-xs text-white/50 mb-1">Título principal <span className="text-white/20">(Enter = quebra de linha)</span></label>
              <textarea
                value={isCarousel ? slides[activeSlide]?.headline ?? "" : headline}
                onChange={(e) =>
                  isCarousel ? updateSlide(activeSlide, "headline", e.target.value) : setHeadline(e.target.value)
                }
                rows={3}
                placeholder={"Ex:\ninteligência\nARTIFICIAL"}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00FF88]/40 transition-colors resize-none"
              />

              <label className="block text-xs text-white/50 mb-1 mt-4">Subtítulo <span className="text-white/20">(Enter = quebra)</span></label>
              <textarea
                value={isCarousel ? slides[activeSlide]?.body ?? "" : body}
                onChange={(e) =>
                  isCarousel ? updateSlide(activeSlide, "body", e.target.value) : setBody(e.target.value)
                }
                rows={2}
                placeholder="Por quê você deve aprender a usar"
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00FF88]/40 transition-colors resize-none"
              />

              <label className="block text-xs text-white/50 mb-1 mt-4">Legenda (caption)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Legenda para o Instagram..."
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00FF88]/40 transition-colors resize-none"
              />

              <label className="block text-xs text-white/50 mb-1 mt-4">Hashtags</label>
              <textarea
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                rows={2}
                placeholder="#fyre #marketingdigital ..."
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00FF88]/40 transition-colors resize-none"
              />
            </GlassCard>

            {/* Image Upload */}
            <GlassCard title="Imagem">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/[0.12] rounded-xl p-6 text-center cursor-pointer hover:border-[#00FF88]/30 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
                <p className="text-sm text-white/40">Arraste uma imagem ou clique para enviar</p>
                <p className="text-xs text-white/20 mt-1">JPG, PNG, WebP</p>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-white/30">ou URL:</span>
                <input
                  value={currentImage.startsWith("data:") ? "" : currentImage}
                  onChange={(e) => {
                    if (isCarousel) updateSlide(activeSlide, "image", e.target.value);
                    else setImage(e.target.value);
                  }}
                  placeholder="https://..."
                  className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#00FF88]/40 transition-colors"
                />
              </div>

              {currentImage && (
                <>
                  <button
                    onClick={() => { if (isCarousel) updateSlide(activeSlide, "image", ""); else setImage(""); }}
                    className="mt-2 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    Remover imagem
                  </button>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="flex items-center justify-between text-xs text-white/50 mb-1"><span>Zoom: {imageZoom}%</span></label>
                      <input type="range" min={100} max={300} value={imageZoom} onChange={(e) => setImageZoom(Number(e.target.value))} className="w-full accent-[#00FF88]" />
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-xs text-white/50 mb-1"><span>Posição X: {imagePosX}%</span></label>
                      <input type="range" min={0} max={100} value={imagePosX} onChange={(e) => setImagePosX(Number(e.target.value))} className="w-full accent-[#00FF88]" />
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-xs text-white/50 mb-1"><span>Posição Y: {imagePosY}%</span></label>
                      <input type="range" min={0} max={100} value={imagePosY} onChange={(e) => setImagePosY(Number(e.target.value))} className="w-full accent-[#00FF88]" />
                    </div>
                  </div>
                </>
              )}
            </GlassCard>

            {/* Styling */}
            <GlassCard title="Estilo">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Cor de fundo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-white/40 font-mono">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Cor do texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-white/40 font-mono">{textColor}</span>
                  </div>
                </div>
              </div>

              <label className="block text-xs text-white/50 mb-1 mt-4">Fonte</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00FF88]/40 transition-colors"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value} className="bg-black">
                    {f.label}
                  </option>
                ))}
              </select>

              <div className="mt-4">
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Título: {headlineSize}px</span>
                </label>
                <input type="range" min={20} max={160} value={headlineSize} onChange={(e) => setHeadlineSize(Number(e.target.value))} className="w-full accent-[#00FF88]" />
              </div>

              <div className="mt-3">
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Subtítulo: {bodySize}px</span>
                </label>
                <input type="range" min={12} max={80} value={bodySize} onChange={(e) => setBodySize(Number(e.target.value))} className="w-full accent-[#00FF88]" />
              </div>

              <div className="mt-3">
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Entrelinhas: {lineHeight}%</span>
                </label>
                <input type="range" min={70} max={160} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-[#00FF88]" />
              </div>

              <div className="mt-3">
                <label className="block text-xs text-white/50 mb-1">Peso do título</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[{l:"Light",v:300},{l:"Regular",v:400},{l:"Medium",v:500},{l:"SemiBold",v:600},{l:"Bold",v:700},{l:"ExtraBold",v:800},{l:"Black",v:900}].map((w) => (
                    <button key={w.v} onClick={() => setHeadlineWeight(w.v)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${headlineWeight === w.v ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30" : "bg-white/[0.04] text-white/40 border border-white/[0.06]"}`}>
                      {w.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button onClick={() => setHeadlineItalic(!headlineItalic)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium italic transition-colors ${headlineItalic ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30" : "bg-white/[0.04] text-white/40 border border-white/[0.06]"}`}>
                  Itálico
                </button>
              </div>

              <label className="block text-xs text-white/50 mb-1 mt-4">Logo</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {LOGO_POSITIONS.map((lp) => (
                  <button
                    key={lp.value}
                    onClick={() => setLogoPos(lp.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      logoPos === lp.value
                        ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30"
                        : "bg-white/[0.06] text-white/50 border border-white/[0.08] hover:text-white/80"
                    }`}
                  >
                    {lp.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="flex items-center justify-between text-xs text-white/50 mb-1"><span>Tamanho logo: {logoSize}px</span></label>
                <input type="range" min={32} max={160} value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full accent-[#00FF88]" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <label className="text-xs text-white/50">Gradiente escuro</label>
                <button
                  onClick={() => setGradientEnabled(!gradientEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    gradientEnabled ? "bg-[#00FF88]" : "bg-white/[0.12]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      gradientEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {gradientEnabled && (
                <div className="mt-3">
                  <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                    <span>Opacidade: {Math.round(gradientOpacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(gradientOpacity * 100)}
                    onChange={(e) => setGradientOpacity(Number(e.target.value) / 100)}
                    className="w-full accent-[#00FF88]"
                  />
                </div>
              )}
            </GlassCard>

            {/* Text Position */}
            <GlassCard title="Posicao do Texto">
              <label className="block text-xs text-white/50 mb-1">Alinhamento</label>
              <div className="flex gap-2 mb-4">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setTextAlign(a)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      textAlign === a
                        ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30"
                        : "bg-white/[0.06] text-white/50 border border-white/[0.08] hover:text-white/80"
                    }`}
                  >
                    {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
                  </button>
                ))}
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Posição vertical: {textPosY}%</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={textPosY}
                  onChange={(e) => setTextPosY(Number(e.target.value))}
                  className="w-full accent-[#00FF88]"
                />
                <div className="flex justify-between text-[9px] text-white/20 mt-0.5">
                  <span>Topo</span>
                  <span>Meio</span>
                  <span>Base</span>
                </div>
              </div>

              <div className="mt-3">
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Margem lateral: {textPadding}px</span>
                </label>
                <input
                  type="range"
                  min={24}
                  max={120}
                  value={textPadding}
                  onChange={(e) => setTextPadding(Number(e.target.value))}
                  className="w-full accent-[#00FF88]"
                />
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ═══ RIGHT PANEL — Preview ═══ */}
        <div className="w-full lg:w-[60%] flex flex-col items-center justify-start p-4 lg:p-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 73px)" }}>
          <p className="text-xs text-white/30 mb-3 self-start">Preview (1080 x 1350)</p>

          {/* Preview wrapper — contains the scaled div */}
          <div
            ref={containerRef}
            style={{
              width: 1080 * previewScale,
              height: 1350 * previewScale,
              overflow: "hidden",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* THE REAL 1080x1350 div — used for BOTH preview and export */}
            <div
              id="post-canvas"
              ref={canvasRef}
              style={{
                width: 1080,
                height: 1350,
                position: "absolute",
                top: 0,
                left: 0,
                overflow: "hidden",
                background: bgColor,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              {/* Background image with zoom/position */}
              {currentImage && (
                <img
                  src={currentImage}
                  alt=""
                  style={{
                    position: "absolute",
                    width: `${imageZoom}%`,
                    height: `${imageZoom}%`,
                    objectFit: "cover",
                    left: `${50 - (imagePosX * imageZoom) / 100}%`,
                    top: `${50 - (imagePosY * imageZoom) / 100}%`,
                    transform: "translate(-50%, -50%) translate(50%, 50%)",
                    minWidth: "100%",
                    minHeight: "100%",
                  }}
                />
              )}

              {/* Gradient overlay */}
              {gradientEnabled && (
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(0,0,0,${gradientOpacity}) 0%, rgba(0,0,0,${gradientOpacity * 0.6}) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.15) 100%)`, zIndex: 5 }} />
              )}

              {/* Safe zone guide */}
              <div style={{ position: "absolute", top: 48, left: 48, right: 48, bottom: 48, border: "1px dashed rgba(255,255,255,0.04)", borderRadius: 8, zIndex: 3, pointerEvents: "none" }} />

              {/* Logo */}
              {(() => {
                const isSvg = logoPos === "top-left" || logoPos === "top-left-svg" || logoPos === "bottom-left";
                const src = isSvg ? "/images/logo-fyre.png" : "/images/logo-fyre-circle.png";
                const s: React.CSSProperties = { position: "absolute", width: logoSize, height: "auto", opacity: 0.9, zIndex: 20 };
                if (logoPos === "top-center") Object.assign(s, { top: 48, left: "50%", transform: "translateX(-50%)" });
                else if (logoPos === "top-left-svg" || logoPos === "top-left") Object.assign(s, { top: 48, left: 48 });
                else if (logoPos === "top-right") Object.assign(s, { top: 48, right: 48 });
                else if (logoPos === "bottom-left") Object.assign(s, { bottom: 48, left: 48 });
                else if (logoPos === "bottom-right") Object.assign(s, { bottom: 48, right: 48 });
                return <img src={src} alt="FYRE" style={s} />;
              })()}

              {/* Text block — real pixel values */}
              <div
                style={{
                  position: "absolute",
                  top: `${textPosY}%`,
                  transform: "translateY(-50%)",
                  left: textPadding,
                  right: textPadding,
                  zIndex: 10,
                  textAlign: textAlign,
                }}
              >
                {currentBody && (
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: bodySize, fontWeight: 300, color: textColor, opacity: 0.8, lineHeight: 1.4, margin: 0, marginBottom: 20, letterSpacing: "0.02em", whiteSpace: "pre-wrap" }}>
                    {currentBody}
                  </p>
                )}
                <h2 style={{ fontFamily, fontSize: headlineSize, fontWeight: headlineWeight, fontStyle: headlineItalic ? "italic" : "normal", color: textColor, lineHeight: lineHeight / 100, margin: 0, letterSpacing: "-0.02em", whiteSpace: "pre-wrap" }}>
                  {currentHeadline || "Seu título aqui"}
                </h2>
              </div>
            </div>
          </div>

          {/* Full Preview Modal */}
          {showFullPreview && (
            <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4" onClick={() => setShowFullPreview(false)}>
              <button className="absolute top-6 right-6 text-white/40 hover:text-white z-50" onClick={() => setShowFullPreview(false)}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <div style={{ width: "100%", maxWidth: 540, height: "auto", overflow: "hidden", borderRadius: 12 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ width: 1080, height: 1350, position: "relative", overflow: "hidden", background: bgColor, transform: `scale(${Math.min(540 / 1080, (window.innerHeight - 80) / 1350)})`, transformOrigin: "top left" }}>
                  {currentImage && <img src={currentImage} alt="" style={{ position: "absolute", width: `${imageZoom}%`, height: `${imageZoom}%`, objectFit: "cover", left: `${50 - (imagePosX * imageZoom) / 100}%`, top: `${50 - (imagePosY * imageZoom) / 100}%`, transform: "translate(-50%, -50%) translate(50%, 50%)", minWidth: "100%", minHeight: "100%" }} />}
                  {gradientEnabled && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(0,0,0,${gradientOpacity}) 0%, rgba(0,0,0,${gradientOpacity * 0.6}) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.15) 100%)`, zIndex: 5 }} />}
                  {(() => { const isSvg = logoPos.includes("left"); const src = isSvg ? "/images/logo-fyre.png" : "/images/logo-fyre-circle.png"; const s: React.CSSProperties = { position: "absolute", width: logoSize, height: "auto", opacity: 0.9, zIndex: 20 }; if (logoPos === "top-center") Object.assign(s, { top: 48, left: "50%", transform: "translateX(-50%)" }); else if (logoPos.startsWith("top")) Object.assign(s, { top: 48, [logoPos.includes("right") ? "right" : "left"]: 48 }); else Object.assign(s, { bottom: 48, [logoPos.includes("right") ? "right" : "left"]: 48 }); return <img src={src} alt="" style={s} />; })()}
                  <div style={{ position: "absolute", top: `${textPosY}%`, transform: "translateY(-50%)", left: textPadding, right: textPadding, zIndex: 10, textAlign }}>
                    {currentBody && <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: bodySize, fontWeight: 300, color: textColor, opacity: 0.8, lineHeight: 1.4, margin: "0 0 20px 0", whiteSpace: "pre-wrap" }}>{currentBody}</p>}
                    <h2 style={{ fontFamily, fontSize: headlineSize, fontWeight: headlineWeight, fontStyle: headlineItalic ? "italic" : "normal", color: textColor, lineHeight: lineHeight / 100, margin: 0, letterSpacing: "-0.02em", whiteSpace: "pre-wrap" }}>{currentHeadline || "Seu título aqui"}</h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export buttons */}
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            <button
              onClick={() => setShowFullPreview(true)}
              className="bg-white/[0.06] border border-white/[0.1] text-white font-semibold rounded-xl px-5 py-3 text-sm hover:bg-white/[0.1] transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="bg-[#00FF88] text-black font-semibold rounded-xl px-6 py-3 text-sm hover:bg-[#00FF88]/90 transition-colors"
            >
              Baixar JPEG
            </button>
            {isCarousel && slides.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="bg-[#0A3D2A] text-[#00FF88] font-semibold rounded-xl px-6 py-3 text-sm border border-[#00FF88]/20 hover:bg-[#0A3D2A]/80 transition-colors"
              >
                Baixar Todos
              </button>
            )}
            <button
              onClick={copyCaption}
              className="bg-white/[0.06] border border-white/[0.1] text-white font-semibold rounded-xl px-5 py-3 text-sm hover:bg-white/[0.1] transition-colors"
            >
              Copiar Legenda
            </button>
          </div>

          {/* Caption preview */}
          {(caption || hashtags) && (
            <div className="mt-6 w-full max-w-[540px] bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
              <p className="text-xs text-white/30 mb-2">Legenda:</p>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{caption}</p>
              {hashtags && <p className="text-sm text-[#00FF88]/60 mt-2 whitespace-pre-wrap">{hashtags}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */
function TogglePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
        active
          ? "bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30"
          : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
      }`}
    >
      {label}
    </button>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white/60 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto" />;
}
