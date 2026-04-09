import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data_service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const service = new DataService();
  try {
    const politicians = await service.getAllPoliticians();
    return NextResponse.json(politicians);
  } catch (error: any) {
    console.error('[API] Error fetching politicians:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
