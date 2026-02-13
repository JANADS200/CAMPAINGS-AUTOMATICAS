
import React, { useState, useEffect, useRef } from 'react';
import { BusinessInfo, CampaignAsset, ViewType } from '../types';
import { executeFinalDeployment } from '../services/metaService';
import { 
  X, ChevronRight, ChevronLeft, Rocket, Zap, 
  ShieldCheck, Heart, MessageCircle, Share2, 
  Play, Pause, Volume2, VolumeX, Cpu, CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface PhoenixReelFlowProps {
  business: BusinessInfo;
  assets: CampaignAsset[];
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
}

export const PhoenixReelFlow: React.FC<PhoenixReelFlowProps> = ({ business, assets, onClose, onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const currentAsset = assets[activeIndex];

  useEffect(() => {
    // Autoplay el video actual
    videoRefs.current.forEach((v, i) => {
      if (v) {
        if (i === activeIndex) v.play().catch(() => {});
        else v.pause();
      }
    });
  }, [activeIndex]);

  const handleNext = () => {
    if (activeIndex < assets.length - 1) setActiveIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(prev => prev - 1);
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const res = await executeFinalDeployment(business, [currentAsset], (log) => {
        setLaunchProgress(log.progress);
      });
      if (res.success) {
        setShowSuccess(true);
      } else {
        alert("Fallo en el lanzamiento del Reel: " + res.error);
      }
    } catch (e) {
      alert("Error crítico de inyección.");
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center animate-fadeIn">
      {/* HUD Superior (Barras de progreso tipo Story) */}
      <div className="absolute top-6 left-0 w-full px-6 z-[1010] flex gap-1.5">
        {assets.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-[5000ms] ease-linear ${i < activeIndex ? 'w-full opacity-100' : i === activeIndex ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
            />
          </div>
        ))}
      </div>

      {/* Controles Globales */}
      <div className="absolute top-12 left-6 right-6 z-[1010] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-white font-black text-xs">
            {business.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-black text-xs uppercase tracking-tighter">{business.name}</p>
            <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest">IA Generative Reel</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white p-2 bg-black/40 rounded-full backdrop-blur-md">
          <X size={24} />
        </button>
      </div>

      {/* Contenedor Principal (Reel) */}
      <div className="relative w-full h-full max-w-[500px] aspect-[9/16] overflow-hidden bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {assets.map((ad, idx) => (
          <div 
            key={ad.id} 
            className={`absolute inset-0 transition-all duration-500 transform ${idx === activeIndex ? 'translate-x-0 opacity-100 scale-100' : idx < activeIndex ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'}`}
          >
            {ad.type === 'video' ? (
              <video 
                ref={el => { videoRefs.current[idx] = el; }}
                src={ad.url} 
                className="w-full h-full object-cover" 
                muted={isMuted} 
                loop 
                playsInline
              />
            ) : (
              <img src={ad.url} className="w-full h-full object-cover" />
            )}
            
            {/* Overlay Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            {/* Contenido Publicitario (Stickers) */}
            <div className="absolute bottom-32 left-6 right-16 space-y-4 animate-slideUp">
               <div className="bg-rose-600/90 backdrop-blur-md px-4 py-2 rounded-lg border border-rose-400/30 inline-block">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} fill="white" /> {ad.metadata?.framework || 'AIDA STRATEGY'}
                  </p>
               </div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none text-shadow-lg">
                  {ad.title}
               </h3>
               <p className="text-sm text-white/90 font-medium leading-relaxed line-clamp-3">
                  {ad.content}
               </p>
            </div>

            {/* Acciones Laterales (Iconos Reels) */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center">
               <div className="flex flex-col items-center gap-1">
                  <button className="text-white hover:text-rose-500 transition-colors"><Heart size={28} /></button>
                  <span className="text-[10px] font-black text-white">4.2k</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <button className="text-white"><MessageCircle size={28} /></button>
                  <span className="text-[10px] font-black text-white">128</span>
               </div>
               <button className="text-white"><Share2 size={28} /></button>
               <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-white p-2 bg-white/10 rounded-full backdrop-blur-md"
               >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
               </button>
            </div>
          </div>
        ))}

        {/* Botón de Lanzamiento (Swipe Up Style) */}
        <div className="absolute bottom-10 left-6 right-6">
           <button 
            onClick={handleLaunch}
            disabled={isLaunching}
            className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
           >
             {isLaunching ? (
               <div className="flex items-center gap-3">
                 <RefreshCw className="animate-spin" size={18} />
                 INYECTANDO {launchProgress}%
               </div>
             ) : (
               <>LANZAR ESTE REEL <Rocket size={18} /></>
             )}
           </button>
        </div>

        {/* Navegadores Tactiles Invisibles */}
        <div className="absolute inset-y-0 left-0 w-1/4 z-[1005]" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/4 z-[1005]" onClick={handleNext} />
      </div>

      {/* Overlay de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
           <div className="max-w-md w-full glass bg-slate-950 p-12 rounded-[4rem] border border-emerald-500/50 text-center space-y-8">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/30">
                 <CheckCircle2 size={64} className="animate-bounce" />
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">CAMPAÑA<br/><span className="text-emerald-500">EN ÓRBITA</span></h3>
              <p className="text-sm text-slate-400 font-bold">El reel ha sido inyectado con éxito en tu Business Manager.</p>
              <button 
                onClick={() => onNavigate('campaign_manager')}
                className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest"
              >
                IR AL GESTOR ADS
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
