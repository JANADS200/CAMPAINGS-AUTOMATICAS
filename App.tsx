
import React, { Component, useState, useEffect, useCallback, ReactNode } from 'react';
import { BusinessInfo, CampaignAsset, ViewType, User, LaunchedCampaign, CreativeSlot, ADNProcessState, LabTaskState } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MetaConfigView } from './components/MetaConfigView';
import { GoogleConfigView } from './components/GoogleConfigView';
import { TikTokConfigView } from './components/TikTokConfigView';
import { BusinessDiscoveryView } from './components/BusinessDiscoveryView';
import { StrategyLibraryView } from './components/StrategyLibraryView';
import { AdCreatorView } from './components/AdCreatorView';
import { AdPreviewView } from './components/AdPreviewView';
import { NeuralBackground } from './components/NeuralBackground';
import { SupportBubble } from './components/SupportBubble';
import { AssetLibraryView } from './components/AssetLibraryView';
import { CampaignManagementView } from './components/CampaignManagementView';
import { LoginOverlay } from './components/LoginOverlay';
import { AdminPanel } from './components/AdminPanel';
import { SalesAgent } from './components/SalesAgent';
import { IALabs } from './components/IALabs';
import { ABTestingView } from './components/ABTestingView';
import { dbStore } from './services/storageService';
import { gemini } from './services/geminiService';
import { PERMANENT_TOKEN } from './services/metaService';
import { PROVEN_STRATEGIES } from './constants/strategies';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Kernel protection ErrorBoundary.
 * Fixed inheritance and modifiers to resolve TypeScript errors.
 */
// Fix: Use Component directly from react import and ensure inheritance is correctly recognized
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Removed override modifier from state as it's not a method and can be problematic in some TS versions
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Fix: Removed override modifier to resolve "does not extend another class" error which can happen if type resolution fails
  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (this.state.hasError && !prevState.hasError) {
      setTimeout(() => {
        this.props.onReset();
        this.setState({ hasError: false });
      }, 1000);
    }
  }

  // Fix: Removed override modifier to resolve "does not extend another class" error
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
          <RefreshCw size={32} className="text-rose-500 animate-spin" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizando núcleo...</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const INITIAL_BUSINESS: BusinessInfo = {
  name: '', niche: '', targetAudience: '', language: 'ES',
  pains: [], objections: [], benefits: [], locations: [], competitors: [], strategicMap: [],
  metaConfig: { appId: '1167223758233968', appSecret: '54b28b5e872a8ec8ba9fc5ef47f06ab9', accessToken: PERMANENT_TOKEN, portfolioId: '', adAccountId: '', pageId: '', pixelId: '' },
  googleConfig: { customerId: '', developerToken: '', accessToken: '' },
  tiktokConfig: { advertiserId: '', accessToken: '' },
  budget: 50000, strategyId: 'janads_master'
};

