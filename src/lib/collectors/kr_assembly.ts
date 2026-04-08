import { BaseCollector, CollectorResult } from './base';

export class NationalAssemblyCollector extends BaseCollector {
  protected country: 'KR' | 'JP' = 'KR';
  protected source = 'NationalAssembly';

  // API Endpoints from open.assembly.go.kr
  private readonly BASE_URL = 'https://open.assembly.go.kr/portal/openapi';
  
  // Specific API for Bills (의안정보)
  private readonly BILL_SERVICE_ID = 'nzmimeepazxkubdpn';

  async collect(query: string, options: { 
    type?: 'bill' | 'speech'; 
    size?: number;
    proposer?: string;
    committee?: string;
    age?: string;
  } = {}): Promise<CollectorResult> {
    this.log(`Collecting data for query: ${query}`);

    if (!this.apiKey) {
      return this.mockCollect(query, options);
    }

    try {
      const url = new URL(`${this.BASE_URL}/${this.BILL_SERVICE_ID}`);
      url.searchParams.append('KEY', this.apiKey);
      url.searchParams.append('Type', 'json');
      url.searchParams.append('pIndex', '1');
      url.searchParams.append('pSize', (options.size || 10).toString());
      
      if (query) url.searchParams.append('BILL_NM', query);
      if (options.proposer) url.searchParams.append('PROPOSER', options.proposer);
      if (options.committee) url.searchParams.append('COMMITTEE', options.committee);
      if (options.age) url.searchParams.append('AGE', options.age);

      const response = await fetch(url.toString());
      // ... same error handling
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      this.log(`Error collecting data: ${error.message}`);
      return { success: false, data: null, error: error.message };
    }
  }

  private async mockCollect(query: string, options: any): Promise<CollectorResult> {
    this.log('API Key not provided. Returning mock data.');
    
    // Simulating a delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockData = [
      {
        BILL_ID: 'PRC_A20240408_001',
        BILL_NM: `[Mock] ${query} 관련 의료법 일부개정법률안`,
        PROPOSER: '김철수 의원 외 10인',
        PROPOSE_DT: '2024-04-08',
        CURR_STATUS: '심사중',
        SUMMARY: `${query}에 대한 긴급 대응 및 시스템 개선을 목적으로 함.`
      },
      {
        BILL_ID: 'PRC_A20240407_002',
        BILL_NM: `[Mock] ${query} 지원을 위한 특별법`,
        PROPOSER: '정부',
        PROPOSE_DT: '2024-04-07',
        CURR_STATUS: '공포',
        SUMMARY: `국가적 차원의 ${query} 산업 육성 및 규제 샌드박스 적용.`
      }
    ];

    return { success: true, data: mockData };
  }
}
