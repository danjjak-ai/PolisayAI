export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { parseOffice } from 'officeparser';
// @ts-ignore
import pdfParse from 'pdf-parse';
import { DataService } from '@/lib/data_service';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const politicianId = formData.get('politicianId') as string | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
    }

    if (!politicianId) {
      return NextResponse.json({ error: '대상 KOL(인물)을 선택해야 합니다.' }, { status: 400 });
    }

    // Fetch politician to get speaker name and group, or ensure they exist
    const dbService = new DataService();
    let politician = await dbService.getKOLProfile(politicianId);
    
    if (!politician) {
      // Check in Raw NDL dataset using DataAggregator
      const { DataAggregator } = await import('@/lib/collectors/aggregator');
      const aggregator = new DataAggregator();
      const speakerStats = await aggregator.getSpeakerStats();
      const matched = speakerStats.find((s: any) => s.id === politicianId || s.name === politicianId);
      
      const name = matched?.name || politicianId;
      const party = matched?.group || 'N/A';
      // Detect country: Korean characters in name/party -> 'KR', else 'JP'
      const hasHangul = /[\u3131-\uD79D]/.test(name + party);
      const country = hasHangul ? 'KR' : 'JP';
      
      politician = await dbService.ensurePoliticianExists(politicianId, name, party, country);
    }

    if (!politician) {
      return NextResponse.json({ error: '존재하지 않는 KOL이며, 새로운 KOL로 등록하지 못했습니다.' }, { status: 404 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse file based on extension to avoid Next.js bundling/worker issues with officeparser's PDF implementation
    let extractedText = '';
    const extension = path.extname(file.name).toLowerCase();

    try {
      if (extension === '.pdf') {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || '';
      } else {
        const ast = await parseOffice(buffer);
        extractedText = ast.toText();
      }
    } catch (parseError: any) {
      console.error('[Upload API] parsing error:', parseError);
      return NextResponse.json({ error: `파일 파싱 실패: ${parseError.message || parseError}` }, { status: 500 });
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json({ error: '파일에서 추출된 텍스트가 없습니다.' }, { status: 400 });
    }

    // Setup storage directory
    const STORAGE_DIR = path.join(process.cwd(), 'data', 'raw', 'ndl');
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    // Format filename matching (.+)_p(\d+)_(\d+).json
    const safeSpeakerName = politician.name.replace(/\s+/g, '');
    const timestamp = Date.now();
    const fileName = `UPLOAD_${safeSpeakerName}_any_any_p1_${timestamp}.json`;
    const filePath = path.join(STORAGE_DIR, fileName);

    // Create the SpeechRecord schema
    const speechRecord = {
      speechID: `upload-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      speaker: politician.name,
      speakerGroup: politician.party || 'N/A',
      date: new Date().toISOString().substring(0, 10),
      speech: extractedText,
      nameOfMeeting: file.name
    };

    // Save as JSON
    const dataToSave = {
      speechRecord: [speechRecord]
    };

    await fs.promises.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: `${file.name} 업로드 및 텍스트 추출 완료`,
      fileName,
      speaker: politician.name,
      textLength: extractedText.length
    });

  } catch (error: any) {
    console.error('[Upload API] General error:', error);
    return NextResponse.json({ error: error.message || '업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
