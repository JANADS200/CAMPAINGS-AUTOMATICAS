
// Definiciones de tipos para el núcleo de la aplicación JAN ADS OS

export type ViewType = 'dashboard' | 'meta' | 'google' | 'tiktok' | 'business' | 'strategies' | 'creator' | 'previews' | 'ialabs' | 'sales' | 'library' | 'campaign_manager' | 'reelflow' | 'ab_testing' | 'admin';

export type NeuralPersonality = 'DISRUPTOR' | 'AUTHORITY' | 'EMPATHETIC' | 'STORYTELLER';

export interface User {
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  plan: string;
  license_key: string;
  access_until: string;
  status: 'active' | 'expired';
  role: 'ADMIN' | 'USER';
  deviceId?: string;
  registeredAt?: string;
}

export interface MetaAsset {
  id: string;
  name: string;
  type: 'account' | 'page' | 'pixel' | 'instagram' | 'whatsapp';
  avatar?: string;
  details?: string;
  status?: string;
  phoneNumber?: string;
}

export interface CampaignAsset {
  id: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  type: 'image' | 'video' | 'text';
  url: string;
  title: string;
  content: string;
  status: string;
  isActive: boolean;
  funnelStage: 'COLD' | 'WARM' | 'HOT';
  adName?: string;
  metadata?: any;
}

export interface LaunchedCampaign {
  id: string;
  name: string;
  isActive: boolean;
  status: string;
  version: number;
  aiStrategy: string;
  aiAutopilot: boolean;
  createdAt: string;
  ads: CampaignAsset[];
  strategyName: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    ctr: number;
    roas: number;
    cpc: number;
    conversions: number;
    frequency: number;
  };
}

export interface AppNotification {
  id: string;
  timestamp: Date;
  read: boolean;
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'AI_INSIGHT' | 'INFO';
}

export interface ChatMessage {
  id: string;
  timestamp: Date;
  role: 'user' | 'model';
  type: 'text' | 'image' | 'video' | 'thinking' | 'error';
  content: string;
}

export interface StoredAsset extends CampaignAsset {
  niche?: string;
  businessName?: string;
  createdAt: string;
  aiMetadata?: {
    model: string;
    prompt: string;
    bias: string;
    score: number;
    language: string;
  };
}

export interface ADNProcessState {
  loading: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export interface CreativeSlot {
  id: string;
  angle: { name: string; hookText: string; phase?: number };
  type: 'image' | 'video' | null;
  status: 'idle' | 'generating' | 'ready';
  progress: number;
  referenceImage: string | null;
  phase: string;
  assetUrl?: string;
  copy?: any;
  personality?: NeuralPersonality;
}

export interface LabTaskState {
  id: string;
  type: 'image_edit' | 'video_animator' | 'vision_heatmap';
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  message: string;
  results: string[];
  prompt: string;
  baseImage: string | null;
  visionReport?: string;
}

export interface MetaTargetingSpec {
  type: 'BROAD' | 'INTERESTS' | 'RETARGETING';
  interests?: string[];
  ageMin?: number;
  ageMax?: number;
  genders?: number[];
}

export interface MarketingStrategy {
  id: string;
  name: string;
  category: string;
  creativesNeeded: number;
  description: string;
  objective: 'OUTCOME_SALES' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS' | 'OUTCOME_LEADS';
  minBudget: number;
  platforms: ('META' | 'GOOGLE' | 'TIKTOK' | 'OMNICHANNEL')[];
  structure: { 
    name: string; 
    budgetPercentage: number; 
    targeting: MetaTargetingSpec;
    funnelStage: 'COLD' | 'WARM' | 'HOT';
  }[];
  segmentationLogic: string;
  detailedSegmentation: string;
  /** Added platformDetails to fix StrategySelector error */
  platformDetails?: {
    platform: string;
    format: string;
    items: string[];
  }[];
}

export interface PendingCampaign {
  id: string;
  businessName: string;
  strategyName: string;
  budget: number;
  assets: CampaignAsset[];
  failureLog?: string;
}

export interface StrategicMapItem {
  pain: string;
  objection: string;
  attackVector: string;
}

export interface BusinessInfo {
  name: string;
  niche: string;
  targetAudience: string;
  landingPageUrl?: string;
  avatar?: string;
  language: 'ES' | 'EN' | 'PT' | 'FR' | 'IT' | 'DE';
  country?: string;
  city?: string;
  locations?: string[]; 
  competitors?: string[];
  contactEmails?: string[];
  visualDNA?: {
    colorPalette: string[];
    lightingStyle: string;
    cameraAngles: string;
    vibeTags: string[];
    logoUrl?: string;
  };
  pains: string[];
  objections: string[];
  benefits: string[];
  strategicMap?: StrategicMapItem[];
  metaConfig: {
    appId: string;
    appSecret: string;
    accessToken: string;
    portfolioId: string;
    adAccountId: string;
    pageId: string;
    pixelId: string;
    instagramId?: string;
    whatsappId?: string;
    connectedUser?: string;
  };
  googleConfig: {
    customerId: string;
    developerToken: string;
    accessToken: string;
    clientId?: string;
    applicationName?: string;
  };
  tiktokConfig: {
    advertiserId: string;
    accessToken: string;
  };
  discoveredAssets?: {
    meta?: {
      accounts: MetaAsset[];
      pages: MetaAsset[];
      pixels: MetaAsset[];
      instagrams: MetaAsset[];
      whatsapps: MetaAsset[];
      businesses: MetaAsset[];
    };
    /** Added tiktok to fix TikTokConfigView error */
    tiktok?: MetaAsset[];
  };
  budget: number;
  strategyId: string;
  brief?: string;
  whatsappNumber?: string;
  persona?: { 
    name: string; 
    demographics: string; 
    psychology: string; 
    bio?: string;
    interests?: string[];
  };
}

/** Missing exports added below to fix import errors in AdminPanel, storageService, and ABTestingView */
export interface License {
  license_key: string;
  plan: string;
  status: 'available' | 'active';
  durationDays: number;
  activatedAt?: string;
  expiry?: string;
}

export interface MasterSystemConfig {
  metaAppId: string;
  metaAppSecret: string;
  googleDevToken: string;
  googleClientId: string;
  tiktokAppId: string;
  tiktokSecret: string;
}

export interface TestVariant {
  id: string;
  name: string;
  asset: CampaignAsset;
  metrics: { 
    ctr: number; 
    roas: number; 
    clicks: number; 
  };
}

export interface ABTest {
  id: string;
  name: string;
  variable: 'COPY' | 'CREATIVE';
  status: 'running' | 'completed';
  variants: TestVariant[];
  createdAt: string;
}
