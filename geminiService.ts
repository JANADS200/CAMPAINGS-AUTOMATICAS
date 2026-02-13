
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessInfo, CampaignAsset } from "./types";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeStore(url: string, language: string): Promise<any> {
    const ai = this.getAI();
    const prompt = `ACTÚA COMO UN ANALISTA FORENSE DE MARKETING NIVEL DIOS. 
    URL: ${url}. Determina: brandName, niche, audience, visualDNA (palette, style, vibe), socialFootprint (IG, FB, TikTok), usp (5 puntos).
    Idioma: ${language}. Responde estrictamente en JSON.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });

    const groundingSources = res.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Fuente Forense",
      uri: chunk.web?.uri || ""
    })) || [];

    return { ...JSON.parse(res.text || '{}'), groundingSources };
  }

  async performFullMarketAnalysis(business: BusinessInfo): Promise<any> {
    const ai = this.getAI();
    const prompt = `DIRECCIÓN ESTRATÉGICA. Marca: ${business.name}. 
    Genera un JSON con 5 ángulos de ataque psicológico (angles) {name, hookText} para anuncios de respuesta directa.`;
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(res.text || '{"angles": []}');
  }

  async generateVideo(business: BusinessInfo, prompt: string, referenceImage?: string): Promise<string> {
    const ai = this.getAI();
    const videoConfig: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic commercial for ${business.name}. ${prompt}. Aspect ratio 9:16. High production value.`,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '9:16' }
    };
    if (referenceImage) {
      videoConfig.image = { imageBytes: referenceImage.split(',')[1] || referenceImage, mimeType: 'image/png' };
    }
    
    let operation = await ai.models.generateVideos(videoConfig);
    while (!operation.done) {
      await new Promise(r => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }
    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
  }

  async generateImage(business: BusinessInfo, prompt: string, referenceImage?: string): Promise<string> {
    const ai = this.getAI();
    const parts: any[] = [{ text: `High-end product ad for ${business.name}. ${prompt}` }];
    if (referenceImage) {
      parts.push({ inlineData: { mimeType: 'image/png', data: referenceImage.split(',')[1] || referenceImage } });
    }
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "9:16", imageSize: "1K" } }
    });
    const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Imagen fallida");
  }

  async generateCopies(business: BusinessInfo, angle: any): Promise<any> {
    const ai = this.getAI();
    const prompt = `Crea copys estructurados para Meta Ads. 
    Marca: ${business.name}. Ángulo: ${angle.name}. 
    JSON: {
      "title": "Título corto y llamativo",
      "headline": "Frase de enganche principal",
      "primaryText": "Copy persuasivo con emojis y beneficios",
      "cta": "SHOP_NOW"
    }`;
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(res.text || '{}');
  }

  async testConnection(): Promise<boolean> {
    try {
      const ai = this.getAI();
      await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: 'ping' });
      return true;
    } catch { return false; }
  }
}

export const gemini = new GeminiService();
