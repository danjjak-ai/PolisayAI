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
  }> {
    const speakerMap: Map<string, AnalyzedStats> = new Map();
    const groupMap: Map<string, AnalyzedStats> = new Map();

    for (const path of filePaths) {
      const content = await fs.promises.readFile(path, 'utf8');
      const data = JSON.parse(content);
      
      // NDL JSON structure contains 'speechRecord' array
      const records = data.speechRecord || [];

      for (const rec of records) {
        this.updateMap(speakerMap, rec.speaker, rec.speech?.length || 0);
        this.updateMap(groupMap, rec.speakerGroup || 'Unknown', rec.speech?.length || 0);
      }
    }

    return {
      bySpeaker: Array.from(speakerMap.values()).sort((a, b) => b.count - a.count),
      byGroup: Array.from(groupMap.values()).sort((a, b) => b.count - a.count)
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
