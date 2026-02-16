
import React, { useState, useEffect } from 'react';
import { BusinessInfo, MetaAsset, User } from '../types';
import { fetchMetaAssets, validateMetaCredentials, TokenStatus, PERMANENT_TOKEN } from '../services/metaService';
import { MetaAssetSelector } from './MetaAssetSelector';
import { dbStore } from '../services/storageService';
import { 
  RefreshCw, Zap, CreditCard, Activity,
  Briefcase, ShieldCheck, Edit3, Phone, Instagram, Target, MessageCircle,
  Loader2, ShieldAlert, Check, Search, Terminal, Copy, AlertTriangle, ExternalLink,
  Unlock, Fingerprint, Facebook, Link2
} from 'lucide-react';

const MetaLogoRealistic = () => (
  <svg viewBox="0 0 512 512" className="w-14 h-14 drop-shadow-[0_0_20px_rgba(6,104,225,0.6)] animate-pulse">
    <path fill="#0668E1" d="M355.2 144c-22.9 0-45.7 8.3-63.1 24.8l-36.1 34.3-36.1-34.3C202.5 152.3 179.7 144 156.8 144 100.1 144 56 188.1 56 244.8c0 56.7 44.1 100.8 100.8 100.8 22.9 0 45.7-8.3 63.1-24.8l36.1-34.3 36.1 34.3c17.4 16.5 40.2 24.8 63.1 24.8 56.7 0 100.8-44.1 100.8-100.8 0-56.7-44.1-100.8-100.8-100.8zM156.8 304.8c-33.1 0-59.2-26.1-59.2-59.2s26.1-59.2 59.2-59.2 59.2 26.1 59.2 59.2-26.1 59.2-59.2 59.2zm198.4 0c-33.1 0-59.2-26.1-59.2-59.2s26.1-59.2 59.2-59.2 59.2 26.1 59.2 59.2-26.1 59.2-59.2 59.2z"/>
  </svg>
);

interface MetaConfigViewProps {
  business: BusinessInfo;
  setBusiness: (b: BusinessInfo | ((prev: BusinessInfo) => BusinessInfo)) => void;
  user: User;
}

