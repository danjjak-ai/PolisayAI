import { NextRequest, NextResponse } from 'next/server';
import { NDLCollector } from '@/lib/collectors/jp_ndl';
import { NationalAssemblyCollector } from '@/lib/collectors/kr_assembly';
import { SocialMediaCollector } from '@/lib/collectors/social';
import { NDLDownloader } from '@/lib/collectors/downloader';
import { globalDownloadStatus } from '@/lib/collectors/status';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sParams = request.nextUrl.searchParams;
  const source = sParams.get('source') || 'KR';
  const q = sParams.get('q') || '';
  const maxPages = parseInt(sParams.get('pages') || '1');
  const fromDate = sParams.get('from') || '';
  const untilDate = sParams.get('until') || '';

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
    status: 'running',
    logs: [`수집 시작: ${source} - ${q}`]
  };

  try {
    for (let p = 0; p < maxPages; p++) {
      const res = await collector.collect(q, {
        ...Object.fromEntries(sParams.entries()),
        fromDate,
        untilDate
      });
      if (!res.success) break;

      // Create a consistent prefix using the canonical builder
      const collectionPrefix = NDLDownloader.buildPrefix(source, q, fromDate || undefined, untilDate || undefined);
      const filePath = await downloader.saveChunk(collectionPrefix, res.data, p + 1);
      
      globalDownloadStatus[statusKey].currentPage = p + 1;
      globalDownloadStatus[statusKey].lastFile = filePath;
      globalDownloadStatus[statusKey].logs.push(`${p + 1} 페이지 수집 완료: ${filePath.split('\\').pop()}`);

      await new Promise(r => setTimeout(r, 500));
    }

    globalDownloadStatus[statusKey].status = 'completed';
    globalDownloadStatus[statusKey].logs.push('모든 작업이 완료되었습니다.');
    return NextResponse.json({ success: true, source, query: q });
  } catch (error: any) {
    globalDownloadStatus[statusKey].status = 'error';
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
