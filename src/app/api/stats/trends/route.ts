export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { DataAggregator } from '@/lib/collectors/aggregator';

export async function GET() {
  const aggregator = new DataAggregator();
  try {
    const trends = await aggregator.getTopicTrends();
    // Fallback: if no trend data, return time-series
    if (trends.length === 0) {
      const ts = await aggregator.getTimeSeriesData();
      return NextResponse.json(ts);
    }
    return NextResponse.json(trends);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
