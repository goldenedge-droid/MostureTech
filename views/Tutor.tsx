
import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponse } from '../services/geminiService';
import { ICONS } from '../constants';

interface Message {
  role: 'user' | 'tutor';
  text: string;
}

const Tutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'tutor', text: "Hello Technician. I am TechTutor. What moisture challenges are we solving today? I can help with psychrometric theory, site calculations, or historical context." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    const response = await getTutorResponse(userText);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'tutor', text: response || "I'm offline. Check your connection." }]);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
              ? 'bg-sky-600 text-white rounded-tr-none' 
              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about dew point, drying methods..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-slate-800 transition-all active:scale-95"
          >
            <ICONS.ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-3 text-center uppercase font-bold tracking-widest">Powered by Gemini AI Knowledge Engine</p>
      </div>
    </div>
  );
};

export default Tutor;
