
import React, { useState, useEffect } from 'react';
import { BusinessInfo, User } from '../types';
import { dbStore } from '../services/storageService';
import { fetchTikTokAssets, validateTikTokCredentials } from '../services/tiktokService';
import { 
  Zap, RefreshCcw, RefreshCw, CheckCircle2,
  Smartphone, Activity, ShieldCheck, TrendingUp,
  Loader2, ShieldAlert, Check
} from 'lucide-react';

const TikTokLogoOfficial = () => (
  <svg viewBox="0 0 448 512" className="w-14 h-14 drop-shadow-[0_0_20px_rgba(255,0,80,0.6)] animate-bounce-slow">
    <path fill="#ffffff" d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h.06a121.18 121.18 0 0 0 120.85 97.74v89.92z"/>
  </svg>
);

interface TikTokConfigViewProps {
  business: BusinessInfo;
  setBusiness: (b: BusinessInfo) => void;
  user: User;
}

export const TikTokConfigView: React.FC<TikTokConfigViewProps> = ({ business, setBusiness, user }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const isConnected = !!business.tiktokConfig.accessToken;
  const masterConfig = dbStore.getMasterSystemConfig();
  const scannedData = business.discoveredAssets?.tiktok || [];

  const handleValidate = async () => {
    const { accessToken } = business.tiktokConfig;
    if (!accessToken) return alert("Access Token requerido.");
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateTikTokCredentials(accessToken, masterConfig.tiktokAppId);
      setValidationResult({ type: result.valid ? 'success' : 'error', msg: result.message });
    } catch (e) {
      setValidationResult({ type: 'error', msg: "Fallo en conexión TikTok." });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDiscovery = async (token: string) => {
    if (!token) return;
    setIsScanning(true);
    setScanLogs(["Inicializando TikTok UGC Core v1.3...", "Autenticando Advertisers en TikTok Business...", "Rastreando Pixeles de Conversión Viral..."]);
    try {
      const accounts = await fetchTikTokAssets(token, masterConfig.tiktokAppId);
      const updated = {
        ...business,
        tiktokConfig: { ...business.tiktokConfig, connectedUser: user.email, advertiserId: accounts[0]?.id || '' },
        discoveredAssets: { ...business.discoveredAssets, tiktok: accounts }
      };
      setBusiness(updated);
      dbStore.saveBusinessInfo(updated);
      setScanLogs(prev => [...prev, `SINCRONIZACIÓN PHOENIX OK.`, `${accounts.length} Cuentas Publicitarias UGC Sincronizadas.`]);
    } catch (e) {
      setScanLogs(prev => [...prev, "ERROR: Fallo en TikTok API v1.3 Handshake."]);
    } finally {
      setTimeout(() => setIsScanning(false), 900);
    }
  };

  const handleLink = () => {
    const appId = masterConfig.tiktokAppId;
    const redirectUri = encodeURIComponent(window.location.origin + '/');
    window.location.href = `https://business-api.tiktok.com/portal/auth?app_id=${appId}&state=tiktok&redirect_uri=${redirectUri}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-32 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-black/60 p-12 rounded-[4rem] border border-white/5 relative overflow-hidden group shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-pink-500/10 opacity-50" />
         <div className="flex items-center gap-10 relative z-10">
            <div className="w-24 h-24 bg-slate-950 rounded-[3rem] flex items-center justify-center shadow-2xl border border-white/10 group-hover:border-cyan-500/40 transition-all duration-700">
               <TikTokLogoOfficial />
            </div>
            <div>
               <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">TIKTOK <span className="text-cyan-400">ADS HUB</span></h2>
               <div className="flex flex-wrap items-center gap-4 mt-6">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse' : 'bg-slate-700'}`} />
                  <p className="text-slate-500 font-black uppercase text-[12px] tracking-[0.4em]">ENGINE: UGC VIRALIZATION v1.3</p>
                  
                  {isConnected && (
                    <button 
                      onClick={handleValidate}
                      disabled={isValidating}
                      className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-2 ml-4"
                    >
                      {isValidating ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} 
                      {isValidating ? 'Validando...' : 'Validar Acceso'}
                    </button>
                  )}
               </div>
               {validationResult && (
                <div className={`mt-4 px-6 py-3 rounded-2xl border flex items-center gap-3 animate-slideUp ${validationResult.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                  {validationResult.type === 'success' ? <Check size={14} /> : <ShieldAlert size={14} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{validationResult.msg}</span>
                </div>
              )}
            </div>
         </div>
         {isConnected && (
            <button onClick={() => handleDiscovery(business.tiktokConfig.accessToken)} className="bg-white/5 hover:bg-white/10 text-white px-12 py-7 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] border border-white/10 transition-all flex items-center gap-4 relative z-10 shadow-2xl">
               <RefreshCw size={20} className={isScanning ? "animate-spin" : ""} /> RE-SINCRONIZAR
            </button>
        )}
      </div>

      {!isConnected ? (
        <div className="glass p-20 md:p-40 rounded-[5rem] text-center space-y-12 shadow-2xl relative overflow-hidden bg-black/80">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute top-0 right-0 p-12 opacity-10 animate-pulse"><TikTokLogoOfficial /></div>
          <div className="space-y-8 relative z-10">
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">EFECTO <span className="text-pink-500">VIRAL</span> PROGRAMADO</h3>
            <p className="text-slate-400 font-bold text-sm md:text-lg uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
              Integre su cuenta de TikTok Business para desplegar anuncios nativos que no parecen publicidad, sino contenido irresistible para la Generación Z.
            </p>
          </div>
          <button onClick={handleLink} className="bg-cyan-500 text-slate-950 px-20 py-10 rounded-[3.5rem] font-black text-2xl uppercase tracking-[0.2em] shadow-[0_0_60px_rgba(34,211,238,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-8 mx-auto relative z-10">
            <Zap size={32} /> ACTIVAR TIKTOK ENGINE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-slideUp">
           <div className="space-y-10">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-10">ANUNCIANTES VINCULADOS</h4>
              <div className="grid grid-cols-1 gap-6">
                 {scannedData.map(acc => (
                    <div key={acc.id} onClick={() => setBusiness({...business, tiktokConfig: {...business.tiktokConfig, advertiserId: acc.id}})} className={`p-10 rounded-[3.5rem] border transition-all cursor-pointer flex items-center justify-between group ${business.tiktokConfig.advertiserId === acc.id ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.15)] scale-[1.02]' : 'glass border-white/5 bg-slate-900/40 hover:border-white/20'}`}>
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center p-4 border border-white/10 shadow-xl group-hover:scale-110 transition-transform"><TikTokLogoOfficial /></div>
                          <div>
                             <h4 className="text-xl font-black text-white uppercase truncate max-w-[250px]">{acc.name}</h4>
                             <p className="text-[12px] font-mono text-cyan-400/80 font-bold uppercase tracking-widest mt-1">ADV: {acc.id}</p>
                          </div>
                       </div>
                       {business.tiktokConfig.advertiserId === acc.id && (
                         <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center text-slate-950 shadow-2xl">
                           <CheckCircle2 size={24} strokeWidth={3} />
                         </div>
                       )}
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="space-y-10">
              <div className="glass p-12 rounded-[4.5rem] border border-white/10 bg-slate-900/60 space-y-10 h-full shadow-2xl">
                 <div className="flex items-center gap-6 text-cyan-400">
                    <Activity size={36} />
                    <h4 className="text-sm font-black uppercase tracking-[0.4em]">UGC VIRAL MONITOR</h4>
                 </div>
                 <div className="bg-black/80 rounded-[3rem] p-10 h-72 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-4 text-cyan-400/80 border border-white/5 shadow-inner">
                   {scanLogs.map((log, i) => <p key={i} className="animate-fadeIn border-l border-cyan-500/30 pl-4">{'>'} {log}</p>)}
                   {isScanning && <p className="animate-pulse text-white pl-4">{'>'} ESTABLECIENDO NODO UGC...</p>}
                 </div>
                 <div className="pt-8 border-t border-white/5 flex items-center gap-6">
                    <TrendingUp className="text-emerald-500" size={24} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimización de ROAS en tiempo real activa.</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
