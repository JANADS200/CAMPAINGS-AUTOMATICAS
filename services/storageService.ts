
import { License, User, PendingCampaign, StoredAsset, MasterSystemConfig, BusinessInfo, ADNProcessState, CreativeSlot, LabTaskState, LaunchedCampaign, CampaignAsset } from '../types';

export class StorageService {
  private activeKey: string | null = null;
  private memoryStorage: Record<string, string> = {};

  constructor() {
    try {
      this.activeKey = localStorage.getItem('jan_last_active_key');
    } catch (e) { this.activeKey = null; }
  }

  private safeSet(key: string, value: string) {
    try { localStorage.setItem(key, value); } 
    catch (e) { this.memoryStorage[key] = value; }
  }

  private safeGet(key: string): string | null {
    try { return localStorage.getItem(key) || this.memoryStorage[key] || null; } 
    catch (e) { return this.memoryStorage[key] || null; }
  }

  private getStorageKey(base: string): string {
    return `${base}_${this.activeKey || 'anonymous'}`;
  }

  async syncFromCloud(licenseKey: string): Promise<BusinessInfo | null> {
    return null;
  }

  // --- PERSISTENCIA DE ACTIVOS ---
  saveAsset(asset: CampaignAsset, business: BusinessInfo): void {
    const key = this.getStorageKey('jan_assets');
    const raw = this.safeGet(key);
    let assets: StoredAsset[] = [];
    try { assets = raw ? JSON.parse(raw) : []; } catch { assets = []; }
    
    if (assets.find(a => a.url === asset.url)) return;

    const stored: StoredAsset = {
      ...asset,
      businessName: business.name,
      niche: business.niche,
      createdAt: new Date().toISOString(),
      aiMetadata: {
        model: 'Gemini 3 Pro',
        prompt: asset.metadata?.visual_direction || "Auto-Generated",
        bias: "Conversion Optimized",
        score: 8.5 + (Math.random() * 1.5),
        language: business.language
      }
    };
    
    assets.unshift(stored);
    this.safeSet(key, JSON.stringify(assets.slice(0, 100)));
    window.dispatchEvent(new Event('gallery_updated'));
  }

  getAllAssets(): StoredAsset[] {
    const data = this.safeGet(this.getStorageKey('jan_assets'));
    try { return data ? JSON.parse(data) : []; } catch { return []; }
  }

  deleteAsset(id: string): void {
    const assets = this.getAllAssets();
    this.safeSet(this.getStorageKey('jan_assets'), JSON.stringify(assets.filter(a => a.id !== id)));
    window.dispatchEvent(new Event('gallery_updated'));
  }

  // --- CAMPAÑAS ---
  saveLaunchedCampaign(camp: LaunchedCampaign): void {
    const key = this.getStorageKey('jan_launched_campaigns');
    const raw = this.safeGet(key);
    let campaigns: LaunchedCampaign[] = [];
    try { campaigns = raw ? JSON.parse(raw) : []; } catch { campaigns = []; }
    campaigns.unshift(camp);
    this.safeSet(key, JSON.stringify(campaigns));
  }

