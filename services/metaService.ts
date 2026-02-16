
import { MetaAsset, CampaignAsset, BusinessInfo, MetaTargetingSpec } from '../types';
import { PROVEN_STRATEGIES } from '../constants/strategies';

const API_VER = 'v21.0';

export interface DeploymentResult {
  success: boolean;
  campaignIds?: string[];
  error?: string;
  failedAds?: string[];
}

export interface MetaDeploymentValidation {
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

export const validateMetaDeploymentInputs = (business: BusinessInfo, assets: CampaignAsset[]): MetaDeploymentValidation => {
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

  if (assets.some(a => a.type === 'video' && !a.metadata?.videoId)) {
    errors.push('Hay videos sin metadata.videoId (deben subirse primero a Meta).');
  }

  return { valid: errors.length === 0, errors, publishableAssets };
};


const resolveMetaStrategy = (strategyId: string) => {
  const selected = PROVEN_STRATEGIES.find(s => s.id === strategyId);
  if (selected && selected.platforms.includes('META')) return selected;
  return PROVEN_STRATEGIES.find(s => s.platforms.includes('META')) || PROVEN_STRATEGIES[0];
};


const buildAdvancedMetaTargeting = (
  spec: MetaTargetingSpec,
  personaAge: { min: number; max: number },
  personaInterests: string[],
  business: BusinessInfo
) => {
  const targeting: any = {
    device_platforms: spec.devicePlatforms || ['mobile', 'desktop'],
    geo_locations: {
      countries: spec.countries?.length ? spec.countries : [business.country || 'US']
    },
    publisher_platforms: spec.publisherPlatforms || ['facebook', 'instagram', 'audience_network', 'messenger'],
    age_min: spec.ageMin || personaAge.min,
    age_max: spec.ageMax || personaAge.max
  };

  if (spec.genders?.length) targeting.genders = spec.genders;
  if (spec.languages?.length) targeting.locales = spec.languages;

  if (spec.cities?.length) {
    targeting.geo_locations.cities = spec.cities.map((c) => ({ key: c }));
  }

  const combinedInterests = [...(spec.interests || []), ...personaInterests].filter(Boolean);
  if (spec.type === 'INTERESTS' && combinedInterests.length > 0) {
    targeting.flexible_spec = [{ interests: combinedInterests.map((i) => ({ name: i })) }];
    targeting.targeting_optimization = 'expansion';
  }

  if (spec.behaviors?.length) {
    targeting.flexible_spec = [...(targeting.flexible_spec || []), { behaviors: spec.behaviors.map((b) => ({ name: b })) }];
  }

  if (spec.excludedInterests?.length || spec.excludedCustomAudienceIds?.length) {
    targeting.exclusions = {
      ...(spec.excludedInterests?.length ? { interests: spec.excludedInterests.map((i) => ({ name: i })) } : {}),
      ...(spec.excludedCustomAudienceIds?.length ? { custom_audiences: spec.excludedCustomAudienceIds.map((id) => ({ id })) } : {})
    };
  }

  if (spec.customAudienceIds?.length) {
    targeting.custom_audiences = spec.customAudienceIds.map((id) => ({ id }));
  }

  if (spec.lookalikeSourceAudienceId) {
    targeting.lookalike_spec = {
      type: 'custom_ratio',
      ratio: 0.01,
      starting_ratio: 0.01,
      country: (spec.countries?.[0] || business.country || 'US').toUpperCase(),
      origin: [{ id: spec.lookalikeSourceAudienceId, type: 'custom_audience' }]
    };
  }

  if (spec.type === 'RETARGETING') {
    targeting.advantage_plus_audience = 1;
    targeting.targeting_automation = {
      advantage_detailed_targeting: 1,
      advantage_lookalike: 1
    };
  }

  return targeting;
};

const normalizeMetaStructure = (raw: { name: string; budgetPercentage: number; targeting: any; funnelStage: 'COLD' | 'WARM' | 'HOT' }[]) => {
  const valid = raw.filter(s => s.budgetPercentage > 0);
  if (valid.length === 0) return [{ name: 'Default Broad', budgetPercentage: 100, targeting: { type: 'BROAD' }, funnelStage: 'COLD' as const }];
  const sum = valid.reduce((acc, s) => acc + s.budgetPercentage, 0);
  return valid.map(s => ({ ...s, budgetPercentage: Math.max(1, Math.round((s.budgetPercentage / sum) * 100)) }));
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
  const strategy = resolveMetaStrategy(business.strategyId);
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
  const normalizedStructure = normalizeMetaStructure(strategy.structure);

  try {
    onLog({ phase: 'ESTRATEGIA', message: `Ejecutando: ${strategy.name}`, progress: 5 });
    if (!strategy.platforms.includes('META')) {
      onLog({ phase: 'ESTRATEGIA', message: 'Estrategia no era META; se aplicó fallback compatible.', progress: 8 });
    }

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
    for (const [sIdx, struct] of normalizedStructure.entries()) {
      onLog({ phase: 'SEGMENTACIÓN', message: `Inyectando reglas en: ${struct.name}...`, progress: 30 + (sIdx * 10) });
      
      const adSetParams = new URLSearchParams();
      adSetParams.append('name', struct.name);
      adSetParams.append('campaign_id', campaignId);
      adSetParams.append('billing_event', 'IMPRESSIONS');
      adSetParams.append('optimization_goal', strategy.objective === 'OUTCOME_SALES' ? 'OFFSITE_CONVERSIONS' : 'LINK_CLICKS');
      adSetParams.append('bid_strategy', 'LOWEST_COST_WITHOUT_CAP');
      const adSetBudget = Math.max(100, Math.round((business.budget * (struct.budgetPercentage / 100))));
      adSetParams.append('daily_budget', adSetBudget.toString());
      adSetParams.append('status', 'PAUSED');
      
      const targeting = buildAdvancedMetaTargeting(struct.targeting, personaAge, personaInterests, business);
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
