'use client';

import { useEffect, Suspense } from 'react';
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
