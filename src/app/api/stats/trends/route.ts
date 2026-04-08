import { NextResponse } from 'next/server';
import { DataAggregator } from '@/lib/collectors/aggregator';

export async function GET() {
  const aggregator = new DataAggregator();
  const trends = await aggregator.getTimeSeriesData();
  return NextResponse.json(trends);
}
