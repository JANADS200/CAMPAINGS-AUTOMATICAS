
import { 
  Zap, RefreshCw, ShieldCheck, Send, Activity, 
  Terminal, Target, Flame, Snowflake, 
  AlertTriangle, X, BrainCircuit, LineChart,
  Sparkles, TrendingUp as TrendingUpIcon, Search, Plus, Rocket, DollarSign, Layers,
  Loader2, CheckCircle, HeartCrack, MousePointer2, BadgePercent, Info, Download, Shield,
  TrendingUp, BarChart3, Users
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { AppNotification, LaunchedCampaign, BusinessInfo } from '../types';
import { gemini } from '../services/geminiService';
import { dbStore } from '../services/storageService';

interface DashboardProps {
  campaigns: LaunchedCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<LaunchedCampaign[]>>;
  business: BusinessInfo;
  onBroadcast: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const safeNum = (val: any): number => {
  const n = parseFloat(val);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

export const Dashboard: React.FC<DashboardProps> = ({ campaigns = [], setCampaigns, business, onBroadcast }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [humanInput, setHumanInput] = useState('');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<{role: 'ai'|'user', text: string}[]>([]);
  
  const syncRealMetaCampaigns = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      let realCampaigns: LaunchedCampaign[] = [];

      if (business?.metaConfig?.accessToken && business?.metaConfig?.adAccountId) {
        try {
          let adAccountId = business.metaConfig.adAccountId;
          if (!adAccountId.startsWith('act_')) adAccountId = `act_${adAccountId}`;
          const fields = 'id,name,status,objective,effective_status,created_time,insights{impressions,clicks,spend,conversions,ctr,cpc,purchase_roas}';
          const response = await fetch(`https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=${fields}&limit=10&access_token=${business.metaConfig.accessToken}`);
          const data = await response.json();
          if (!data.error && data.data) {
            realCampaigns = data.data.map((c: any) => ({
              id: c.id, 
              name: c.name, 
              isActive: c.status === 'ACTIVE',
              status: c.status.toLowerCase(),
              version: 1, 
              aiStrategy: c.objective,
              aiAutopilot: true, 
              createdAt: c.created_time,
              ads: [], 
              strategyName: "API Meta Sync",
              metrics: {
                impressions: safeNum(c.insights?.data?.[0]?.impressions),
                clicks: safeNum(c.insights?.data?.[0]?.clicks),
                spend: safeNum(c.insights?.data?.[0]?.spend),
                ctr: safeNum(c.insights?.data?.[0]?.ctr) * 100,
                roas: safeNum(c.insights?.data?.[0]?.purchase_roas?.[0]?.value),
                cpc: safeNum(c.insights?.data?.[0]?.cpc),
                conversions: safeNum(c.insights?.data?.[0]?.conversions),
                frequency: 1.1
              }
            }));
          }
        } catch (e) { console.error("API Meta Sync Failed, falling back to local..."); }
      }

      const localCampaigns = dbStore.getLaunchedCampaigns();
      const combined = [...realCampaigns];
      localCampaigns.forEach(local => {
        if (!combined.find(c => c.id === local.id)) combined.push(local);
      });

      setCampaigns(combined);
      if (combined.length > 0 && !selectedId) setSelectedId(combined[0].id);
    } finally {
      setIsSyncing(false);
    }
  }, [business, isSyncing, selectedId, setCampaigns]);

  useEffect(() => { syncRealMetaCampaigns(); }, []);

  const selectedCampaign = useMemo(() => {
    return campaigns.find(c => c.id === selectedId) || campaigns[0] || null;
  }, [campaigns, selectedId]);

  const summaryStats = useMemo(() => {
    return {
      totalSpend: campaigns.reduce((acc, c) => acc + safeNum(c.metrics.spend), 0),
      totalClicks: campaigns.reduce((acc, c) => acc + safeNum(c.metrics.clicks), 0),
      avgRoas: campaigns.length > 0 ? campaigns.reduce((acc, c) => acc + safeNum(c.metrics.roas), 0) / campaigns.length : 0,
      totalConversions: campaigns.reduce((acc, c) => acc + safeNum(c.metrics.conversions), 0)
    };
  }, [campaigns]);

  const chartData = useMemo(() => {
    if (!selectedCampaign) return [];
    return [
      { name: 'Lunes', value: safeNum(selectedCampaign.metrics.ctr) * 0.8 },
      { name: 'Martes', value: safeNum(selectedCampaign.metrics.ctr) * 1.1 },
      { name: 'Miércoles', value: safeNum(selectedCampaign.metrics.ctr) * 0.9 },
      { name: 'Jueves', value: safeNum(selectedCampaign.metrics.ctr) * 1.2 },
      { name: 'Viernes', value: safeNum(selectedCampaign.metrics.ctr) * 1.5 },
      { name: 'Sábado', value: safeNum(selectedCampaign.metrics.ctr) * 1.1 },
      { name: 'Domingo', value: safeNum(selectedCampaign.metrics.ctr) * 1.3 },
    ];
  }, [selectedCampaign]);

  const handleHumanCommand = async () => {
    if (!humanInput.trim()) return;
    const input = humanInput;
    setHumanInput('');
    setIsProcessingInput(true);
    setLogs(prev => [...prev, { role: 'user', text: input }]);
    try {
      const response = await gemini.getComplexAdvice(input, business, campaigns);
      setLogs(prev => [...prev, { role: 'ai', text: response }]);
    } finally {
      setIsProcessingInput(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-32">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
            <div className="flex items-center gap-3 text-cyan-400 mb-4">
               <DollarSign size={16} />
               <p className="text-[9px] font-black uppercase tracking-widest">Inversión Total</p>
            </div>
            <p className="text-3xl font-black text-white">${summaryStats.totalSpend.toLocaleString()}</p>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/[0.02]">
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
               <TrendingUp size={16} />
               <p className="text-[9px] font-black uppercase tracking-widest">ROAS Promedio</p>
            </div>
            <p className="text-3xl font-black text-emerald-400">{summaryStats.avgRoas.toFixed(2)}x</p>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-rose-500/20 bg-rose-500/[0.02]">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
               <MousePointer2 size={16} />
               <p className="text-[9px] font-black uppercase tracking-widest">Clicks IA</p>
            </div>
            <p className="text-3xl font-black text-white">{summaryStats.totalClicks.toLocaleString()}</p>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-cyan-500/20 bg-cyan-500/[0.02]">
            <div className="flex items-center gap-3 text-cyan-400 mb-4">
               <Users size={16} />
               <p className="text-[9px] font-black uppercase tracking-widest">Conversiones</p>
            </div>
            <p className="text-3xl font-black text-white">{summaryStats.totalConversions.toLocaleString()}</p>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Sidebar de Campañas */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="flex justify-between items-center px-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ACTIVAS EN EL NÚCLEO</h3>
             <button onClick={() => syncRealMetaCampaigns()} className={`text-cyan-400 p-2 hover:bg-white/5 rounded-full transition-all ${isSyncing ? 'animate-spin' : ''}`}><RefreshCw size={16} /></button>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
            {campaigns.length === 0 ? (
              <div className="p-12 text-center opacity-30 text-[10px] uppercase font-black tracking-widest bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-white/5">
                <Rocket size={32} className="mx-auto mb-4" />
                Esperando Primer Despliegue...
              </div>
            ) : campaigns.map(c => (
              <button 
                key={c.id} onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-6 rounded-[2.5rem] border transition-all relative group ${selectedId === c.id ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'glass border-white/5 opacity-60 hover:opacity-100'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className={`w-2 h-2 rounded-full ${c.isActive ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`}></div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{c.aiStrategy}</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase truncate group-hover:text-cyan-400 transition-colors italic">{c.name}</h4>
                <div className="mt-6 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[7px] text-slate-500 font-black uppercase">Gasto</p>
                    <p className="text-xs text-white font-bold">${safeNum(c.metrics.spend).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] text-emerald-500 font-black uppercase">ROAS</p>
                    <p className="text-sm text-emerald-400 font-black">{safeNum(c.metrics.roas).toFixed(2)}x</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Área de Datos Detallada */}
        <div className="flex-1 space-y-6">
          {selectedCampaign ? (
            <>
              <div className="glass p-12 rounded-luxury border border-white/10 flex flex-col md:flex-row justify-between items-center bg-slate-900/40 gap-8 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Activity size={180} className="text-cyan-400" /></div>
                 <div className="flex items-center gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner"><ShieldCheck size={48} /></div>
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                         <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedCampaign.name}</h2>
                         <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-cyan-500/20">LIVE</div>
                       </div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{selectedCampaign.strategyName} • Versión {selectedCampaign.version}.0</p>
                    </div>
                 </div>
                 <div className="flex gap-16 relative z-10">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">CTR GLOBAL</p>
                      <p className="text-4xl font-black text-white italic">{safeNum(selectedCampaign.metrics.ctr).toFixed(2)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-emerald-500 uppercase mb-2 tracking-widest">ROAS IA</p>
                      <p className="text-4xl font-black text-emerald-400 italic">{safeNum(selectedCampaign.metrics.roas).toFixed(2)}x</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="glass p-10 rounded-[3.5rem] border border-white/5 h-[450px] bg-slate-900/40 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                       <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3"><BarChart3 size={16} className="text-cyan-400" /> TELEMETRÍA SEMANAL</h4>
                       <div className="flex gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CTR Prediction</span>
                       </div>
                    </div>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '1.5rem', color: '#fff' }} />
                          <Area type="monotone" dataKey="value" stroke="#22d3ee" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="glass p-10 rounded-[3.5rem] border border-rose-500/20 flex flex-col h-[450px] bg-black/20 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Terminal size={120} className="text-rose-500" /></div>
                    <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10"><Terminal size={16} /> IA OPTIMIZER LOG v4.1</h4>
                    <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-4 pr-4 relative z-10">
                       <p className="text-emerald-500 animate-pulse italic">> Sincronización Phoenix Establecida...</p>
                       <p className="text-slate-600 italic">> Analizando micro-conversiones en tiempo real...</p>
                       {logs.map((l, i) => (
                         <div key={i} className={`p-4 rounded-2xl ${l.role === 'user' ? 'bg-white/5 border border-white/5 ml-6' : 'bg-rose-500/5 border border-rose-500/10'}`}>
                            <p className={l.role === 'user' ? 'text-white font-bold' : 'text-slate-400 font-medium'}>{l.role === 'user' ? '> ' : 'IA: '}{l.text}</p>
                         </div>
                       ))}
                       {isProcessingInput && <p className="text-cyan-400 animate-pulse">> PENSANDO...</p>}
                    </div>
                    <div className="mt-6 relative z-10">
                      <input 
                        value={humanInput} onChange={e => setHumanInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !isProcessingInput && handleHumanCommand()}
                        placeholder="Ej: '¿Cómo puedo subir el ROAS hoy?'"
                        className="w-full bg-slate-900/80 border border-white/10 p-5 rounded-[2rem] text-xs text-white outline-none focus:border-rose-500 transition-all placeholder:text-slate-700"
                      />
                      <button onClick={handleHumanCommand} disabled={isProcessingInput} className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-600 hover:bg-rose-500 p-3 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30"><Send size={16} className="text-white" /></button>
                    </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="h-[70vh] flex flex-col items-center justify-center opacity-10 text-center animate-pulse">
               <BrainCircuit size={120} className="mb-8" />
               <p className="text-2xl font-black uppercase tracking-[0.8em]">CALIBRANDO NÚCLEO...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
