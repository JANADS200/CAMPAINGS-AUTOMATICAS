
import React, { useState } from 'react';
import { PROVEN_STRATEGIES } from '../constants/strategies';
import { 
  Target, 
  Facebook, 
  Search, 
  TrendingUp, 
  Layers,
  Sparkles,
  ChevronRight,
  Monitor,
  Video,
  FileText,
  Smartphone,
  Flame,
  Zap,
  Star
} from 'lucide-react';

interface StrategySelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({ selectedId, onSelect }) => {
  const [filter, setFilter] = useState<string>('TODAS');
  
  const categories = [
    { id: 'TODAS', label: '🚀 Todas', icon: Sparkles },
    { id: 'OMNICHANNEL', label: 'Omnicanal', icon: Layers },
    { id: 'META', label: 'Meta Ads', icon: Facebook },
    { id: 'GOOGLE', label: 'Google Ads', icon: Search },
    { id: 'TIKTOK', label: 'TikTok Ads', icon: TrendingUp },
  ];

  const filteredStrategies = filter === 'TODAS' 
    ? PROVEN_STRATEGIES 
    : PROVEN_STRATEGIES.filter(s => s.category === filter || s.platforms?.includes(filter as any));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-3 ${
              filter === cat.id 
              ? 'bg-rose-500 text-white border-rose-400 shadow-xl scale-105' 
              : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-white/10'
            }`}
          >
            <cat.icon size={14} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[700px] overflow-y-auto custom-scrollbar pr-4 pb-20">
        {filteredStrategies.map((s) => {
          const isJanAds = s.id === 'janads_master_os';
          return (
            <div 
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`cursor-pointer p-8 md:p-10 rounded-[4rem] border transition-all duration-500 relative group flex flex-col ${
                selectedId === s.id 
                ? (isJanAds ? 'border-amber-500 bg-amber-500/[0.05] shadow-[0_0_50px_rgba(245,158,11,0.15)]' : 'border-rose-500 bg-rose-500/[0.03] shadow-2xl') 
                : 'border-white/5 bg-slate-900/40 hover:border-white/10'
              } ${isJanAds ? 'ring-1 ring-amber-500/20' : ''}`}
            >
              {isJanAds && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                  <Star size={12} fill="currentColor" /> FLAGSHIP PROTOCOL
                </div>
              )}

              <div className="flex gap-2 mb-6">
                 {s.platforms?.includes('META') && <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center border border-blue-500/20"><Facebook size={16}/></div>}
                 {s.platforms?.includes('GOOGLE') && <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-500 flex items-center justify-center border border-amber-500/20"><Search size={16}/></div>}
                 {s.platforms?.includes('TIKTOK') && <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-500 flex items-center justify-center border border-cyan-500/20"><TrendingUp size={16}/></div>}
              </div>

              <div className="flex-1">
                <h4 className={`font-black text-2xl tracking-tighter uppercase mb-3 leading-none transition-colors ${isJanAds ? 'text-amber-500' : 'text-white group-hover:text-rose-500'}`}>
                  {s.name}
                </h4>
                <p className="text-[12px] text-slate-400 font-medium leading-relaxed mb-8">
                  {s.description}
                </p>

                <div className="space-y-4 mb-8">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Configuración del Protocolo</p>
                  {s.platformDetails?.map((pd, idx) => (
                    <div key={idx} className={`p-5 rounded-3xl border space-y-3 ${isJanAds ? 'bg-amber-500/5 border-amber-500/20' : 'bg-black/40 border-white/5'}`}>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                         <span className={`text-[10px] font-black uppercase ${pd.platform === 'META' ? 'text-blue-500' : pd.platform === 'GOOGLE' ? 'text-amber-500' : 'text-cyan-500'}`}>{pd.platform} ADS</span>
                         <span className="text-[8px] font-bold text-slate-600 uppercase flex items-center gap-1">
                           {pd.format === '9:16' ? <Smartphone size={10}/> : pd.format === 'TEXT' ? <FileText size={10}/> : <Monitor size={10}/>} {pd.format}
                         </span>
                      </div>
                      <ul className="space-y-1.5">
                         {pd.items.map((item, i) => (
                           <li key={i} className="text-[10px] font-bold text-slate-300 flex items-center gap-2 italic">
                             <div className={`w-1 h-1 rounded-full ${isJanAds ? 'bg-amber-500' : 'bg-rose-500'}`}></div> {item}
                           </li>
                         ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Presupuesto Sugerido</p>
                  <p className={`text-lg font-black ${isJanAds ? 'text-amber-500' : 'text-white'}`}>${s.minBudget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Creativos</p>
                  <p className={`text-lg font-black ${isJanAds ? 'text-amber-500' : 'text-rose-500'}`}>{s.creativesNeeded} PIEZAS</p>
                </div>
              </div>

              {selectedId === s.id && (
                <div className="absolute top-10 right-10 flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full animate-ping absolute ${isJanAds ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                   <div className={`w-3 h-3 rounded-full relative ${isJanAds ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
