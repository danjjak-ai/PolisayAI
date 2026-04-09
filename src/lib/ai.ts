import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service for PolisayAI
 * Handles communication with Gemma 4 31B
 */
export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      console.warn('[AIService] No Gemini API key found. AI analysis will be skipped.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemma-4-31b-it' }); // Use Gemma 4 31B for advanced analysis
  }

  /**
   * Screen and structure raw social media search results
   */
  async structureSocialData(query: string, rawResults: any[]) {
    if (rawResults.length === 0) return [];

    const prompt = `
      You are a legislative intelligence analyst for PolisayAI.
      Transform the following raw search results into a structured format for policy impact analysis.
      
      Query Topic: "${query}"
      
      Raw Results:
      ${JSON.stringify(rawResults)}
      
      Requirements:
      1. Filter out irrelevant noise or spam.
      2. For each relevant item, provide:
         - user: The handle or name of the poster.
         - text: A concise summary of their sentiment or argument regarding the query.
         - date: Estimated ISO date.
         - sentiment: A numeric value between -1.0 (strongly negative) and 1.0 (strongly positive).
      3. Return ONLY a valid JSON array of objects.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Basic JSON extraction from markdown if necessary
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
      console.error('[AIService] Failed to structure social data:', error);
      return rawResults.map(r => ({
        user: r.author || 'Unknown',
        text: r.title || r.url,
        date: r.publishedDate || new Date().toISOString(),
        sentiment: 0
      }));
    }
  }
}
