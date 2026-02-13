
import React, { useState } from 'react';
import { BusinessInfo, ViewType, MarketingStrategy } from '../types';
import { StrategySelector } from './StrategySelector';
import { PROVEN_STRATEGIES } from '../constants/strategies';
import { 
  Zap, ArrowRight, ShieldCheck, Target, 
  TrendingUp, Sparkles, DollarSign, Edit3, 
  Info, ShieldAlert, Cpu, Layers, X, Terminal,
  Fingerprint, Activity
} from 'lucide-react';

interface StrategyLibraryViewProps {
  business: BusinessInfo;
  setBusiness: (b: BusinessInfo | ((prev: BusinessInfo) => BusinessInfo)) => void;
  onNavigate: (view: ViewType) => void;
}

export const StrategyLibraryView: React.FC<StrategyLibraryViewProps> = ({ business, setBusiness, onNavigate }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState(business.strategyId);
  const [customBudget, setCustomBudget] = useState(business.budget);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [showDetailedLogic, setShowDetailedLogic] = useState(false);

  const selectedStrategy = PROVEN_STRATEGIES.find(s => s.id === selectedStrategyId) || PROVEN_STRATEGIES[0];

  const handleConfirmStrategy = () => {
    setBusiness(prev => ({
      ...prev,
      strategyId: selectedStrategyId,
      budget: customBudget
    }));
    onNavigate('creator');
  };

  const updateStrategy = (id: string) => {
    setSelectedStrategyId(id);
    const s = PROVEN_STRATEGIES.find(x => x.id === id);
    if (s) setCustomBudget(s.minBudget);
    // Mostrar el modal automáticamente al cambiar de estrategia para informar al usuario
    setShowDetailedLogic(true);
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32 max-w-7xl mx-auto px-4">
      {/* MODAL DE SEGMENTACIÓN DETALLADA (PHOENIX PROTOCOL INSIGHT) */}
      {showDetailedLogic && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-fadeIn" onClick={() => setShowDetailedLogic(false)}>
          <div className="max-w-2xl w-full glass bg-slate-900/80 rounded-[4rem] border border-rose-500/30 overflow-hidden shadow-[0_0_100px_rgba(225,29,72,0.2)] animate-slideUp" onClick={e => e.stopPropagation()}>
             <div className="p-8 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                      <Terminal size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">PROTOCOL <span className="text-rose-500">INSIGHT</span></h3>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Directiva de Inyección Algorítmica</p>
                   </div>
                </div>
                <button onClick={() => setShowDetailedLogic(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                   <X size={20} />
                </button>
             </div>
             
             <div className="p-10 space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-cyan-400">
                      <Fingerprint size={18} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Lógica de Segmentación</h4>
                   </div>
                   <div className="p-6 bg-black/60 rounded-[2.5rem] border border-white/5 shadow-inner">
                      <p className="text-[14px] text-slate-300 font-bold leading-relaxed italic">
                        "{selectedStrategy.segmentationLogic}"
                      </p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-rose-500">
                      <Cpu size={18} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Instrucción Maestra para la IA</h4>
                   </div>
                   <div className="p-8 bg-slate-950/80 rounded-[3rem] border border-rose-500/10 relative group">
                      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                         <Activity size={16} className="text-rose-500 animate-pulse" />
                      </div>
                      <p className="text-[13px] text-slate-400 font-medium leading-relaxed font-mono">
                        {selectedStrategy.detailedSegmentation || "El sistema operará bajo un modelo de optimización Advantage+ sin restricciones manuales para maximizar el aprendizaje del pixel."}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Impacto de Segmentación</p>
                      <p className="text-xl font-black text-emerald-400">ALTO</p>
                   </div>
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Nivel de Automatización</p>
                      <p className="text-xl font-black text-cyan-400">100% IA</p>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-slate-950/60 border-t border-white/5 text-center">
                <button 
                  onClick={() => setShowDetailedLogic(false)}
                  className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                >
                  ENTENDIDO, PROCEDER
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-1 h-8 bg-rose-500 rounded-full"></div>
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Ecosistema Estratégico Phoenix v24.8</p>
          </div>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none italic">NÚCLEO <span className="text-rose-500">ESTRATÉGICO</span></h2>
        </div>
        <button 
          onClick={handleConfirmStrategy}
          className="bg-rose-600 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-[0_0_50px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-6"
        >
          ACTIVAR PROTOCOLO <ArrowRight size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           <div className="glass p-10 rounded-[4rem] border border-white/10 bg-slate-900/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                 <Sparkles size={180} className="text-rose-500" />
              </div>
              <StrategySelector 
                selectedId={selectedStrategyId} 
                onSelect={updateStrategy} 
              />
           </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
           {/* PANEL DE CALIBRACIÓN DE PRESUPUESTO */}
           <div className="glass p-10 rounded-[3.5rem] border border-cyan-500/20 bg-cyan-500/[0.02] space-y-8 shadow-2xl">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3 text-cyan-400">
                    <DollarSign size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-widest">Inversión Phoenix</h3>
                 </div>
                 <button onClick={() => setIsEditingBudget(!isEditingBudget)} className="text-[9px] font-black text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                    <Edit3 size={12} /> {isEditingBudget ? 'BLOQUEAR' : 'AJUSTAR'}
                 </button>
              </div>

              <div className="space-y-4">
                 {isEditingBudget ? (
                   <div className="space-y-4 animate-slideUp">
                      <input 
                        type="number" 
                        value={customBudget} 
                        onChange={(e) => setCustomBudget(Number(e.target.value))}
                        className="w-full bg-black/60 border border-cyan-400/30 p-6 rounded-2xl text-2xl font-black text-white outline-none focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
                      />
                      <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest text-center italic">Ajustando presupuesto manual para {selectedStrategy.name}</p>
                   </div>
                 ) : (
                   <div className="space-y-2">
                      <p className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">${customBudget.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Inversión Estimada por Operación</p>
                   </div>
                 )}
                 {customBudget < selectedStrategy.minBudget && (
                   <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
                      <ShieldAlert size={14} />
                      <span className="text-[8px] font-black uppercase">Por debajo del mínimo sugerido</span>
                   </div>
                 )}
              </div>
           </div>

           {/* PANEL DE EXPLICACIÓN IA */}
           <div className="glass p-10 rounded-[3.5rem] border border-rose-500/20 bg-rose-500/[0.02] space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                 <Cpu size={150} className="text-rose-500" />
              </div>
              <div className="flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-3 text-rose-500">
                    <Info size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-widest">Lógica de Segmentación IA</h3>
                 </div>
                 <button 
                  onClick={() => setShowDetailedLogic(true)}
                  className="bg-white/5 p-2 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                  title="Ver Detalle Técnico"
                 >
                   <Terminal size={14} />
                 </button>
              </div>
              <div className="space-y-6 relative z-10">
                 <div className="p-6 bg-black/60 rounded-3xl border border-white/5 group cursor-pointer hover:border-rose-500/30 transition-all" onClick={() => setShowDetailedLogic(true)}>
                    <p className="text-[12px] text-slate-300 font-bold leading-relaxed italic line-clamp-3">
                      {selectedStrategy.detailedSegmentation || "Segmentación adaptativa basada en objetivos de conversión Meta Ads."}
                    </p>
                    <p className="text-[8px] font-black text-rose-500 uppercase mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Clic para expandir directiva</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Capacidad Activos</p>
                       <p className="text-xl font-black text-white">{selectedStrategy.creativesNeeded} ADs</p>
                    </div>
                    <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Efecto</p>
                       <p className="text-xl font-black text-rose-500 uppercase italic">DIOS</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* ARQUITECTURA DE CAMPAÑAS */}
           {selectedStrategy.structure && (
              <div className="glass p-10 rounded-[3.5rem] border border-white/5 bg-slate-900/40 space-y-6">
                 <div className="flex items-center gap-3 text-slate-400">
                    <Layers size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Estructura de Matriz</h4>
                 </div>
                 <div className="space-y-3">
                    {selectedStrategy.structure.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-rose-500/30 transition-all">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{s.name}</span>
                         <span className="text-[10px] font-black text-white bg-white/5 px-3 py-1 rounded-lg">{s.budgetPercentage}%</span>
                      </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
