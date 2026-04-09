/**
 * Exa API Client for Neural Search
 * Used for scraping social media and communities without official APIs.
 */
export class ExaClient {
  private apiKey: string;
  private readonly BASE_URL = 'https://api.exa.ai';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.EXA_API_KEY || '';
  }

  /**
   * Search for content across specific domains or platforms
   */
  async search(query: string, options: {
    platforms?: string[];
    numResults?: number;
    startPublishedDate?: string;
    endPublishedDate?: string;
  } = {}) {
    if (!this.apiKey) {
      console.warn('[ExaClient] No API key provided. Search results will be empty.');
      return [];
    }

    const { platforms = [], numResults = 10, startPublishedDate, endPublishedDate } = options;

    // Map platforms to domains
    const domainMap: Record<string, string[]> = {
      'X': ['twitter.com', 'x.com'],
      'YouTube': ['youtube.com'],
      'Community': ['reddit.com', 'clien.net', 'fmkorea.com', 'dcinside.com']
    };

    let includeDomains: string[] = [];
    platforms.forEach(p => {
      if (domainMap[p]) includeDomains.push(...domainMap[p]);
    });

    try {
      const response = await fetch(`${this.BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          query,
          useAutoprompt: true,
          numResults,
          includeDomains: includeDomains.length > 0 ? includeDomains : undefined,
          startPublishedDate,
          endPublishedDate
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Exa API error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('[ExaClient] Search failed:', error);
      throw error;
    }
  }
}
