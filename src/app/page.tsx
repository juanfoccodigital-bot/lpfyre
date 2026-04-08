"use client";

import { useState, useCallback } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ScrollProgress from "@/components/ScrollProgress";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeBanner from "@/components/MarqueeBanner";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import MarqueeBanner2 from "@/components/MarqueeBanner2";
import TechDivider from "@/components/TechDivider";
import Automatizacao from "@/components/Automatizacao";
import Founders from "@/components/Founders";
import Testimonials from "@/components/Testimonials";
import QuizChat from "@/components/QuizChat";
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
      <About />
      <WhatWeDo />
      <MarqueeBanner2 />
      <Automatizacao />
      <TechDivider />
      <Founders />
      <Testimonials />
      <QuizChat />
      <Footer />
    </main>
  );
}
