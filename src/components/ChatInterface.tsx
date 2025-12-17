'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_ENDPOINTS } from '../config/api';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, isTyping?: boolean}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typing effect function
  const typeMessage = useCallback((messageId: string, fullText: string, speed: number = 30) => {
    let currentIndex = 0;
    const messageElement = document.getElementById(`message-${messageId}`);
    
    if (!messageElement) return;

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        const partialText = fullText.substring(0, currentIndex);
        const formattedText = partialText
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #a0b0ff; font-weight: 700;">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em style="color: #E5E7EB; font-weight: 600;">$1</em>');
        messageElement.innerHTML = formattedText;
        currentIndex++;
        scrollToBottom();
      } else {
        clearInterval(typeInterval);
        // Mark message as no longer typing
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isTyping: false } : msg
        ));
      }
    }, speed);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add typing effect to welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText = `**Hi! I'm SoftBot from Soft Techniques**

I'm your **AI Solutions Expert**! I specialize in transforming businesses with cutting-edge AI technology. From custom AI models to intelligent automation, I help companies unlock their full potential through innovative solutions.

**What I Can Help You With:**

**Custom AI Solutions** - Tailored AI models for your specific business needs
**AI Integration** - Seamless deployment and integration services  
**Project Showcase** - See our successful AI implementations
**Transparent Pricing** - Clear, upfront costs for AI development

**Ready to transform your business with AI? Let's chat!**`;

      const welcomeMessage = {
        id: 'welcome-' + Date.now(),
        type: 'assistant' as const,
        content: welcomeText,
        isTyping: true
      };

      setMessages([welcomeMessage]);
      
      setTimeout(() => {
        typeMessage(welcomeMessage.id, welcomeText, 15);
      }, 1000);
    }
  }, [isOpen, messages.length, typeMessage]);


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Hit your backend chat API
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: `nextjs_session_${Date.now()}` // Generate session ID for Next.js frontend
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: data.response,
        isTyping: true
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Start typing effect after a short delay
      setTimeout(() => {
        typeMessage(assistantMessage.id, data.response, 25);
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      
      // Determine error message based on error type
      let errorContent = "Sorry, I encountered an error. Please try again or contact us directly at ask@softtechniques.com";
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorContent = "The AI service is temporarily unavailable. Please try again in a few moments or contact us at ask@softtechniques.com";
        } else if (error.message.includes('404')) {
          errorContent = "The chat service endpoint was not found. Please contact us at ask@softtechniques.com";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorContent = "Network connection issue. Please check your internet connection and try again.";
        }
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: errorContent,
        isTyping: true
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Start typing effect for error message
      setTimeout(() => {
        typeMessage(errorMessage.id, errorMessage.content, 25);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScheduleClick = () => {
    router.push('/schedule');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{ width: '100vw', maxWidth: '100%', left: 0, right: 0 }}
      />
      
      {/* Chat Interface */}
      <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-auto sm:right-4 md:right-8 bottom-4 sm:bottom-16 z-[100] w-[calc(100%-1rem)] sm:w-96 md:w-[28rem] max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-9rem)] flex flex-col animate-in slide-in-from-right-5 duration-300 max-w-full">
        {/* Chat Window */}
        <div className="relative bg-[#44559e] rounded-lg shadow-xl w-full h-full flex flex-col border border-[#5566b0]">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#5566b0] bg-[#36447e] rounded-t-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo10.png"
                alt="SoftTechniques Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain rounded-lg"
              />
              <div>
                <h3 className="font-medium text-white text-xs sm:text-sm">Soft Techniques</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleScheduleClick}
                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-[#44559e] to-[#5566b0] text-white text-xs rounded-md hover:from-[#36447e] hover:to-[#44559e] transition-all font-medium"
              >
                <span className="hidden sm:inline">Schedule Consultation</span>
                <span className="sm:hidden">Schedule</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-[#44559e]">
            <div className="space-y-4 sm:space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-[#44559e] to-[#5566b0] text-white'
                          : 'bg-[#36447e]/90 text-white border border-[#5566b0]/50 backdrop-blur-sm'
                      }`}
                    >
                      {message.type === 'assistant' && message.isTyping ? (
                        <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          <span id={`message-${message.id}`}></span>
                        </div>
                      ) : (
                        <div 
                          className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #a0b0ff; font-weight: 700;">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em style="color: #E5E7EB; font-weight: 600;">$1</em>')
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#36447e]/90 text-white border border-[#5566b0]/50 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl backdrop-blur-sm shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-gray-300">SoftBot is typing</span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5566b0] rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5566b0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5566b0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-6 border-t border-[#5566b0] bg-gradient-to-r from-[#36447e] to-[#44559e]">
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about AI solutions..."
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-[#5566b0] rounded-xl bg-[#36447e]/80 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5566b0]/50 focus:border-[#5566b0]/50 text-sm sm:text-base transition-all duration-300 hover:border-[#6677c0]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#44559e] to-[#5566b0] text-white rounded-xl hover:from-[#36447e] hover:to-[#44559e] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[#5566b0]/25 transform hover:scale-105 disabled:transform-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
