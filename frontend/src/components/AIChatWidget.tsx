import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
// lucide-react icons for UI polish
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi there! I am your AI assistant. Ask me anything about the team\'s reports, blockers, or progress.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat panel when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { question: userMsg });
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'The AI is currently unavailable.',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
      
      <div style={styles.container}>
        {isOpen && (
          <div style={styles.chatPanel}>
            {/* Chat Header */}
            <div style={styles.header}>
              <h3 style={styles.title}>AI Manager Assistant</h3>
              <button onClick={toggleChat} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div style={styles.messageArea}>
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{
                    ...styles.messageWrapper,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    ...styles.messageBubble,
                    backgroundColor: msg.role === 'user' ? '#2563eb' : (msg.isError ? '#fee2e2' : '#f3f4f6'),
                    color: msg.role === 'user' ? 'white' : (msg.isError ? '#b91c1c' : '#1f2937'),
                    borderBottomRightRadius: msg.role === 'user' ? '2px' : '16px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '16px',
                    border: msg.isError ? '1px solid #f87171' : 'none',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div style={{...styles.messageWrapper, justifyContent: 'flex-start'}}>
                  <div style={{...styles.messageBubble, backgroundColor: '#f3f4f6', color: '#6b7280', display: 'flex', alignItems: 'center'}}>
                    <Loader2 size={16} className="spin-icon" style={{ marginRight: '8px' }} /> 
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} style={styles.inputArea}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about blockers, progress..."
                style={styles.inputField}
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()} style={styles.sendButton}>
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Floating Toggle Button */}
        {!isOpen && (
          <button onClick={toggleChat} style={styles.toggleBtn}>
            <MessageCircle size={28} color="white" />
          </button>
        )}
      </div>
    </>
  );
};

// Inline CSS for the chat widget
const styles = {
  container: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    fontFamily: 'sans-serif',
  },
  toggleBtn: {
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
    transition: 'transform 0.2s',
  },
  chatPanel: {
    backgroundColor: 'white',
    width: '350px',
    height: '500px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  header: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  messageArea: {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    backgroundColor: '#fafafa',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '0.75rem 1rem',
    borderRadius: '16px',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
  },
  inputArea: {
    display: 'flex',
    padding: '0.75rem',
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    gap: '0.5rem',
  },
  inputField: {
    flex: 1,
    padding: '0.625rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '9999px',
    outline: 'none',
    fontSize: '0.875rem',
  },
  sendButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }
};

export default AIChatWidget;
