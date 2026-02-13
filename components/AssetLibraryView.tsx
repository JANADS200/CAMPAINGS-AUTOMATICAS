
import React, { useState, useMemo, useEffect } from 'react';
import { StoredAsset, PendingCampaign, ViewType } from '../types';
import { dbStore } from '../services/storageService';
import { 
  Search, Trash2, Video, Image as ImageIcon, 
  RefreshCw, AlertTriangle, ArchiveRestore, Rocket,
  X, Sparkles, Download
} from 'lucide-react';

interface AssetLibraryViewProps {
  onSelect: (assets: any[]) => void;
  onNavigate?: (view: ViewType) => void;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({ onSelect, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'drafts'>('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');
  const [pendingCampaigns, setPendingCampaigns] = useState<PendingCampaign[]>([]);
  const [localAssets, setLocalAssets] = useState<StoredAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<StoredAsset | null>(null);

  const refreshLibrary = async () => {
    try {
      const data = await dbStore.getAllAssets();
      setLocalAssets(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
      
      const drafts = await dbStore.getPendingCampaigns();
      setPendingCampaigns(Array.isArray(drafts) ? drafts : []);
    } catch (e) {
      console.error("Error al refrescar biblioteca:", e);
    }
  };

  useEffect(() => {
    refreshLibrary();
    window.addEventListener('gallery_updated', refreshLibrary);
    return () => window.removeEventListener('gallery_updated', refreshLibrary);
  }, []);

  const filteredAssets = useMemo(() => {
    return localAssets.filter(a => {
      const matchSearch = (a.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlatform = filterPlatform === 'ALL' || a.platform === filterPlatform;
      return matchSearch && matchPlatform;
    });
  }, [localAssets, searchTerm, filterPlatform]);

  const handleDelete = async (id: string) => {
    if(confirm("¿Seguro que deseas eliminar este activo para siempre?")) {
      await dbStore.deleteAsset(id);
      refreshLibrary();
    }
  };

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRescue = (assets: any[]) => {
    onSelect(assets);
    if (onNavigate) onNavigate('previews');
  };

  return (
    <div className="space-y-10 animate-fadeIn px-4 pb-32 max-w-7xl mx-auto">
      {selectedAsset && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-fadeIn">
          <div className="max-w-5xl w-full glass bg-slate-900/80 rounded-[4rem] border border-white/10 overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-[0_0_100px_rgba(225,29,72,0.15)]">
             <div className="flex-1 bg-black flex items-center justify-center relative group">
                {selectedAsset.type === 'video' ? (
                  <video src={selectedAsset.url} controls autoPlay loop className="max-h-full max-w-full" />
                ) : (
                  <img src={selectedAsset.url} className="max-h-full max-w-full object-contain" />
                )}
                <div className="absolute top-6 left-6 flex gap-3">
                   <button onClick={() => setSelectedAsset(null)} className="p-4 bg-white/10 rounded-full text-white hover:bg-rose-600 transition-all backdrop-blur-md"><X /></button>
                   <button onClick={() => downloadAsset(selectedAsset.url, `${selectedAsset.title}.${selectedAsset.type === 'video' ? 'mp4' : 'png'}`)} className="p-4 bg-white/10 rounded-full text-white hover:bg-cyan-600 transition-all backdrop-blur-md"><Download /></button>
                </div>
             </div>
             <div className="w-full md:w-[400px] p-10 flex flex-col space-y-8 overflow-y-auto custom-scrollbar bg-slate-900/60 border-l border-white/5">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-rose-500">
                      <Sparkles size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Telemetría de IA</p>
                   </div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedAsset.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Score ROAS IA</p>
                      <p className="text-xl font-black text-emerald-400">{selectedAsset.aiMetadata?.score || '8.9'}/10</p>
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Modelo</p>
                      <p className="text-xs font-black text-white truncate uppercase">{selectedAsset.aiMetadata?.model || 'Gemini 3 Pro'}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Copy Inyectado</p>
                   <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5">
                      <p className="text-11px text-slate-300 font-medium italic leading-relaxed">"{selectedAsset.content}"</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <button 
                    onClick={() => handleRescue([selectedAsset])}
                    className="w-full bg-rose-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl"
                   >
                      <Rocket size={16} /> RE-LANZAR AHORA
                   </button>
                   <button 
                    onClick={() => handleDelete(selectedAsset.id)}
                    className="w-full bg-white/5 text-rose-500 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-rose-500/20"
                   >
                      ELIMINAR PERMANENTEMENTE
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">LA <span className="text-emerald-500">BÓVEDA</span></h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4 italic">Almacenamiento Seguro Scoped por Licencia</p>
        </div>
        <div className="flex bg-black/40 p-2 rounded-[2rem] border border-white/5">
           <button onClick={() => setActiveTab('assets')} className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-emerald-500 text-slate-900 shadow-xl' : 'text-slate-500'}`}>Activos ({localAssets.length})</button>
           <button onClick={() => setActiveTab('drafts')} className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'drafts' ? 'bg-rose-500 text-white shadow-xl' : 'text-slate-500'}`}>Rescate ({pendingCampaigns.length})</button>
        </div>
      </div>

      {activeTab === 'assets' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row gap-4 bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/5">
             <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rastrear por negocio o título..."
                  className="w-full bg-black/40 border border-white/5 p-5 pl-16 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all"
                />
             </div>
             <div className="flex gap-2">
                {['ALL', 'META', 'GOOGLE', 'TIKTOK'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setFilterPlatform(p)}
                    className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase border transition-all ${filterPlatform === p ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}
                  >
                    {p}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.id} 
                onClick={() => setSelectedAsset(asset)}
                className="glass rounded-[3rem] border border-white/5 overflow-hidden group shadow-2xl transition-all hover:scale-[1.02] cursor-pointer relative"
              >
                 <div className="aspect-[4/5] bg-black relative">
                    {asset.type === 'image' ? (
                      <img src={asset.url} className="w-full h-full object-cover" />
                    ) : (
                      <video src={asset.url} className="w-full h-full object-cover" muted autoPlay loop />
                    )}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                       {asset.type === 'video' ? <Video size={14} className="text-rose-500"/> : <ImageIcon size={14} className="text-cyan-400"/>}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-emerald-500 text-slate-900 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl">
                       IA SCORE: {asset.aiMetadata?.score || '8.5'}
                    </div>
                 </div>
                 <div className="p-5 bg-slate-900/60 border-t border-white/5">
                    <div className="flex justify-between items-start gap-2">
                       <div className="overflow-hidden">
                          <p className="text-[10px] font-black text-white uppercase truncate">{asset.businessName || 'Empresa'}</p>
                          <p className="text-[7px] font-bold text-slate-500 uppercase mt-1">{(asset.platform || 'META')} ENGINE</p>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }} className="p-2 text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
          {filteredAssets.length === 0 && (
            <div className="py-40 text-center space-y-4 opacity-20">
               <ArchiveRestore size={64} className="mx-auto" />
               <p className="text-[10px] font-black uppercase tracking-widest">Sin activos en la bóveda</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'drafts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pendingCampaigns.map((camp) => (
            <div key={camp.id} className={`glass p-10 rounded-[4rem] border transition-all shadow-2xl relative overflow-hidden ${camp.id.startsWith('fail_') ? 'border-rose-500/40 bg-rose-500/[0.02]' : 'border-white/10 bg-slate-900/40'}`}>
               {camp.id.startsWith('fail_') && (
                 <div className="absolute top-0 right-0 bg-rose-600 text-white px-6 py-2 rounded-bl-3xl font-black text-[8px] uppercase tracking-widest animate-pulse">
                    FALLO DE INYECCIÓN DETECTADO
                 </div>
               )}
               <div className="flex justify-between items-start mb-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shadow-inner ${camp.id.startsWith('fail_') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                    <AlertTriangle size={32} />
                  </div>
                  <button onClick={async (e) => { e.stopPropagation(); if(confirm("¿Eliminar?")){ await dbStore.deletePendingCampaign(camp.id); refreshLibrary(); } }} className="p-3 text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={20} /></button>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{camp.businessName}</h3>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">{camp.strategyName}</p>
               </div>
               <div className="flex gap-3 py-8 border-y border-white/5 my-6 overflow-x-auto no-scrollbar">
                 {Array.isArray(camp.assets) && camp.assets.map((a, i) => (
                   <div key={i} className="w-16 h-16 rounded-2xl bg-black overflow-hidden border border-white/10 shrink-0">
                      {a.type === 'image' ? <img src={a.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-rose-500"><Video size={20} /></div>}
                   </div>
                 ))}
               </div>
               <button 
                onClick={() => handleRescue(camp.assets)}
                className="w-full bg-white text-slate-900 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 hover:bg-rose-500 hover:text-white transition-all shadow-xl"
               >
                 <RefreshCw size={18} /> RE-INTENTAR LANZAMIENTO
               </button>
            </div>
          ))}
          {pendingCampaigns.length === 0 && (
             <div className="col-span-full py-40 text-center opacity-30 italic uppercase font-black text-xs tracking-widest">Sin campañas en cola de recuperación</div>
          )}
        </div>
      )}
    </div>
  );
};
