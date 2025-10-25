'use client';

import { useState, useRef, useEffect } from 'react';
import { UI_TEXT, UI_CONFIG, COMPONENT_SIZES } from '@/lib/constants';
import { componentStyles } from '@/lib/design-system';
import { handleApiError, logError } from '@/lib/error-handler';
import type { ChatbotModalProps, ChatbotMessage } from '@/lib/types';

/**
 * ChatbotModal Component
 * 
 * A floating chat interface that allows users to ask questions about
 * the current event and get AI-powered analysis
 */
export default function ChatbotModal({ isOpen, onClose, contextData }: ChatbotModalProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm here to help you explore and understand the "${contextData.headline}" event. Ask me anything about the competing narratives, the evidence, or the broader implications for San Francisco!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setIsMinimized(false);
      // Reset messages when opening
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm here to help you explore and understand the "${contextData.headline}" event. Ask me anything about the competing narratives, the evidence, or the broader implications for San Francisco!`
        }
      ]);
    }
  }, [isOpen, contextData.headline]);

  /**
   * Handle form submission for sending messages
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          contextData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      const appError = handleApiError(error, 'Chatbot');
      logError(appError, 'ChatbotModal');
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Widget */}
      <div className={`${componentStyles.modal.content} shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
      } flex flex-col`}>
        {/* Header */}
        <div className="border-b-2 border-black px-4 py-3 flex items-center justify-between bg-gray-50 cursor-pointer"
             onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-mono font-bold truncate">{UI_TEXT.CHATBOT_TITLE}</h3>
            {!isMinimized && (
              <p className="text-xs font-mono text-gray-600 truncate mt-0.5">
                {contextData.headline}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="text-lg font-mono font-bold hover:bg-gray-200 w-7 h-7 flex items-center justify-center transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '□' : '−'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-lg font-mono font-bold hover:bg-gray-200 w-7 h-7 flex items-center justify-center transition-colors"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages - Only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Context Info */}
            <div className="px-4 py-2 bg-gray-100 border-b border-gray-300">
              <p className="text-xs font-mono text-gray-700">
                <span className="font-bold">Week of:</span> {contextData.weekOf}
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 font-mono text-xs leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-black text-white border-2 border-black'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 border border-gray-300 px-3 py-2 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                      </div>
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t-2 border-black p-3 bg-gray-50">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={UI_TEXT.CHATBOT_PLACEHOLDER}
                  className={`${componentStyles.input.base} flex-1 text-xs`}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className={`${componentStyles.button.primary.base} ${componentStyles.button.primary.hover} ${componentStyles.button.primary.disabled} text-xs`}
                >
                  Send
                </button>
              </div>
              <p className="text-xs font-mono text-gray-500 mt-2">
                {UI_TEXT.CHATBOT_SUGGESTIONS}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
