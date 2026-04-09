import { NextRequest, NextResponse } from 'next/server';
import { globalDownloadStatus } from '@/lib/collectors/status';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const source = request.nextUrl.searchParams.get('source');
  
  if (q && source) {
    const key = `${source}_${q}`;
    return NextResponse.json(globalDownloadStatus[key] || { status: 'idle' });
  }

  if (q) {
    return NextResponse.json(globalDownloadStatus[q] || { status: 'idle' });
  }

  return NextResponse.json(globalDownloadStatus);
}
