"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { useChat } from "./ChatProvider";
import { useAuth } from "./AuthProvider";
import { signOutUser } from "@/lib/authService";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const { setChatOpen } = useChat();
  const { user, userData } = useAuth();

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

  const handleAccountDropdownMouseEnter = useCallback(() => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsAccountDropdownOpen(true);
  }, [dropdownTimeout]);

  const handleAccountDropdownMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsAccountDropdownOpen(false);
    }, 150);
    setDropdownTimeout(timeout);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsAccountDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-[#44559e] backdrop-blur-sm border-b-2 border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={closeMenu}>
              <div className="flex items-center justify-center">
                <Image
                  src="/logo10.png"
                  alt="SoftTechniques Logo"
                  width={200}
                  height={80}
                  className="h-12 sm:h-14 lg:h-16 w-auto object-contain rounded-lg"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Show on large tablets and up */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-center">
            <Link
              href="#services"
              className="text-white/90 hover:text-white transition-colors text-sm xl:text-base font-medium whitespace-nowrap"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="text-white/90 hover:text-white transition-colors text-sm xl:text-base font-medium whitespace-nowrap"
            >
              About
            </Link>
            <Link
              href="#why-us"
              className="text-white/90 hover:text-white transition-colors text-sm xl:text-base font-medium whitespace-nowrap"
            >
              Why Us
            </Link>
            <Link
              href="#case-studies"
              className="text-white/90 hover:text-white transition-colors text-sm xl:text-base font-medium whitespace-nowrap"
            >
              Case Studies
            </Link>
            <button
              onClick={handleContactClick}
              className="text-white/90 hover:text-white transition-colors text-sm xl:text-base font-medium whitespace-nowrap"
            >
              Contact
            </button>
            
            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
                className="text-white/90 hover:text-white transition-colors text-sm xl:text-base font-medium flex items-center whitespace-nowrap"
              >
                Resources
                <svg className="ml-1 h-3 w-3 xl:h-4 xl:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isResourcesDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-20 bg-white/30 backdrop-blur-sm rounded-md shadow-lg py-1 z-50 transform translate-x-4 border border-white/40"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <Link
                    href="/blog"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/40 transition-colors duration-200 text-center"
                    onClick={() => setIsResourcesDropdownOpen(false)}
                  >
                    Blog
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Account Icon & CTA Button - Show on large tablets and up */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onMouseEnter={handleAccountDropdownMouseEnter}
                  onMouseLeave={handleAccountDropdownMouseLeave}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-200 border border-white/30"
                  aria-label="Account menu"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                
                {/* Account Dropdown Menu */}
                {isAccountDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-sm rounded-md shadow-lg py-1 z-50 border border-white/20"
                    onMouseEnter={handleAccountDropdownMouseEnter}
                    onMouseLeave={handleAccountDropdownMouseLeave}
                  >
                    <div className="px-4 py-2 border-b border-white/20">
                      <p className="text-sm text-white font-medium truncate">{userData?.displayName || user.email}</p>
                      <p className="text-xs text-white/70 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            <Link
              href="#about"
              className="bg-white text-[#44559e] px-4 xl:px-6 py-1.5 xl:py-2 rounded-full font-medium text-sm xl:text-base hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile/Tablet Menu Button - Show on mobile and tablets */}
          <button
            onClick={toggleMenu}
            className="block lg:hidden flex flex-col items-center justify-center w-10 h-10 space-y-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
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

        {/* Mobile/Tablet Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out bg-[#44559e] ${
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
            {user && (
              <div className="py-2 border-t border-white/20 mt-2">
                <div className="text-white text-sm font-medium mb-1">{userData?.displayName || user.email}</div>
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  className="w-full text-left text-white/70 hover:text-white text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
            <Link
              href="#about"
              onClick={closeMenu}
              className="bg-white text-[#44559e] px-6 py-3 rounded-full font-medium text-base hover:bg-white/90 transition-colors text-center mt-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
