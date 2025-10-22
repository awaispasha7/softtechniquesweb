'use client';

import { usePathname } from 'next/navigation';
import ChatBotButton from './ChatBotButton';
import { useChat } from './ChatProvider';

export default function ConditionalChatButton() {
  const pathname = usePathname();
  const { isChatOpen, setChatOpen } = useChat();
  
  // Show chat button on main page and blog page, not on schedule page
  const showChatButton = pathname === '/' || pathname === '/blog';

  if (!showChatButton) {
    return null;
  }

  return <ChatBotButton isChatOpen={isChatOpen} setChatOpen={setChatOpen} />;
}

