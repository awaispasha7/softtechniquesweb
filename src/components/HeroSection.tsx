"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [displayedText, setDisplayedText] = useState("");
  const [isClient, setIsClient] = useState(false);
  const fullText = "Simplifying Technology, Amplifying Growth";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    let charIndex = 0;
    
    const typeChar = () => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
        setTimeout(typeChar, 100); // 100ms delay between characters
      } else {
        // Wait 2 seconds, then restart
        setTimeout(() => {
          charIndex = 0;
          setDisplayedText("");
          typeChar();
        }, 2000);
      }
    };

    // Start typing after a short delay
    setTimeout(typeChar, 500);
  }, [isClient]);

  return (
    <section className="relative min-h-screen bg-[#44559e] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 md:pt-22 lg:pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block">
              <span className="text-white/70 text-sm md:text-base font-semibold uppercase tracking-wider mb-4 inline-block">
                Technology Consulting & Solutions
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight min-h-[280px] md:min-h-[320px] lg:min-h-[400px]">
              <span className="inline-block">
                {isClient ? displayedText : fullText}
              </span>
            </h1>

            <div className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-1 h-16 bg-white rounded-full mt-1"></div>
              <p className="text-lg md:text-xl text-white leading-relaxed max-w-xl font-medium">
                We help teams adopt technology the easy way—<span className="text-white font-semibold">clear methods</span>, 
                <span className="text-white font-semibold"> friendly guidance</span>, and 
                <span className="text-white font-semibold"> real business outcomes</span>. 
                From AI & automation to practical IT consulting and training, 
                <span className="text-white font-bold"> SoftTechniques makes tech approachable</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <Link
                href="#services"
                className="group bg-white text-[#44559e] px-8 py-4 rounded-full font-bold text-base hover:bg-white/90 transition-all hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                Explore Services
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#contact"
                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white hover:text-[#44559e] transition-all hover:scale-105 shadow-lg flex items-center gap-2"
              >
                Talk to Us
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
            </div>
            
            {/* Video Generation CTA */}
            <div className="pt-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <a
                href="#video-generation"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('video-generation')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center gap-2 bg-linear-to-r from-white to-blue-100 text-[#44559e] px-6 py-3 rounded-full text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all animate-pulse hover:animate-none"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#44559e] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#44559e]"></span>
                </span>
                Try Our New AI Video Generator
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/20 backdrop-blur-sm">
              <Image
                src="/soft1.jpg"
                alt="Server infrastructure and technology"
                width={600}
                height={450}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
            </div>
            <p className="text-white/60 text-sm mt-4 text-center italic">
              Photo by Unsplash (replace with project visuals)
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}

