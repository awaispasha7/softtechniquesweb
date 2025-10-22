"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { useChat } from "./ChatProvider";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const { setChatOpen } = useChat();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleContactClick = () => {
    setChatOpen(true);
    closeMenu(); // Close mobile menu if open
  };

  const handleDropdownMouseEnter = useCallback(() => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsResourcesDropdownOpen(true);
  }, [dropdownTimeout]);

  const handleDropdownMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsResourcesDropdownOpen(false);
    }, 150); // Small delay to allow clicking
    setDropdownTimeout(timeout);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-[#29473d] backdrop-blur-sm border-b-2 border-white/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18 lg:h-20 w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={closeMenu}>
              <div className="w-[200px] h-[200px] rounded-full flex items-center justify-center -mt-2 -ml-4">
                <Image
                  src="/logo8.png"
                  alt="SoftTechniques Logo"
                  width={1000}
                  height={1000}
                  className="w-[200px] h-[200px] object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="#services"
              className="text-white/90 hover:text-white transition-colors text-xs font-medium"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="text-white/90 hover:text-white transition-colors text-xs font-medium"
            >
              About
            </Link>
            <Link
              href="#why-us"
              className="text-white/90 hover:text-white transition-colors text-xs font-medium"
            >
              Why Us
            </Link>
            <Link
              href="#case-studies"
              className="text-white/90 hover:text-white transition-colors text-xs font-medium"
            >
              Case Studies
            </Link>
            <button
              onClick={handleContactClick}
              className="text-white/90 hover:text-white transition-colors text-xs font-medium"
            >
              Contact
            </button>
            
            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
                className="text-white/90 hover:text-white transition-colors text-xs font-medium flex items-center"
              >
                Resources
                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isResourcesDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-20 bg-white/10 backdrop-blur-sm rounded-md shadow-lg py-1 z-50 transform translate-x-4 border border-white/20"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <Link
                    href="/blog"
                    className="block px-4 py-2 text-xs text-white hover:bg-white/20 transition-colors duration-200 text-center"
                    onClick={() => setIsResourcesDropdownOpen(false)}
                  >
                    Blog
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center flex-shrink-0">
            <Link
              href="#about"
              className="bg-white text-[#29473d] px-4 py-1.5 rounded-full font-medium text-xs hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="block sm:block md:hidden lg:hidden xl:hidden 2xl:hidden flex flex-col items-center justify-center w-10 h-10 space-y-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
            aria-label="Toggle menu"
          >
            <span
              className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out bg-[#29473d] ${
            isMenuOpen
              ? "max-h-96 opacity-100 pb-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col space-y-4 pt-4 border-t border-white/20">
            <Link
              href="#services"
              onClick={closeMenu}
              className="text-white/90 hover:text-white transition-colors text-base font-medium py-2"
            >
              Services
            </Link>
            <Link
              href="#about"
              onClick={closeMenu}
              className="text-white/90 hover:text-white transition-colors text-base font-medium py-2"
            >
              About
            </Link>
            <Link
              href="#why-us"
              onClick={closeMenu}
              className="text-white/90 hover:text-white transition-colors text-base font-medium py-2"
            >
              Why Us
            </Link>
            <Link
              href="#case-studies"
              onClick={closeMenu}
              className="text-white/90 hover:text-white transition-colors text-base font-medium py-2"
            >
              Case Studies
            </Link>
            <button
              onClick={handleContactClick}
              className="text-white/90 hover:text-white transition-colors text-base font-medium py-2 text-left"
            >
              Contact
            </button>
            
            {/* Resources Section in Mobile Menu */}
            <div className="py-2">
              <div className="text-white text-base font-medium mb-2">Resources</div>
              <Link
                href="/blog"
                onClick={closeMenu}
                className="text-white/70 hover:text-white block py-1 text-sm font-medium"
              >
                Blog
              </Link>
            </div>
            <Link
              href="#about"
              onClick={closeMenu}
              className="bg-white text-[#29473d] px-6 py-3 rounded-full font-medium text-base hover:bg-white/90 transition-colors text-center mt-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
