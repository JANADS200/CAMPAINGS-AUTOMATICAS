
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BusinessInfo, CampaignAsset, LaunchedCampaign, User, NeuralPersonality, MarketingStrategy, StrategicMapItem } from "../types";
import { dbStore } from "./storageService";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getCinematicStyle(personality: NeuralPersonality = 'STORYTELLER', business: BusinessInfo): string {
    const buyerProfile = business.persona ? `BUYER PERSONA: ${business.persona.name}. PSICOLOGÍA: ${business.persona.psychology}.` : "";
    const styles: Record<NeuralPersonality, string> = {
      'DISRUPTOR': `Estilo Cyberpunk de ultra-lujo, alto contraste, neones agresivos. ${buyerProfile} Estética para personas que odian lo convencional. Fotorrealismo extremo.`,
      'AUTHORITY': `Minimalismo Apple-style, iluminación cenital, tonos sobrios y premium. ${buyerProfile} Estética que proyecta confianza millonaria.`,
      'EMPATHETIC': `Luz natural de mañana, enfoque bokeh cinematográfico, texturas orgánicas. ${buyerProfile} Estética que abraza emocionalmente al cliente.`,
      'STORYTELLER': `Paleta de colores tipo Wes Anderson o película épica de Hollywood. ${buyerProfile} Estética narrativa que detiene el scroll.`
    };
    return styles[personality] || styles['STORYTELLER'];
  }

  /**
   * Generates ad copies based on business info and selling angle
   */
  async generateCopies(business: BusinessInfo, angle: any, strategy: MarketingStrategy, personality: NeuralPersonality = 'DISRUPTOR'): Promise<any> {
    const ai = this.getAI();
    const persona = business.persona;
    const buyerContext = persona ? `CLIENTE IDEAL: ${persona.name}. BIO: ${persona.bio}. DOLORES CRÍTICOS: ${business.pains.join(', ')}.` : "Público General";
    
    const prompt = `ACTÚA COMO UN PSICÓLOGO DE VENTAS Y REDACTOR DE ÉLITE.
    Contexto Negocio: ${business.name} (${business.niche}). 
    ${buyerContext}
    Ángulo de Venta: ${angle.name} (${angle.hookText}).
    Estrategia Activa: ${strategy.name}.
    
    TAREA: Crea una campaña completa en ESPAÑOL que hable directamente al subconsciente de este comprador.
    FORMATO JSON ESTRICTO:
    {
      "headline": "Título de impacto (Max 40 chars)",
      "primaryText": "Cuerpo del anuncio usando Storytelling + AIDA. Tono: ${personality}",
      "description": "Subtítulo que refuerza la oferta",
      "cta": "Valor API Meta (ej: SHOP_NOW, ORDER_NOW, LEARN_MORE)",
      "visual_direction": "Instrucción cinematográfica detallada para el fotógrafo de IA para captar a este buyer persona",
      "mentalTriggers": ["Gatillo 1", "Gatillo 2"],
      "socialLabel": "ETIQUETA SOCIAL"
    }`;
    
    const res = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: prompt, 
      config: { responseMimeType: 'application/json' } 
    });
    return JSON.parse(res.text || '{}');
  }

  /**
   * Generates a high-quality advertising image
   */
  async generateImage(business: BusinessInfo, prompt: string, referenceImage?: string, personality: NeuralPersonality = 'STORYTELLER'): Promise<string> {
    const ai = this.getAI();
    const style = this.getCinematicStyle(personality, business);
    
    const parts: any[] = [{ 
      text: `OBRA MAESTRA PUBLICITARIA 4K. Concepto: ${prompt}.
      ESTILO VISUAL: ${style}.
      ESPECIFICACIONES: Fotorrealismo 8k, lentes anamórficos, profundidad de campo pro, iluminación dramática de estudio.
      ALINEACIÓN: La imagen debe resonar con los deseos profundos de ${business.persona?.name || 'el cliente'}. No texto en la imagen.` 
    }];

    if (referenceImage) {
      parts.push({ inlineData: { mimeType: 'image/png', data: referenceImage.split(',')[1] || referenceImage } });
    }

    const res = await ai.models.generateContent({ 
      model: 'gemini-3-pro-image-preview', 
      contents: { parts }, 
      config: { imageConfig: { aspectRatio: "9:16", imageSize: "1K" } } 
    });
    const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";
  }

  /**
   * Generates a high-quality advertising video using Veo
   */
  async generateVideo(business: BusinessInfo, prompt: string, referenceImage?: string, personality: NeuralPersonality = 'STORYTELLER'): Promise<string> {
    const ai = this.getAI();
    const style = this.getCinematicStyle(personality, business);
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic commercial for ${business.name}. ${prompt}. Style: ${style}. 9:16 aspect ratio. High-end motion graphics and professional color grading. Target: ${business.persona?.name}. No text.`,
      image: referenceImage ? {
        imageBytes: referenceImage.split(',')[1] || referenceImage,
        mimeType: 'image/png',
      } : undefined,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '9:16' }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
  }

  /**
   * Performs deep market analysis via Google Search grounding
   */
  async analyzeStore(url: string, language: string): Promise<any> {
    const ai = this.getAI();
    const prompt = `ANALISTA FORENSE DE MARKETING: ${url}. brandName, niche, persona, pains, objections, benefits en JSON ESPAÑOL. Usa búsqueda real para encontrar competidores y ubicaciones.`;
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    
    const groundingSources = res.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Fuente Forense",
      uri: chunk.web?.uri || ""
    })) || [];

    const data = JSON.parse(res.text || '{}');
    return { ...data, groundingSources };
  }

  /**
   * Analyzes business profile and generates customer persona
   */
  async analyzeBusiness(name: string, niche: string, brief: string, language: string): Promise<any> {
    const ai = this.getAI();
    const prompt = `Analiza profundamente: ${name}, ${niche}, ${brief}. Genera Persona (bio, demographics, psychology, interests), StrategicMap y Pains en JSON ESPAÑOL.`;
    const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
    return JSON.parse(res.text || '{}');
  }

  /**
   * Generates psychological selling angles for a strategy
   */
  async performFullMarketAnalysis(business: BusinessInfo, strategy: MarketingStrategy): Promise<any> {
    const ai = this.getAI();
    const count = strategy.creativesNeeded || 5;
    const prompt = `Genera ${count} ángulos psicológicos disruptivos para ${business.name} en JSON ESPAÑOL: { "angles": [{ "name", "hookText" }] } basados en la estrategia ${strategy.name}`;
    const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
    return JSON.parse(res.text || '{"angles": []}');
  }

  /**
   * Provides complex marketing advice based on business context
   */
  async getComplexAdvice(input: string, business: BusinessInfo, campaigns: LaunchedCampaign[], media?: any): Promise<string> {
    const ai = this.getAI();
    const contents: any[] = [{ text: `RESPONDE EN ESPAÑOL. Eres el cerebro operativo de ${business.name}. Pregunta: ${input}. Contexto: Tenemos ${campaigns.length} campañas activas.` }];
    if (media) contents.push({ inlineData: { mimeType: media.mimeType || 'image/png', data: media.data?.split(',')[1] || media.data } });
    const res = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: { parts: contents } });
    return res.text || "Error de respuesta.";
  }

  /**
   * Provides fast, actionable advice
   */
  async getFastAdvice(input: string, context: string): Promise<string> {
    const ai = this.getAI();
    const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Contexto: ${context}. Responde muy breve y accionable: ${input}` });
    return res.text || "Error.";
  }

  /**
   * Tests API connection
   */
  async testConnection(): Promise<boolean> {
    try { const ai = this.getAI(); await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: 'ping' }); return true; } catch { return false; }
  }

  /**
   * Analyzes an ad's visual hierarchy (heatmap prediction)
   */
  async analyzeHeatmap(image: string): Promise<string> {
    const ai = this.getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { mimeType: 'image/png', data: image.split(',')[1] || image } }, { text: "Analiza la jerarquía visual de este anuncio y predice puntos calientes de atención." }] }
    });
    return res.text || "Fallo análisis.";
  }

  /**
   * Generates A/B test variants
   */
  async generateABVariants(business: BusinessInfo, asset: CampaignAsset, variable: string): Promise<any[]> {
    const ai = this.getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera 2 variantes A/B optimizadas para ${variable} de ${asset.title} en JSON. { "variants": [{ "name", "copy_title", "copy_body", "visual_prompt" }] }`,
      config: { responseMimeType: "application/json" }
    });
    const parsed = JSON.parse(res.text || '{"variants": []}');
    return parsed.variants || [];
  }

  /**
   * Generates a super-brief advertising summary for the business.
   */
  async generateSuperBrief(name: string, targetAudience: string, language: string, image?: string): Promise<string> {
    const ai = this.getAI();
    const parts: any[] = [{ 
      text: `ACTÚA COMO UN ESTRATEGA CREATIVO. Genera un "Super Brief" publicitario para ${name}.
      Objetivo: ${targetAudience}. Idioma: ${language}. 
      Proporciona una visión general emocionante y de alta conversión.` 
    }];
    if (image) {
      parts.push({ inlineData: { mimeType: 'image/png', data: image.split(',')[1] || image } });
    }
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts }
    });
    return res.text || "";
  }

  /**
   * Generates speech audio from text using Gemini TTS.
   */
  async generateSpeech(text: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  }
}

export const gemini = new GeminiService();
