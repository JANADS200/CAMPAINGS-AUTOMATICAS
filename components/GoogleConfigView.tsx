
import React, { useState, useEffect } from 'react';
import { BusinessInfo, User } from '../types';
import { dbStore } from '../services/storageService';
import { fetchGoogleAssets, validateGoogleCredentials } from '../services/googleService';
import { 
  Search, Zap, RefreshCw, CheckCircle2, 
  Globe, Activity, ShieldAlert, Key, RefreshCcw, LayoutGrid, Edit3,
  Loader2, Check, ShieldCheck
} from 'lucide-react';

const GoogleLogoOfficial = () => (
  <svg viewBox="0 0 48 48" className="w-14 h-14">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

interface GoogleConfigViewProps {
  business: BusinessInfo;
  setBusiness: (b: BusinessInfo | ((prev: BusinessInfo) => BusinessInfo)) => void;
  user: User;
}

export const GoogleConfigView: React.FC<GoogleConfigViewProps> = ({ business, setBusiness, user }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleManualChange = (field: string, value: string) => {
    setBusiness(prev => ({
      ...prev,
      googleConfig: { ...prev.googleConfig, [field]: value }
    }));
  };

  const handleValidate = async () => {
    const { accessToken, developerToken } = business.googleConfig;
    if (!accessToken) return alert("Ingresa un Access Token.");
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateGoogleCredentials(accessToken, developerToken);
      setValidationResult({ type: result.valid ? 'success' : 'error', msg: result.message });
    } catch (e) {
      setValidationResult({ type: 'error', msg: "Fallo en el protocolo de enlace Google." });
    } finally {
      setIsValidating(false);
    }
  };

  const handleLink = () => {
    const masterConfig = dbStore.getMasterSystemConfig();
    const clientId = business.googleConfig.clientId || masterConfig.googleClientId;
    const redirectUri = encodeURIComponent(window.location.origin + '/');
    const scope = encodeURIComponent('https://www.googleapis.com/auth/adwords');
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&state=google_oauth`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-32 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-white/5 p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-10">
           <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden">
              <GoogleLogoOfficial />
           </div>
           <div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic">GOOGLE <span className="text-amber-500">ADS HUB</span></h2>
              <div className="flex flex-wrap gap-4 mt-4">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center gap-2">
                  <Edit3 size={12} /> {showAdvanced ? 'Ocultar Manual' : 'Configuración Manual'}
                </button>
                {business.googleConfig.accessToken && (
                  <button 
                    onClick={handleValidate}
                    disabled={isValidating}
                    className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-2"
                  >
                    {isValidating ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} 
                    {isValidating ? 'Validando...' : 'Validar Google Ads'}
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
        <button onClick={handleLink} className="bg-white text-slate-950 px-16 py-8 rounded-[2.5rem] font-black uppercase text-sm shadow-2xl transition-all hover:scale-105 active:scale-95">
           VINCULAR GOOGLE OAUTH
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp">
           <div className="space-y-2">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">CID (Customer ID)</label>
             <input type="text" value={business.googleConfig.customerId} onChange={e => handleManualChange('customerId', e.target.value)} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-amber-500" placeholder="Ej: 442-519-..." />
           </div>
           <div className="space-y-2">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Dev Token</label>
             <input type="text" value={business.googleConfig.developerToken} onChange={e => handleManualChange('developerToken', e.target.value)} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-amber-500" />
           </div>
           <div className="md:col-span-2 space-y-2">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Token</label>
             <input type="text" value={business.googleConfig.accessToken} onChange={e => handleManualChange('accessToken', e.target.value)} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-amber-500" />
           </div>
        </div>
      )}

      <div className="glass p-20 rounded-[5rem] text-center space-y-8 shadow-2xl">
         <Activity size={48} className="mx-auto text-amber-500 animate-pulse" />
         <h3 className="text-4xl font-black text-white uppercase tracking-tighter">SINCRONIZACIÓN NATIVA</h3>
         <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] max-w-xl mx-auto leading-relaxed">
            Cada cambio se sincroniza con el núcleo operativo. Puedes navegar libremente, el autoguardado está activo 24/7.
         </p>
      </div>

      <div className="fixed bottom-10 right-10 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-full flex items-center gap-3 animate-pulse pointer-events-none z-[100] backdrop-blur-md">
        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Autoguardado Phoenix Activo</span>
      </div>
    </div>
  );
};
