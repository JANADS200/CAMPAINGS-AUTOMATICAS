
import React, { useState, useEffect } from 'react';
import { Rocket, Zap, ShieldAlert, RefreshCw, Key, CheckCircle2, ArrowRight, User, Phone, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';
import { dbStore } from '../services/storageService';
import { JanAdsLogo } from './Logo';

interface LoginOverlayProps {
  onLoginSuccess: (user: UserType) => void;
}

const CountdownTimer: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number, ms: number }>({ d: 0, h: 0, m: 0, s: 0, ms: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(expiryDate).getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
        ms: Math.floor((distance % 1000) / 10)
      });
    }, 45);

    return () => clearInterval(timer);
  }, [expiryDate]);

  return (
    <div className="grid grid-cols-5 gap-2 w-full">
       {[
         { v: timeLeft.d, l: 'D' },
         { v: timeLeft.h, l: 'H' },
         { v: timeLeft.m, l: 'M' },
         { v: timeLeft.s, l: 'S' },
         { v: timeLeft.ms, l: 'MS' }
       ].map((t, i) => (
         <div key={i} className="bg-black/60 border border-emerald-500/20 p-3 rounded-2xl text-center shadow-inner">
            <p className="text-2xl font-black text-emerald-400 font-mono leading-none tracking-tighter">{t.v.toString().padStart(2, '0')}</p>
            <p className="text-[6px] font-black text-slate-500 uppercase mt-1 tracking-widest">{t.l}</p>
         </div>
       ))}
    </div>
  );
};

export const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLoginSuccess }) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [welcomeUser, setWelcomeUser] = useState<UserType | null>(null);

  const handleLogin = async () => {
    setError(null);
    const input = licenseInput.trim().toUpperCase();
    
    if (!userName.trim()) { setError("INGRESA TU NOMBRE DE AGENTE."); return; }
    if (!userPhone.trim()) { setError("NÚMERO DE WHATSAPP REQUERIDO."); return; }
    if (!input) { setError("INGRESA LA LLAVE DE ACCESO."); return; }

    setIsLoading(true);
    setSyncStatus('Verificando en Bóveda...');

    // Simulamos delay de red para efecto visual, pero envolvemos en try/catch real
    setTimeout(async () => {
      try {
        const result = dbStore.validateAndActivate(input, userName, userPhone);
        
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
        } else if (result.user) {
          setSyncStatus('Sincronizando Nodos IA...');
          
          try {
            const cloudData = await dbStore.syncFromCloud(result.user.license_key);
            if (cloudData) {
               dbStore.saveBusinessInfo(cloudData);
            }
          } catch (e) {
            console.warn("Fallo sincronización nube, continuando offline");
          }

          setTimeout(() => {
            setWelcomeUser(result.user);
            setIsLoading(false);
          }, 1200);
        } else {
          // Caso borde inesperado
          setError("Error desconocido en autenticación.");
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error(e);
        setError("Error crítico del sistema de licencias.");
        setIsLoading(false);
      }
    }, 1500);
  };

  if (welcomeUser) {
    return (
      <div className="fixed inset-0 z-[600] bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-40 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="max-w-xl w-full glass p-10 md:p-14 rounded-[4.5rem] border border-emerald-500/30 text-center space-y-10 animate-slideUp relative z-10 shadow-[0_0_100px_rgba(16,185,129,0.15)]">
          <div className="space-y-4">
            <div className="mx-auto flex justify-center scale-150 py-10">
              <JanAdsLogo size={60} />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">ACCESO <span className="text-emerald-400">AUTORIZADO</span></h2>
          </div>

          <div className="p-8 bg-black/50 rounded-[3rem] border border-white/5 space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                   <User size={14} className="text-emerald-500" />
                   <span className="text-white">{welcomeUser.name}</span>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">
                   {welcomeUser.plan}
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 justify-center text-slate-400">
                   <Clock size={16} className="text-emerald-500" />
                   <p className="text-[11px] font-black uppercase tracking-[0.2em]">TIEMPO RESTANTE DE OPERACIÓN</p>
                </div>
                <CountdownTimer expiryDate={welcomeUser.access_until} />
             </div>
          </div>

          <button 
            onClick={() => onLoginSuccess(welcomeUser)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-xl tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-6 group hover:scale-[1.02] active:scale-95"
          >
            ACTIVAR NÚCLEO PHOENIX <ArrowRight className="group-hover:translate-x-3 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-md w-full glass p-10 md:p-14 rounded-[4rem] border border-white/10 text-center space-y-12 animate-fadeIn">
        <div className="space-y-6">
          <div className="mx-auto flex justify-center scale-125">
            <JanAdsLogo size={80} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="relative group">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="NOMBRE DEL AGENTE"
              className="w-full bg-black/60 border border-white/10 p-5 pl-14 rounded-[2rem] text-xs font-bold text-white outline-none focus:border-rose-500 transition-all"
            />
          </div>

          <div className="relative group">
            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              type="text" 
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="WHATSAPP DE NEGOCIO"
              className="w-full bg-black/60 border border-white/10 p-5 pl-14 rounded-[2rem] text-xs font-bold text-white outline-none focus:border-rose-500 transition-all"
            />
          </div>

          <div className="relative pt-6 group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#020617] px-4">
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">PROTOCOLO DE ACCESO</span>
            </div>
            <Key className="absolute left-6 top-1/2 -translate-y-1/2 translate-y-3 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              type="text" 
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              placeholder="LLAVE DE SEGURIDAD"
              className="w-full bg-slate-900 border border-rose-500/30 p-6 pl-14 rounded-[2rem] text-center font-mono text-sm font-black text-white outline-none focus:border-rose-500 transition-all shadow-inner"
            />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-6">
              <RefreshCw className="animate-spin text-rose-500" size={32} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">{syncStatus}</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl animate-shake">
               <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          {!isLoading && (
            <button 
              onClick={handleLogin}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              ACCEDER AL SISTEMA
            </button>
          )}
        </div>
        
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] leading-relaxed italic">
          IAJANADS OS ES PROPIEDAD INTELECTUAL PROTEGIDA.
        </p>
      </div>
    </div>
  );
};
