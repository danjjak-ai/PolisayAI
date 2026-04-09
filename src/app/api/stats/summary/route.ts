export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { DataAggregator } from '@/lib/collectors/aggregator';

export async function GET() {
  const aggregator = new DataAggregator();
  const summary = await aggregator.getSummary();
  return NextResponse.json(summary);
}

