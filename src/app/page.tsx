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

export default function Home() {
  return (
    <ChatProvider>
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
    </ChatProvider>
  );
}
