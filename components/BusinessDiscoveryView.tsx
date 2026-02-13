
import React from 'react';
import { dbStore } from '../services/storageService';
import { BusinessInfo, ViewType, ADNProcessState, StrategicMapItem } from '../types';
import { 
  ArrowRight, Activity, Users, Sword, User, Compass,
  Target, ShieldAlert, Zap, BrainCircuit, Fingerprint,
  Search, Palette, Share2, Instagram, Facebook, ShieldCheck,
  Flame, Crosshair, AlertTriangle, Shield, TrendingUp, Gem,
  Target as TargetIcon, Zap as ZapIcon, ShieldCheck as ShieldCheckIcon,
  Zap as SparkleIcon, Flame as FireIcon, Ghost, MapPin, Globe, Award, Building
} from 'lucide-react';

interface BusinessDiscoveryViewProps {
  business: BusinessInfo;
  setBusiness: (b: BusinessInfo) => void;
  onNavigate: (view: ViewType) => void;
  adnTask: ADNProcessState;
  setAdnTask: (s: ADNProcessState) => void;
  handleFullDiscovery: () => Promise<void>;
}

const AIProgressBar = ({ progress, status }: { progress: number, status: string }) => (
  <div className="w-full space-y-4 animate-fadeIn">
    <div className="flex justify-between items-end">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] animate-pulse">Inyectando Inteligencia Forense</p>
        <p className="text-xs font-bold text-white uppercase truncate max-w-[200px]">{status}</p>
      </div>
      <p className="text-3xl font-black text-white italic">{progress}%</p>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
      <div 
        className="h-full bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export const BusinessDiscoveryView: React.FC<BusinessDiscoveryViewProps> = ({ 
  business, 
  setBusiness, 
  onNavigate, 
  adnTask, 
  setAdnTask, 
  handleFullDiscovery 
}) => {
  // Blindaje preventivo
  const vibeTags = business?.visualDNA?.vibeTags ?? [];
  const locations = business?.locations ?? [];
  const strategicMap = business?.strategicMap ?? [];
  const competitors = business?.competitors ?? [];

  return (
    <div className="space-y-12 animate-fadeIn pb-32 px-4 max-w-7xl mx-auto">
      {adnTask.error && (
        <div className="p-10 glass bg-rose-950/20 border border-rose-500 rounded-[3rem] text-center space-y-6">
           <ShieldAlert size={48} className="mx-auto text-rose-500" />
           <p className="text-white font-black uppercase tracking-tighter text-xl">ERROR EN PROTOCOLO PHOENIX</p>
           <p className="text-slate-400 font-bold">{adnTask.error}</p>
           <button onClick={() => setAdnTask({ ...adnTask, error: null })} className="px-10 py-4 bg-rose-600 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Reintentar Sincronización</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <Fingerprint size={16} className="text-rose-500" />
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Investigación de Mercado DeepScan v21.0 (REAL DATA)</p>
          </div>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">CORE <br/><span className="text-rose-500">ESTRATÉGICO</span></h2>
        </div>
        {!adnTask.loading && business?.persona?.name && (
          <button onClick={() => onNavigate('strategies')} className="bg-rose-500 text-white px-10 py-6 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl">
            FORJAR ESTRATEGIA <ArrowRight size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1">
          <div className="glass p-10 rounded-[4rem] border border-white/10 bg-slate-900/80 shadow-2xl sticky top-10 space-y-10">
            {adnTask.loading ? (
              <div className="py-10 space-y-10">
                <div className="w-24 h-24 bg-rose-500/10 rounded-[3rem] flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_50px_rgba(225,29,72,0.1)]">
                  <Activity size={40} className="text-rose-500 animate-spin" />
                </div>
                <AIProgressBar progress={adnTask.progress} status={adnTask.status} />
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">URL DESTINO</label>
                    <div className="relative">
                       <Crosshair size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                       <input 
                        type="url" 
                        value={business?.landingPageUrl || ''} 
                        onChange={e => setBusiness({...business, landingPageUrl: e.target.value})} 
                        className="w-full bg-black/40 border border-white/5 p-6 pl-16 rounded-[2rem] text-white font-bold outline-none focus:border-rose-500 transition-all text-sm"
                        placeholder="https://tu-tienda.com"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleFullDiscovery} 
                  className="w-full bg-rose-500 text-white py-10 rounded-[3rem] font-black uppercase text-xs flex flex-col items-center justify-center gap-3 shadow-2xl hover:bg-rose-600 transition-all hover:scale-[1.02] group"
                >
                  <Search size={28} className="group-hover:rotate-12 transition-transform duration-500" />
                  <span className="tracking-widest">DEEP SCAN 100%</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
          {business?.persona?.name ? (
            <div className="space-y-12 animate-fadeIn">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="glass p-8 rounded-[3.5rem] border border-cyan-500/20 bg-cyan-500/[0.02] flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Logo Generado por IA</p>
                    <div className="w-32 h-32 bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-2">
                       {business.avatar ? (
                         <img src={business.avatar} className="w-full h-full object-contain" alt="IA Logo" />
                       ) : (
                         <Building size={48} className="m-auto text-slate-200" />
                       )}
                    </div>
                    <p className="text-xs font-black text-white uppercase italic">{business.name}</p>
                 </div>

                 <div className="md:col-span-2 glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/40 space-y-6">
                    <div className="flex items-center gap-4 text-rose-500">
                       <Award size={24} />
                       <h3 className="text-xl font-black uppercase tracking-tighter">Posicionamiento Real</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                          <p className="text-[8px] font-black text-slate-500 uppercase">Nicho de Mercado</p>
                          <p className="text-xs font-bold text-white uppercase">{business.niche || 'N/A'}</p>
                       </div>
                       <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                          <p className="text-[8px] font-black text-slate-500 uppercase">Competidor Principal</p>
                          <p className="text-xs font-bold text-amber-500 uppercase">{competitors[0] || 'Detectando...'}</p>
                       </div>
                    </div>
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                       <p className="text-[8px] font-black text-slate-500 uppercase">Aesthetic Tags</p>
                       <div className="flex flex-wrap gap-2">
                          {vibeTags.map((tag, i) => (
                            <span key={i} className="text-[8px] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg border border-cyan-500/20 uppercase font-black">{tag}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="glass p-12 rounded-[4.5rem] border border-emerald-500/30 bg-emerald-500/[0.01] space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-emerald-400">
                        <MapPin size={28} />
                        <div>
                           <h3 className="text-2xl font-black uppercase tracking-tighter italic">GEOLOCALIZACIÓN OPERATIVA</h3>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ubicaciones y Sedes Verificadas via Grounding</p>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       {locations.length > 0 ? (
                         locations.map((loc, i) => (
                           <div key={i} className="p-6 bg-black/60 rounded-[2rem] border border-white/5 flex items-start gap-4 group hover:border-emerald-500/30 transition-all">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                 <Building size={18} />
                              </div>
                              <p className="text-[13px] font-bold text-slate-200 leading-tight uppercase italic">{loc}</p>
                           </div>
                         ))
                       ) : (
                         <div className="p-10 text-center opacity-30 italic bg-black/20 rounded-[2rem] border-2 border-dashed border-white/5">
                            <Search size={32} className="mx-auto mb-4" />
                            <p className="text-[10px] uppercase font-black">Escaneando Mapa Global...</p>
                         </div>
                       )}
                    </div>
                    <div className="p-8 bg-slate-950 rounded-[3rem] border border-white/5 space-y-6 relative overflow-hidden shadow-inner">
                       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                       <div className="relative z-10">
                          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe size={14}/> Radar de Mercado</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                             El sistema ha rastreado la huella digital para identificar puntos de contacto físicos y logísticos. 
                             <br/><br/>
                             <span className="text-white font-bold">Inferencia de Cobertura:</span> {business.city ? `${business.city}, ` : ''}{business.country || 'Global'}.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="glass p-12 rounded-[4.5rem] border border-rose-500/30 bg-rose-500/[0.01] space-y-12">
                 <div className="flex items-center gap-4 text-rose-500">
                    <Sword size={32} />
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">MAPA DE CONTRAATAQUE</h3>
                 </div>
                 
                 <div className="space-y-10">
                    {strategicMap.map((map: StrategicMapItem, i: number) => (
                      <div key={i} className="relative group">
                         <div className="absolute left-[20px] top-[60px] bottom-[-20px] w-0.5 bg-gradient-to-b from-rose-500/50 via-amber-500/50 to-emerald-500/50 last:hidden hidden md:block" />
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                            <div className="lg:col-span-3 p-8 bg-black/60 rounded-[2.5rem] border border-rose-500/20 shadow-inner">
                               <div className="flex items-center gap-3 mb-4 opacity-70">
                                  <FireIcon size={14} className="text-rose-500" />
                                  <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Dolor</p>
                               </div>
                               <p className="text-[14px] font-bold text-slate-100 uppercase italic leading-tight">{map.pain}</p>
                            </div>
                            <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                               <div className="w-12 h-px bg-white/10" />
                            </div>
                            <div className="lg:col-span-3 p-8 bg-black/60 rounded-[2.5rem] border border-amber-500/20 shadow-inner">
                               <div className="flex items-center gap-3 mb-4 opacity-70">
                                  <Ghost size={14} className="text-amber-500" />
                                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Objeción</p>
                               </div>
                               <p className="text-[14px] font-bold text-slate-100 uppercase italic leading-tight">{map.objection}</p>
                            </div>
                            <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                               <div className="w-12 h-px bg-white/10" />
                            </div>
                            <div className="lg:col-span-4 p-10 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/40 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all duration-500">
                               <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                     <SparkleIcon size={16} fill="currentColor" />
                                  </div>
                                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Vector de Ataque IA</p>
                               </div>
                               <p className="text-base font-black text-emerald-500 uppercase leading-relaxed tracking-tighter italic">
                                  {map.attackVector}
                                </p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="glass p-12 md:p-16 rounded-[5.5rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/[0.05] to-transparent flex flex-col md:flex-row items-center gap-14 shadow-2xl relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12">
                    <BrainCircuit size={300} className="text-purple-500" />
                 </div>
                 <div className="relative shrink-0">
                    <div className="w-56 h-56 rounded-[5rem] bg-slate-950 border-4 border-purple-500/30 flex items-center justify-center text-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.2)] overflow-hidden group">
                       <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${business?.persona?.name || 'Agente'}`} 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" 
                        alt="Avatar" 
                       />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-18 h-18 rounded-3xl bg-purple-600 border-4 border-slate-950 flex items-center justify-center text-white shadow-2xl animate-pulse z-20">
                       <BrainCircuit size={32} />
                    </div>
                 </div>
                 <div className="flex-1 space-y-8 text-center md:text-left w-full relative z-10">
                    <div>
                       <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                          <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">AVATAR GENERADO POR IA</div>
                       </div>
                       <h3 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">{business?.persona?.name || 'Agente Phoenix'}</h3>
                       <p className="text-[12px] font-black text-purple-400 uppercase tracking-[0.5em] mt-4 italic">{business?.persona?.demographics || 'Nivel de Conciencia: Alto'}</p>
                    </div>
                    <div className="p-8 bg-black/40 rounded-[3rem] border border-white/5 shadow-inner">
                       <p className="text-xl text-slate-300 font-bold leading-relaxed italic">"{business?.persona?.bio || 'Buscando el ángulo psicológico óptimo...'}"</p>
                    </div>
                 </div>
              </div>

            </div>
          ) : (
            <div className="h-[70vh] flex flex-col items-center justify-center glass p-20 rounded-[6rem] border-2 border-dashed border-white/5 text-center space-y-10 group hover:border-rose-500/20 transition-all duration-700 shadow-2xl">
              <div className="relative">
                 <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl scale-150 animate-pulse" />
                 <Crosshair size={120} className="text-slate-800 group-hover:text-rose-500/60 transition-colors duration-700 group-hover:rotate-90 relative z-10" strokeWidth={1} />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-white uppercase tracking-[0.3em]">NÚCLEO EN ESPERA</h3>
                <p className="text-sm text-slate-500 font-bold max-w-sm mx-auto leading-relaxed uppercase tracking-widest italic">
                  Ingrese la URL del producto para iniciar el **Deep Scan 100%**. Investigaremos ubicaciones reales, competencia y ADN de marca.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
