import fs from 'fs';

export interface AnalyzedStats {
  speaker: string;
  count: number;
  totalLength: number;
  avgLength: number;
}

export class LocalAnalyzer {
  /**
   * Analyzes local JSON files from NDL and groups results by speaker or organization
   */
  async analyzeLocalFiles(filePaths: string[]): Promise<{
    bySpeaker: AnalyzedStats[];
    byGroup: AnalyzedStats[];
    sentiment: {
      avg: number;
      distribution: { positive: number; neutral: number; negative: number };
    } | null;
  }> {
    const speakerMap: Map<string, AnalyzedStats> = new Map();
    const groupMap: Map<string, AnalyzedStats> = new Map();
    const sentimentStats: { positive: number; neutral: number; negative: number } = { positive: 0, neutral: 0, negative: 0 };
    let totalSentiment = 0;
    let sentimentCount = 0;

    for (const path of filePaths) {
      const content = await fs.promises.readFile(path, 'utf8');
      const data = JSON.parse(content);
      
      // 1. Handle NDL (speechRecord)
      if (data.speechRecord) {
        for (const rec of data.speechRecord) {
          this.updateMap(speakerMap, rec.speaker, rec.speech?.length || 0);
          this.updateMap(groupMap, rec.speakerGroup || 'Unknown', rec.speech?.length || 0);
        }
      } 
      // 2. Handle Social Media (Array of structured objects)
      else if (Array.isArray(data)) {
        for (const item of data) {
          if (item.sentiment !== undefined) {
            totalSentiment += item.sentiment;
            sentimentCount++;
            if (item.sentiment > 0.2) sentimentStats.positive++;
            else if (item.sentiment < -0.2) sentimentStats.negative++;
            else sentimentStats.neutral++;
          }
          // Also group by user if relevant
          this.updateMap(speakerMap, item.user || 'Unknown', item.text?.length || 0);
        }
      }
    }

    return {
      bySpeaker: Array.from(speakerMap.values()).sort((a, b) => b.count - a.count).slice(0, 10),
      byGroup: Array.from(groupMap.values()).sort((a, b) => b.count - a.count),
      sentiment: sentimentCount > 0 ? {
        avg: totalSentiment / sentimentCount,
        distribution: sentimentStats
      } : null
    };
  }

  private updateMap(map: Map<string, AnalyzedStats>, key: string, length: number) {
    const existing = map.get(key) || { speaker: key, count: 0, totalLength: 0, avgLength: 0 };
    existing.count += 1;
    existing.totalLength += length;
    existing.avgLength = existing.totalLength / existing.count;
    map.set(key, existing);
  }
}
