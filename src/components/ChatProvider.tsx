'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ConditionalChatButton from './ConditionalChatButton';

interface ChatContextType {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
  const [isChatOpen, setChatOpen] = useState(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, setChatOpen }}>
      {children}
      <ConditionalChatButton />
    </ChatContext.Provider>
  );
}





