
import React, { useState } from 'react';
import { MetaAsset, BusinessInfo } from '../types';
import { 
  Plus, Check, X, Instagram, MessageSquare, 
  Target, CreditCard, ShieldAlert, User
} from 'lucide-react';

interface MetaAssetSelectorProps {
  label: string;
  assets: MetaAsset[];
  selectedId: string;
  onSelect: (id: string, asset: MetaAsset) => void;
  icon?: React.ReactNode;
  businessContext?: BusinessInfo;
}

export const MetaAssetSelector: React.FC<MetaAssetSelectorProps> = ({ label, assets, selectedId, onSelect, icon }) => {
  const [showManual, setShowManual] = useState(false);
  const [manualId, setManualId] = useState('');
  
  const isWhatsapp = label.toLowerCase().includes('whatsapp');
  const isPixel = label.toLowerCase().includes('pixel') || label.toLowerCase().includes('píxel');
  const isInstagram = label.toLowerCase().includes('instagram');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between ml-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg text-slate-400 border border-white/5 shadow-inner">{icon}</div>
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{label}</label>
        </div>
        {assets.length === 0 && (
          <span className="text-[8px] font-black text-rose-500 uppercase flex items-center gap-2 animate-pulse">
            <ShieldAlert size={10} /> BUSCANDO ACTIVOS...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {assets.map((asset) => {
          const isSelected = selectedId === asset.id;
          return (
            <div 
              key={asset.id} 
              onClick={() => onSelect(asset.id, asset)} 
              className={`w-full p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group ${
                isSelected 
                ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)]' 
                : 'bg-slate-900/40 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center overflow-hidden bg-slate-950 relative ${isSelected ? 'border-cyan-400' : 'border-white/10'}`}>
                  {asset.avatar ? (
                    <img src={asset.avatar} className="w-full h-full object-cover" alt={asset.name} />
                  ) : (
                    <div className={`font-black ${isSelected ? 'text-cyan-400' : 'text-slate-700'}`}>
                      {isInstagram ? <Instagram size={20} /> : isPixel ? <Target size={20} /> : isWhatsapp ? <MessageSquare size={20} /> : <User size={20} />}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`font-black text-[12px] uppercase tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>{asset.name}</h4>
                  <p className={`text-[9px] font-mono mt-1 ${isSelected ? 'text-cyan-400/80' : 'text-slate-500'}`}>ID: {asset.id}</p>
                </div>
              </div>
              {isSelected && (
                <div className="w-8 h-8 bg-cyan-400 rounded-xl flex items-center justify-center text-slate-950 shadow-lg">
                  <Check size={16} strokeWidth={4} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showManual ? (
        <button 
          onClick={() => setShowManual(true)} 
          className="w-full p-5 rounded-[1.8rem] border border-dashed border-white/10 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/20 transition-all flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest"
        >
          <Plus size={16} /> VINCULAR MANUALMENTE
        </button>
      ) : (
        <div className="p-6 bg-slate-950 rounded-[2.5rem] border border-cyan-500/30 space-y-4 animate-slideUp">
           <input 
             type="text" value={manualId} onChange={e => setManualId(e.target.value)} 
             placeholder="Ingresa el ID del activo..." 
             className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-cyan-500 text-xs" 
           />
           <div className="flex gap-2">
              <button 
                onClick={() => {
                   if (!manualId) return;
                   const newAsset: MetaAsset = {
                     id: manualId,
                     name: `Manual: ${manualId}`,
                     type: isWhatsapp ? 'whatsapp' : isPixel ? 'pixel' : 'account',
                     avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${manualId}&backgroundColor=1e293b`
                   };
                   onSelect(newAsset.id, newAsset);
                   setShowManual(false);
                }} 
                className="flex-1 bg-cyan-600 text-white py-4 rounded-xl font-black uppercase text-[10px]"
              >
                CONFIRMAR
              </button>
              <button onClick={() => setShowManual(false)} className="px-5 bg-white/5 text-slate-500 rounded-xl"><X size={16}/></button>
           </div>
        </div>
      )}
    </div>
  );
};
