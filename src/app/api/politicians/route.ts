import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('politicians')
    .select('*')
    .order('name_ko', { ascending: true });

  if (error) {
    // Return mock data if DB is not connected/empty for demo
    const mockKOLs = [
      { id: '1', name_ko: '김철수', country: 'KR', position: '국회의원', party: '더불어민주당' },
      { id: '2', name_ko: '이영희', country: 'KR', position: '국회의원', party: '국민의힘' },
      { id: '3', name_ko: 'Sato Ken', country: 'JP', position: '衆議院議員', party: 'LDP' }
    ];
    return NextResponse.json(mockKOLs);
  }

  return NextResponse.json(data);
}