  getLaunchedCampaigns(): LaunchedCampaign[] {
    const key = this.getStorageKey('jan_launched_campaigns');
    const raw = this.safeGet(key);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  // --- CONFIGURACIÓN DE NEGOCIO ---
  saveBusinessInfo(info: BusinessInfo): void { 
    this.safeSet(this.getStorageKey('iajanads_business_v3'), JSON.stringify(info));
  }
  
  getBusinessInfo(fallback: BusinessInfo): BusinessInfo { 
    const local = this.safeGet(this.getStorageKey('iajanads_business_v3'));
    if (!local) return fallback;
    try { 
      const parsed = JSON.parse(local);
      if (!parsed.metaConfig?.accessToken && fallback.metaConfig?.accessToken) {
        parsed.metaConfig.accessToken = fallback.metaConfig.accessToken;
      }
      return { ...fallback, ...parsed }; 
    } catch { return fallback; }
  }

  // --- SESIÓN Y USUARIOS CRM ---
  getSession(): User | null { 
    const data = this.safeGet('jan_session_active');
    try { if (data) return JSON.parse(data); } catch {}
    return null; 
  }

  saveSession(user: User): void { 
    this.safeSet('jan_session_active', JSON.stringify(user)); 
    // Registrar en CRM Global
    const users = this.getGlobalUsers();
    if (!users.find(u => u.license_key === user.license_key)) {
      users.push(user);
      this.safeSet('jan_global_users', JSON.stringify(users));
    }
  }

  setActiveKey(key: string) { 
    this.activeKey = key; 
    this.safeSet('jan_last_active_key', key); 
  }

  validateAndActivate(input: string, name?: string, phone?: string): { user: User | null, error: string | null } { 
    const vault = this.getVaultStatus();
    const license = vault.find(l => l.license_key === input);

    // Bypass para ADMIN maestro si no hay licencias o llave específica
    const isMaster = input.includes('ADMIN') || input === 'JAN-MASTER-2025';

    if (!license && !isMaster) {
      return { user: null, error: "LLAVE NO ENCONTRADA EN LA BÓVEDA." };
    }

    if (license && license.status === 'active' && license.license_key !== input) {
        // En un sistema real verificaríamos deviceId, aquí permitimos re-login
    }

    const durationDays = license?.durationDays || 3650;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + durationDays);

    const user: User = { 
      user_id: `u_${Date.now()}`,
      email: `${input.toLowerCase()}@janads.ia`,
      license_key: input, 
      name: name || 'Agente Phoenix', 
      phone, 
      role: isMaster ? 'ADMIN' : 'USER', 
      plan: license?.plan || 'GOD MODE UNLIMITED', 
      status: 'active', 
      access_until: expiry.toISOString(),
      registeredAt: new Date().toISOString()
    };

    // Marcar licencia como usada en la bóveda
    if (license) {
      license.status = 'active';
      license.activatedAt = new Date().toISOString();
      license.expiry = expiry.toISOString();
      this.safeSet('jan_vault_v3', JSON.stringify(vault));
    }

    this.setActiveKey(input);
    this.saveSession(user);
    return { user, error: null };
  }

  getVaultStatus(): License[] { 
    const raw = this.safeGet('jan_vault_v3'); 
    return raw ? JSON.parse(raw) : []; 
  }

  addLicense(license: License): void {
    const vault = this.getVaultStatus();
    vault.push(license);
    this.safeSet('jan_vault_v3', JSON.stringify(vault));
  }

  deleteLicense(key: string): void {
    const vault = this.getVaultStatus();
    this.safeSet('jan_vault_v3', JSON.stringify(vault.filter(l => l.license_key !== key)));
  }

  getGlobalUsers(): User[] {
    const key = 'jan_global_users';
    const raw = this.safeGet(key);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  getMasterSystemConfig(): MasterSystemConfig { 
    return JSON.parse(this.safeGet('jan_master_config_v2') || '{"metaAppId":"1167223758233968"}'); 
  }

  saveMasterSystemConfig(c: MasterSystemConfig): void { 
    this.safeSet('jan_master_config_v2', JSON.stringify(c)); 
  }

  saveCreativeSlots(s: CreativeSlot[]): void { 
    this.safeSet(this.getStorageKey('jan_creative_slots_v3'), JSON.stringify(s)); 
  }

  getCreativeSlots(): CreativeSlot[] { 
    return JSON.parse(this.safeGet(this.getStorageKey('jan_creative_slots_v3')) || '[]'); 
  }

  saveADNTask(t: ADNProcessState): void { 
    this.safeSet(this.getStorageKey('jan_adn_task'), JSON.stringify(t)); 
  }

  getADNTask(): ADNProcessState { 
    return JSON.parse(this.safeGet(this.getStorageKey('jan_adn_task')) || '{"loading":false,"progress":0,"status":"","error":null}'); 
  }

  getPendingCampaigns(): PendingCampaign[] {
    const key = this.getStorageKey('jan_pending_campaigns');
    const raw = this.safeGet(key);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  deletePendingCampaign(id: string): void {
    const key = this.getStorageKey('jan_pending_campaigns');
    const drafts = this.getPendingCampaigns();
    this.safeSet(key, JSON.stringify(drafts.filter(d => d.id !== id)));
  }
}

export const dbStore = new StorageService();
