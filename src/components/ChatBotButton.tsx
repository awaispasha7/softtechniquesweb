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
          className={`fixed right-4 sm:right-8 bottom-8 z-30 flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-green-500/20 ${className}`}
          aria-label="Open chat bot"
          style={{ display: isChatOpen ? 'none' : 'flex' }}
        >
        {/* Chat Bot Icon */}
        <Image
          src="/logo9.png"
          alt="Soft Techniques Logo"
          width={24}
          height={24}
          className="object-contain rounded-lg"
          style={{ width: 'auto', height: 'auto' }}
        />
        
        {/* Button Text */}
        <span className="text-white font-semibold text-sm sm:text-base">Ask Aken</span>
        </button>
      )}

      {/* Chat Interface */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

