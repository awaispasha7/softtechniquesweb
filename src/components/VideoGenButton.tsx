'use client';

import Link from 'next/link';

export default function VideoGenButton() {
  return (
    <Link
      href="/generate-video"
      className="fixed left-4 sm:left-8 bottom-8 z-50 flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-4 bg-linear-to-r from-white to-blue-100 hover:from-blue-50 hover:to-white text-[#29473d] font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/40 animate-pulse hover:animate-none"
      aria-label="Generate AI Video"
    >
      {/* Video Icon */}
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      
      {/* Button Text */}
      <span className="text-[#29473d] font-bold text-sm sm:text-base">Generate Video</span>
    </Link>
  );
}

