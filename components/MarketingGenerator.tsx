
import React, { useState, useEffect } from 'react';
import { BusinessInfo, CampaignAsset } from '../types';
import { PROVEN_STRATEGIES } from '../constants/strategies';
import { 
  Rocket, Zap, X, CheckCircle2, AlertTriangle, 
  ArrowRight, Edit3, DollarSign, Settings2,
  Sparkles, Activity, FileText, Image as ImageIcon, Video,
  RotateCcw, Tag, Brain, Heart, ShieldCheck, TrendingUp
} from 'lucide-react';

interface MarketingGeneratorProps {
  business: BusinessInfo;
  setBusiness: (b: BusinessInfo) => void;
  onAssetsGenerated: (assets: CampaignAsset[]) => void;
  onNavigate?: (view: any) => void;
  launchedAssets?: CampaignAsset[];
}

export const MarketingGenerator: React.FC<MarketingGeneratorProps> = ({ 
  business, 
  setBusiness, 
  onAssetsGenerated, 
  onNavigate,
  launchedAssets 
}) => {
  const [step, setStep] = useState<'idle' | 'confirm' | 'success'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [persuasionMode, setPersuasionMode] = useState<'empathy' | 'scarcity' | 'social_proof' | 'logic'>('empathy');
  const [opName, setOpName] = useState(`OP: ${business.name} - ${new Date().toLocaleDateString()}`);
  const strategy = PROVEN_STRATEGIES.find(s => s.id === business.strategyId) || PROVEN_STRATEGIES[0];

  useEffect(() => {
    if (launchedAssets && launchedAssets.length > 0) {
      setStep('success');
    }
  }, [launchedAssets]);

  const handleUpdateBudget = (newBudget: number) => {
    setBusiness({ ...business, budget: newBudget });
  };

  const prepareForControlHub = () => {
    // Aquí podríamos guardar el persuasionMode en el business info si el backend lo soporta
    if (onNavigate) onNavigate('creator');
  };

  const resetForNewOperation = () => {
    setStep('idle');
    if (onNavigate) onNavigate('business');
  };

  const PERSUASION_OPTIONS = [
    { id: 'empathy', label: 'Empatía (Dolor)', icon: Heart, desc: 'Conecta con el problema real del cliente.' },
    { id: 'scarcity', label: 'Escasez (Urgencia)', icon: Zap, desc: 'Fomenta la acción rápida por miedo a perder.' },
    { id: 'social_proof', label: 'Prueba Social', icon: ShieldCheck, desc: 'Inyecta autoridad y validación de terceros.' },
    { id: 'logic', label: 'Lógica (Beneficio)', icon: TrendingUp, desc: 'Argumentos racionales y ROI claro.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {step === 'idle' && (
        <div className="glass rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-center relative overflow-hidden border border-white/5 bg-slate-900/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
          <div className="space-y-8 md:space-y-10">
            <div className="inline-flex items-center gap-3 bg-white/5 px-4 md:px-6 py-2 rounded-full border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">{business.strategyId.toUpperCase()} ENGINE READY</span>
            </div>
            <h2 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9]">TIENDA <br/><span className="text-rose-500">AUTÓNOMA</span></h2>
            <p className="text-slate-400 font-bold max-w-2xl mx-auto text-sm md:text-xl leading-relaxed px-4">
              Configura tus campañas y deja que la IA se encargue del trabajo pesado bajo tu supervisión.
            </p>
            <div className="flex flex-col items-center gap-4 px-4">
               <button 
                onClick={() => setStep('confirm')} 
                className="w-full max-w-xl bg-rose-600 text-white py-6 md:py-10 rounded-[2rem] md:rounded-[3rem] font-black text-lg md:text-2xl uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 md:gap-6"
               >
                PREPARAR LANZAMIENTO <Rocket size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
           <div className="max-w-6xl w-full glass bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 overflow-hidden animate-slideUp shadow-2xl my-auto">
              <div className="p-6 md:p-14 space-y-8 md:space-y-10">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                         <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                         <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">CALIBRACIÓN <span className="text-rose-500">PHOENIX</span></h3>
                       </div>
                       <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.4em]">Inyectando Ingeniería de Persuasión v14.0</p>
                    </div>
                    <button onClick={() => setStep('idle')} className="text-slate-500 hover:text-white p-3 bg-white/5 rounded-xl transition-all">
                      <X size={20}/>
                    </button>
                 </div>

                 {/* PANEL DE PERSUASIÓN (NUEVO) */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-cyan-400">
                       <Brain size={20} />
                       <h4 className="text-[11px] font-black uppercase tracking-widest">Ajuste de Leva Psicológica</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                       {PERSUASION_OPTIONS.map((opt) => (
                          <button 
                            key={opt.id}
                            onClick={() => setPersuasionMode(opt.id as any)}
                            className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-3 group ${persuasionMode === opt.id ? 'bg-cyan-600 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)] scale-[1.02]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                          >
                             <opt.icon size={24} className={persuasionMode === opt.id ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400'} />
                             <div>
                                <p className={`text-[11px] font-black uppercase ${persuasionMode === opt.id ? 'text-white' : 'text-slate-300'}`}>{opt.label}</p>
                                <p className={`text-[9px] font-bold leading-tight mt-1 ${persuasionMode === opt.id ? 'text-cyan-100' : 'text-slate-500'}`}>{opt.desc}</p>
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-4 border-t border-white/5">
                    <div className="space-y-6 md:space-y-8">
                       <div className="p-6 md:p-8 bg-black/40 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-4 md:space-y-6">
                          <div className="flex items-center gap-3 text-rose-500">
                             <Tag size={16} />
                             <h4 className="text-[9px] font-black uppercase tracking-widest">Identificador de Operación</h4>
                          </div>
                          <input 
                            type="text" 
                            value={opName}
                            onChange={(e) => setOpName(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl text-lg font-black text-white outline-none focus:border-rose-500 transition-all"
                          />
                       </div>

                       <div className="p-6 md:p-8 bg-black/40 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-4 md:space-y-6">
                          <div className="flex justify-between items-center">
                             <div className="flex items-center gap-3 text-cyan-400">
                                <DollarSign size={16} />
                                <h4 className="text-[9px] font-black uppercase tracking-widest">Inversión Programada</h4>
                             </div>
                             <button onClick={() => setIsEditing(!isEditing)} className="text-[8px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <Edit3 size={10}/> {isEditing ? 'CERRAR' : 'EDITAR'}
                             </button>
                          </div>
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={business.budget}
                              onChange={(e) => handleUpdateBudget(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-cyan-500/30 p-4 rounded-xl text-xl font-black text-white outline-none"
                            />
                          ) : (
                            <p className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">${business.budget.toLocaleString()}</p>
                          )}
                       </div>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                       <div className="p-6 md:p-8 glass rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-6 h-full">
                          <div className="flex items-center gap-3 text-rose-500">
                            <Settings2 size={16} />
                            <h4 className="text-[9px] font-black uppercase tracking-widest">Estrategia Activa</h4>
                          </div>
                          <div className="space-y-1">
                             <h5 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{strategy.name}</h5>
                             <p className="text-[10px] md:text-[12px] text-slate-400 font-medium leading-relaxed">{strategy.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-white/5">
                             <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Creativos</p>
                                <p className="text-lg font-black text-white">{strategy.creativesNeeded} ADs</p>
                             </div>
                             <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Motor IA</p>
                                <p className="text-lg font-black text-emerald-400">ACTIVO</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 md:pt-6 flex flex-col md:flex-row gap-4 md:gap-6">
                    <button onClick={() => setStep('idle')} className="w-full md:flex-1 bg-white/5 border border-white/10 text-slate-400 py-6 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest">VOLVER</button>
                    <button onClick={prepareForControlHub} className="w-full md:flex-[2] bg-rose-600 text-white py-6 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-lg md:text-xl uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4">GENERAR CON ESTA CALIBRACIÓN <ArrowRight size={20} /></button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {step === 'success' && (
        <div className="glass rounded-[3rem] md:rounded-[4rem] p-10 md:p-20 border border-emerald-500/30 bg-emerald-500/[0.02] space-y-10 md:space-y-12 animate-fadeIn relative overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
              <div className="space-y-4 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-900 shadow-xl"><CheckCircle2 size={24} /></div>
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">CAMPAÑA <span className="text-emerald-500">ACTIVA</span></h3>
                 </div>
                 <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">Resumen de Operación Phoenix Exitoso</p>
              </div>
              <button onClick={resetForNewOperation} className="w-full md:w-auto bg-white text-slate-900 px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl">
                 <RotateCcw size={18} /> NUEVA OPERACIÓN
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                 <div className="p-6 md:p-8 bg-black/40 rounded-[2.5rem] border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Campaña</p>
                       <p className="text-xs font-black text-white uppercase truncate">{business.name || 'Empresa'}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Estrategia</p>
                       <p className="text-xs font-black text-emerald-400 uppercase truncate">{strategy.name}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Presupuesto</p>
                       <p className="text-xs font-black text-white uppercase">${business.budget.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Activos Inyectados</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                       {(launchedAssets || []).map((asset, i) => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
                                {asset.type === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
                             </div>
                             <p className="text-[9px] font-black text-white uppercase truncate">{asset.title || 'Anuncio IA'}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 space-y-6">
                 <div className="flex items-center gap-3 text-emerald-400">
                    <Activity size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Motor Phoenix Status</h4>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                       <span className="text-slate-400">Inyección API</span>
                       <span className="text-emerald-400 uppercase">Completada</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold">
                       <span className="text-slate-400">Optimización ROAS</span>
                       <span className="text-emerald-400 uppercase">Activa</span>
                    </div>
                    <div className="pt-4 border-t border-emerald-500/20">
                       <p className="text-[10px] text-slate-300 font-medium italic">"Los activos han sido distribuidos globalmente siguiendo los parámetros de la estrategia {strategy.id}."</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
