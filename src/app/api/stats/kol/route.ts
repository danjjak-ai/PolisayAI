import { NextResponse } from 'next/server';
import { DataAggregator } from '@/lib/collectors/aggregator';

export async function GET() {
  const aggregator = new DataAggregator();
  const stats = await aggregator.getSpeakerStats();
  return NextResponse.json(stats);
}
