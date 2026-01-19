'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Image removed - not used

// Component that uses useSearchParams - must be wrapped in Suspense
function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  
  const name = searchParams.get('name') || 'there';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'your preferred date';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const jsDate = new Date(y, m - 1, d);
      return jsDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/schedule')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Schedule
          </button>
        </div>

        {/* Confirmation Card */}
        <div className={`bg-[#36447e]/80 backdrop-blur-sm rounded-2xl border border-[#5566b0]/50 shadow-2xl p-8 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-[#44559e] to-[#5566b0] rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white mb-4">
              Your Appointment Has Been Booked!
            </h1>
            
            <p className="text-xl text-gray-300 mb-6">
              Thank you, <span className="text-white font-semibold">{name}</span>!
            </p>

            <div className="bg-[#44559e]/60 rounded-lg p-6 border border-[#5566b0] space-y-3">
              <p className="text-gray-300 text-lg">
                We&apos;ve received your consultation request and will contact you soon to confirm the details.
              </p>
              
              {(date || time) && (
                <div className="pt-4 border-t border-[#5566b0]">
                  <p className="text-gray-400 mb-2">Your preferred schedule:</p>
                  {date && (
                    <p className="text-white font-semibold">📅 Date: <strong>{formatDate(date)}</strong></p>
                  )}
                  {time && (
                    <p className="text-white font-semibold">🕐 Time: <strong>{time}</strong></p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 space-y-4">
              <p className="text-gray-400">
                Our team will reach out to you within 24 hours to confirm your appointment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => router.push('/schedule')}
                  className="px-6 py-3 bg-gradient-to-r from-[#44559e] to-[#5566b0] hover:from-[#36447e] hover:to-[#44559e] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Schedule Another
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-transparent border border-[#5566b0] hover:border-[#5566b0] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-[#5566b0]/50">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                <span className="text-pink-400">📞</span> Need to Make Changes?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-[#5566b0]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span><strong>Phone:</strong> +1 (555) 012-3456</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-[#5566b0]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span><strong>Email:</strong> ask@softtechniques.com</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-3">Our team is available Monday-Friday, 9 AM - 5 PM EST</p>
            </div>
          </div>
        </div>
      </div>
  );
}

// Main page component with Suspense boundary
export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#36447e] via-[#44559e] to-[#36447e] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="relative w-full max-w-2xl">
          <div className="bg-[#36447e]/80 backdrop-blur-sm rounded-2xl border border-[#5566b0]/50 shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-[#44559e] to-[#5566b0] rounded-full flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-gray-300 text-lg">Loading confirmation...</p>
          </div>
        </div>
      }>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}


