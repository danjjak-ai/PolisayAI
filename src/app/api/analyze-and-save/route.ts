import { NextRequest, NextResponse } from 'next/server';
import { CollectorManager } from '@/lib/collectors/manager';
import { AnalysisManager } from '@/lib/analysis/manager';
import { DataService } from '@/lib/data_service';

export async function POST(request: NextRequest) {
  const { query, politician_id } = await request.json();

  if (!query || !politician_id) {
    return NextResponse.json({ error: 'Missing query or politician_id' }, { status: 400 });
  }

  const collector = new CollectorManager();
  const analyzer = new AnalysisManager();
  const db = new DataService();

  try {
    // 1. Collect
    const collection = await collector.collectAll(query);
    
    // 2. Analyze & 3. Save (Loop through result contents)
    // For demo, we just analyze the first KR item
    const contentToAnalyze = collection.results.KR.data[0]?.BILL_NM || 'No content found';
    
    const analysis = await analyzer.processIncomingData(contentToAnalyze);
    const saved = await db.saveAnalyzedSpeech({
      politician_id,
      content: contentToAnalyze,
      source_type: 'legislation',
      analysis
    });

    return NextResponse.json({
      message: 'Analysis completed and saved successfully',
      analysis,
      db_record: saved
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
