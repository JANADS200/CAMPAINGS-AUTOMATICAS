
import React from 'react';
import { AppNotification } from '../types';
import { X, Zap, Bell, CheckCircle, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, notifications, onMarkRead }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md h-full glass border-l border-white/10 flex flex-col shadow-2xl animate-slideLeft">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
           <div className="flex items-center gap-4">
              <div className="icon-container w-12 h-12 rounded-2xl flex items-center justify-center text-cyan-400">
                 <Bell size={22} />
              </div>
              <div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">SISTEMA <span className="text-cyan-400">PHOENIX</span></h2>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Monitor de IA en Tiempo Real</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
           {notifications.length === 0 ? (
             <div className="py-20 text-center space-y-4">
                <Zap size={48} className="mx-auto text-slate-800" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Sin alertas activas</p>
             </div>
           ) : (
             notifications.map((n) => (
               <div 
                 key={n.id} 
                 onClick={() => onMarkRead(n.id)}
                 className={`glass p-6 rounded-[2rem] border transition-all cursor-pointer group ${n.read ? 'border-white/5 opacity-60' : 'border-cyan-500/20 bg-cyan-500/[0.03]'}`}
               >
                 <div className="flex items-start gap-4">
                    <div className={`icon-container p-3 rounded-xl shrink-0 ${
                      n.type === 'SUCCESS' ? 'text-emerald-400' :
                      n.type === 'WARNING' ? 'text-amber-400' :
                      n.type === 'CRITICAL' ? 'text-rose-500' :
                      n.type === 'AI_INSIGHT' ? 'text-purple-400' : 'text-cyan-400'
                    }`}>
                       {n.type === 'SUCCESS' && <CheckCircle size={18} />}
                       {n.type === 'WARNING' && <AlertTriangle size={18} />}
                       {n.type === 'CRITICAL' && <ShieldAlert size={18} />}
                       {n.type === 'AI_INSIGHT' && <Sparkles size={18} />}
                       {n.type === 'INFO' && <Zap size={18} />}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                       <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest truncate">{n.title}</h4>
                          <span className="text-[7px] text-slate-600 font-bold">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed">{n.message}</p>
                    </div>
                 </div>
               </div>
             ))
           )}
        </div>

        <div className="p-8 border-t border-white/5 bg-slate-900/40 text-center">
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Protocolo de Escaneo de IA Activo 24/7</p>
        </div>
      </div>
    </div>
  );
};
