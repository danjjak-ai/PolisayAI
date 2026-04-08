import { NationalAssemblyCollector } from './kr_assembly';
import { NDLCollector } from './jp_ndl';
import { SocialMediaCollector } from './social';

export class CollectorManager {
  private krCollector: NationalAssemblyCollector;
  private jpCollector: NDLCollector;
  private socialCollector: SocialMediaCollector;

  constructor(apiKeys: { kr?: string; jp?: string; social?: string } = {}) {
    this.krCollector = new NationalAssemblyCollector(apiKeys.kr);
    this.jpCollector = new NDLCollector(apiKeys.jp);
    this.socialCollector = new SocialMediaCollector(apiKeys.social);
  }

  async collectAll(query: string) {
    console.log(`[CollectorManager] Starting cross-border collection for: ${query}`);
    
    const [krResult, jpResult, socialResult] = await Promise.all([
      this.krCollector.collect(query),
      this.jpCollector.collect(query),
      this.socialCollector.collect(query)
    ]);

    return {
      query,
      timestamp: new Date().toISOString(),
      results: {
        KR: krResult,
        JP: jpResult,
        Social: socialResult
      }
    };
  }
}
