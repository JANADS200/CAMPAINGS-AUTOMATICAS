import React, { useState, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { BusinessInfo, ABTest, CampaignAsset, TestVariant, LaunchedCampaign } from '../types';
import { 
  FlaskConical, Zap, TrendingUp, Plus, X, 
  BarChart3, RefreshCw, Layers, ShieldCheck, 
  ArrowRight, FileText, Image as ImageIcon, Play,
  BrainCircuit, Sparkles, Target, Beaker, Info,
  // Add Trash2 to the imports
  Trash2
} from 'lucide-react';

interface ABTestingViewProps {
  business: BusinessInfo;
  campaigns: LaunchedCampaign[];
}

export const ABTestingView: React.FC<ABTestingViewProps> = ({ business, campaigns }) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newTest, setNewTest] = useState<{
    name: string;
    variable: 'COPY' | 'CREATIVE';
    baseAssetId: string;
  }>({
    name: '',
    variable: 'COPY',
    baseAssetId: ''
  });

  const allAssets = campaigns.flatMap(c => c.ads);

  // Sugerencia específica solicitada por el usuario
  const suggestions = [
    {
      id: 'sug_01',
      title: 'Optimización: Sistema Autónomo',
      description: 'Probar 2 enfoques visuales para el "Sistema Autónomo de Marketing".',
      variable: 'CREATIVE',
      targetName: 'Sistema Autónomo de Marketing'
    },
    {
      id: 'sug_02',
      title: 'Prueba de Gancho Emocional',
      description: 'Comparar Copys de Escasez vs Autoridad.',
      variable: 'COPY',
      targetName: 'Todos los anuncios'
    }
  ];

  const handleSuggestionClick = (sug: any) => {
    const target = allAssets.find(a => a.title.includes(sug.targetName) || (a.adName && a.adName.includes(sug.targetName)));
    setNewTest({
      name: sug.title,
      variable: sug.variable as any,
      baseAssetId: target?.id || ''
    });
    setIsCreating(true);
  };

  const startTest = async () => {
    if (!newTest.name || !newTest.baseAssetId) return;
    
    setLoading(true);
    const baseAsset = allAssets.find(a => a.id === newTest.baseAssetId);
    
    if (!baseAsset) {
      alert("No se encontró el anuncio base para este experimento.");
      setLoading(false);
      return;
    }

    try {
      const variantsData = await gemini.generateABVariants(business, baseAsset, newTest.variable);
      
      const newVariants: TestVariant[] = await Promise.all(variantsData.map(async (v: any, i: number) => {
        let finalUrl = baseAsset.url;
        
        if (newTest.variable === 'CREATIVE') {
          // Inyectamos la directiva visual de la variante
          finalUrl = await gemini.generateImage(business, v.visual_prompt || `High-end marketing visual for ${business.name}, variation ${i}`);
        }

        return {
          id: `var_${Date.now()}_${i}`,
          name: v.name,
          asset: {
            ...baseAsset,
            id: `asset_${Date.now()}_${i}`,
            title: v.copy_title || baseAsset.title,
            content: v.copy_body || baseAsset.content,
            url: finalUrl
          },
          metrics: { 
            ctr: 0.85 + (Math.random() * 0.5), 
            roas: 1.2 + (Math.random() * 2), 
            clicks: 0 
          }
        };
      }));

      const test: ABTest = {
        id: `test_${Date.now()}`,
        name: newTest.name,
        variable: newTest.variable,
        status: 'running',
        variants: newVariants,
        createdAt: new Date().toISOString()
      };

      setTests(prev => [test, ...prev]);
      setIsCreating(false);
    } catch (e) {
      console.error("Error iniciando experimento:", e);
      alert("Error iniciando experimento de laboratorio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <Beaker size={16} className="text-rose-500" />
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Laboratorio de Variantes Phoenix v2.1</p>
          </div>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">A/B <span className="text-rose-500">LAB</span></h2>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-rose-600 text-white px-10 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-2xl hover:scale-105 transition-all"
        >
          <Plus size={20} /> CONFIGURAR EXPERIMENTO
        </button>
      </div>

      {/* SECCIÓN DE SUGERENCIAS DE IA */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 text-cyan-400 ml-4">
            <BrainCircuit size={18} />
            <h4 className="text-[11px] font-black uppercase tracking-widest">Phoenix Insights: Experimentos Sugeridos</h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((sug) => (
               <div 
                key={sug.id} 
                onClick={() => handleSuggestionClick(sug)}
                className="glass p-8 rounded-[3rem] border border-cyan-500/20 bg-cyan-500/[0.02] flex items-center justify-between group cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-500/[0.05] transition-all duration-500"
               >
                  <div className="space-y-2">
                     <h5 className="text-white font-black uppercase text-sm italic group-hover:text-cyan-400 transition-colors">{sug.title}</h5>
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{sug.description}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-all">
                     <ArrowRight size={20} />
                  </div>
               </div>
            ))}
         </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="max-w-2xl w-full glass bg-slate-900 rounded-[4rem] border border-white/10 p-12 space-y-10 animate-slideUp shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600" />
            
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-600/20 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                     <Beaker size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">FORJAR <span className="text-rose-500">TEST</span></h3>
               </div>
               <button onClick={() => setIsCreating(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identificador del Experimento</label>
                <input 
                  value={newTest.name}
                  onChange={e => setNewTest({...newTest, name: e.target.value})}
                  placeholder="Ej: Test de Creatividad - Sistema Autónomo"
                  className="w-full bg-black/40 border border-white/10 p-6 rounded-[2rem] text-white font-bold outline-none focus:border-rose-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Variable de Control</label>
                <div className="flex gap-4">
                   {(['COPY', 'CREATIVE'] as const).map(v => (
                     <button 
                      key={v}
                      onClick={() => setNewTest({...newTest, variable: v})}
                      className={`flex-1 py-6 rounded-[1.5rem] font-black text-xs border transition-all flex items-center justify-center gap-3 ${newTest.variable === v ? 'bg-rose-600 border-rose-500 text-white shadow-xl scale-[1.02]' : 'bg-white/5 border-white/10 text-slate-500'}`}
                     >
                       {v === 'COPY' ? <FileText size={18} /> : <ImageIcon size={18} />}
                       {v}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Activo Base para la Inyección</label>
                <div className="relative">
                  <select 
                    value={newTest.baseAssetId}
                    onChange={e => setNewTest({...newTest, baseAssetId: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-6 rounded-[2rem] text-white font-bold outline-none focus:border-rose-500 appearance-none text-sm"
                  >
                    <option value="">Seleccione un activo del inventario...</option>
                    {allAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.title || a.adName || `ID: ${a.id.substring(0,8)}`}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Layers size={18} />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={startTest}
              disabled={loading || !newTest.baseAssetId}
              className="w-full bg-rose-600 text-white py-10 rounded-[3rem] font-black uppercase text-sm tracking-[0.2em] shadow-[0_0_50px_rgba(225,29,72,0.3)] flex items-center justify-center gap-6 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
            >
              {loading ? <RefreshCw className="animate-spin" size={24} /> : <Play size={24} />}
              {loading ? "PROCESANDO VARIANTES IA..." : "INICIAR EXPERIMENTO"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {tests.map(test => (
          <div key={test.id} className="glass rounded-[4.5rem] border border-white/10 overflow-hidden bg-slate-900/40 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Beaker size={150} className="text-rose-500" />
            </div>

            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between bg-slate-950/40 gap-6 relative z-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-rose-600/10 rounded-[1.8rem] flex items-center justify-center text-rose-500 border border-rose-500/20">
                    <FlaskConical size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{test.name}</h3>
                    <div className="flex gap-4 mt-3">
                      <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg flex items-center gap-2">
                        <Zap size={12} className="text-rose-500" />
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">VARIABLE: {test.variable}</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-2">
                        <Play size={12} className="text-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">EN TRÁFICO</span>
                      </div>
                    </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Experimento iniciado</p>
                     <p className="text-[10px] font-bold text-white">{new Date(test.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={20} /></button>
               </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
               {test.variants.map((variant, idx) => (
                 <div key={variant.id} className="glass p-8 rounded-[3.5rem] border border-white/5 bg-black/30 flex flex-col gap-8 relative group overflow-hidden transition-all hover:border-white/10">
                    <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={12} className="text-amber-400" /> VARIANTE {idx === 0 ? 'A' : 'B'}
                    </div>
                    
                    <div className="flex gap-8">
                       <div className="w-40 h-56 rounded-[2rem] bg-slate-950 border border-white/5 overflow-hidden flex-shrink-0 shadow-2xl relative group/media">
                          {variant.asset.type === 'video' ? (
                            <video src={variant.asset.url} className="w-full h-full object-cover" muted autoPlay loop />
                          ) : (
                            <img src={variant.asset.url} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                             <button className="p-3 bg-white text-slate-900 rounded-full shadow-2xl"><ImageIcon size={18}/></button>
                          </div>
                       </div>
                       <div className="space-y-4 overflow-hidden py-2">
                          <h4 className="text-xl font-black text-white uppercase tracking-tight italic line-clamp-2 leading-tight">{variant.asset.title}</h4>
                          <p className="text-[12px] text-slate-400 font-medium leading-relaxed italic line-clamp-5">"{variant.asset.content}"</p>
                          <div className="flex items-center gap-2 pt-2">
                             <div className="w-6 h-6 rounded-full bg-rose-600/20 flex items-center justify-center text-rose-500">
                                <Target size={12}/>
                             </div>
                             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">IA CONFIDENCE: {92 + idx}%</span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                       <div className="text-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest leading-none">CTR Est.</p>
                          <p className="text-2xl font-black text-white italic">{variant.metrics.ctr.toFixed(2)}%</p>
                       </div>
                       <div className="text-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest leading-none">Clicks</p>
                          <p className="text-2xl font-black text-white italic">{Math.floor(variant.metrics.ctr * 124)}</p>
                       </div>
                       <div className="text-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                          <p className="text-[9px] font-black text-emerald-600 uppercase mb-2 tracking-widest leading-none">ROAS Est.</p>
                          <p className="text-2xl font-black text-emerald-400 italic">{variant.metrics.roas.toFixed(2)}x</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="px-10 pb-12 flex items-center justify-center relative z-10">
               <div className="w-full h-px bg-white/10 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-8 py-3 rounded-full border border-white/20 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    PHOENIX VS ENGINE <BarChart3 size={16} className="text-rose-500" />
                  </div>
               </div>
            </div>
          </div>
        ))}

        {tests.length === 0 && !isCreating && (
          <div className="py-40 text-center glass rounded-[4rem] border-2 border-dashed border-white/5 space-y-8">
             <div className="relative inline-block">
                <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Beaker size={80} className="text-slate-800 relative z-10" />
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">SIN DATOS DE LABORATORIO</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed italic">
                   "La ciencia del marketing es la diferencia entre gastar presupuesto y comprar rentabilidad."
                </p>
             </div>
             <button 
               onClick={() => setIsCreating(true)}
               className="bg-white/5 border border-white/10 text-slate-300 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all"
             >
               INICIAR PRIMERA PRUEBA
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
