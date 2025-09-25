"use client";

import React from "react";
import { X, Sparkles } from "lucide-react";
import { useChatbot } from "./ChatbotProvider";

// Modern AI Icon Component
const ModernAIIcon: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Main AI Icon */}
      <div className="relative">
        {/* Core circle with gradient */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/90 to-white/70 flex items-center justify-center shadow-inner">
          {/* AI Brain/Chip Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
          >
            {/* Chip outline */}
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Circuit lines */}
            <path
              d="M8 8h8M8 12h8M8 16h8"
              stroke="currentColor"
              strokeWidth="1"
              className="animate-pulse"
            />

            {/* Connection dots */}
            <circle cx="6" cy="8" r="1" fill="currentColor" />
            <circle cx="18" cy="8" r="1" fill="currentColor" />
            <circle cx="6" cy="12" r="1" fill="currentColor" />
            <circle cx="18" cy="12" r="1" fill="currentColor" />
            <circle cx="6" cy="16" r="1" fill="currentColor" />
            <circle cx="18" cy="16" r="1" fill="currentColor" />

            {/* Central processing unit */}
            <rect
              x="10"
              y="10"
              width="4"
              height="4"
              rx="0.5"
              fill="currentColor"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Animated sparkle */}
        <div className="absolute -top-1 -right-1">
          <Sparkles size={12} className="text-yellow-400 animate-spin-slow" />
        </div>

        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
      </div>
    </div>
  );
};

export const ChatbotIcon: React.FC = () => {
  const { isOpen, toggleChatbot } = useChatbot();

  return (
    <button
      onClick={toggleChatbot}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700
        hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        flex items-center justify-center
        focus:outline-none focus:ring-4 focus:ring-blue-500/30
        ${isOpen ? "scale-95" : "scale-100 hover:scale-105"}
        group
      `}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <X size={24} className="text-white transition-transform duration-300" />
      ) : (
        <ModernAIIcon />
      )}

      {/* Subtle glow effect */}
      <div
        className={`
        absolute inset-0 rounded-full
        bg-gradient-to-br from-blue-400/20 to-indigo-600/20
        blur-sm
        ${!isOpen ? "opacity-100 group-hover:opacity-75" : "opacity-0"}
        transition-opacity duration-300
      `}
      ></div>

      {/* Status indicator */}
      <div
        className={`
        absolute -bottom-1 -right-1 w-4 h-4 
        bg-green-400 rounded-full border-2 border-white
        ${!isOpen ? "animate-pulse" : "hidden"}
      `}
      >
        <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
      </div>
    </button>
  );
};
