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
import VideoGenButton from "@/components/VideoGenButton";

function HomeContent() {
  const searchParams = useSearchParams();
  const { setChatOpen } = useChat();

  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'chat') {
      setChatOpen(true);
    }
  }, [searchParams, setChatOpen]);

  return (
    <main className="relative z-0 bg-[#050816] text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <AboutSection />
      <CaseStudiesSection />
      <TestimonialsSection />
      
      {/* Football Analysis CTA Section */}
      <section id="football-analysis" className="relative bg-gradient-to-br from-[#44559e]/30 via-[#050816] to-[#2a3360]/30 text-white border-y-2 border-[#44559e]/30 overflow-hidden py-20 md:py-28">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="field-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#field-pattern)" className="text-blue-400" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-400/50 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                AI-Powered Analysis
              </span>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left Side - Main Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-600/20 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 
                  flex items-center justify-center shadow-2xl shadow-blue-500/50 mb-6">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Advanced{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300">
                  Football Analysis
                </span>{' '}
                with AI
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
                Upload a football match video and our advanced AI will automatically detect and track
                players and the ball in real-time using cutting-edge YOLO technology. Get professional-grade
                analysis with player detection, ball tracking, and detailed match insights.
              </p>
              
              {/* Enhanced Feature Tags */}
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Player Detection', icon: '👥' },
                  { name: 'Ball Tracking', icon: '⚽' },
                  { name: 'Real-time Analysis', icon: '⚡' },
                  { name: 'HD Output', icon: '🎬' }
                ].map((feature) => (
                  <span
                    key={feature.name}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600/10 to-purple-600/10 
                      border border-blue-400/30 rounded-full text-blue-300 font-medium
                      hover:bg-blue-600/20 hover:border-blue-400/50 transition-all duration-300
                      backdrop-blur-sm shadow-lg shadow-blue-500/10"
                  >
                    <span className="mr-2">{feature.icon}</span>
                    {feature.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/football-analysis"
                  className="group inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 
                    text-white px-8 py-4 rounded-full font-bold text-base shadow-2xl hover:shadow-blue-500/50 
                    hover:from-blue-500 hover:via-blue-400 hover:to-purple-500 hover:scale-105 transition-all"
                >
                  Analyze Football Video
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Right Side - How It Works & Info Cards */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-blue-600/10 
                border border-blue-400/30 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4 shadow-2xl shadow-blue-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 
                    border border-blue-400/50 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-white">
                    How It Works
                  </p>
                </div>
                <ul className="space-y-4 text-sm md:text-base text-gray-200">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg">✓</span>
                    <span>Upload your football match video (MP4, AVI, MOV, MKV, WebM)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg">✓</span>
                    <span>Our YOLO AI analyzes each frame to detect players and track the ball</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg">✓</span>
                    <span>Get real-time analysis with professional tracking overlays</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg">✓</span>
                    <span>Download your annotated video with player and ball tracking</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 
                border border-blue-400/30 rounded-xl p-5 text-center backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <p className="text-sm md:text-base text-blue-300 font-semibold">
                  ⚽ Powered by YOLO Object Detection · Max 5 min video · HD MP4 output
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
      <VideoGenButton />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
