export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { NDLDownloader } from '@/lib/collectors/downloader';

export async function GET() {
  const downloader = new NDLDownloader();
  const collections = await downloader.listCollections();
  return NextResponse.json(collections);
}
