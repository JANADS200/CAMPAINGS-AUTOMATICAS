import React from 'react';
// Add Zap to the imports from lucide-react
import { ShieldCheck, Lock, EyeOff, Trash2, Mail, FileText, X, Zap } from 'lucide-react';
import { MASTER_CONFIG } from '../services/masterConfig';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10 animate-fadeIn">
      <div className="max-w-4xl w-full glass bg-slate-900/60 rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_100px_rgba(34,211,238,0.1)]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">POLÍTICA DE <span className="text-cyan-400">PRIVACIDAD</span></h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocolo de Protección de Datos JAN ADS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Sección 1: Datos */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-cyan-400">
                <FileText size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">¿Qué datos recolectamos?</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Recolectamos exclusivamente información operativa necesaria para el funcionamiento del OS: Tokens de acceso a APIs (Meta, Google, TikTok), ID de cuentas publicitarias, nombres de páginas y activos multimedia generados por la IA.
              </p>
            </div>

            {/* Sección 2: Uso */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                {/* Fix: Added missing Zap import above */}
                <Zap size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">¿Para qué los usamos?</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Los datos se utilizan únicamente para: 1. Automatizar la creación y gestión de campañas. 2. Generar creativos personalizados mediante IA. 3. Sincronizar métricas de rendimiento en tiempo real.
              </p>
            </div>

            {/* Sección 3: Meta APIs */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-500">
                <ShieldCheck size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">Uso de APIs de Meta</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Utilizamos Meta Graph API v19.0 para leer activos (Pixeles, Páginas, Instagram) y desplegar anuncios. Todo el proceso cumple con las políticas de desarrollador de Meta y requiere su autorización explícita mediante tokens de sistema.
              </p>
            </div>

            {/* Sección 4: Garantía No-Venta */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-rose-500">
                <EyeOff size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">Privacidad Garantizada</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                <span className="text-white font-black">NO VENDEMOS NI COMPARTIMOS</span> sus datos comerciales, estrategias o lista de clientes con terceros. Su ventaja competitiva permanece privada dentro de su instancia del OS.
              </p>
            </div>

            {/* Sección 5: Eliminación */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <Trash2 size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">Cómo eliminar sus datos</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                La mayoría de los datos se almacenan localmente en su navegador (localStorage). Puede eliminar toda la información instantáneamente limpiando la caché del sitio o cerrando sesión y borrando los datos de navegación.
              </p>
            </div>

            {/* Sección 6: Contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Mail size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">Contacto Directo</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Para cualquier duda sobre el tratamiento de su información, contacte a nuestro DPO en: <br/>
                <span className="text-cyan-400 font-black">{MASTER_CONFIG.SUPPORT_EMAIL}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-950/60 border-t border-white/5 text-center">
          <button onClick={onClose} className="bg-cyan-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
            ENTENDIDO Y ACEPTADO
          </button>
        </div>
      </div>
    </div>
  );
};