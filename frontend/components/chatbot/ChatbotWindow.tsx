'use client';

import React, { useEffect, useRef } from 'react';
import { X, Trash2, Bot } from 'lucide-react';
import { useChatbot } from './ChatbotProvider';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export const ChatbotWindow: React.FC = () => {
  const { isOpen, messages, toggleChatbot, clearMessages, isLoading } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle ESC key to close chatbot
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleChatbot();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, toggleChatbot]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-5 duration-300 sm:w-96 sm:h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Bot size={18} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">LCA Assistant</h3>
            <p className="text-xs text-blue-100">AI-Powered Environmental Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          )}
          
          <button
            onClick={toggleChatbot}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-ai-float">
                <Bot size={32} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to LCA Assistant!
            </h4>
            <p className="text-sm text-gray-600 max-w-xs leading-relaxed mb-4">
              I'm your AI-powered companion for Life Cycle Assessment questions, 
              sustainability metrics, and environmental impact analysis.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                🌱 Sustainability
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                📊 LCA Analysis
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                🔬 Environmental Impact
              </span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex flex-col max-w-[80%]">
                  <div className="px-4 py-2 rounded-lg bg-gray-100 rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput />
    </div>
  );
};