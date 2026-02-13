
import React from 'react';
import { Shield, FileText, Scale, Zap, AlertTriangle, UserCheck, X } from 'lucide-react';

interface TermsOfServiceProps {
  onClose?: () => void;
  isPublic?: boolean;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose, isPublic }) => {
  return (
    <div className={`fixed inset-0 z-[700] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10 animate-fadeIn`}>
      <div className="max-w-4xl w-full glass bg-slate-900/60 rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-400/20">
              <Scale size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">CONDICIONES DEL <span className="text-rose-500">SERVICIO</span></h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">JAN ADS OS - ACUERDO LEGAL v1.0</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar text-slate-300">
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <UserCheck size={20} className="text-rose-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">1. Aceptación de los Términos</h3>
              </div>
              <p className="text-xs leading-relaxed">
                Al acceder y utilizar JAN ADS OS (en adelante "el Sistema"), usted acepta cumplir y estar sujeto a estos Términos de Servicio. Si no está de acuerdo, debe cesar el uso del Sistema inmediatamente.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Zap size={20} className="text-rose-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">2. Uso de Inteligencia Artificial (Google Gemini/Veo)</h3>
              </div>
              <p className="text-xs leading-relaxed">
                El Sistema utiliza modelos generativos de Google para crear contenido. Usted es responsable de verificar la precisión de cualquier copy o video generado. JAN ADS OS no garantiza la veracidad absoluta de los datos producidos por la IA.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Shield size={20} className="text-rose-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">3. Responsabilidad de APIs de Terceros</h3>
              </div>
              <p className="text-xs leading-relaxed">
                El Sistema actúa como interfaz para las APIs de Meta Ads, Google Ads y TikTok Ads. Usted debe poseer las credenciales necesarias y cumplir con las políticas de cada plataforma. JAN ADS OS no se hace responsable por suspensiones de cuentas publicitarias derivadas del uso de estas herramientas.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <AlertTriangle size={20} className="text-rose-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">4. Limitación de Responsabilidad</h3>
              </div>
              <p className="text-xs leading-relaxed">
                JAN ADS OS no garantiza resultados financieros específicos. El marketing digital conlleva riesgos y el rendimiento de las campañas depende de múltiples factores externos al software.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <FileText size={20} className="text-rose-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">5. Propiedad Intelectual</h3>
              </div>
              <p className="text-xs leading-relaxed">
                El software JAN ADS OS es propiedad intelectual protegida. Los activos generados (videos/imágenes) son propiedad del usuario final una vez producidos bajo su licencia activa.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-950/60 border-t border-white/5 text-center">
          {isPublic ? (
             <p className="text-[10px] font-bold text-slate-500 uppercase">Documento oficial para verificación de plataforma</p>
          ) : (
            <button onClick={onClose} className="bg-rose-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
              ACEPTAR Y VOLVER
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