export const MetaConfigView: React.FC<MetaConfigViewProps> = ({ business, setBusiness, user }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [tokenHealth, setTokenHealth] = useState<TokenStatus | null>(null);
  
  const scannedData = business.discoveredAssets?.meta || {
    accounts: [], pages: [], pixels: [], instagrams: [], whatsapps: [], businesses: []
  };

  // Fixed missing isConnected definition to resolve reference error
  const isConnected = !!business.metaConfig.accessToken;

  const handleDiscovery = async (customToken?: string) => {
    const token = customToken || business.metaConfig.accessToken || PERMANENT_TOKEN;
    if (!token) {
       setScanLogs(["ERROR: No hay token disponible. Use 'Vincular Cuenta'."]);
       return;
    }
    
    setIsScanning(true);
    setScanLogs(["Iniciando Barrido Profundo Phoenix..."]);
    
    try {
      const assets = await fetchMetaAssets(token, (msg) => {
        setScanLogs(prev => [...prev, `> ${msg}`]);
      });
      
      setBusiness(prev => {
        const next = {
          ...prev,
          discoveredAssets: { ...prev.discoveredAssets, meta: assets }
        };
        dbStore.saveBusinessInfo(next);
        return next;
      });

      setScanLogs(prev => [...prev, "✓ BARRIDO COMPLETADO AL 100%.", `✓ ${assets.accounts.length} Cuentas y ${assets.pages.length} Páginas listas.`]);
      setTokenHealth({ isValid: true, type: 'HEALTHY', message: "Conexión estable." });
    } catch (e: any) {
      setScanLogs(prev => [...prev, `!! FALLO CRÍTICO: ${e.message}`]);
      setTokenHealth({ isValid: false, type: 'EXPIRED', message: e.message });
    } finally {
      setIsScanning(false);
    }
  };

  // Escuchar si regresamos de un OAuth (token en URL)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        setBusiness(prev => ({ ...prev, metaConfig: { ...prev.metaConfig, accessToken: token }}));
        handleDiscovery(token);
        // Limpiar hash para estética
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  const startOAuthFlow = () => {
    const masterConfig = dbStore.getMasterSystemConfig();
    const appId = business.metaConfig.appId || masterConfig.metaAppId;
    const redirectUri = encodeURIComponent(window.location.origin + '/');
    const scope = 'ads_management,ads_read,business_management,pages_read_engagement,pages_show_list,instagram_basic,whatsapp_business_management';
    window.location.href = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(scope)}&state=meta_oauth`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn px-4 pb-32">
      
      {/* HEADER PRINCIPAL CON BOTÓN DE VINCULACIÓN RE-INSTAURADO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-blue-600/10 p-12 rounded-[4rem] border border-blue-500/20 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
           <Facebook size={200} className="text-blue-500" />
        </div>
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="w-24 h-24 bg-slate-950 rounded-[3rem] flex items-center justify-center shadow-2xl border border-white/5 overflow-hidden">
             <MetaLogoRealistic />
          </div>
          <div>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none italic">META <span className="text-blue-500">ENGINE</span></h2>
            <div className="flex flex-wrap gap-4 mt-6">
              <button 
                onClick={() => handleDiscovery()}
                disabled={isScanning}
                className={`px-8 py-4 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 ${isScanning ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
              >
                {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Fingerprint size={14} />} 
                {isScanning ? 'ESCANEANDO...' : 'INICIAR BARRIDO 100%'}
              </button>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)} 
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-blue-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <Edit3 size={12} /> {showAdvanced ? 'CERRAR MANUAL' : 'AJUSTE MANUAL'}
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={startOAuthFlow} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase text-sm shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 relative z-10 flex items-center gap-4 group"
        >
          <Link2 size={24} className="group-hover:rotate-12 transition-transform" />
          VINCULAR CUENTA DE META
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
           <div className="space-y-2">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Token (Manual)</label>
             <input type="text" value={business.metaConfig.accessToken} onChange={e => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, accessToken: e.target.value}}))} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-blue-500" />
           </div>
           <div className="space-y-2">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">App ID</label>
             <input type="text" value={business.metaConfig.appId} onChange={e => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, appId: e.target.value}}))} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-blue-500" />
           </div>
           <div className="space-y-2">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">App Secret</label>
             <input type="password" value={business.metaConfig.appSecret} onChange={e => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, appSecret: e.target.value}}))} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-blue-500" />
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
          <MetaAssetSelector 
            label="CUENTA PUBLICITARIA" assets={scannedData.accounts || []}
            selectedId={business.metaConfig.adAccountId} onSelect={(id) => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, adAccountId: id}}))}
            icon={<CreditCard size={24} className="text-blue-500" />}
            businessContext={business}
          />
          <MetaAssetSelector 
            label="PÁGINA COMERCIAL (FACEBOOK)" assets={scannedData.pages || []}
            selectedId={business.metaConfig.pageId} onSelect={(id) => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, pageId: id}}))}
            icon={<ShieldCheck size={24} className="text-blue-500" />}
            businessContext={business}
          />
          <MetaAssetSelector 
            label="CUENTA INSTAGRAM BUSINESS" assets={scannedData.instagrams || []}
            selectedId={business.metaConfig.instagramId || ''} onSelect={(id) => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, instagramId: id}}))}
            icon={<Instagram size={24} className="text-pink-500" />}
            businessContext={business}
          />
          <MetaAssetSelector 
            label="PIXEL DE RASTREO" assets={scannedData.pixels || []}
            selectedId={business.metaConfig.pixelId || ''} onSelect={(id) => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, pixelId: id}}))}
            icon={<Target size={24} className="text-emerald-500" />}
            businessContext={business}
          />
          <MetaAssetSelector 
            label="WHATSAPP BUSINESS (WABA)" assets={scannedData.whatsapps || []}
            selectedId={business.metaConfig.whatsappId || ''} onSelect={(id) => setBusiness(prev => ({...prev, metaConfig: {...prev.metaConfig, whatsappId: id}}))}
            icon={<MessageCircle size={24} className="text-emerald-400" />}
            businessContext={business}
          />
        </div>

        <div className="space-y-8 h-fit sticky top-10">
           <div className="glass p-10 rounded-[4rem] border border-white/10 bg-slate-900/60 shadow-2xl space-y-8">
              <div className="flex items-center gap-6 text-blue-500">
                <Terminal size={32} />
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">MONITOR DE BARRIDO</h3>
              </div>
              
              <div className="bg-black/60 rounded-[2.5rem] p-8 h-80 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-4 text-cyan-400 shadow-inner border border-white/5">
                {scanLogs.length === 0 && <p className="opacity-30 italic">{'>'} Esperando instrucción de barrido...</p>}
                {scanLogs.map((log, i) => (
                  <p key={i} className="animate-fadeIn border-l border-white/10 pl-4">{log}</p>
                ))}
                {isScanning && <p className="animate-pulse text-white pl-4">{'>'} ESCANEANDO NODOS...</p>}
              </div>

              <div className="pt-6 border-t border-white/5 grid grid-cols-5 gap-2 text-center">
                 <div className="space-y-1">
                    <p className="text-white font-black text-xl leading-none">{scannedData.accounts.length}</p>
                    <p className="text-[6px] text-slate-500 uppercase font-black">Cuentas</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-white font-black text-xl leading-none">{scannedData.pages.length}</p>
                    <p className="text-[6px] text-slate-500 uppercase font-black">Páginas</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-white font-black text-xl leading-none">{scannedData.instagrams.length}</p>
                    <p className="text-[6px] text-slate-500 uppercase font-black">Instagrams</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-white font-black text-xl leading-none">{scannedData.pixels.length}</p>
                    <p className="text-[6px] text-slate-500 uppercase font-black">Píxeles</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-white font-black text-xl leading-none">{scannedData.whatsapps.length}</p>
                    <p className="text-[6px] text-slate-500 uppercase font-black">WhatsApp</p>
                 </div>
              </div>
           </div>

           {/* TIPS DE VINCULACIÓN */}
           {!isConnected && (
             <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex gap-6">
                <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo de Primer Acceso</p>
                   <p className="text-[11px] text-slate-400 leading-relaxed">Si es la primera vez que vinculas, asegúrate de marcar todas las páginas y cuentas publicitarias en el diálogo de Facebook para que JAN ADS pueda verlas.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
