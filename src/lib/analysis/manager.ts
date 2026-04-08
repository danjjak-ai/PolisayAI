import { LLMProcessor } from './llm_processor';
import { SimilarityAnalyzer } from './similarity';
import { ChangePointDetector, TimeSeriesData } from './change_point';

export class AnalysisManager {
  private llm: LLMProcessor;
  private similarity: SimilarityAnalyzer;
  private changePoint: ChangePointDetector;

  constructor(apiKey?: string) {
    this.llm = new LLMProcessor(apiKey);
    this.similarity = new SimilarityAnalyzer();
    this.changePoint = new ChangePointDetector();
  }

  async analyzeBatch(contents: string[]) {
    console.log(`[AnalysisManager] Batch processing ${contents.length} items...`);
    // Scale limited for demo
    const results = await Promise.all(
      contents.slice(0, 5).map(c => this.processIncomingData(c))
    );
    return results;
  }

  async processIncomingData(content: string) {
    const analysis = await this.llm.analyzePolicyRelevance(content);
    return {
      content: content.slice(0, 500) + '...', // Store snippet
      ...analysis,
      processed_at: new Date().toISOString()
    };
  }

  calculateGap(demandEmbed: number[], policyEmbed: number[]) {
    return this.similarity.analyzeAlignmentGap(demandEmbed, policyEmbed);
  }

  detectTrends(history: TimeSeriesData[]) {
    return this.changePoint.detect(history);
  }
}
