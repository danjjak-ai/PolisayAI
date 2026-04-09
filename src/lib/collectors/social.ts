import { BaseCollector, CollectorResult } from './base';
import { ExaClient } from './exa_client';
import { AIService } from '../ai';

export class SocialMediaCollector extends BaseCollector {
  protected country: 'KR' | 'JP' = 'KR';
  protected source = 'SocialMedia';

  private exa: ExaClient;
  private ai: AIService;

  constructor(apiKey?: string) {
    super(apiKey);
    this.exa = new ExaClient(apiKey || process.env.EXA_API_KEY);
    this.ai = new AIService();
  }

  /**
   * Real implementation using Exa and Gemma 4
   */
  async collect(query: string, options: { 
    platform?: 'X' | 'YouTube' | 'Community';
    fromDate?: string;
    untilDate?: string;
  } = {}): Promise<CollectorResult> {
    const platform = options.platform || 'X';
    this.log(`Real Scraping initiated for ${platform}: ${query}`);

    try {
      // 1. Search using Exa (Platform-aware)
      const rawResults = await this.exa.search(query, {
        platforms: [platform],
        numResults: 15,
        startPublishedDate: options.fromDate,
        endPublishedDate: options.untilDate
      });

      if (!rawResults || rawResults.length === 0) {
        this.log('No raw results found via Exa. Falling back to mock.');
        return this.mockCollect(query, options);
      }

      // 2. Use Gemma 4 to structure and filter the data
      this.log(`Structuring ${rawResults.length} raw results via Gemma 4 AI...`);
      const structuredData = await this.ai.structureSocialData(query, rawResults);

      return { 
        success: true, 
        data: structuredData 
      };
    } catch (error: any) {
      this.log(`Error in real collection: ${error.message}`);
      return this.mockCollect(query, options);
    }
  }

  private async mockCollect(query: string, options: Record<string, unknown>): Promise<CollectorResult> {
    const platform = options.platform || 'X';
    this.log(`Returning fallback mock data for ${platform}.`);

    const mockData = [
      {
        id: `sn_mock_${Date.now()}_1`,
        platform,
        user: '@policy_watcher',
        text: `[Fallback] ${query} 정책에 대한 현장의 목소리가 반영되지 않고 있습니다.`,
        date: new Date().toISOString(),
        sentiment: -0.4
      },
      {
        id: `sn_mock_${Date.now()}_2`,
        platform,
        user: 'NewsAI',
        text: `[Fallback] 정부, ${query} 관련 투자 계획 발표... 시장 반응은 긍정적.`,
        date: new Date().toISOString(),
        sentiment: 0.6
      }
    ];

    return { success: true, data: mockData };
  }
}
