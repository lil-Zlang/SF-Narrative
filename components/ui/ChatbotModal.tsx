'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: {
    headline: string;
    weekOf: string;
    hypeContent: string;
    backlashContent: string;
    summary: string;
    hypeTweets?: any[];
    backlashTweets?: any[];
  };
}

export default function ChatbotModal({ isOpen, onClose, contextData }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm here to help you explore and understand the "${contextData.headline}" event. Ask me anything about the competing narratives, the evidence, or the broader implications for San Francisco!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    }
  }, [isOpen]);

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

      const data = await response.json();
      
      if (data.success && data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black w-full max-w-3xl h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b-2 border-black px-6 py-4 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-mono font-bold">AI Analysis Assistant</h3>
            <p className="text-xs font-mono text-gray-600 mt-1">
              Powered by DeepSeek via Novita AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-mono hover:bg-gray-200 px-3 py-1 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Context Info */}
        <div className="px-6 py-3 bg-gray-100 border-b border-gray-300">
          <p className="text-xs font-mono text-gray-700">
            <span className="font-bold">Context:</span> {contextData.headline} ({contextData.weekOf})
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 font-mono text-sm ${
                  message.role === 'user'
                    ? 'bg-black text-white border-2 border-black'
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-3 font-mono text-sm">
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
        <form onSubmit={handleSubmit} className="border-t-2 border-black p-4 bg-gray-50">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 px-4 py-2 font-mono text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-2 font-mono font-bold text-sm bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors border-2 border-black"
            >
              Send
            </button>
          </div>
          <p className="text-xs font-mono text-gray-500 mt-2">
            💡 Try asking: "What are the key tensions?", "Compare the narratives", "What's missing from this analysis?"
          </p>
        </form>
      </div>
    </div>
  );
}

