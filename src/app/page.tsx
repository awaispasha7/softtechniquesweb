'use client';

import { useEffect, Suspense } from 'react';
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useChat } from '@/components/ChatProvider';
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import AboutSection from "@/components/AboutSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ChatProvider from "@/components/ChatProvider";

function HomeContent() {
  const searchParams = useSearchParams();
  const { setChatOpen } = useChat();

  useEffect(() => {
    // Check if chatbot should be opened from query parameter
    const openChat = searchParams.get('openChat');
    if (openChat === 'true') {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        setChatOpen(true);
        // Clean up URL by removing query parameter
        window.history.replaceState({}, '', '/');
      }, 300);
    }

    // Handle hash navigation when page loads (e.g., from blog page)
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    // Handle initial load
    handleHashNavigation();

    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, [searchParams, setChatOpen]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* AI Video Generation CTA */}
      <section className="bg-[#29473d] text-white border-y border-white/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-4 md:space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
              New · Sora-powered workflows
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Turn plain-language prompts into polished demo videos.
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              Describe the scenario once—and let our AI video pipeline handle the rest.
              Perfect for product explainers, internal training, and quick stakeholder demos
              without the production overhead.
            </p>
          </div>
          <div className="space-y-6 md:space-y-8">
            <div className="bg-black/20 border border-white/20 rounded-2xl p-5 md:p-6 backdrop-blur-sm space-y-3">
              <p className="text-sm font-semibold text-white/80">
                How it works
              </p>
              <ul className="space-y-2 text-sm text-white/75 list-disc list-inside">
                <li>Write a natural-language prompt for the scene you want.</li>
                <li>Choose the length (5–20 seconds) and submit.</li>
                <li>We generate and stream the finished video back to your browser.</li>
              </ul>
            </div>
            <Link
              href="/generate-video"
              className="inline-flex items-center justify-center bg-white text-[#29473d] px-8 py-3 rounded-full font-semibold text-base shadow-xl hover:shadow-2xl hover:bg-white/90 hover:scale-105 transition-all"
            >
              Generate a video now
            </Link>
          </div>
        </div>
      </section>

      <ServicesSection />
      <AboutSection />
      <WhyChooseUsSection />
      <CaseStudiesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <ChatProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </ChatProvider>
  );
}
