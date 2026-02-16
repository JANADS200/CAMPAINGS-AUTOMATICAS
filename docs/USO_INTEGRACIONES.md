# Guía de uso (paso a paso)

Esta guía explica **cómo usar lo que ya quedó implementado** para evitar campañas vacías en Meta y cómo activar los flujos de video/WhatsApp/checks de plataformas.

## 1) Meta Ads: evitar campañas vacías

El despliegue final usa `executeFinalDeployment(...)` y ahora valida antes de publicar:

- Debe existir `business.landingPageUrl`.
- Debe existir al menos 1 asset publicable (copy + media).
- Si no cumple, devuelve error y no publica.

### Campos mínimos que debes llenar

En tu `BusinessInfo`:

- `metaConfig.accessToken`
- `metaConfig.adAccountId`
- `metaConfig.pageId`
- `landingPageUrl`

En cada `CampaignAsset` que quieras publicar:

- `content` (texto del anuncio)
- `type`: `image` o `video`
- `url` (imagen/video)

Si el asset es `video`, además:

- `metadata.videoId` (ID del video ya subido a Meta)

> Importante: un video con solo URL local no alcanza para Meta Ads. Debes subirlo a Meta y usar ese `videoId`.

### Flujo real ejecutado

1. Crea `Campaign`
2. Crea `AdSet`
3. Crea `AdCreative` con `object_story_spec`
4. Crea `Ad` con `creative_id`

Si **ningún ad** se pudo crear, el sistema hace rollback y elimina la campaña para no dejarla vacía.

---

## 2) Cómo lanzar una campaña desde la UI

1. Configura negocio + cuenta Meta + página + URL.
2. Genera o selecciona assets (imagen/video + copy).
3. Ve a vista de preview y pulsa lanzar.
4. Revisa logs:
   - Si dice `VALIDACIÓN FALLIDA`, corrige campos faltantes.
   - Si falla video por `videoId`, sube el video a Meta primero.

---

## 3) Pipeline de video IA (base implementada)

Se agregó `generateVideoAssetPipeline(...)` para:

1. Generar video con Gemini.
2. Crear `CampaignAsset` tipo `video`.
3. Guardarlo en librería local (`dbStore.saveAsset`).

### Ejemplo de uso

```ts
import { generateVideoAssetPipeline } from '../services/videoPipelineService';

const result = await generateVideoAssetPipeline(
  business,
  'Video vertical 9:16 mostrando transformación antes/después',
  {
    title: 'Transforma tu rutina hoy',
    content: 'Descubre cómo lograr resultados reales en menos tiempo.',
    cta: 'LEARN_MORE'
  },
  (msg) => console.log(msg)
);

if (result.success) {
  console.log('Asset video listo:', result.asset);
}
```

> Después de esto, falta el paso de subir ese video a Meta para obtener `metadata.videoId` y poder publicarlo como ad real en Meta.

---

## 4) Tracking de leads de WhatsApp -> Meta

Se agregó:

- `normalizeWhatsAppLead(payload)`
- `sendWhatsAppLeadToMeta(business, lead, hashedPhone)`

### Flujo recomendado

1. Tu webhook backend recibe mensaje de WhatsApp.
2. Normalizas payload con `normalizeWhatsAppLead`.
3. Hasheas teléfono en backend (SHA-256).
4. Envías evento Lead a Meta con `sendWhatsAppLeadToMeta`.

### Ejemplo

```ts
import { normalizeWhatsAppLead, sendWhatsAppLeadToMeta } from '../services/whatsappTrackingService';

const lead = normalizeWhatsAppLead(incomingPayload);
if (!lead) throw new Error('Payload no contiene teléfono');

// hashedPhone debe venir del backend (sha256 del teléfono normalizado)
const res = await sendWhatsAppLeadToMeta(business, lead, hashedPhone);
console.log(res);
```

---

## 5) Google Ads y TikTok: cómo revisar estado actual

Hay checks técnicos de readiness:

- `runGoogleIntegrationCheck(accessToken, developerToken)`
- `runTikTokIntegrationCheck(accessToken, appId)`

Devuelven pasos:

- `AUTH`
- `CAMPAIGN_CREATE`
- `AD_CREATE`
- `PUBLISH`

Hoy te muestran claramente qué está listo (auth) y qué sigue pendiente (publicación end-to-end en backend seguro).

---

## 6) Checklist operativo (rápido)

Antes de lanzar:

- [ ] Token Meta válido
- [ ] Ad Account y Page configuradas
- [ ] Landing URL cargada
- [ ] Cada asset tiene copy y media
- [ ] Si es video: `metadata.videoId`

Si quieres, el siguiente paso que te puedo implementar es un **asistente visual en UI** que muestre este checklist y bloquee el botón de “Lanzar” hasta que todo esté en verde.
