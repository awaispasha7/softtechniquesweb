'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_ENDPOINTS } from '../../config/api';

export default function SchedulePage() {
  const router = useRouter();
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    date: '',
    time: '',
    message: ''
  });
  const [scheduleStatus, setScheduleStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{
    available_days?: string[];
    available_slots_by_day?: Record<string, string[]>;
  } | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Load available slots on component mount
  useEffect(() => {
    loadAvailableSlots();
  }, []);

  const loadAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(API_ENDPOINTS.CONSULTATION_AVAILABLE_SLOTS);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.available_slots);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Hit your backend consultation scheduling API
      const response = await fetch(API_ENDPOINTS.CONSULTATION_SCHEDULE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: scheduleForm.name,
          email: scheduleForm.email,
          phone: scheduleForm.phone,
          company: scheduleForm.company,
          preferred_date: scheduleForm.date,
          preferred_time: scheduleForm.time,
          message: scheduleForm.message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setScheduleStatus({ type: 'success', message: data.message || 'Thank you! We&apos;ll contact you soon to confirm your consultation.' });
        
        // Immediately refresh available slots to remove the booked time slot
        await loadAvailableSlots();
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setScheduleForm({
            name: '',
            email: '',
            phone: '',
            company: '',
            date: '',
            time: '',
            message: ''
          });
          setScheduleStatus(null);
        }, 3000);
      } else {
        setScheduleStatus({ type: 'error', message: data.message || 'There was an error scheduling your consultation. Please try again.' });
      }
    } catch (error) {
      console.error('Error scheduling consultation:', error);
      setScheduleStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'There was an error scheduling your consultation. Please try again or contact us directly.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d4539] via-[#3a5a4f] to-[#2d4539] flex items-center justify-center p-4">

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chat
          </button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo9.png"
              alt="Soft Techniques Logo"
              width={48}
              height={48}
              className="object-contain rounded-2xl"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Schedule a Consultation</h1>
              <p className="text-gray-400">Let&apos;s discuss how we can help your business</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#2d4539]/80 backdrop-blur-sm rounded-2xl border border-[#4a6b5f]/50 shadow-2xl p-8">
          <form onSubmit={handleScheduleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#3a5a4f]/60 border border-[#4a6b5f] rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={scheduleForm.email}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#3a5a4f]/60 border border-[#4a6b5f] rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={scheduleForm.phone}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#3a5a4f]/60 border border-[#4a6b5f] rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.company}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#3a5a4f]/60 border border-[#4a6b5f] rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            </div>

            {/* Scheduling Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Scheduling Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <select
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value, time: '' }))}
                    disabled={isLoadingSlots}
                    className="w-full px-4 py-3 bg-[#3a5a4f]/60 border border-[#4a6b5f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingSlots ? 'Loading dates...' : 'Select a date'}
                    </option>
                    {availableSlots?.available_days?.map((dateStr: string) => {
                      const [y, m, d] = (dateStr || '').split('-').map(Number);
                      const jsDate = new Date(y, (m || 1) - 1, d || 1);
                      const availableTimes = availableSlots.available_slots_by_day?.[dateStr] || [];
                      return (
                        <option key={dateStr} value={dateStr}>
                          {jsDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} ({availableTimes.length} slots available)
                        </option>
                      );
                    })}
                    {!availableSlots && !isLoadingSlots && (
                      <>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                        <option value="next-week">Next Week</option>
                        <option value="flexible">I&apos;m flexible</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    disabled={!scheduleForm.date || isLoadingSlots}
                    className="w-full px-4 py-3 bg-[#3a5a4f]/60 border border-[#4a6b5f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
                  >
                    <option value="">
                      {!scheduleForm.date ? 'Select a date first' : 'Select a time'}
                    </option>
                    {scheduleForm.date && availableSlots?.available_slots_by_day?.[scheduleForm.date]?.map((time: string) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                    {!availableSlots && !isLoadingSlots && (
                      <>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                        <option value="flexible">I&apos;m flexible</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tell us about your project (Optional)
                </label>
                <textarea
                  rows={4}
                  value={scheduleForm.message}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#3a5a4f]/60 border border-[#4a6b5f] rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your project, goals, or any specific requirements..."
                />
              </div>
            </div>

            {/* Status Message */}
            {scheduleStatus && (
              <div className={`p-4 rounded-lg ${
                scheduleStatus.type === 'success' ? 'bg-green-600/20 border border-green-500/50 text-green-300' : 'bg-red-600/20 border border-red-500/50 text-red-300'
              }`}>
                {scheduleStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Schedule My Consultation
              </button>
            </div>
          </form>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-[#4a6b5f]/50">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-4">📞 Prefer to Call?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span><strong>Phone:</strong> +1 (555) 012-3456</span>                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
}
