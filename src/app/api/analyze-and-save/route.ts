export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { DataAggregator } from '@/lib/collectors/aggregator';
import { AnalysisManager } from '@/lib/analysis/manager';
import { DataService } from '@/lib/data_service';

export async function POST(request: NextRequest) {
  const { query, politician_id } = await request.json();

  if (!query) {
    return NextResponse.json({ error: 'Missing speaker query' }, { status: 400 });
  }

  const aggregator = new DataAggregator();
  const analyzer = new AnalysisManager();
  const db = new DataService();

  try {
    // 1. Get raw speeches for this speaker from local JSON
    const speeches = await aggregator.getRawSpeechesBySpeaker(query, 3);
    
    if (speeches.length === 0) {
      return NextResponse.json({ error: 'No raw speeches found for this speaker to analyze.' }, { status: 404 });
    }

    const savedRecords = [];
    const analysisResults = [];

    // 2. Analyze & 3. Save
    for (const record of speeches) {
      const contentToAnalyze = record.speech || '';
      if (!contentToAnalyze.trim()) continue;

      const analysis = await analyzer.processIncomingData(contentToAnalyze);
      const saved = await db.saveAnalyzedSpeech({
        politician_id: politician_id || query,
        content: contentToAnalyze,
        source_type: 'ndl_japan',
        analysis
      });

      savedRecords.push(saved);
      analysisResults.push(analysis);
    }

    return NextResponse.json({
      message: `Analysis completed for ${savedRecords.length} speeches(s)`,
      analysis: analysisResults,
      db_records: savedRecords
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

