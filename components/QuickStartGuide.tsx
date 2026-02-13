
import React from 'react';

export const QuickStartGuide: React.FC = () => {
  return (
    <div className="glass rounded-[2.5rem] p-8 border border-cyan-500/20 bg-cyan-500/5 space-y-6 mb-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
          No requiere edición de código
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-slate-900 font-black shrink-0">1</div>
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter">Obtén tu API Key</h3>
          <p className="text-slate-400 text-[10px] font-bold">Crea tu llave en el panel oficial de Google.</p>
        </div>
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noreferrer"
          className="ml-auto bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-cyan-500/20"
        >
          Ir a AI Studio
        </a>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white font-black shrink-0">2</div>
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter">Vinculación Automática</h3>
          <p className="text-slate-400 text-[10px] font-bold">Usa el botón "Vincular" abajo. La IA hará el resto.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
           <span className="text-[10px] font-black text-cyan-400/60 uppercase">Seguro & Encriptado</span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] text-center">
          Tu clave se almacena de forma segura en el navegador. <br/> 
          <span className="text-cyan-500/50">Cero configuraciones manuales necesarias.</span>
        </p>
      </div>
    </div>
  );
};
