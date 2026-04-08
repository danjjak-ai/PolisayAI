import { NextRequest, NextResponse } from 'next/server';
import { NDLCollector } from '@/lib/collectors/jp_ndl';
import { NationalAssemblyCollector } from '@/lib/collectors/kr_assembly';
import { SocialMediaCollector } from '@/lib/collectors/social';
import { NDLDownloader } from '@/lib/collectors/downloader';
import { globalDownloadStatus } from '@/lib/collectors/status';

export async function GET(request: NextRequest) {
  const sParams = request.nextUrl.searchParams;
  const source = sParams.get('source') || 'KR';
  const q = sParams.get('q') || '';
  const maxPages = parseInt(sParams.get('pages') || '1');

  // Unified Collector Selection
  let collector: any;
  if (source === 'JP') collector = new NDLCollector();
  else if (source === 'KR') collector = new NationalAssemblyCollector();
  else collector = new SocialMediaCollector();

  const downloader = new NDLDownloader();

  // Unified Status
  const statusKey = `${source}_${q}`;
  globalDownloadStatus[statusKey] = {
    query: q,
    totalPage: maxPages,
    currentPage: 0,
    status: 'running'
  };

  try {
    for (let p = 0; p < maxPages; p++) {
      const res = await collector.collect(q, Object.fromEntries(sParams.entries()));
      if (!res.success) break;

      const filePath = await downloader.saveChunk(`${source}_${q}`, res.data, p + 1);
      
      globalDownloadStatus[statusKey].currentPage = p + 1;
      globalDownloadStatus[statusKey].lastFile = filePath;

      await new Promise(r => setTimeout(r, 500));
    }

    globalDownloadStatus[statusKey].status = 'completed';
    return NextResponse.json({ success: true, source, query: q });
  } catch (error: any) {
    globalDownloadStatus[statusKey].status = 'error';
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
