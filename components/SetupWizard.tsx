
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { BusinessInfo, MetaAsset } from '../types';
import { MetaAssetSelector } from './MetaAssetSelector';
import { StrategySelector } from './StrategySelector';
import { Search, Globe, CreditCard, Target, Settings, Smartphone, Facebook, Zap } from 'lucide-react';

const MOCK_PORTFOLIOS: MetaAsset[] = [{ id: 'bm_01', name: 'Agencia Digital Pro', type: 'account' }, { id: 'bm_02', name: 'Business Suite Master', type: 'account' }];
const MOCK_ACCOUNTS: MetaAsset[] = [{ id: 'act_01', name: 'Ad Account 01 - Principal', type: 'account' }, { id: 'act_02', name: 'E-com Scaling Account', type: 'account' }];

export const SetupWizard: React.FC<{ onComplete: (info: BusinessInfo) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const [formData, setFormData] = useState<BusinessInfo>({
    name: '',
    niche: '',
    targetAudience: '',
    language: 'ES',
    pains: [],
    objections: [],
    benefits: [],
    metaConfig: {
      appId: '',
      appSecret: '',
      accessToken: '',
      portfolioId: '',
      adAccountId: '',
      pageId: '',
      pixelId: '' // Queda vacío
    },
    googleConfig: {
      customerId: '',
      developerToken: '',
      accessToken: '',
      clientId: '',
      applicationName: ''
    },
    tiktokConfig: {
      advertiserId: '',
      accessToken: ''
    },
    whatsappNumber: '',
    budget: 100000,
    strategyId: 'launch_master',
    brief: ''
  });

  useEffect(() => {
    const check = async () => {
      try {
        const sel = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(sel);
      } catch { setHasApiKey(false); }
    };
    check();
  }, []);

  const handleLinkApiKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    } catch (e) {
      console.error("Fallo al abrir selección de llave:", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateBriefAndContinue = async () => {
    setLoading(true);
    try {
      const brief = await gemini.generateSuperBrief(formData.name, formData.targetAudience, formData.language, previewImg || undefined);
      const analysis = await gemini.analyzeBusiness(formData.name, formData.niche, brief, formData.language);
      setFormData({ ...formData, brief, ...analysis });
      setStep(5);
    } catch (e) {
      alert("Error generando el Super Brief. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="max-w-xl mx-auto glass p-12 rounded-[3rem] text-center space-y-8 animate-fadeIn border border-white/5">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">IAJAN<span className="text-cyan-400">ADS</span></h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
          Para habilitar el generador de Video Veo 3.1, debes seleccionar una API Key de un proyecto con facturación activa.
        </p>
        <div className="space-y-4">
          <button 
            onClick={handleLinkApiKey}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            Vincular Google AI (Paid Key)
          </button>
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">
            Consulta la <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline text-cyan-400">documentación de facturación</a>.
          </p>
        </div>
      </div>
    );
  }

  const TOTAL_STEPS = 5;

  return (
    <div className="max-w-4xl mx-auto w-full animate-fadeIn py-10">
      <div className="glass rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="h-2 bg-white/5 w-full">
          <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
        </div>
        <div className="p-12 md:p-20">
          {step === 0 && (
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">DESCUBRIMIENTO <br/><span className="text-cyan-400">DE NEGOCIO</span></h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Fase 1: Identidad Corporativa</p>
              </div>
              <div className="space-y-6">
                <input type="text" placeholder="Nombre de tu Marca" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 outline-none font-black text-white focus:border-cyan-400 text-xl" />
                <input type="text" placeholder="Nicho de Mercado" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 outline-none font-black text-white focus:border-cyan-400 text-xl" />
                <textarea placeholder="Describe brevemente qué vendes y a quién..." value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 outline-none font-bold text-white focus:border-cyan-400 min-h-[150px]" />
                <div onClick={() => fileInputRef.current?.click()} className="w-full p-10 border-2 border-dashed border-white/10 rounded-[2rem] text-center cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group hover:scale-[1.01]">
                  {previewImg ? <img src={previewImg} className="absolute inset-0 w-full h-full object-cover opacity-30" /> : <p className="text-slate-500 font-black uppercase text-xs tracking-widest group-hover:text-cyan-400 transition-colors">Opcional: Foto de producto</p>}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
              </div>
              <button 
                onClick={() => setStep(1)} 
                disabled={!formData.name || !formData.niche} 
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-xl tracking-widest shadow-2xl transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] active:scale-95"
              >
                Continuar a Meta Dev
              </button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">META <span className="text-blue-500">DEVELOPERS</span></h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Fase 2: Conexión de API de Pauta</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="App ID" value={formData.metaConfig.appId} onChange={e => setFormData({...formData, metaConfig: {...formData.metaConfig, appId: e.target.value}})} className="p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:border-blue-500" />
                <input type="password" placeholder="App Secret" value={formData.metaConfig.appSecret} onChange={e => setFormData({...formData, metaConfig: {...formData.metaConfig, appSecret: e.target.value}})} className="p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:border-blue-500" />
                <input type="text" placeholder="Access Token" value={formData.metaConfig.accessToken} onChange={e => setFormData({...formData, metaConfig: {...formData.metaConfig, accessToken: e.target.value}})} className="md:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:border-blue-500" />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(0)} 
                  className="flex-1 py-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-sm transition-all hover:scale-[1.03] hover:bg-white/10"
                >
                  Atrás
                </button>
                <button 
                  onClick={() => setStep(2)} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-xl tracking-widest shadow-2xl transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(37,99,235,0.3)] active:scale-95"
                >
                  Sincronizar Meta
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">GOOGLE <span className="text-amber-500">ADS CONFIG</span></h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Fase 3: Conexión de API de Búsqueda</p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Developer Token</label>
                    <input type="text" placeholder="Dev Token" value={formData.googleConfig.developerToken} onChange={e => setFormData({...formData, googleConfig: {...formData.googleConfig, developerToken: e.target.value}})} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:border-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Client ID</label>
                    <input type="text" placeholder="Client ID" value={formData.googleConfig.clientId} onChange={e => setFormData({...formData, googleConfig: {...formData.googleConfig, clientId: e.target.value}})} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:border-amber-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nombre de Aplicación</label>
                  <input type="text" placeholder="Mi App de Marketing" value={formData.googleConfig.applicationName} onChange={e => setFormData({...formData, googleConfig: {...formData.googleConfig, applicationName: e.target.value}})} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:border-amber-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Token (Opcional)</label>
                  <input type="text" placeholder="Access Token" value={formData.googleConfig.accessToken} onChange={e => setFormData({...formData, googleConfig: {...formData.googleConfig, accessToken: e.target.value}})} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:border-amber-500" />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)} 
                  className="flex-1 py-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-sm transition-all hover:scale-[1.03] hover:bg-white/10"
                >
                  Atrás
                </button>
                <button 
                  onClick={() => setStep(3)} 
                  className="flex-[2] bg-amber-600 hover:bg-amber-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-xl tracking-widest shadow-2xl transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(217,119,6,0.3)] active:scale-95"
                >
                  Sincronizar Google
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">SELECCIÓN DE <span className="text-cyan-400">ACTIVOS</span></h2>
              </div>
              <div className="space-y-6">
                <MetaAssetSelector label="Portafolio Comercial" assets={MOCK_PORTFOLIOS} selectedId={formData.metaConfig.portfolioId} onSelect={id => setFormData({...formData, metaConfig: {...formData.metaConfig, portfolioId: id}})} />
                <MetaAssetSelector label="Cuenta Publicitaria" assets={MOCK_ACCOUNTS} selectedId={formData.metaConfig.adAccountId} onSelect={id => setFormData({...formData, metaConfig: {...formData.metaConfig, adAccountId: id}})} />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)} 
                  className="flex-1 py-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-sm transition-all hover:scale-[1.03] hover:bg-white/10"
                >
                  Atrás
                </button>
                <button 
                  onClick={() => setStep(4)} 
                  className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-xl tracking-widest shadow-2xl transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] active:scale-95"
                >
                  Confirmar Activos
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">ALGORITMO DE <span className="text-cyan-400">AGENCIA</span></h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                <StrategySelector selectedId={formData.strategyId} onSelect={id => setFormData({...formData, strategyId: id})} />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(3)} 
                  className="flex-1 py-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-sm transition-all hover:scale-[1.03] hover:bg-white/10"
                >
                  Atrás
                </button>
                <button 
                  onClick={generateBriefAndContinue} 
                  disabled={loading} 
                  className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-xl tracking-widest shadow-2xl transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(225,29,72,0.3)] active:scale-95 disabled:opacity-50"
                >
                  {loading ? "GENERANDO ESTRATEGIA..." : "ACTIVAR AUTONOMÍA IA"}
                </button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-10 animate-fadeIn text-center">
               <h2 className="text-4xl font-black text-white uppercase tracking-tighter">ECOSISTEMA <span className="text-cyan-400">LISTO</span></h2>
               <button 
                onClick={() => onComplete(formData)} 
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-10 rounded-[3rem] font-black uppercase text-2xl tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] active:scale-95"
               >
                 LANZAR CAMPAÑAS AHORA
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
