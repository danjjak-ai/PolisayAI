import { NextRequest, NextResponse } from 'next/server';
import { NDLDownloader } from '@/lib/collectors/downloader';
import { LocalAnalyzer } from '@/lib/analysis/local_analyzer';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'q is required' }, { status: 400 });

  const downloader = new NDLDownloader();
  const analyzer = new LocalAnalyzer();

  try {
    const files = await downloader.listFiles(q);
    if (files.length === 0) {
      return NextResponse.json({ message: 'No local files found for this query. Download first.' });
    }

    const stats = await analyzer.analyzeLocalFiles(files);

    return NextResponse.json({
      query: q,
      fileCount: files.length,
      analysis: stats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
