import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Database, Key, Lock, RefreshCw, Settings2, Trash2, Unlock, Users } from 'lucide-react';
import { License, MasterSystemConfig } from '../types';
import { dbStore, AdminClientRow } from '../services/storageService';
import { auditStrategies } from '../services/strategyAuditService';

export const AdminPanel: React.FC = () => {
  const [vault, setVault] = useState<License[]>([]);
  const [clientRows, setClientRows] = useState<AdminClientRow[]>([]);
  const [activeTab, setActiveTab] = useState<'licenses' | 'crm' | 'system' | 'oauth'>('licenses');
  const [newKeyPlan, setNewKeyPlan] = useState('PRO PLAN 30 DÍAS');
  const [durationDays, setDurationDays] = useState(30);
  const [masterConfig, setMasterConfig] = useState<MasterSystemConfig>(() => dbStore.getMasterSystemConfig());

  const refresh = () => {
    setVault(dbStore.getVaultStatus());
    setClientRows(dbStore.getAdminClientRows());
  };

  useEffect(() => {
    refresh();
  }, [activeTab]);

  const strategyAudit = useMemo(() => auditStrategies(), []);

  const stats = useMemo(() => ({
    totalLicenses: vault.length,
    activeLicenses: vault.filter(v => v.status === 'active').length,
    blockedLicenses: vault.filter(v => v.isEnabled === false).length,
    totalClients: clientRows.length
  }), [vault, clientRows]);

  const generateLicense = () => {
    const key = `JAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    dbStore.addLicense({
      license_key: key,
      plan: newKeyPlan,
      durationDays,
      status: 'available',
      isEnabled: true
    });
    refresh();
  };

  const removeLicense = (licenseKey: string) => {
    if (!confirm('¿Eliminar licencia definitivamente?')) return;
    dbStore.deleteLicense(licenseKey);
    refresh();
  };

  const toggleAccess = (licenseKey: string, enabled: boolean) => {
    dbStore.setLicenseAccess(licenseKey, enabled);
    refresh();
  };

  const currentOrigin = window.location.origin + '/';

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto pb-20">
      <div>
        <h2 className="text-5xl font-black text-white italic">ADMIN <span className="text-emerald-500">VAULT</span></h2>
        <p className="text-slate-400 text-xs uppercase tracking-widest mt-2">Gestión multi-cliente y control de accesos</p>
      </div>

      <div className="flex gap-2 bg-black/40 rounded-2xl p-2 border border-white/10 w-fit">
        <button onClick={() => setActiveTab('licenses')} className={`px-4 py-2 rounded-xl text-xs font-black ${activeTab === 'licenses' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Licencias</button>
        <button onClick={() => setActiveTab('crm')} className={`px-4 py-2 rounded-xl text-xs font-black ${activeTab === 'crm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Clientes</button>
        <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-xl text-xs font-black ${activeTab === 'system' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Sistema</button>
        <button onClick={() => setActiveTab('oauth')} className={`px-4 py-2 rounded-xl text-xs font-black ${activeTab === 'oauth' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>OAuth</button>
      </div>

      {activeTab === 'licenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Licencias" value={stats.totalLicenses} />
            <Stat label="Activadas" value={stats.activeLicenses} />
            <Stat label="Bloqueadas" value={stats.blockedLicenses} />
            <Stat label="Clientes" value={stats.totalClients} />
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-5 grid md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">Plan</label>
              <input value={newKeyPlan} onChange={e => setNewKeyPlan(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Duración (días)</label>
              <input type="number" value={durationDays} onChange={e => setDurationDays(Math.max(1, Number(e.target.value || 1)))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" />
            </div>
            <button onClick={generateLicense} className="bg-emerald-600 text-white rounded-xl py-2 font-black text-xs">Crear llave</button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vault.map((lic) => (
              <div key={lic.license_key} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white text-xs"><Key size={14} /> {lic.license_key}</div>
                  <button onClick={() => removeLicense(lic.license_key)} className="text-rose-400"><Trash2 size={14} /></button>
                </div>
                <p className="text-xs text-slate-300">{lic.plan}</p>
                <p className="text-xs text-slate-400">Estado: {lic.isEnabled === false ? 'BLOQUEADA' : 'ACTIVA'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => navigator.clipboard.writeText(lic.license_key)} className="bg-white/10 rounded-lg py-2 text-xs text-white flex items-center justify-center gap-2"><Copy size={12}/>Copiar</button>
                  {lic.isEnabled === false ? (
                    <button onClick={() => toggleAccess(lic.license_key, true)} className="bg-emerald-500/20 text-emerald-300 rounded-lg py-2 text-xs flex items-center justify-center gap-2"><Unlock size={12}/>Activar</button>
                  ) : (
                    <button onClick={() => toggleAccess(lic.license_key, false)} className="bg-rose-500/20 text-rose-300 rounded-lg py-2 text-xs flex items-center justify-center gap-2"><Lock size={12}/>Bloquear</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'crm' && (
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-black text-xl flex items-center gap-2"><Users className="text-cyan-400" /> Matriz de clientes</h3>
            <button onClick={refresh} className="text-emerald-400"><RefreshCw size={18} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase">
                <tr>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Teléfono</th>
                  <th className="p-2">Llave</th>
                  <th className="p-2">Plan</th>
                  <th className="p-2">Acceso</th>
                  <th className="p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {clientRows.map((row) => (
                  <tr key={row.licenseKey} className="border-t border-white/10 text-slate-200">
                    <td className="p-2">{row.user?.name || 'Sin login'}</td>
                    <td className="p-2">{row.user?.phone || 'N/A'}</td>
                    <td className="p-2 font-mono">{row.licenseKey}</td>
                    <td className="p-2">{row.licensePlan}</td>
                    <td className="p-2">{row.isEnabled ? 'Habilitado' : 'Bloqueado'}</td>
                    <td className="p-2">
                      {row.isEnabled ? (
                        <button onClick={() => toggleAccess(row.licenseKey, false)} className="px-3 py-1 rounded bg-rose-500/20 text-rose-300">Bloquear</button>
                      ) : (
                        <button onClick={() => toggleAccess(row.licenseKey, true)} className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300">Reactivar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-white font-black text-xl flex items-center gap-2"><Settings2 className="text-cyan-400" /> Configuración sistema</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={masterConfig.metaAppId} onChange={e => setMasterConfig({ ...masterConfig, metaAppId: e.target.value })} placeholder="Meta App ID" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" />
            <input value={masterConfig.googleClientId} onChange={e => setMasterConfig({ ...masterConfig, googleClientId: e.target.value })} placeholder="Google Client ID" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" />
            <input value={masterConfig.googleDevToken} onChange={e => setMasterConfig({ ...masterConfig, googleDevToken: e.target.value })} placeholder="Google Dev Token" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" />
            <input value={masterConfig.tiktokAppId} onChange={e => setMasterConfig({ ...masterConfig, tiktokAppId: e.target.value })} placeholder="TikTok App ID" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white" />
          </div>
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-slate-300 font-black mb-2">Auditoría de estrategias</p>
            <ul className="space-y-1 text-xs">
              {strategyAudit.slice(0, 8).map((item) => (
                <li key={item.id} className={item.ok ? 'text-emerald-300' : 'text-rose-300'}>{item.id}: {item.message}</li>
              ))}
            </ul>
          </div>
          <button onClick={() => dbStore.saveMasterSystemConfig(masterConfig)} className="bg-emerald-600 text-white rounded-xl px-4 py-2 text-xs font-black">Guardar</button>
        </div>
      )}

      {activeTab === 'oauth' && (
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-3">
          <h3 className="text-white font-black text-xl flex items-center gap-2"><Database className="text-rose-400" /> URLs OAuth</h3>
          <p className="text-slate-300 text-sm">Usa esta URL para Meta, Google y TikTok redirect URI:</p>
          <code className="block bg-black/40 border border-white/10 rounded-xl p-3 text-rose-300">{currentOrigin}</code>
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
    <p className="text-slate-400 text-xs uppercase">{label}</p>
    <p className="text-white text-2xl font-black">{value}</p>
  </div>
);
