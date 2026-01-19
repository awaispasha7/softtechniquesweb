'use client';

import Image from 'next/image';
import ChatInterface from './ChatInterface';

interface ChatBotButtonProps {
  className?: string;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

export default function ChatBotButton({ className = '', isChatOpen, setChatOpen }: ChatBotButtonProps) {
  const toggleChatBot = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Bot Button - Only visible when chat is closed */}
      {!isChatOpen && (
        <button
          onClick={toggleChatBot}
          className={`fixed right-2 sm:right-4 md:right-8 bottom-4 sm:bottom-8 z-30 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#44559e] to-[#36447e] hover:from-[#36447e] hover:to-[#2a3360] text-white font-semibold rounded-2xl shadow-2xl hover:shadow-[#5566b0]/25 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-[#5566b0]/20 max-w-[calc(100vw-1rem)] ${className}`}
          aria-label="Open chat bot"
          style={{ display: isChatOpen ? 'none' : 'flex' }}
        >
        {/* Chat Bot Icon */}
        <Image
          src="/logo10.png"
          alt="SoftTechniques Logo"
          width={24}
          height={24}
          className="h-6 w-auto object-contain rounded-lg"
        />
        
        {/* Button Text */}
        <span className="text-white font-semibold text-sm sm:text-base">Ask SoftBot</span>
        </button>
      )}

      {/* Chat Interface */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

