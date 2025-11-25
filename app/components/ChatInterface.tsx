"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { Send, Loader2, Bot, User, X } from 'lucide-react';
import { format } from 'date-fns';
import FormattedMessage from './FormattedMessage';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onClose?: () => void;
}

export default function ChatInterface({ messages, onSendMessage, isLoading = false, onClose }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="header-left">
          <Bot size={20} />
          <h3>Email Agent Chat</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-btn" title="Close Chat">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <Bot size={48} className="empty-icon" />
            <p>Ask me anything about your emails!</p>
            <div className="suggestions">
              <button onClick={() => setInput("Show me urgent emails")} className="suggestion">
                Show me urgent emails
              </button>
              <button onClick={() => setInput("What action items are due this week?")} className="suggestion">
                What action items are due this week?
              </button>
              <button onClick={() => setInput("Summarize today's emails")} className="suggestion">
                Summarize today's emails
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-icon">
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {msg.role === 'assistant' ? (
                      <FormattedMessage content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.timestamp && (
                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                  )}
                  {msg.referenced_emails && msg.referenced_emails.length > 0 && (
                    <div className="referenced-emails">
                      Referenced {msg.referenced_emails.length} email(s)
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-icon">
                  <Bot size={18} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your emails..."
          className="chat-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>

      <style jsx>{`
        .chat-interface {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: var(--bg-primary);
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          color: var(--text-primary);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }

        .close-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .chat-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          gap: 1.5rem;
        }

        .empty-icon {
          opacity: 0.5;
        }

        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          max-width: 450px;
        }

        .suggestion {
          padding: 1rem 1.25rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: left;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .suggestion:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-primary);
          color: var(--text-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .message {
          display: flex;
          gap: 0.75rem;
          animation: slideIn 0.3s ease-out;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          backdrop-filter: blur(10px);
        }

        .message.user .message-icon {
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .message.assistant .message-icon {
          background: rgba(139, 92, 246, 0.15);
          color: var(--accent-primary);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .message-content {
          max-width: 75%;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .message.user .message-content {
          align-items: flex-end;
        }

        .message-text {
          padding: 1rem 1.25rem;
          border-radius: 16px;
          line-height: 1.6;
          font-size: 0.9375rem;
          backdrop-filter: blur(20px);
        }

        .message.user .message-text {
          background: var(--gradient-primary);
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .message.assistant .message-text {
          background: var(--glass-bg);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
          border-bottom-left-radius: 6px;
        }

        .message-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          padding: 0 0.5rem;
        }

        .referenced-emails {
          font-size: 0.75rem;
          color: var(--accent-primary);
          padding: 0 0.5rem;
          font-weight: 500;
        }

        .typing-indicator {
          display: flex;
          gap: 0.375rem;
          padding: 1rem 1.25rem;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: pulse 1.4s ease-in-out infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        .chat-input-form {
          display: flex;
          gap: 0.75rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-default);
        }

        .chat-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          transition: all var(--transition-base);
        }

        .chat-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .chat-input::placeholder {
          color: var(--text-muted);
        }

        .chat-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chat-send-btn {
          padding: 0.875rem 1.5rem;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .chat-send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--accent-glow);
        }

        .chat-send-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
