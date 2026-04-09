import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data_service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = new DataService();

  try {
    const profile = await service.getKOLProfile(id);
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
