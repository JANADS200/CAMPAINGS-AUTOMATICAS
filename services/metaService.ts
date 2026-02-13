
import { MetaAsset, CampaignAsset, BusinessInfo, MarketingStrategy } from '../types';
import { PROVEN_STRATEGIES } from '../constants/strategies';
import { dbStore } from './storageService';

const API_VER = 'v21.0';

export interface DeploymentResult {
  success: boolean;
  campaignIds?: string[];
  error?: string;
  failedAds?: string[];
}

interface MetaDeploymentValidation {
  valid: boolean;
  errors: string[];
  publishableAssets: CampaignAsset[];
}

export type TokenStatus = { 
  isValid: boolean; 
  type: 'HEALTHY' | 'EXPIRED' | 'UNAUTHORIZED'; 
  message: string 
};

export const PERMANENT_TOKEN = "EAAQllXV7oXABQkK2rL5KWzuZCoXdcvzYl4rrwIhruFf2ZCVqdjUB7iysMP0FOBL9H8BFK3Dj2ZBGhUcOHiE1KvF8KwYPy49DIadh71mH73NR6IU6vO6oW5zEOQD06UxnUCxcUn9NAZAucdb2ZBpN9U4QQfnPKsVzMZA6OkzREry4J0XAEydEUsyNL7uYZBvUTRPHK5KC4IY8235HfmlhvaFjwxUIRd4fCGCAFWQ3ctNyLMZBPqnn9YedFC73h0vJR1G9elnKWyKVeJ8lPspHoJ9knDQnCBiZAgVHsZCGUmigZDZD";

export const validateMetaCredentials = async (token: string, adAccountId: string): Promise<{ valid: boolean; message: string }> => {
  const account = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  try {
    const res = await fetch(`https://graph.facebook.com/${API_VER}/${account}?access_token=${token}`);
    const data = await res.json();
    if (data.error) return { valid: false, message: data.error.message };
    return { valid: true, message: "Conexión estable con Meta API." };
  } catch (e) {
    return { valid: false, message: "Error de red al conectar con Meta Ads." };
  }
};

export const fetchMetaAssets = async (token: string, onLog: (msg: string) => void) => {
  onLog("Conectando con Meta Graph API...");
  try {
    const accountsRes = await fetch(`https://graph.facebook.com/${API_VER}/me/adaccounts?fields=name,id,amount_spent&access_token=${token}`);
    const accountsData = await accountsRes.json();
    const accounts: MetaAsset[] = accountsData.data?.map((a: any) => ({
      id: a.id,
      name: a.name || `Cuenta ${a.id}`,
      type: 'account',
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${a.id}&backgroundColor=1e293b`
    })) || [];
    onLog(`Detectadas ${accounts.length} cuentas publicitarias.`);

    const pagesRes = await fetch(`https://graph.facebook.com/${API_VER}/me/accounts?fields=name,id,picture&access_token=${token}`);
    const pagesData = await pagesRes.json();
    const pages: MetaAsset[] = pagesData.data?.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: 'page',
      avatar: p.picture?.data?.url
    })) || [];
    onLog(`Detectadas ${pages.length} páginas comerciales.`);

    return { accounts, pages, pixels: [], instagrams: [], whatsapps: [], businesses: [] };
  } catch (e) {
    console.error("Meta Discovery Error:", e);
    return { accounts: [], pages: [], pixels: [], instagrams: [], whatsapps: [], businesses: [] };
  }
};

// Utilidad para extraer números de texto (edad)
const extractAgeRange = (demographics: string = "") => {
  const numbers = demographics.match(/\d+/g);
  if (numbers && numbers.length >= 2) return { min: parseInt(numbers[0]), max: parseInt(numbers[1]) };
  if (numbers && numbers.length === 1) return { min: parseInt(numbers[0]), max: 65 };
  return { min: 18, max: 65 };
};

const validateMetaDeploymentInputs = (business: BusinessInfo, assets: CampaignAsset[]): MetaDeploymentValidation => {
  const errors: string[] = [];

  if (!business.landingPageUrl) {
    errors.push('Falta URL de destino (landingPageUrl).');
  }

  const publishableAssets = assets.filter((asset) => {
    const hasCopy = Boolean(asset.content?.trim());
    const hasMedia = (asset.type === 'image' || asset.type === 'video') && Boolean(asset.url?.trim());
    return hasCopy && hasMedia;
  });

  if (publishableAssets.length === 0) {
    errors.push('No hay activos publicables con copy + media (imagen o video).');
  }

  if (assets.some(a => !a.content?.trim())) {
    errors.push('Hay activos sin texto/copy.');
  }

  if (assets.some(a => (a.type === 'image' || a.type === 'video') && !a.url?.trim())) {
    errors.push('Hay activos sin URL de media.');
  }

  return { valid: errors.length === 0, errors, publishableAssets };
};

