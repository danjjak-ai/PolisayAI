export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { DataAggregator } from '@/lib/collectors/aggregator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const aggregator = new DataAggregator();

  try {
    const rawSpeeches = await aggregator.getRawSpeechesBySpeaker(decodedId, 10);
    return NextResponse.json(rawSpeeches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
