
import React from 'react';

export const JanAdsLogo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
        {/* Isotipo: Nodo de Automatización */}
        <path d="M100 20L169.282 60V140L100 180L30.718 140V60L100 20Z" fill="url(#jan_grad_bg)" />
        
        {/* Rayo de Velocidad (J estilizada) */}
        <path d="M80 60L120 100L80 140" stroke="white" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M120 60L140 80" stroke="white" strokeWidth="15" strokeLinecap="round" opacity="0.5" />
        
        {/* Círculos de Conexión */}
        <circle cx="100" cy="100" r="85" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <circle cx="169" cy="60" r="6" fill="#22d3ee" />
        
        <defs>
          <linearGradient id="jan_grad_bg" x1="30.718" y1="20" x2="169.282" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#064e3b" />
            <stop offset="0.5" stopColor="#10b981" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="flex flex-col leading-none">
        <span className="font-black text-white tracking-tighter uppercase" style={{ fontSize: size * 0.55 }}>
          JAN<span className="text-cyan-400">ADS</span>
        </span>
        <span className="font-bold text-emerald-500/80 tracking-[0.4em] uppercase mt-0.5" style={{ fontSize: size * 0.14 }}>
          INTELIGENCIA·IA
        </span>
      </div>
    </div>
  );
};
