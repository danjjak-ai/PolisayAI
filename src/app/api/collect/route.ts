export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { CollectorManager } from '@/lib/collectors/manager';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // In a real app, keys would come from process.env
  const manager = new CollectorManager({
    kr: process.env.KR_ASSEMBLY_API_KEY,
    jp: process.env.JP_NDL_API_KEY
  });

  const results = await manager.collectAll(query);

  return NextResponse.json(results);
}

