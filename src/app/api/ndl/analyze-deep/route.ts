export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { NDLDownloader } from '@/lib/collectors/downloader';
import { AnalysisManager } from '@/lib/analysis/manager';
import fs from 'fs';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'q is required' }, { status: 400 });

  const downloader = new NDLDownloader();
  const analyzer = new AnalysisManager();

  try {
    const files = await downloader.listFiles(q);
    if (files.length === 0) {
      return NextResponse.json({ message: 'No local files found' });
    }

    // Read first file for demo analysis
    const content = await fs.promises.readFile(files[0], 'utf8');
    const data = JSON.parse(content);
    const speeches = (data.speechRecord || []).map((r: any) => r.speech).filter(Boolean);

    const deepResults = await analyzer.analyzeBatch(speeches);

    return NextResponse.json({
      query: q,
      itemCount: speeches.length,
      deepAnalysis: deepResults
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