const ViewSwitcher: React.FC<{
  activeView: ViewType;
  business: BusinessInfo;
  setBusiness: any;
  campaigns: LaunchedCampaign[];
  setCampaigns: any;
  userSession: User;
  creativeSlots: CreativeSlot[];
  setCreativeSlots: any;
  adnTask: ADNProcessState;
  setAdnTask: any;
  labTask: LabTaskState;
  setTask: any;
  currentAssets: CampaignAsset[];
  setCurrentAssets: any;
  handleFullDiscovery: () => Promise<void>;
  handleGenerateMedia: (id: string, type: 'image' | 'video') => Promise<void>;
  setActiveView: (v: ViewType) => void;
}> = ({ activeView, business, setBusiness, campaigns, setCampaigns, userSession, creativeSlots, setCreativeSlots, adnTask, setAdnTask, labTask, setTask, currentAssets, setCurrentAssets, handleFullDiscovery, handleGenerateMedia, setActiveView }) => {
  switch (activeView) {
    case 'dashboard': return <Dashboard campaigns={campaigns} setCampaigns={setCampaigns} business={business} onBroadcast={() => {}} />;
    case 'meta': return <MetaConfigView business={business} setBusiness={setBusiness} user={userSession} />;
    case 'google': return <GoogleConfigView business={business} setBusiness={setBusiness} user={userSession} />;
    case 'tiktok': return <TikTokConfigView business={business} setBusiness={setBusiness} user={userSession} />;
    case 'business': return <BusinessDiscoveryView business={business} setBusiness={setBusiness} onNavigate={setActiveView} adnTask={adnTask} setAdnTask={setAdnTask} handleFullDiscovery={handleFullDiscovery} />;
    case 'strategies': return <StrategyLibraryView business={business} setBusiness={setBusiness} onNavigate={setActiveView} />;
    case 'creator': return <AdCreatorView business={business} slots={creativeSlots} setSlots={setCreativeSlots} onGenerateMedia={handleGenerateMedia} onAssetsGenerated={(assets) => { setCurrentAssets(assets); setActiveView('previews'); }} />;
    case 'previews': return <AdPreviewView assets={currentAssets} business={business} onNavigate={setActiveView} setCampaigns={setCampaigns} />;
    case 'library': return <AssetLibraryView onSelect={setCurrentAssets} onNavigate={setActiveView} />;
    case 'campaign_manager': return <CampaignManagementView campaigns={campaigns} onToggleCampaign={() => {}} onToggleAd={() => {}} onToggleAutopilot={() => {}} onDeleteCampaign={() => {}} />;
    case 'sales': return <SalesAgent business={business} campaigns={campaigns} history={[]} setHistory={() => {}} />;
    case 'ialabs': return <IALabs business={business} task={labTask} setTask={setTask} onRun={() => {}} />;
    case 'ab_testing': return <ABTestingView business={business} campaigns={campaigns} />;
    case 'admin': return <AdminPanel />;
    default: return <Dashboard campaigns={campaigns} setCampaigns={setCampaigns} business={business} onBroadcast={() => {}} />;
  }
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [userSession, setUserSession] = useState<User | null>(null);
  const [currentAssets, setCurrentAssets] = useState<CampaignAsset[]>([]);
  const [business, setBusiness] = useState<BusinessInfo>(INITIAL_BUSINESS);
  const [campaigns, setCampaigns] = useState<LaunchedCampaign[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [creativeSlots, setCreativeSlots] = useState<CreativeSlot[]>([]);
  const [labTask, setTask] = useState<LabTaskState>({ id: 'global_lab', type: 'image_edit', status: 'idle', progress: 0, message: '', results: [], prompt: '', baseImage: null });
  const [adnTask, setAdnTask] = useState<ADNProcessState>({ loading: false, progress: 0, status: '', error: null });

  const init = useCallback(async () => {
    try {
      const session = dbStore.getSession();
      if (session) {
        setUserSession(session);
        const stored = dbStore.getBusinessInfo(INITIAL_BUSINESS);
        setBusiness({ ...INITIAL_BUSINESS, ...stored });
        setCreativeSlots(dbStore.getCreativeSlots() || []);
        setAdnTask(dbStore.getADNTask());
      }
    } catch (e) { console.error("INIT_ERROR:", e); }
    finally { setIsReady(true); if ((window as any).hideEmergencyLoader) (window as any).hideEmergencyLoader(); }
  }, []);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (userSession && isReady) {
      dbStore.saveBusinessInfo(business);
      dbStore.saveCreativeSlots(creativeSlots);
      dbStore.saveADNTask(adnTask);
    }
  }, [business, creativeSlots, adnTask, userSession, isReady]);

  const handleGenerateMedia = async (slotId: string, type: 'image' | 'video') => {
    const slot = creativeSlots.find(s => s.id === slotId);
    if (!slot || slot.status === 'generating') return;
    const strategy = PROVEN_STRATEGIES.find(s => s.id === business.strategyId) || PROVEN_STRATEGIES[0];
    setCreativeSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: 'generating', progress: 10, type, phase: 'Inyectando Psiquis...' } : s));
    try {
      const copyData = await gemini.generateCopies(business, slot.angle, strategy, slot.personality);
      setCreativeSlots(prev => prev.map(s => s.id === slotId ? { ...s, progress: 40, phase: 'Renderizando Visual...' } : s));
      const url = type === 'video' 
        ? await gemini.generateVideo(business, copyData.visual_direction || slot.angle.hookText, slot.referenceImage || undefined, slot.personality)
        : await gemini.generateImage(business, copyData.visual_direction || slot.angle.hookText, slot.referenceImage || undefined, slot.personality);
      setCreativeSlots(prev => prev.map(s => s.id === slotId ? { ...s, assetUrl: url, copy: copyData, status: 'ready', progress: 100, phase: 'Completado' } : s));
    } catch (e) { setCreativeSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: 'idle', progress: 0, phase: 'Error de Red' } : s)); }
  };

  const handleFullDiscovery = async () => {
    if (!business.landingPageUrl) return;
    setAdnTask({ loading: true, progress: 5, status: 'Iniciando Investigación...', error: null });
    try {
      const result = await gemini.analyzeStore(business.landingPageUrl, business.language);
      setAdnTask(prev => ({ ...prev, progress: 40, status: 'Analizando Mercado...' }));
      const analysis = await gemini.analyzeBusiness(result.brandName || business.name, result.niche || business.niche, JSON.stringify(result), business.language);
      setBusiness(prev => ({ ...prev, ...result, ...analysis }));
      setAdnTask({ loading: false, progress: 100, status: 'Completado', error: null });
    } catch (e) { setAdnTask({ loading: false, progress: 0, status: '', error: "Fallo en la investigación." }); }
  };

  if (!isReady) return <div className="h-full w-full bg-[#020617]" />;
  if (!userSession) return <LoginOverlay onLoginSuccess={(u) => { setUserSession(u); dbStore.saveSession(u); setActiveView('dashboard'); }} />;

  return (
    <div className="flex h-[100dvh] w-full bg-[#020617] text-slate-200 overflow-hidden relative">
      <NeuralBackground />
      <Sidebar 
        activeView={activeView} onViewChange={setActiveView} businessName={business.name || 'JANADS OS'} 
        isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        isAdmin={userSession.role === 'ADMIN'} onNotifClick={() => {}} hasUnread={false} 
        isProcessing={adnTask.loading || creativeSlots.some(s => s.status === 'generating')}
      />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 relative z-10">
        <div className="max-w-7xl mx-auto pb-32 h-full relative">
          <ErrorBoundary onReset={() => setActiveView('dashboard')}>
            <ViewSwitcher 
              activeView={activeView} business={business} setBusiness={setBusiness}
              campaigns={campaigns} setCampaigns={setCampaigns} userSession={userSession}
              creativeSlots={creativeSlots} setCreativeSlots={setCreativeSlots}
              adnTask={adnTask} setAdnTask={setAdnTask} labTask={labTask} setTask={setTask}
              currentAssets={currentAssets} setCurrentAssets={setCurrentAssets}
              handleFullDiscovery={handleFullDiscovery} handleGenerateMedia={handleGenerateMedia}
              setActiveView={setActiveView}
            />
          </ErrorBoundary>
        </div>
      </main>
      <SupportBubble business={business} campaigns={campaigns} />
    </div>
  );
};

export default App;