export const executeFinalDeployment = async (
  business: BusinessInfo,
  assets: CampaignAsset[],
  onLog: (log: { phase: string, message: string, progress: number, status?: 'INFO' | 'ERROR' }) => void,
  customBaseName?: string
): Promise<DeploymentResult> => {
  const token = business.metaConfig.accessToken || PERMANENT_TOKEN;
  const rawId = business.metaConfig.adAccountId;
  
  if (!token || !rawId || !business.metaConfig.pageId) {
    return { success: false, error: 'CONFIGURACIÓN INCOMPLETA: Falta Token, Cuenta o Página.' };
  }

  const adAccountId = rawId.startsWith('act_') ? rawId : `act_${rawId}`;
  const strategy = PROVEN_STRATEGIES.find(s => s.id === business.strategyId) || PROVEN_STRATEGIES[0];
  const campaignIds: string[] = [];
  const failedAds: string[] = [];
  let totalAdsCreated = 0;

  const validation = validateMetaDeploymentInputs(business, assets);
  if (!validation.valid) {
    return { success: false, error: `VALIDACIÓN FALLIDA: ${validation.errors.join(' | ')}` };
  }

  // Extraer datos del Persona para segmentación real
  const personaAge = extractAgeRange(business.persona?.demographics);
  const personaInterests = business.persona?.interests || [business.niche];

  try {
    onLog({ phase: 'ESTRATEGIA', message: `Ejecutando: ${strategy.name}`, progress: 5 });

    // 1. CREAR CAMPAÑA
    const campParams = new URLSearchParams();
    campParams.append('name', `${customBaseName || '[PHOENIX]'} | ${strategy.name}`);
    campParams.append('objective', strategy.objective);
    campParams.append('status', 'PAUSED');
    campParams.append('access_token', token);

    const campRes = await fetch(`https://graph.facebook.com/${API_VER}/${adAccountId}/campaigns`, { method: 'POST', body: campParams });
    const campData = await campRes.json();
    if (campData.error) throw new Error(campData.error.message);
    const campaignId = campData.id;
    campaignIds.push(campaignId);

    onLog({ phase: 'JERARQUÍA', message: `Campaña ${campaignId} activa. Desplegando AdSets...`, progress: 20 });

    // 2. CREAR AD SETS CON SEGMENTACIÓN AVANZADA
    for (const [sIdx, struct] of strategy.structure.entries()) {
      onLog({ phase: 'SEGMENTACIÓN', message: `Inyectando reglas en: ${struct.name}...`, progress: 30 + (sIdx * 10) });
      
      const adSetParams = new URLSearchParams();
      adSetParams.append('name', struct.name);
      adSetParams.append('campaign_id', campaignId);
      adSetParams.append('billing_event', 'IMPRESSIONS');
      adSetParams.append('optimization_goal', strategy.objective === 'OUTCOME_SALES' ? 'OFFSITE_CONVERSIONS' : 'LINK_CLICKS');
      adSetParams.append('bid_strategy', 'LOWEST_COST_WITHOUT_CAP');
      adSetParams.append('daily_budget', Math.round((business.budget * (struct.budgetPercentage / 100))).toString());
      adSetParams.append('status', 'PAUSED');
      
      // Construir Targeting dinámico
      const targeting: any = { 
        device_platforms: ['mobile', 'desktop'], 
        geo_locations: { countries: ['CO', 'MX', 'ES', 'US'] },
        publisher_platforms: ['facebook', 'instagram', 'audience_network', 'messenger']
      };

      // Aplicar edad del Persona o de la estructura
      targeting.age_min = struct.targeting.ageMin || personaAge.min;
      targeting.age_max = struct.targeting.ageMax || personaAge.max;

      // Lógica de Público Específica
      if (struct.targeting.type === 'INTERESTS') {
        const combinedInterests = [...(struct.targeting.interests || []), ...personaInterests];
        targeting.flexible_spec = [{ interests: combinedInterests.map(i => ({ name: i })) }];
        // Activar Advantage Detailed Targeting
        targeting.targeting_optimization = 'expansion'; 
      }

      if (struct.name.includes('Instagram') || struct.targeting.type === 'RETARGETING') {
        // En un despliegue automático 100%, si no hay Custom Audiences IDs, usamos Advantage+ Audience
        // para encontrar gente similar a los engagers y compradores
        targeting.advantage_plus_audience = 1;
        targeting.targeting_automation = {
          advantage_detailed_targeting: 1,
          advantage_lookalike: 1
        };
      }

      adSetParams.append('targeting', JSON.stringify(targeting));
      
      if (strategy.objective === 'OUTCOME_SALES' && business.metaConfig.pixelId) {
        adSetParams.append('promoted_object', JSON.stringify({ pixel_id: business.metaConfig.pixelId, custom_event_type: 'PURCHASE' }));
      }
      adSetParams.append('access_token', token);

      const adSetRes = await fetch(`https://graph.facebook.com/${API_VER}/${adAccountId}/adsets`, { method: 'POST', body: adSetParams });
      const adSetData = await adSetRes.json();
      if (adSetData.error) throw new Error(adSetData.error.message);
      const adSetId = adSetData.id;

      // 3. CREAR ANUNCIOS (Inyectar activos en cada AdSet)
      for (const [aIdx, asset] of validation.publishableAssets.entries()) {
        const creativeParams = new URLSearchParams();
        creativeParams.append('name', `ADS_IA_${aIdx + 1}`);
        
        const adStorySpec: any = {
          page_id: business.metaConfig.pageId,
          instagram_actor_id: business.metaConfig.instagramId || undefined
        };

        if (asset.type === 'image') {
          adStorySpec.link_data = {
            link: business.landingPageUrl,
            message: asset.content,
            name: asset.title,
            description: asset.metadata?.description || "Inyección Phoenix v21",
            picture: asset.url,
            call_to_action: { type: asset.metadata?.cta || 'SHOP_NOW', value: { link: business.landingPageUrl } }
          };
        }

        if (asset.type === 'video') {
          const videoId = asset.metadata?.videoId;
          if (!videoId) {
            failedAds.push(`${struct.name} :: ${asset.title || asset.id} (video sin videoId subido a Meta)`);
            onLog({ phase: 'VALIDACIÓN', message: `Asset ${asset.title || asset.id}: falta videoId para usar video en Meta.`, progress: 35, status: 'ERROR' });
            continue;
          }

          adStorySpec.video_data = {
            video_id: videoId,
            message: asset.content,
            title: asset.title,
            call_to_action: { type: asset.metadata?.cta || 'SHOP_NOW', value: { link: business.landingPageUrl } }
          };
        }
        
        creativeParams.append('object_story_spec', JSON.stringify(adStorySpec));
        creativeParams.append('access_token', token);

        const crRes = await fetch(`https://graph.facebook.com/${API_VER}/${adAccountId}/adcreatives`, { method: 'POST', body: creativeParams });
        const crData = await crRes.json();
        
        if (crData.error || !crData.id) {
          failedAds.push(`${struct.name} :: ${asset.title || asset.id} (creative error: ${crData.error?.message || 'sin id'})`);
          onLog({ phase: 'CREATIVE', message: `No se pudo crear AdCreative para ${asset.title || asset.id}.`, progress: 55, status: 'ERROR' });
          continue;
        }

          const adParams = new URLSearchParams();
          adParams.append('name', `AD_${aIdx + 1}_${struct.name}`);
          adParams.append('adset_id', adSetId);
          adParams.append('creative', JSON.stringify({ creative_id: crData.id }));
          adParams.append('status', 'PAUSED');
          adParams.append('access_token', token);
          const adRes = await fetch(`https://graph.facebook.com/${API_VER}/${adAccountId}/ads`, { method: 'POST', body: adParams });
          const adData = await adRes.json();
          if (adData.error || !adData.id) {
            failedAds.push(`${struct.name} :: ${asset.title || asset.id} (ad error: ${adData.error?.message || 'sin id'})`);
            onLog({ phase: 'AD', message: `No se pudo crear Ad para ${asset.title || asset.id}.`, progress: 70, status: 'ERROR' });
            continue;
          }

          totalAdsCreated += 1;
      }
    }

    if (totalAdsCreated === 0) {
      onLog({ phase: 'ROLLBACK', message: 'No se creó ningún Ad válido. Eliminando campaña vacía...', progress: 95, status: 'ERROR' });
      await fetch(`https://graph.facebook.com/${API_VER}/${campaignId}`, {
        method: 'DELETE',
        body: new URLSearchParams({ access_token: token })
      });
      return { success: false, error: 'Meta bloqueó todos los Ads/Creatives. Campaña revertida para evitar campañas vacías.', failedAds };
    }

    onLog({ phase: 'ÉXITO', message: "Estructura multivariante desplegada.", progress: 100 });
    return { success: true, campaignIds, failedAds };
  } catch (e: any) {
    onLog({ phase: 'ERROR', message: e.message, progress: 0, status: 'ERROR' });
    return { success: false, error: e.message };
  }
};
