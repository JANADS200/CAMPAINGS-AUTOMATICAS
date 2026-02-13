import { CampaignAsset, BusinessInfo } from '../types';
import { gemini } from './geminiService';
import { dbStore } from './storageService';

export interface VideoGenerationResult {
  success: boolean;
  asset?: CampaignAsset;
  error?: string;
}

/**
 * Pipeline mínimo para convertir prompt -> video -> asset utilizable en campañas.
 * Nota: para publicar en Meta aún se debe subir a Graph API y guardar metadata.videoId.
 */
export const generateVideoAssetPipeline = async (
  business: BusinessInfo,
  prompt: string,
  copy: { title: string; content: string; cta?: string },
  onProgress?: (message: string) => void
): Promise<VideoGenerationResult> => {
  try {
    onProgress?.('Generando video con IA...');
    const videoUrl = await gemini.generateVideo(business, prompt);

    if (!videoUrl) {
      return { success: false, error: 'No se pudo generar el video.' };
    }

    const asset: CampaignAsset = {
      id: `video_${Date.now()}`,
      platform: 'META',
      type: 'video',
      url: videoUrl,
      title: copy.title,
      content: copy.content,
      status: 'ready',
      isActive: true,
      funnelStage: 'COLD',
      metadata: {
        cta: copy.cta || 'SHOP_NOW',
        generatedBy: 'gemini-veo',
        storageStatus: 'local-object-url'
      }
    };

    dbStore.saveAsset(asset, business);
    onProgress?.('Video generado y guardado en librería local.');

    return { success: true, asset };
  } catch (e: any) {
    return { success: false, error: e.message || 'Error desconocido en pipeline de video.' };
  }
};
