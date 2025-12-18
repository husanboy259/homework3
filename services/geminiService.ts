
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Always use the process.env.API_KEY directly as per guidelines.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling and professional product description for a product named "${productName}" in the "${category}" category. Keep it under 100 words.`,
      });
      return response.text || "No description generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to generate description at this time.";
    }
  }

  async getShoppingAssistantResponse(query: string, availableProducts: string[]): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a helpful shopping assistant for NovaMarket. 
        The customer asked: "${query}". 
        We have these products: ${availableProducts.join(', ')}. 
        Recommend the best options and be friendly.`,
      });
      return response.text || "I'm sorry, I couldn't find an answer for that.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having trouble connecting to my brain right now!";
    }
  }
}

export const geminiService = new GeminiService();
