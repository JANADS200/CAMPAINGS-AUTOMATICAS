
import React, { useState } from 'react';
import { LaunchedCampaign } from '../types';
import { 
  ShieldCheck, 
  Activity, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  Settings,
  Flame,
  Snowflake,
  Sun,
  Power,
  Layers,
  BarChart3
} from 'lucide-react';

interface CampaignManagementViewProps {
  campaigns: LaunchedCampaign[];
  onToggleCampaign: (id: string) => void;
  onToggleAd: (campaignId: string, adId: string) => void;
  onToggleAutopilot: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
}

export const CampaignManagementView: React.FC<CampaignManagementViewProps> = ({ 
  campaigns, 
  onToggleCampaign, 
  onToggleAd, 
  onToggleAutopilot,
  onDeleteCampaign 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-4">
        <div>
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-gradient-cyan">
            CENTRO DE <br/> <span className="text-white opacity-90">CONTROL</span>
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em]">Gestión de Activos Phoenix v4.2</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="glass px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
              <div className="icon-container w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400">
                 <Layers size={18} />
              </div>
              <div>
                 <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Activas</p>
                 <p className="text-lg font-black text-white">{campaigns.filter(c => c.isActive).length}</p>
              </div>
           </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass rounded-[4rem] py-40 text-center border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>
          <Activity size={64} className="mx-auto text-slate-800 mb-6 animate-pulse" />
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Frecuencia Cero Detectada</h3>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest max-w-xs mx-auto leading-relaxed mt-2">
            Inicia el despliegue en la Lanzadera para activar este módulo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 px-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className={`glass rounded-[3.5rem] border transition-all duration-700 ${camp.isActive ? 'border-cyan-500/30 bg-cyan-500/[0.02]' : 'border-white/5 opacity-80'}`}>
              {/* Main Card Header */}
              <div className="p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8 w-full lg:w-auto">
                  <div className={`icon-container w-20 h-20 rounded-[2rem] flex items-center justify-center border shadow-2xl transition-all ${camp.isActive ? 'text-cyan-400 border-cyan-500/20' : 'text-slate-600 border-white/5'}`}>
                    <ShieldCheck size={40} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{camp.name}</h3>
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${camp.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 status-live-pulse' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'}`}>
                        <div className={`w-2 h-2 rounded-full ${camp.isActive ? 'bg-emerald-400' : 'bg-rose-500'}`}></div>
                        {camp.isActive ? 'System Live' : 'Pausada'}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                       <div className="flex items-center gap-2">
                          <BarChart3 size={14} className="text-cyan-400/60" />
                          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{camp.strategyName}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-600" />
                          <p className="text-[9px] font-bold text-slate-500 uppercase">{formatDate(camp.createdAt)}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-center">
                   {/* Autopilot Controller */}
                   <button 
                    onClick={() => onToggleAutopilot(camp.id)}
                    className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] border transition-all duration-500 ${camp.aiAutopilot ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'bg-white/5 border-white/5 text-slate-500'}`}
                   >
                     <div className={`icon-container p-2.5 rounded-xl ${camp.aiAutopilot ? 'bg-purple-500/20' : ''}`}>
                        <Zap size={18} className={camp.aiAutopilot ? 'animate-pulse' : ''} />
                     </div>
                     <div className="text-left">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Controlador IA</p>
                        <p className="text-xs font-black uppercase tracking-widest">{camp.aiAutopilot ? 'AUTOPILOTO' : 'MANUAL'}</p>
                     </div>
                   </button>

                   {/* Main Power Toggle */}
                   <button 
                    onClick={() => onToggleCampaign(camp.id)}
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 active:scale-90 ${camp.isActive ? 'btn-glow-emerald text-white' : 'bg-slate-800 text-slate-400 border border-white/10'}`}
                   >
                     <Power size={28} />
                   </button>

                   {/* Expand Button */}
                   <button 
                    onClick={() => setExpandedId(expandedId === camp.id ? null : camp.id)}
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all glass border-white/10 ${expandedId === camp.id ? 'bg-white/10 text-cyan-400' : 'text-white'}`}
                   >
                     {expandedId === camp.id ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                   </button>

                   {/* Delete Action */}
                   <button 
                    onClick={() => onDeleteCampaign(camp.id)}
                    className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                   >
                     <Trash2 size={24} />
                   </button>
                </div>
              </div>

              {/* Sub-ads Nested Grid */}
              {expandedId === camp.id && (
                <div className="border-t border-white/5 bg-black/40 p-10 animate-fadeIn">
                   <div className="flex items-center gap-3 mb-10">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-600 border border-white/5">
                        <Settings size={14} />
                      </div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Inyectores de Tráfico ({camp.ads.length})</h4>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {camp.ads.map((ad) => (
                        <div key={ad.id} className={`glass rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${ad.isActive ? 'border-cyan-500/20' : 'border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}>
                           <div className="aspect-[4/5] relative overflow-hidden rounded-t-[2.5rem]">
                              {ad.type === 'image' ? (
                                <img src={ad.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              ) : (
                                <video src={ad.url} className="w-full h-full object-cover" muted autoPlay loop />
                              )}
                              
                              {/* Overlay de Fase del Embudo */}
                              <div className="absolute top-4 left-4 flex gap-2">
                                {ad.funnelStage === 'COLD' && <div className="bg-blue-600/90 backdrop-blur-md p-2 rounded-xl border border-white/10"><Snowflake size={14} className="text-white" /></div>}
                                {ad.funnelStage === 'WARM' && <div className="bg-amber-600/90 backdrop-blur-md p-2 rounded-xl border border-white/10"><Sun size={14} className="text-white" /></div>}
                                {ad.funnelStage === 'HOT' && <div className="bg-rose-600/90 backdrop-blur-md p-2 rounded-xl border border-white/10"><Flame size={14} className="text-white" /></div>}
                              </div>
                           </div>
                           
                           <div className="p-6 space-y-4 bg-slate-900/40">
                              <p className="text-[10px] font-black text-white uppercase tracking-tight truncate leading-none">{ad.title}</p>
                              
                              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                 <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${ad.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                       {ad.isActive ? 'RUNNING' : 'PAUSED'}
                                    </span>
                                 </div>
                                 <button 
                                  onClick={() => onToggleAd(camp.id, ad.id)}
                                  className={`transition-all active:scale-90 ${ad.isActive ? 'text-cyan-400' : 'text-slate-600'}`}
                                 >
                                    {ad.isActive ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
