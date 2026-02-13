
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { BusinessInfo, LaunchedCampaign } from '../types';
import { X, Send, Terminal, MessageSquare, Plus, RefreshCw, Zap, ShieldCheck, Volume2 } from 'lucide-react';

export const SupportBubble: React.FC<{ business: BusinessInfo, campaigns: LaunchedCampaign[] }> = ({ business, campaigns }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string, id: string}[]>([
    { role: 'ai', text: 'Núcleo Phoenix v15.0 activo. ¿En qué puedo ayudarte? (Respuestas cortas activadas)', id: 'initial' }
  ]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{data: string, mimeType: string} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isBusy]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedMedia) || isBusy) return;
    
    const userText = input;
    const media = attachedMedia;
    const msgId = Date.now().toString();
    setInput('');
    setAttachedMedia(null);
    
    setMessages(prev => [...prev, { role: 'user', text: userText || "[Imagen enviada]", id: msgId }]);
    setIsBusy(true);

    try {
      let response = "";
      if (media) {
        response = await gemini.getComplexAdvice(userText, business, campaigns, media);
      } else {
        response = await gemini.getFastAdvice(userText, `Marca: ${business.name}. Nicho: ${business.niche}`);
      }
      setMessages(prev => [...prev, { role: 'ai', text: response, id: Date.now().toString() }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error de comunicación con el núcleo.", id: 'err' }]);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120]">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-85 glass rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-slideUp bg-[#0a0f1d]/98">
          <div className="bg-slate-900/80 p-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-rose-500" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Soporte Phoenix ES</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={18}/></button>
          </div>

          <div ref={scrollRef} className="h-96 overflow-y-auto p-5 space-y-4 bg-black/20 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] font-bold relative group ${msg.role === 'user' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 italic'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isBusy && (
              <div className="flex items-center gap-2 justify-center py-2 animate-pulse">
                <RefreshCw size={14} className="text-cyan-400 animate-spin" />
                <span className="text-[9px] font-black text-cyan-400 uppercase">Analizando...</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900/60 border-t border-white/5 flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">
              <Plus size={18}/>
            </button>
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                const reader = new FileReader();
                reader.onload = () => setAttachedMedia({ data: reader.result as string, mimeType: f.type });
                reader.readAsDataURL(f);
              }
            }} />
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Duda rápida..." 
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-rose-500" 
            />
            <button onClick={handleSend} disabled={isBusy} className="bg-rose-600 text-white p-3 rounded-xl hover:bg-rose-500">
              <Send size={16}/>
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center bg-rose-600 hover:scale-105 transition-all group">
        <MessageSquare className="text-white group-hover:rotate-12 transition-transform" size={28} />
      </button>
    </div>
  );
};
