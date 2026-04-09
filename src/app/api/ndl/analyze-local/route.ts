export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { NDLDownloader } from '@/lib/collectors/downloader';
import { LocalAnalyzer } from '@/lib/analysis/local_analyzer';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const prefix = request.nextUrl.searchParams.get('prefix');

  const downloader = new NDLDownloader();
  const analyzer = new LocalAnalyzer();

  try {
    let files: string[];

    if (prefix) {
      // Specific collection batch
      files = await downloader.listFiles(prefix);
    } else if (q) {
      // All files (for 전체 selection - scan everything)
      files = await downloader.listAllFiles();
    } else {
      return NextResponse.json({ error: 'q or prefix is required' }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({
        query: q || prefix,
        fileCount: 0,
        message: '다운로드된 데이터가 없습니다. 먼저 데이터를 수집하세요.',
        analysis: { bySpeaker: [], byGroup: [], sentiment: null },
      });
    }

    const stats = await analyzer.analyzeLocalFiles(files);

    return NextResponse.json({
      query: q || prefix,
      fileCount: files.length,
      analysis: stats,
    });
  } catch (error: any) {
    console.error('[analyze-local]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
