
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Key, Copy, Zap, UserCheck, ShieldCheck, Database, Lock, Unlock, 
  Activity, Settings2, Users, PieChart, BarChart3, TrendingUp,
  Save, Globe, Facebook, Search, Smartphone, RefreshCw, AlertCircle, ExternalLink, Info,
  Link, Plus, Trash2, X, MessageSquare, Calendar, Clock, Hourglass, Loader2, CheckCircle2
} from 'lucide-react';
import { License, MasterSystemConfig, User } from '../types';
import { dbStore } from '../services/storageService';

export const AdminPanel: React.FC = () => {
  const [vault, setVault] = useState<License[]>([]);
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'licenses' | 'crm' | 'system' | 'oauth'>('licenses');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [durationValue, setDurationValue] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days' | 'years'>('days');
  
  const [masterConfig, setMasterConfig] = useState<MasterSystemConfig>(() => dbStore.getMasterSystemConfig());
  const [showGenerator, setShowGenerator] = useState(false);
  const [newKeyPlan, setNewKeyPlan] = useState('PRO PLAN 30 DÍAS');

  const refresh = () => {
    setIsRefreshing(true);
    const leads = dbStore.getGlobalUsers();
    const licenses = dbStore.getVaultStatus();
    
    setGlobalUsers(leads);
    setVault(licenses);
    
    setTimeout(() => {
      setIsRefreshing(false);
      if (activeTab === 'crm' && leads.length > 0) notify("SINCRO CRM EXITOSA");
    }, 500);
  };

  useEffect(() => { refresh(); }, [activeTab]);

  const stats = useMemo(() => {
    const total = vault.length;
    const used = vault.filter(v => v.status === 'active').length;
    const available = total - used;
    const totalUsers = globalUsers.length;
    return { total, used, available, totalUsers };
  }, [vault, globalUsers]);

  const notify = (msg: string) => {
    setLastAction(msg);
    setTimeout(() => setLastAction(null), 3000);
  };

  const generateLicense = () => {
    const newKey = `JAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const license: License = {
      license_key: newKey,
      plan: newKeyPlan,
      status: 'available',
      durationDays: durationUnit === 'days' ? durationValue : durationUnit === 'years' ? durationValue * 365 : 1
    };
    dbStore.addLicense(license);
    refresh();
    notify(`LLAVE GENERADA: ${newKey}`);
    setShowGenerator(false);
  };

  const removeLicense = (key: string) => {
    if (confirm("¿Eliminar licencia definitivamente?")) {
      dbStore.deleteLicense(key);
      refresh();
      notify("LICENCIA ELIMINADA");
    }
  };

  const saveMasterConfig = () => {
    dbStore.saveMasterSystemConfig(masterConfig);
    notify("CONFIGURACIÓN MAESTRA GUARDADA");
  };

  const currentOrigin = window.location.origin + '/';

  return (
    <div className="space-y-12 animate-fadeIn pb-32 px-4 max-w-7xl mx-auto">
      {lastAction && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[500] bg-emerald-500 text-slate-950 px-8 py-3 rounded-full font-black text-[10px] tracking-widest shadow-2xl animate-slideUp">
          {lastAction}
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none italic">ADMIN <span className="text-emerald-500">VAULT</span></h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4 flex items-center gap-2">
            <Database size={12} /> GESTIÓN DE ACCESOS PHOENIX OS
          </p>
        </div>
        
        <div className="flex bg-black/40 p-2 rounded-[2.5rem] border border-white/5 overflow-x-auto no-scrollbar max-w-full">
           <button onClick={() => setActiveTab('licenses')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'licenses' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>LLaves</button>
           <button onClick={() => setActiveTab('crm')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'crm' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>Leads CRM</button>
           <button onClick={() => setActiveTab('system')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'system' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>Configuraciones</button>
           <button onClick={() => setActiveTab('oauth')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'oauth' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>Redirecciones</button>
        </div>
      </div>

      {activeTab === 'licenses' && (
        <div className="space-y-10 animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Capacidad Bóveda</span>
               <p className="text-4xl font-black text-white">{stats.total}</p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/[0.02]">
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">Licencias Activadas</span>
               <p className="text-4xl font-black text-white">{stats.used}</p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] border border-cyan-500/20 bg-cyan-500/[0.02]">
               <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2 block">Leads Registrados</span>
               <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
            </div>
            <button 
              onClick={() => setShowGenerator(true)}
              className="bg-emerald-600 hover:bg-emerald-500 transition-all rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-white space-y-2 shadow-xl active:scale-95"
            >
               <Plus size={32} />
               <span className="text-[10px] font-black uppercase tracking-widest">Crear Nueva Llave</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {vault.map((lic) => (
              <div key={lic.license_key} className={`p-6 rounded-[2rem] border transition-all group relative ${lic.status === 'active' ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg' : 'border-white/5 bg-slate-900/40 opacity-70 hover:opacity-100'}`}>
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-2">
                      <Key size={16} className={lic.status === 'active' ? 'text-emerald-500' : 'text-slate-500'} />
                      {lic.status === 'available' && <Hourglass size={12} className="text-amber-500 animate-pulse" />}
                   </div>
                   <button onClick={() => removeLicense(lic.license_key)} className="opacity-0 group-hover:opacity-100 transition-all text-rose-500 hover:scale-110">
                      <Trash2 size={14} />
                   </button>
                </div>
                <h3 className="text-[12px] font-black font-mono text-white mb-1 truncate tracking-tighter">{lic.license_key}</h3>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-3">{lic.plan}</p>
                <div className="space-y-1 mb-4">
                   {lic.status === 'active' && lic.expiry ? (
                     <>
                        <p className="text-[8px] font-mono text-emerald-400 uppercase flex items-center gap-1 font-black"><Clock size={10}/> Expira: {new Date(lic.expiry).toLocaleDateString()}</p>
                        <p className="text-[7px] font-mono text-slate-600 uppercase italic">Activa desde {lic.activatedAt ? new Date(lic.activatedAt).toLocaleDateString() : 'N/A'}</p>
                     </>
                   ) : (
                     <p className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-2"><Zap size={10}/> LISTA: {lic.durationDays} DÍAS</p>
                   )}
                </div>
                <button onClick={() => { navigator.clipboard.writeText(lic.license_key); notify("LLAVE COPIADA"); }} className="w-full py-2.5 rounded-xl bg-white/5 text-[9px] font-black text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-all">
                  <Copy size={12} /> COPIAR CÓDIGO
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGenerator && (
        <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowGenerator(false)}>
           <div className="max-w-md w-full glass bg-slate-900 rounded-[3rem] p-10 space-y-8 animate-slideUp border border-white/10" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">GENERADOR DE <span className="text-emerald-500">LLAVES</span></h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Nombre del Plan</label>
                    <input value={newKeyPlan} onChange={e => setNewKeyPlan(e.target.value)} className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-white font-bold text-xs" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Valor</label>
                      <input type="number" value={durationValue} onChange={e => setDurationValue(Number(e.target.value))} className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-white font-bold text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Unidad</label>
                      <select value={durationUnit} onChange={e => setDurationUnit(e.target.value as any)} className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-white font-bold text-xs appearance-none">
                        <option value="days">DÍAS</option>
                        <option value="hours">HORAS</option>
                        <option value="years">AÑOS</option>
                      </select>
                   </div>
                 </div>
              </div>
              <button onClick={generateLicense} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl">FORJAR LICENCIA</button>
           </div>
        </div>
      )}

      {activeTab === 'crm' && (
        <div className="space-y-10 animate-slideUp">
           <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/40">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <Users className="text-emerald-500" size={32} />
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">REGISTRO DE LEADS CRM</h3>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Sincronización en tiempo real con la base de datos local</p>
                    </div>
                 </div>
                 <button 
                  onClick={refresh} 
                  disabled={isRefreshing}
                  className={`w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    {isRefreshing ? <Loader2 size={24} className="animate-spin" /> : <RefreshCw size={24} />}
                 </button>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-black/20 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                          <th className="p-6">Nombre del Agente</th>
                          <th className="p-6">Canal WhatsApp</th>
                          <th className="p-6">Llave Utilizada</th>
                          <th className="p-6">Plan Asignado</th>
                          <th className="p-6">Registro</th>
                          <th className="p-6">Vencimiento</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {globalUsers.length > 0 ? [...globalUsers].reverse().map((user, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="p-6">
                                <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                  {user.name || 'Desconocido'}
                                </span>
                             </td>
                             <td className="p-6">
                                <a 
                                  href={`https://wa.me/${user.phone?.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  className="text-emerald-400 text-xs font-mono font-bold hover:underline flex items-center gap-2 group-hover:scale-105 transition-transform origin-left"
                                >
                                   <MessageSquare size={14} /> {user.phone || 'N/A'}
                                </a>
                             </td>
                             <td className="p-6">
                                <span className="text-[10px] font-mono text-slate-400 font-bold bg-black/40 px-3 py-1 rounded-lg border border-white/5">{user.license_key}</span>
                             </td>
                             <td className="p-6">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{user.plan}</span>
                             </td>
                             <td className="p-6">
                                <span className="text-slate-500 text-[10px] font-bold flex items-center gap-2">
                                  <Calendar size={12}/> {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'Manual'}
                                </span>
                             </td>
                             <td className="p-6">
                                <div className="flex flex-col">
                                   <span className="text-rose-400 text-[10px] font-black">{user.access_until ? new Date(user.access_until).toLocaleDateString() : 'Eterna'}</span>
                                   <span className="text-slate-600 text-[8px] font-bold">{user.access_until ? new Date(user.access_until).toLocaleTimeString() : '-'}</span>
                                </div>
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan={6} className="p-24 text-center">
                                <div className="flex flex-col items-center gap-6 opacity-20">
                                   <Database size={64} className="text-slate-500" />
                                   <div className="space-y-2">
                                      <p className="text-xl font-black uppercase tracking-[0.3em]">Cero Datos en CRM</p>
                                      <p className="text-[10px] font-bold">Inicie sesión con una llave para registrar el primer lead.</p>
                                   </div>
                                </div>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/40 space-y-10">
           <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4"><Settings2 className="text-cyan-400" /> INFRAESTRUCTURA API MAESTRA</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Meta App ID</label>
                   <input type="text" value={masterConfig.metaAppId} onChange={e => setMasterConfig({...masterConfig, metaAppId: e.target.value})} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs outline-none focus:border-blue-500" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Google Client ID</label>
                   <input type="text" value={masterConfig.googleClientId} onChange={e => setMasterConfig({...masterConfig, googleClientId: e.target.value})} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs outline-none focus:border-amber-500" />
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Google Developer Token</label>
                   <input type="text" value={masterConfig.googleDevToken} onChange={e => setMasterConfig({...masterConfig, googleDevToken: e.target.value})} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs outline-none focus:border-amber-500" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">TikTok App ID</label>
                   <input type="text" value={masterConfig.tiktokAppId} onChange={e => setMasterConfig({...masterConfig, tiktokAppId: e.target.value})} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs outline-none focus:border-cyan-500" />
                 </div>
              </div>
           </div>
           <button onClick={saveMasterConfig} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs shadow-2xl transition-all hover:scale-105 active:scale-95">ACTUALIZAR CONFIGURACIÓN</button>
        </div>
      )}

      {activeTab === 'oauth' && (
        <div className="space-y-8 animate-slideUp">
           <div className="glass p-12 rounded-[4rem] border border-rose-500/30 bg-rose-500/[0.02] space-y-8">
              <div className="flex items-center gap-4">
                 <AlertCircle className="text-rose-500" size={32} />
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">OAUTH CONFIGURACIÓN</h3>
                    <p className="text-xs text-slate-400 font-bold">URLs de redireccionamiento críticas para autorización de plataformas.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 text-amber-500">
                       <Search size={18} />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">URI Google Ads</h4>
                    </div>
                    <div className="flex items-center gap-4">
                       <code className="flex-1 bg-amber-500/10 text-amber-400 p-4 rounded-xl font-mono text-xs border border-amber-500/20 truncate">{currentOrigin}</code>
                       <button onClick={() => { navigator.clipboard.writeText(currentOrigin); notify("URL GOOGLE COPIADA"); }} className="p-4 bg-amber-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all"><Copy size={18}/></button>
                    </div>
                 </div>

                 <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 text-blue-500">
                       <Facebook size={18} />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">URI Meta Ads</h4>
                    </div>
                    <div className="flex items-center gap-4">
                       <code className="flex-1 bg-blue-500/10 text-blue-400 p-4 rounded-xl font-mono text-xs border border-blue-500/20 truncate">{currentOrigin}</code>
                       <button onClick={() => { navigator.clipboard.writeText(currentOrigin); notify("URL META COPIADA"); }} className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all"><Copy size={18}/></button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
