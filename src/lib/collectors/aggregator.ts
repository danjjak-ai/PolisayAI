import fs from 'fs';
import path from 'path';

export interface SpeechRecord {
  speechID: string;
  speaker: string;
  speakerGroup: string;
  date: string;
  speech: string;
  nameOfMeeting: string;
}

export class DataAggregator {
  private baseDir = path.join(process.cwd(), 'data', 'raw', 'ndl');

  async getAllRecords(): Promise<SpeechRecord[]> {
    if (!fs.existsSync(this.baseDir)) return [];

    const files = fs.readdirSync(this.baseDir).filter(f => f.endsWith('.json'));
    let allRecords: SpeechRecord[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.baseDir, file), 'utf8');
        const data = JSON.parse(content);
        if (data.speechRecord) {
          allRecords = allRecords.concat(data.speechRecord);
        }
      } catch (e) {
        console.error(`Error reading ${file}:`, e);
      }
    }

    return allRecords;
  }

  async getSummary() {
    const records = await this.getAllRecords();
    const speakers = new Set(records.map(r => r.speaker));
    const meetings = new Set(records.map(r => r.nameOfMeeting));
    
    // Simple topic extraction (mock-like but based on real count)
    const keywords = ['医療', 'DX', '経済', '環境', '教育'];
    const topicStats = keywords.map(k => ({
      name: k,
      count: records.filter(r => r.speech?.includes(k)).length
    })).sort((a, b) => b.count - a.count);

    return {
      totalRecords: records.length,
      totalSpeakers: speakers.size,
      totalMeetings: meetings.size,
      topTopics: topicStats,
      recentDate: records.sort((a, b) => b.date.localeCompare(a.date))[0]?.date
    };
  }

  async getSpeakerStats() {
    const records = await this.getAllRecords();
    const stats: Record<string, { count: number; group: string; meetings: Set<string> }> = {};

    records.forEach(r => {
      if (!stats[r.speaker]) {
        stats[r.speaker] = { count: 0, group: r.speakerGroup || 'N/A', meetings: new Set() };
      }
      stats[r.speaker].count++;
      stats[r.speaker].meetings.add(r.nameOfMeeting);
    });

    return Object.entries(stats)
      .map(([name, s]) => ({
        id: name,
        name,
        group: s.group,
        speechCount: s.count,
        meetingCount: s.meetings.size
      }))
      .sort((a, b) => b.speechCount - a.speechCount);
  }

  async getTimeSeriesData() {
    const records = await this.getAllRecords();
    const timeline: Record<string, number> = {};

    records.forEach(r => {
      const date = r.date;
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
