import React, { useMemo, useState } from 'react';
import { CampaignAsset, BusinessInfo, ViewType, LaunchedCampaign } from '../types';
import { executeFinalDeployment, DeploymentResult, validateMetaDeploymentInputs } from '../services/metaService';
import { dbStore } from '../services/storageService';
import { Rocket, CheckCircle2, Cpu, AlertTriangle } from 'lucide-react';

interface AdPreviewViewProps {
  assets: CampaignAsset[];
  business: BusinessInfo;
  onNavigate?: (view: ViewType) => void;
  setCampaigns?: React.Dispatch<React.SetStateAction<LaunchedCampaign[]>>;
}

export const AdPreviewView: React.FC<AdPreviewViewProps> = ({ assets, business, onNavigate, setCampaigns }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [logs, setLogs] = useState<{ phase: string, message: string, progress: number, status?: string }[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [campaignName] = useState(`[PHOENIX] ${business.name} - ${new Date().toLocaleDateString()}`);

  const validation = useMemo(() => validateMetaDeploymentInputs(business, assets), [business, assets]);

  const launchBlocked = !validation.valid || isLaunching;

  const handleLaunch = async () => {
    if (!validation.valid) {
      alert(`No se puede lanzar todavía:\n\n${validation.errors.join('\n')}`);
      return;
    }

    setIsLaunching(true);
    setLogs([]);
    setProgress(0);

    try {
      const res = await executeFinalDeployment(business, assets, (log) => {
        setLogs(prev => [log, ...prev]);
        setProgress(log.progress);
      }, campaignName);

      if (res.success) {
        setResult(res);
        const newCampaign: LaunchedCampaign = {
          id: res.campaignIds?.[0] || `local_${Date.now()}`,
          name: campaignName,
          isActive: true,
          status: 'running',
          version: 1,
          aiStrategy: business.strategyId,
          aiAutopilot: true,
          createdAt: new Date().toISOString(),
          ads: assets,
          strategyName: business.strategyId.toUpperCase(),
          metrics: { impressions: 1, clicks: 0, spend: 0, ctr: 0, roas: 0, cpc: 0, conversions: 0, frequency: 1 }
        };

        dbStore.saveLaunchedCampaign(newCampaign);
        if (setCampaigns) setCampaigns(prev => [newCampaign, ...prev]);
      } else {
        throw new Error(res.error || 'Fallo en la API de Meta');
      }
    } catch (e: any) {
      alert(`Error en inyección: ${e.message}`);
      setIsLaunching(false);
    }
  };

  if (isLaunching && !result) {
    return (
      <div className="fixed inset-0 z-[1000] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-12 text-center">
          <div className="w-32 h-32 bg-rose-600/20 rounded-[3.5rem] flex items-center justify-center mx-auto border border-rose-500/30 animate-pulse"><Cpu size={56} className="text-rose-500" /></div>
          <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">INYECTANDO <span className="text-rose-500">ESTRUCTURA</span></h3>
          <div className="bg-black/60 rounded-[2.5rem] p-8 h-64 overflow-y-auto font-mono text-[10px] space-y-3 border border-white/5 text-cyan-400 text-left custom-scrollbar shadow-inner">
            {logs.map((l, i) => <div key={i} className="flex gap-4 animate-fadeIn"><span className="text-slate-600 shrink-0">[{l.phase}]</span><span>{l.message}</span></div>)}
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
            <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 animate-fadeIn">
        <div className="glass p-12 md:p-20 rounded-luxury border border-emerald-500/40 bg-emerald-500/[0.02] text-center space-y-10">
          <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 mx-auto shadow-2xl"><CheckCircle2 size={64} className="animate-bounce" /></div>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none text-emerald-500">¡CAMPAÑA EN ÓRBITA!</h2>
          {!!result.failedAds?.length && (
            <div className="text-left bg-black/30 border border-amber-500/30 rounded-3xl p-6">
              <p className="text-amber-300 font-black uppercase text-xs tracking-widest mb-3">Ads con error ({result.failedAds.length})</p>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.failedAds.slice(0, 8).map((item, idx) => <li key={idx}>• {item}</li>)}
              </ul>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <button onClick={() => onNavigate?.('campaign_manager')} className="bg-emerald-600 text-white px-10 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest">GESTOR DE CAMPAÑAS</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn pb-32 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-end gap-10">
        <div className="space-y-4">
          <p className="text-slate-500 font-black uppercase text-[12px] tracking-[0.4em]">CALIDAD FINAL</p>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none italic">REVISAR <span className="text-rose-500">ACTIVOS</span></h2>
        </div>
        <button
          onClick={handleLaunch}
          disabled={launchBlocked}
          className={`text-white px-20 py-10 rounded-luxury border font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-6 ${launchBlocked ? 'bg-slate-700 border-slate-500/30 cursor-not-allowed opacity-70' : 'bg-rose-600 border-rose-500/30 hover:scale-105'}`}
        >
          <Rocket size={28} /> {launchBlocked ? 'CORRIGE ERRORES ANTES DE LANZAR' : 'INICIAR LANZAMIENTO'}
        </button>
      </div>

      {!validation.valid && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-300" size={18} />
            <p className="text-amber-300 font-black uppercase text-xs tracking-widest">Checklist bloqueante de publicación</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-100">
            {validation.errors.map((error, idx) => <li key={idx}>• {error}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {assets.map((ad) => (
          <div key={ad.id} className="bg-slate-900 border border-white/5 rounded-luxury-sm overflow-hidden shadow-2xl transition-all duration-300 group hover:border-rose-500/40">
            <div className="p-8"><textarea value={ad.content} readOnly className="w-full bg-transparent border-none outline-none text-[13px] text-slate-200 font-medium leading-relaxed resize-none min-h-[100px]" /></div>
            <div className="aspect-square bg-black relative">
              {ad.type === 'video' ? <video src={ad.url} className="w-full h-full object-cover" muted autoPlay loop playsInline /> : <img src={ad.url} className="w-full h-full object-cover" />}
            </div>
            <div className="bg-slate-800/80 p-6 border-t border-white/5 flex items-center justify-between gap-8">
              <div className="flex-1">
                <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-1">{ad.metadata?.socialLabel || 'IA CREATIVE'}</p>
                <p className="text-[20px] font-black text-white uppercase tracking-tighter">{ad.title}</p>
              </div>
              <div className="bg-white text-slate-900 text-[11px] font-black px-8 py-4 rounded-2xl border border-white/10 uppercase tracking-[0.1em]">{ad.metadata?.cta || 'SHOP_NOW'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
