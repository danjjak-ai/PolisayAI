export interface CollectorResult {
  success: boolean;
  data: any;
  error?: string;
}

export abstract class BaseCollector {
  protected abstract country: 'KR' | 'JP';
  protected abstract source: string;

  constructor(protected apiKey?: string) {}

  abstract collect(query: string, options?: any): Promise<CollectorResult>;

  protected log(message: string) {
    console.log(`[Collector][${this.country}][${this.source}] ${message}`);
  }
}
