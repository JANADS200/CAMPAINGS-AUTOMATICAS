
import React, { useState } from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, Cable, Rocket, ChevronLeft, ChevronRight, Menu, X, 
  FlaskConical, Brain, Archive, Bell, ShieldCheck, Target, Crosshair, Settings,
  Search, Smartphone, Shield, Zap, Layers, Loader2
} from 'lucide-react';
import { PrivacyPolicy } from './PrivacyPolicy';
import { JanAdsLogo } from './Logo';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  businessName: string;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onNotifClick: () => void;
  hasUnread: boolean;
  isAdmin: boolean;
  isProcessing?: boolean;
  processStates?: {
    adn: boolean;
    creator: boolean;
    labs: boolean;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, onViewChange, businessName, isCollapsed, toggleCollapse, onNotifClick, hasUnread, isAdmin, isProcessing, processStates
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const menuItems: { id: ViewType; label: string; icon: any; color: string; hasProcess?: boolean }[] = [
    { id: 'dashboard', label: 'Panel Control', icon: LayoutDashboard, color: 'text-cyan-400' },
    { id: 'meta', label: 'Meta Ads', icon: Cable, color: 'text-blue-500' },
    { id: 'google', label: 'Google Ads', icon: Search, color: 'text-amber-500' },
    { id: 'tiktok', label: 'TikTok Ads', icon: Smartphone, color: 'text-cyan-400' },
    { id: 'business', label: 'ADN Negocio', icon: Crosshair, color: 'text-rose-500', hasProcess: processStates?.adn },
    { id: 'strategies', label: 'Estrategias', icon: Target, color: 'text-emerald-400' },
    { id: 'creator', label: 'Forja Masiva', icon: Zap, color: 'text-rose-600', hasProcess: processStates?.creator },
    { id: 'ab_testing', label: 'A/B Lab', icon: FlaskConical, color: 'text-purple-400' },
    { id: 'campaign_manager', label: 'Gestión Ads', icon: ShieldCheck, color: 'text-indigo-400' },
    { id: 'sales', label: 'IA Command', icon: Brain, color: 'text-teal-400' },
    { id: 'ialabs', label: 'Labs Phoenix', icon: FlaskConical, color: 'text-amber-400', hasProcess: processStates?.labs },
    { id: 'library', label: 'Mi Bóveda', icon: Archive, color: 'text-orange-400' },
  ];

  if (isAdmin) {
    menuItems.unshift({ id: 'admin', label: 'ADMIN PANEL', icon: Settings, color: 'text-rose-500' });
  }

  const showLabels = isMobileMenuOpen || !isCollapsed;

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-20 z-[100] flex items-center justify-between px-6 md:hidden bg-[#020617] border-b border-white/10">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-12 h-12 rounded-xl flex items-center justify-center text-rose-500 bg-white/5 border border-white/10">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <JanAdsLogo size={32} className="scale-90" />
        <button onClick={onNotifClick} className="w-12 h-12 rounded-xl flex items-center justify-center text-cyan-400 relative bg-white/5 border border-white/10">
          <Bell size={20} />
          {hasUnread && <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]"></span>}
        </button>
      </div>

      <aside className={`fixed md:relative h-screen glass border-r border-white/10 flex flex-col z-[110] transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'left-0 w-[85vw]' : '-left-full md:left-0'} ${isCollapsed ? 'md:w-24' : 'md:w-72'}`}>
        <button onClick={toggleCollapse} className="absolute -right-3 top-28 bg-rose-500 rounded-full p-1 text-white hidden md:block shadow-lg z-[120] hover:scale-110 transition-transform">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="p-8 border-b border-white/5 bg-slate-900/40">
           {isCollapsed && !isMobileMenuOpen ? (
             <div className="flex justify-center" title={businessName || "JANADS"}>
                <JanAdsLogo size={32} />
             </div>
           ) : (
             <JanAdsLogo size={40} />
           )}
           
           {(!isCollapsed || isMobileMenuOpen) && (
             <div className="mt-6 flex items-center gap-2 px-1">
                {isProcessing ? (
                  <Loader2 size={12} className="text-cyan-400 animate-spin" />
                ) : (
                  <Layers size={12} className="text-rose-500" />
                )}
                <span className={`text-[9px] font-black uppercase tracking-widest ${isProcessing ? 'text-cyan-400 animate-pulse neon-text-cyan' : 'text-slate-500'}`}>
                  {isProcessing ? 'IA TRABAJANDO...' : (businessName || 'TERMINADA AUTOMATIZACION')}
                </span>
             </div>
           )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { onViewChange(item.id); setIsMobileMenuOpen(false); }} 
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border group relative ${activeView === item.id ? 'bg-white/10 border-white/20 shadow-lg' : 'text-slate-400 border-transparent hover:bg-white/5'}`}
            >
              <div className="relative">
                <item.icon size={20} className={`${activeView === item.id ? item.color : 'text-slate-400 group-hover:text-slate-200'}`} />
                {item.hasProcess && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                )}
              </div>
              <span className={`text-left font-black uppercase text-[11px] tracking-widest transition-opacity duration-200 ${showLabels ? 'opacity-100' : 'opacity-0 md:hidden'} ${activeView === item.id ? 'text-white' : 'text-slate-200'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-900/40">
           <button 
            onClick={() => setShowPrivacy(true)}
            className={`flex items-center gap-4 w-full text-slate-200 hover:text-white transition-all px-4 py-2 rounded-xl ${isCollapsed && !isMobileMenuOpen ? 'justify-center' : ''}`}
           >
              <Shield size={20} className="text-slate-400" />
              <span className={`text-[11px] font-black uppercase tracking-widest ${showLabels ? 'block' : 'hidden'}`}>Privacidad</span>
           </button>
        </div>
      </aside>

      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {isMobileMenuOpen && <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[105] md:hidden" />}
    </>
  );
};
