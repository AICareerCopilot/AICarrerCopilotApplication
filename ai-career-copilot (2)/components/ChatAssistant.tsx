import React, { useState, useRef, useEffect } from 'react';
import type { ChatbotMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { Card } from './Card';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    { role: 'ai', content: "Hello! I'm the Career Commandant Bot. I'm here to help you conquer your job search. Ask me anything!" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage: ChatbotMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getChatbotResponse(userInput);
      const newAiMessage: ChatbotMessage = { role: 'ai', content: aiResponse };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatbotMessage = { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMessage = (msg: ChatbotMessage, index: number) => {
      const isUser = msg.role === 'user';
      return (
          <div key={index} className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : ''}`}>
              {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aqua to-purple flex items-center justify-center flex-shrink-0">
                      <Bot size={18} className="text-white" />
                  </div>
              )}
               <div className={`p-3 rounded-2xl max-w-sm ${isUser ? 'bg-accent text-white rounded-br-none' : 'bg-background/80 text-text-secondary rounded-bl-none'}`}>
                   <p className="text-sm">{msg.content}</p>
               </div>
               {isUser && (
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-text-secondary" />
                  </div>
               )}
          </div>
      )
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-aqua to-purple rounded-full shadow-2xl shadow-purple/30 flex items-center justify-center text-white transform hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-accent"
          aria-label="Open AI Career Coach"
        >
          <MessageSquare size={32} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500">
            <Card title="Career Commandant Bot" icon={<Bot className="text-aqua" />}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                    aria-label="Close chat"
                >
                    <X size={20} />
                </button>
                <div 
                    ref={chatContainerRef} 
                    className="h-80 overflow-y-auto p-4 space-y-4 bg-background/50 rounded-xl mb-4"
                >
                    {messages.map(renderMessage)}
                    {isLoading && (
                       <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aqua to-purple flex items-center justify-center flex-shrink-0">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div className="p-3.5 rounded-2xl bg-background/80 rounded-bl-none flex items-center shadow-sm">
                               <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s] mx-1.5"></div>
                               <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-grow px-4 py-2 border border-border rounded-xl shadow-sm placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm bg-background/50"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !userInput.trim()} className="!p-3">
                        {isLoading ? <Spinner size="sm" /> : <Send size={18} />}
                    </Button>
                </form>
            </Card>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;