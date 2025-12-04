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

      {/* AI Video Generation CTA - Prominent Section */}
      <section className="relative bg-gradient-to-br from-[#29473d] via-[#1a3329] to-[#0f1f1a] text-white border-y-2 border-white/20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                What&apos;s New
              </span>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Try Our New{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                  AI Video Generation
                </span>{' '}
                Module
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
                Transform your ideas into stunning videos in seconds. Powered by OpenAI&apos;s Sora 2, 
                our video generation tool lets you create professional-quality clips from simple text prompts.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/generate-video"
                  className="group inline-flex items-center justify-center bg-white text-[#29473d] px-8 py-4 rounded-full font-bold text-base shadow-2xl hover:shadow-white/50 hover:bg-white/90 hover:scale-105 transition-all"
                >
                  Generate Video Now
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/generate-video"
                  className="inline-flex items-center justify-center border-2 border-white/40 text-white px-6 py-4 rounded-full font-semibold text-sm hover:bg-white/10 hover:border-white/60 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    How It Works
                  </p>
                </div>
                <ul className="space-y-3 text-sm md:text-base text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="text-white mt-1 font-bold">✓</span>
                    <span>Write a detailed prompt describing your video scene</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white mt-1 font-bold">✓</span>
                    <span>Select duration (5-20 seconds) and submit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white mt-1 font-bold">✓</span>
                    <span>Watch your video generate in real-time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white mt-1 font-bold">✓</span>
                    <span>Download or share your generated video instantly</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-white/10 to-blue-500/10 border border-white/20 rounded-xl p-4 text-center">
                <p className="text-sm text-white font-semibold">
                  🎬 Powered by OpenAI Sora 2 · Beta Access Available Now
                </p>
              </div>
            </div>
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
