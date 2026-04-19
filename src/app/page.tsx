"use client";

import { useState, useCallback } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ScrollProgress from "@/components/ScrollProgress";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeBanner from "@/components/MarqueeBanner";
import ApplicationForm from "@/components/ApplicationForm";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import MarqueeBanner2 from "@/components/MarqueeBanner2";
import Automatizacao from "@/components/Automatizacao";
import TechDivider from "@/components/TechDivider";
import Results from "@/components/Results";
import ResultsShowcase from "@/components/ResultsShowcase";
import Founders from "@/components/Founders";
import FAQ from "@/components/FAQ";
import DiagnosticoIA from "@/components/DiagnosticoIA";
import Footer from "@/components/Footer";

export default function Home() {
  useScrollReveal();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <main className="relative">
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <ScrollProgress />
      <Navbar />
      <Hero />
      <MarqueeBanner />
      <ApplicationForm />
      <About />
      <WhatWeDo />
      <MarqueeBanner2 />
      <Automatizacao />
      <TechDivider />
      <Results />
      <ResultsShowcase />
      <Founders />
      <DiagnosticoIA />
      <FAQ />
      <Footer />
    </main>
  );
}
