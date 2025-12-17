'use client';

import Link from 'next/link';

export default function VideoGenButton() {
  return (
    <Link
      href="/generate-video"
      className="fixed left-2 sm:left-4 md:left-8 bottom-4 sm:bottom-8 z-30 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#44559e] to-[#36447e] hover:from-[#36447e] hover:to-[#2a3360] text-white font-semibold rounded-2xl shadow-2xl hover:shadow-[#5566b0]/25 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-[#5566b0]/20 max-w-[calc(100vw-1rem)] animate-pulse hover:animate-none"
      aria-label="Generate AI Video"
    >
      {/* Video Icon */}
      <svg 
        className="w-5 h-5 sm:w-6 sm:h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      
      {/* Button Text */}
      <span className="text-white font-semibold text-sm sm:text-base">Generate Video</span>
    </Link>
  );
}

