'use client';

import React from 'react';
import { ChatbotIcon } from './ChatbotIcon';
import { ChatbotWindow } from './ChatbotWindow';

export const Chatbot: React.FC = () => {
  return (
    <>
      <ChatbotIcon />
      <ChatbotWindow />
    </>
  );
};