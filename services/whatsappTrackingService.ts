import { BusinessInfo } from '../types';

const API_VER = 'v21.0';

export interface WhatsAppLeadEvent {
  phone: string;
  name?: string;
  campaignId?: string;
  source?: string;
  timestamp?: number;
}

export interface ConversionDispatchResult {
  success: boolean;
  message: string;
  metaResponse?: any;
}

/**
 * Endpoint para que un webhook externo normalice leads de WhatsApp.
 */
export const normalizeWhatsAppLead = (payload: any): WhatsAppLeadEvent | null => {
  const phone = payload?.phone || payload?.from || payload?.contact?.wa_id;
  if (!phone) return null;

  return {
    phone,
    name: payload?.name || payload?.profile?.name,
    campaignId: payload?.campaignId,
    source: 'WHATSAPP',
    timestamp: payload?.timestamp ? Number(payload.timestamp) : Date.now()
  };
};

/**
 * Envía evento de conversión a Meta CAPI para cerrar loop de atribución.
 */
export const sendWhatsAppLeadToMeta = async (
  business: BusinessInfo,
  lead: WhatsAppLeadEvent,
  hashedPhone: string
): Promise<ConversionDispatchResult> => {
  const token = business.metaConfig.accessToken;
  const pixelId = business.metaConfig.pixelId;

  if (!token || !pixelId) {
    return { success: false, message: 'Meta token/pixel no configurados.' };
  }

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor((lead.timestamp || Date.now()) / 1000),
        action_source: 'system_generated',
        event_source_url: business.landingPageUrl || undefined,
        user_data: {
          ph: [hashedPhone]
        },
        custom_data: {
          source: lead.source || 'WHATSAPP',
          campaign_id: lead.campaignId || 'unknown'
        }
      }
    ]
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${API_VER}/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return { success: false, message: data.error?.message || 'Error enviando conversión a Meta.', metaResponse: data };
    }

    return { success: true, message: 'Conversión de WhatsApp enviada a Meta.', metaResponse: data };
  } catch (e: any) {
    return { success: false, message: e.message || 'Fallo de red enviando conversión.' };
  }
};
