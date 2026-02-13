
import React, { useState, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { BusinessInfo, CampaignAsset, CreativeSlot } from '../types';
import { dbStore } from '../services/storageService';
import { PROVEN_STRATEGIES } from '../constants/strategies';
import { 
  Zap, RefreshCw, Rocket, Video, ImageIcon, Play, Tag,
  Cpu, Camera, ShieldCheck, Palette, Sparkles, Activity,
  ChevronRight, ArrowRight
} from 'lucide-react';

interface AdCreatorViewProps {
  business: BusinessInfo;
  slots: CreativeSlot[];
  setSlots: React.Dispatch<React.SetStateAction<CreativeSlot[]>>;
  onGenerateMedia: (slotId: string, type: 'image' | 'video') => Promise<void>;
  onAssetsGenerated: (assets: CampaignAsset[]) => void;
}

const AIProgressBar = ({ progress, status }: { progress: number, status: string }) => (
  <div className="w-full space-y-4 animate-fadeIn">
    <div className="flex justify-between items-end px-2">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">{status}</p>
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Inyección Phoenix Activa</p>
      </div>
      <p className="text-3xl font-black text-white italic">{Math.round(progress)}%</p>
    </div>
    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/10 p-[1.5px]">
      <div 
        className="h-full bg-gradient-to-r from-rose-700 via-rose-400 to-rose-700 rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(225,29,72,0.6)]" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  </div>
);

export const AdCreatorView: React.FC<AdCreatorViewProps> = ({ business, slots, setSlots, onGenerateMedia, onAssetsGenerated }) => {
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isAutoProducing, setIsAutoProducing] = useState(false);
  const strategy = PROVEN_STRATEGIES.find(s => s.id === business.strategyId) || PROVEN_STRATEGIES[0];

  const initCreator = async () => {
    if (slots.length > 0) return;
    setLoadingInitial(true);
    try {
      const data = await gemini.performFullMarketAnalysis(business, strategy);
      const angles = data.angles || [];
      const newSlots: CreativeSlot[] = angles.map((angle: any, i: number) => ({
        id: `slot_${i}_${Date.now()}`,
        angle: { name: angle.name, hookText: angle.hookText },
        type: null, status: 'idle', progress: 0, referenceImage: null, phase: 'Listo',
        personality: 'STORYTELLER'
      }));
      setSlots(newSlots);
    } catch (e) { console.error(e); } finally { setLoadingInitial(false); }
  };

  useEffect(() => { initCreator(); }, [business.strategyId]);

  const runAutoProduction = async () => {
    if (isAutoProducing) return;
    setIsAutoProducing(true);
    
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (slot.status === 'idle') {
        const type = i % 2 === 0 ? 'video' : 'image';
        try {
          await onGenerateMedia(slot.id, type);
          // Wait slightly for storage to catch up
          await new Promise(r => setTimeout(r, 500));
          const updatedSlot = dbStore.getCreativeSlots().find(s => s.id === slot.id);
          if (updatedSlot && updatedSlot.status === 'ready') {
            dbStore.saveAsset({
              id: updatedSlot.id,
              platform: 'META',
              type: updatedSlot.type!,
              url: updatedSlot.assetUrl!,
              title: updatedSlot.copy?.headline || "Creative IA",
              content: updatedSlot.copy?.primaryText || "",
              status: 'ready',
              isActive: true,
              funnelStage: 'COLD',
              metadata: updatedSlot.copy
            }, business);
          }
        } catch (e) { console.error(`Fallo en slot ${slot.id}`); }
      }
    }
    setIsAutoProducing(false);
  };

  const handleFinish = () => {
    const readyAssets: CampaignAsset[] = slots.filter(s => s.status === 'ready').map(s => ({
       id: s.id, platform: 'META', type: s.type!, funnelStage: 'COLD',
       url: s.assetUrl!, title: s.copy?.headline || "Creative",
       content: s.copy?.primaryText || "", status: 'ready', isActive: true,
       metadata: s.copy
    }));
    onAssetsGenerated(readyAssets);
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-8">
        <div className="flex-1 glass p-10 bg-slate-900/60 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu size={140} className="text-rose-500" /></div>
          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-rose-600/20 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-[0_0_30px_rgba(225,29,72,0.2)]"><Palette size={32} /></div>
                <div>
                   <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.5em]">Motor de Producción Masiva</p>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">{strategy.name}</h2>
                </div>
             </div>
             <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={runAutoProduction}
                  disabled={isAutoProducing || loadingInitial}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-14 py-6 rounded-2xl font-black uppercase text-[13px] tracking-[0.15em] flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-30"
                >
                   {isAutoProducing ? <RefreshCw size={22} className="animate-spin" /> : <Play size={22} fill="currentColor" />}
                   {isAutoProducing ? 'AUTOPRODUCCIÓN EN CURSO...' : 'ACTIVAR AUTOPILOTO CREATIVO'}
                </button>
                <div className="px-6 py-6 rounded-2xl border border-white/10 flex items-center gap-4 bg-white/5">
                   <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">{slots.filter(s => s.status === 'ready').length} / {slots.length} LISTOS</span>
                </div>
             </div>
          </div>
        </div>

        <div className="w-full lg:w-80">
           <button 
             onClick={handleFinish}
             disabled={!slots.some(s => s.status === 'ready')}
             className="h-full w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-20 text-white p-12 rounded-[3.5rem] border border-rose-500/30 font-black uppercase text-xl tracking-[0.1em] shadow-[0_0_60px_rgba(244,63,94,0.3)] transition-all flex flex-col items-center justify-center gap-6 active:scale-95"
           >
              <Rocket size={56} className="animate-bounce" />
              Lanzar Lote
           </button>
        </div>
      </div>

      {loadingInitial ? (
        <div className="h-[50vh] flex flex-col items-center justify-center space-y-12">
           <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 blur-[100px] scale-150 animate-pulse" />
              <Activity size={100} className="text-rose-500 animate-pulse relative z-10" />
           </div>
           <p className="text-sm font-black text-slate-500 uppercase tracking-[0.6em]">Sincronizando Psiquis de Venta...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {slots.map((slot, i) => (
            <div key={slot.id} className={`glass rounded-[3.5rem] border p-10 flex flex-col transition-all duration-700 relative overflow-hidden group hover:scale-[1.03] hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] ${slot.status === 'ready' ? 'border-cyan-500/40 bg-cyan-500/[0.04]' : 'border-white/5 bg-slate-900/40'}`}>
               <div className="aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden border border-white/5 relative mb-10 shadow-inner group-hover:border-cyan-500/30 transition-colors group-hover:neon-border-cyan">
                  {slot.status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-10 animate-fadeIn">
                       <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center text-slate-800 border border-white/5"><Camera size={32} /></div>
                       <div className="w-full space-y-4">
                          <button onClick={() => onGenerateMedia(slot.id, 'video')} className="w-full py-6 rounded-2xl bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 font-black text-[12px] uppercase tracking-widest transition-all shadow-xl">Video Cinematic</button>
                          <button onClick={() => onGenerateMedia(slot.id, 'image')} className="w-full py-6 rounded-2xl bg-cyan-600/10 hover:bg-cyan-600 text-cyan-500 hover:text-white border border-cyan-500/20 font-black text-[12px] uppercase tracking-widest transition-all shadow-xl">Foto Pro</button>
                       </div>
                    </div>
                  )}
                  {slot.status === 'generating' && (
                    <div className="absolute inset-0 bg-[#020617]/95 flex items-center justify-center p-10 backdrop-blur-md">
                       <AIProgressBar progress={slot.progress} status={slot.phase} />
                    </div>
                  )}
                  {slot.status === 'ready' && slot.assetUrl && (
                    <div className="absolute inset-0 animate-fadeIn creative-slot-glow">
                      {slot.type === 'video' ? <video src={slot.assetUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline /> : <img src={slot.assetUrl} className="w-full h-full object-cover" />}
                    </div>
                  )}
                  {slot.status === 'ready' && (
                    <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{slot.type} IA READY</span>
                          <button onClick={() => onGenerateMedia(slot.id, slot.type!)} className="text-white hover:text-rose-500 transition-colors"><RefreshCw size={16}/></button>
                       </div>
                    </div>
                  )}
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-start">
                     <h4 className="text-lg font-black text-white uppercase tracking-tighter italic flex-1 leading-tight">{slot.copy?.headline || slot.angle.name}</h4>
                     {slot.status === 'ready' && <div className="p-3 bg-emerald-500 text-slate-900 rounded-xl shadow-2xl animate-bounce-slow"><ShieldCheck size={18}/></div>}
                  </div>
                  <p className="text-[13px] text-slate-400 font-medium italic leading-relaxed line-clamp-3">"{slot.copy?.primaryText || slot.angle.hookText}"</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                     {slot.copy?.mentalTriggers?.map((t: string, idx: number) => (
                        <span key={idx} className="text-[8px] font-black text-cyan-400 uppercase bg-cyan-400/10 px-2 py-1 rounded-lg border border-cyan-400/20">{t}</span>
                     ))}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
