
import React, { useState, useEffect, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { BusinessInfo, ChatMessage, StoredAsset, LaunchedCampaign } from '../types';
import { dbStore } from '../services/storageService';
import { 
  Send, Brain, RefreshCw, Download, X, Plus,
  Activity, Rocket, Sparkles, AlertTriangle, Target, BarChart3,
  Volume2, Cpu, Eye, Image as ImageIcon
} from 'lucide-react';

interface SalesAgentProps {
  business: BusinessInfo;
  campaigns: LaunchedCampaign[];
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const SalesAgent: React.FC<SalesAgentProps> = ({ business, campaigns, history, setHistory }) => {
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isBusy]);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = { ...msg, id: Date.now().toString(), timestamp: new Date() };
    setHistory(prev => [...prev, newMsg]);
  };

  const handleTTS = async (messageId: string, text: string) => {
    if (playingId) return;
    setPlayingId(messageId);
    try {
      const base64 = await gemini.generateSpeech(text);
      if (!base64) throw new Error();
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await ctx.decodeAudioData(Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setPlayingId(null);
      source.start();
    } catch {
      setPlayingId(null);
    }
  };

  const handleCommand = async () => {
    if (!input.trim() && !attachedImage) return;

    const currentInput = input;
    const currentImg = attachedImage;
    setInput('');
    setAttachedImage(null);

    addMessage({ role: 'user', type: 'text', content: currentInput });
    if (currentImg) addMessage({ role: 'user', type: 'image', content: currentImg });
    
    setIsBusy(true);

    try {
      const response = await gemini.getComplexAdvice(currentInput, business, campaigns, currentImg ? { data: currentImg, mimeType: 'image/png' } : undefined);
      addMessage({ role: 'model', type: 'text', content: response });
    } catch (e: any) {
      addMessage({ role: 'model', type: 'error', content: "Fallo en la sincronización." });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-180px)] animate-fadeIn pb-10">
      <div className="glass rounded-[3.5rem] border border-white/10 flex flex-col overflow-hidden bg-slate-900/20 shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Brain size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-tighter">PHOENIX AI COMMAND</h4>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Motor Táctico en Español (Conciso)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <Activity size={12} className="text-emerald-400 animate-pulse" />
               <span className="text-[8px] font-black text-emerald-400 uppercase">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-black/10">
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
               <Target size={48} className="text-cyan-400" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Analiza tus campañas o genera creativos aquí</p>
            </div>
          )}
          
          {history.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
              <div className="max-w-[85%] group relative">
                {msg.type === 'text' && (
                  <div className={`p-5 rounded-[2rem] text-[13px] leading-relaxed font-bold relative ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'glass border-white/10 text-slate-200 rounded-tl-none italic'}`}>
                    {msg.content}
                    {msg.role === 'model' && (
                      <button onClick={() => handleTTS(msg.id, msg.content)} className={`absolute -right-12 top-2 p-2 rounded-full glass border-white/5 text-slate-500 hover:text-white transition-all ${playingId === msg.id ? 'text-rose-500 animate-pulse' : 'opacity-0 group-hover:opacity-100'}`}><Volume2 size={16} /></button>
                    )}
                  </div>
                )}
                {msg.type === 'image' && (
                  <div className="glass p-2 rounded-[2.5rem] border border-cyan-500/30">
                    <img src={msg.content} className="rounded-[2rem] max-w-sm shadow-2xl" />
                  </div>
                )}
                {msg.type === 'error' && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-slate-900/40 border-t border-white/5 space-y-4">
          {attachedImage && (
            <div className="flex items-center gap-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl animate-fadeIn">
               <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10"><img src={attachedImage} className="w-full h-full object-cover" /></div>
               <div className="flex-1"><p className="text-[10px] font-black text-white uppercase">Imagen cargada</p></div>
               <button onClick={() => setAttachedImage(null)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><X size={16}/></button>
            </div>
          )}
          
          <div className="flex gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"><ImageIcon size={24} /></button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => {
              const f = e.target.files?.[0];
              if(f){ const r=new FileReader(); r.onload=()=>setAttachedImage(r.result as string); r.readAsDataURL(f); }
            }} />
            <div className="relative flex-1">
               <input 
                 value={input} 
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && !isBusy && handleCommand()}
                 placeholder="Ej: 'Optimiza mi campaña actual' o 'Analiza esta imagen'..."
                 className="w-full bg-black/60 border border-white/10 p-5 rounded-[2rem] text-sm font-bold text-white outline-none focus:border-cyan-500 pr-16"
               />
               <button onClick={handleCommand} disabled={isBusy} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-cyan-600 text-white shadow-xl hover:scale-105 active:scale-95 disabled:opacity-30">
                 {isBusy ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
