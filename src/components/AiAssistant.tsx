import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Languages,
  PhoneCall,
  Loader2,
  HelpCircle,
  Stethoscope,
  Info,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage, Language } from '../types';

interface AiAssistantProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ language, setLanguage }) => {
  const isHindi = language === 'hi';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        language === 'hi'
          ? `नमस्ते! मैं आरोग्य मित्र (HealthPulse AI) हूँ। 🏥
मैं आपकी मेडिकल रिपोर्ट्स के जटिल शब्दों को सरल हिन्दी में समझाने, स्वास्थ्य जांचों की जानकारी देने और सही डॉक्टर चुनने में मदद कर सकता हूँ।

आप मुझसे क्या पूछना चाहते हैं?`
          : `Hello! I am Arogya Mitra (HealthPulse AI Assistant). 🏥
I am here to help you understand medical terminology, explain diagnostic lab reports, and guide you towards the appropriate specialist doctor.

How can I assist your health journey today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = isHindi
    ? [
        'HbA1c 7.4% का क्या मतलब है?',
        'एक्स-रे में Consolidation का क्या अर्थ होता है?',
        '3 दिन से लगातार बुखार - किस डॉक्टर को दिखाएं?',
        'सीने में भारीपन लगे तो क्या करना चाहिए?',
      ]
    : [
        'Explain HbA1c 7.4% in simple terms',
        'What does Right Lower Lobe Infiltrate mean on an X-Ray?',
        'Persistent cough for 4 days - which specialist should I consult?',
        'What is the normal reference range for WBC count?',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          language,
        }),
      });

      const data = await response.json();
      const replyContent =
        data.reply ||
        (isHindi
          ? 'माफ़ कीजिए, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
          : 'Could not generate a response. Please check your connectivity and retry.');

      const isEmergency =
        text.toLowerCase().includes('chest') ||
        text.toLowerCase().includes('heart') ||
        text.toLowerCase().includes('सीने') ||
        text.toLowerCase().includes('दर्द') ||
        text.toLowerCase().includes('breath');

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emergencyAlert: isEmergency,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_err_${Date.now()}`,
          role: 'assistant',
          content: isHindi
            ? 'क्षमा करें, सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
            : 'Temporary connectivity error. Please try again.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg_welcome_new',
        role: 'assistant',
        content: isHindi
          ? 'बातचीत रीसेट कर दी गई है। आप अपनी मेडिकल रिपोर्ट या स्वास्थ्य संबंधी प्रश्न पूछ सकते हैं।'
          : 'Conversation cleared. You can ask any medical report terminology or specialist navigation query.',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[700px] max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold">
                {isHindi ? 'आरोग्य मित्र AI सहायक' : 'Arogya Mitra AI Assistant'}
              </h2>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Bilingual (EN / हिन्दी)
              </span>
            </div>
            <p className="text-xs text-teal-200">
              {isHindi
                ? 'मेडिकल रिपोर्ट शब्दावली एवं स्वास्थ्य मार्गदर्शन (निदान नहीं)'
                : 'Medical report term explainer & healthcare navigation'}
            </p>
          </div>
        </div>

        {/* Language switcher & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Switch to हिन्दी' : 'Switch to EN'}</span>
          </button>
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Clear Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Safety Notice Strip */}
      <div className="p-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] flex items-center justify-between px-4 shrink-0">
        <span className="flex items-center gap-1.5 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          {isHindi
            ? 'AI सहायक दवाइयां नहीं लिखता और न ही निश्चित निदान करता है। आपातकाल में 108 पर कॉल करें।'
            : 'AI Assistant does not prescribe medicine or provide definitive diagnosis. In emergency dial 108.'}
        </span>
        <a
          href="tel:108"
          className="text-red-700 font-bold hover:underline shrink-0 ml-2"
        >
          Emergency 108
        </a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser ? (
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                  U
                </div>
              )}

              <div className={`max-w-[85%] space-y-1 ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.emergencyAlert && (
                  <div className="p-2.5 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-bounce" />
                      Immediate Emergency Attention Recommended (Dial 108 / 112)
                    </span>
                    <a
                      href="tel:108"
                      className="px-2 py-0.5 bg-red-600 text-white rounded-md font-bold text-[10px]"
                    >
                      Call Now
                    </a>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 px-1 inline-block">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-500 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Analyzing medical query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 px-4">
        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 transition-colors whitespace-nowrap shrink-0 border border-slate-200/80"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              isHindi
                ? 'अपनी मेडिकल रिपोर्ट या लक्षण के बारे में पूछें...'
                : 'Ask about report values, medical terms, or specialist recommendations...'
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-teal-600/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isHindi ? 'भेजें' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
