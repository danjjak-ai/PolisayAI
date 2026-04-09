import { getDb } from '../local_db';

export interface AnalysisResult {
  score: number; // 0.0 to 1.0
  category: string;
  summary: string;
  tags: string[];
}

export class LLMProcessor {
  constructor(private apiKey?: string) {}

  async analyzePolicyRelevance(content: string): Promise<AnalysisResult> {
    console.log(`[LLMProcessor] Analyzing content relevance...`);
    
    // In a real implementation, this would call Gemma/GPT
    await new Promise(resolve => setTimeout(resolve, 1500));

    const db = getDb();
    const categories = db.prepare('SELECT * FROM policy_categories').all() as any[];

    // Basic heuristic to assign dynamic topics to Japanese text
    const tags: string[] = [];
    
    for (const cat of categories) {
      const keywords = cat.keywords.split(',').map((k: string) => k.trim());
      const hasMatch = keywords.some((kw: string) => content.includes(kw));
      if (hasMatch) {
         tags.push(cat.category_name);
         // Simulate also adding the matching keyword occasionally
         const matched = keywords.find((kw: string) => content.includes(kw));
         if (matched && matched !== cat.category_name) tags.push(matched);
      }
    }

    const score = tags.length > 0 ? 0.6 + (tags.length * 0.1) : 0.3;
    const category = tags.length > 0 ? tags[0] : '一般政策';

    return {
      score: Math.min(0.98, score),
      category,
      summary: `본 발언은 ${category || '일반 국정'} 분야를 중심으로 다루고 있으며, 국가 정책 방향성과 사회적 파급력을 내포하고 있습니다.`,
      tags: tags.length > 0 ? Array.from(new Set(tags)) : ['국정현안', '정례회의']
    };
  }

  async extractTopics(content: string): Promise<string[]> {
    const analysis = await this.analyzePolicyRelevance(content);
    return analysis.tags;
  }
}
