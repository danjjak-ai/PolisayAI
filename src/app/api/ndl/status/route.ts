import { NextRequest, NextResponse } from 'next/server';
import { globalDownloadStatus } from '@/lib/collectors/status';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  
  if (q) {
    return NextResponse.json(globalDownloadStatus[q] || { status: 'idle' });
  }

  return NextResponse.json(globalDownloadStatus);
}
