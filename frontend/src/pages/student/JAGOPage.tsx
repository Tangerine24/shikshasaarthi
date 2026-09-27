import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { jagoApi } from '../../api';
import {
  MessageSquareHeart,
  Send,
  User,
  Bot,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export const JAGOPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = t('jago_interactive.initial_greeting');

  useEffect(() => {
    // Set initial greeting
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: initialGreeting,
        createdAt: new Date(),
      },
    ]);
  }, [i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || input).trim();
    if (!message || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await jagoApi.chat(message, conversationId, i18n.language);
      if (res.success && res.data) {
        setConversationId(res.data.conversationId);
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: res.data.reply,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: t('jago_interactive.error_reply'),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    t('jago_interactive.sample_1'),
    t('jago_interactive.sample_2'),
    t('jago_interactive.sample_3'),
    t('jago_interactive.sample_4'),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] font-body">
      {/* Top Banner: Controlled Assistant Identity */}
      <div className="bg-surface p-4 rounded-t-card border border-b-0 border-border shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-surface flex items-center justify-center font-heading font-bold shadow-xs">
            <MessageSquareHeart className="w-5 h-5 text-surface" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-lg text-primary-dark">JAGO Assistant</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {t('jago_interactive.verified_authority_note')}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {t('jago.identity_note')}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setConversationId(undefined);
            setMessages([
              {
                id: 'init-refresh',
                role: 'assistant',
                content: initialGreeting,
                createdAt: new Date(),
              },
            ]);
          }}
          className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center gap-1.5 p-2 rounded hover:bg-stone-100 transition"
          title={t('jago.new_conversation')}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('jago.new_conversation')}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-surface border-x border-border p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-primary text-surface' : 'bg-stone-100 text-primary border border-border'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  isUser
                    ? 'bg-primary text-surface rounded-tr-none'
                    : 'bg-stone-50 text-text-primary border border-border rounded-tl-none'
                }`}
              >
                {msg.content}
                <div
                  className={`text-[10px] mt-2 ${isUser ? 'text-surface/70 text-right' : 'text-text-muted'}`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-full bg-stone-100 border border-border flex items-center justify-center text-primary shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-stone-50 border border-border p-4 rounded-2xl rounded-tl-none text-xs text-text-secondary flex items-center gap-2">
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full" />
              <span>{t('jago.thinking')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-surface border-x border-t border-border px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-semibold text-text-muted shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> {t('jago_interactive.suggested_title')}:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs font-medium text-primary hover:text-primary-dark bg-stone-50 hover:bg-stone-100 border border-border px-3 py-1 rounded-full whitespace-nowrap transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="bg-surface p-4 rounded-b-card border border-border shadow-xs shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            className="flex-1 border border-border rounded-input px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            placeholder={t('jago.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-primary-dark text-surface px-5 py-2.5 rounded-input font-semibold text-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t('jago.send')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default JAGOPage;
