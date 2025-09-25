'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatbot } from './ChatbotProvider';

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading } = useChatbot();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageToSend = message;
    setMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent text-sm
              min-h-[40px] max-h-[120px]
            "
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="
            flex-shrink-0 w-10 h-10 rounded-lg
            bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
            text-white flex items-center justify-center
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};