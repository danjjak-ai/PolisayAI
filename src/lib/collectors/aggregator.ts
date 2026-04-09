import fs from 'fs';
import path from 'path';
import { getDb } from '../local_db';
import { NDLDownloader } from './downloader';

export interface SpeechRecord {
  speechID: string;
  speaker: string;
  speakerGroup: string;
  date: string;
  speech: string;
  nameOfMeeting: string;
}

export class DataAggregator {
  private readonly downloader = new NDLDownloader();

  /** Load ALL raw speech records from every JSON file on disk, deduplicated by speechID. */
  async getAllRecords(): Promise<SpeechRecord[]> {
    const files = await this.downloader.listAllFiles();
    const uniqueRecords = new Map<string, SpeechRecord>();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        if (data.speechRecord && Array.isArray(data.speechRecord)) {
          for (const r of data.speechRecord) {
            const key = r.speechID || r.speech; // Fallback to content if ID missing
            if (key) {
               uniqueRecords.set(key, r);
            }
          }
        }
      } catch (e) {
        console.error(`[Aggregator] Error reading ${file}:`, e);
      }
    }
    return Array.from(uniqueRecords.values());
  }

  /** Speaker participation stats merged with SQLite analyzed data */
  async getSpeakerStats() {
    const records = await this.getAllRecords();
    const stats: Record<string, { count: number; group: string; meetings: Set<string>; isAnalyzed: boolean }> = {};

    for (const r of records) {
      const name = r.speaker || '不明';
      if (!stats[name]) {
        stats[name] = { count: 0, group: r.speakerGroup || 'N/A', meetings: new Set(), isAnalyzed: false };
      }
      stats[name].count++;
      if (r.nameOfMeeting) stats[name].meetings.add(r.nameOfMeeting);
    }

    // Merge with SQLite analyzed speeches
    try {
      const db = getDb();
      const rows = db.prepare(`
        SELECT p.name, p.party AS grp, COUNT(s.id) AS cnt
        FROM politicians p
        JOIN speeches s ON p.id = s.politician_id
        GROUP BY p.id
      `).all() as any[];

      for (const row of rows) {
        if (!stats[row.name]) {
          stats[row.name] = { count: 0, group: row.grp || 'N/A', meetings: new Set(), isAnalyzed: false };
        }
        stats[row.name].count += row.cnt;
        stats[row.name].isAnalyzed = true;
      }
    } catch (e) {
      console.warn('[Aggregator] SQLite speaker stats unavailable');
    }

    return Object.entries(stats)
      .filter(([name]) => !!name && name !== '不明' && name !== 'undefined')
      .map(([name, s]) => ({
        id: name,
        name,
        group: s.group,
        speechCount: s.count,
        meetingCount: s.meetings.size,
        isAnalyzed: s.isAnalyzed,
      }))
      .sort((a, b) => b.speechCount - a.speechCount);
  }

  /** Dashboard summary */
  async getSummary() {
    const records = await this.getAllRecords();
    const speakers = new Set(records.map(r => r.speaker).filter(Boolean));
    const meetings = new Set(records.map(r => r.nameOfMeeting).filter(Boolean));

    // Baseline keywords + dynamically discovered ones from SQLite
    const keywords = new Set(['医療', 'DX', '経済', '環境', '教育', 'デジタル', '安全保障', '税制', '社会保障', '外交']);
    const topicMap: Record<string, number> = {};

    try {
      const db = getDb();
      // Add dynamically discovered AI topics
      const dynamicTopics = db.prepare('SELECT DISTINCT topic FROM topic_classifications').all() as any[];
      for (const row of dynamicTopics) {
        if (row.topic) keywords.add(row.topic);
      }
    } catch (_) {}

    // Count mentions across raw data
    for (const kw of keywords) {
      const count = records.filter(r => r.speech?.includes(kw)).length;
      if (count > 0) {
        topicMap[kw] = count;
      }
    }

    try {
      const db = getDb();
      // Add counts from AI analyzed records
      const rows = db.prepare(`SELECT topic, COUNT(*) AS cnt FROM topic_classifications GROUP BY topic`).all() as any[];
      for (const r of rows) {
        topicMap[r.topic] = (topicMap[r.topic] || 0) + r.cnt;
      }
    } catch (_) {}

    const topTopics = Object.entries(topicMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const sorted = [...records].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return {
      totalRecords: records.length,
      totalSpeakers: speakers.size,
      totalMeetings: meetings.size,
      topTopics,
      recentDate: sorted[0]?.date || null,
      // Gap analysis needs keyword supply score for top topics
      keywordSupply: topicMap,
    };
  }

  /** Time-series: speech count per date */
  async getTimeSeriesData() {
    const records = await this.getAllRecords();
    const timeline: Record<string, number> = {};

    for (const r of records) {
      if (!r.date) continue;
      const date = r.date.substring(0, 10);
      timeline[date] = (timeline[date] || 0) + 1;
    }

    // Add SQLite speeches
    try {
      const db = getDb();
      const rows = db.prepare(`
        SELECT date(created_at) AS d, COUNT(*) AS cnt
        FROM speeches GROUP BY d ORDER BY d ASC
      `).all() as any[];
      for (const r of rows) {
        timeline[r.d] = (timeline[r.d] || 0) + r.cnt;
      }
    } catch (_) {}

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Topic trend: per-keyword count over time (for Policy Tracking chart) */
  async getTopicTrends() {
    const summary = await this.getSummary(); // uses the deduped records under the hood
    // Use the dynamic top topics from summary
    const dynamicKeywords = summary.topTopics.map((t: any) => t.name);
    // fallback if none
    const keywords = dynamicKeywords.length > 0 ? dynamicKeywords : ['医療', 'DX', '経済', '環境', '教育', 'デジタル'];

    const records = await this.getAllRecords();
    const byDate: Record<string, Record<string, number>> = {};

    for (const r of records) {
      if (!r.date) continue;
      const date = r.date.substring(0, 7); // YYYY-MM grouping
      if (!byDate[date]) {
        byDate[date] = {};
        for (const kw of keywords) byDate[date][kw] = 0;
      }
      for (const kw of keywords) {
        if (r.speech?.includes(kw)) {
          byDate[date][kw]++;
        }
      }
    }

    return Object.entries(byDate)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Get raw unanalyzed speeches by a specific speaker */
  async getRawSpeechesBySpeaker(speaker: string, limit: number = 5): Promise<SpeechRecord[]> {
    const records = await this.getAllRecords();
    const filtered = records.filter(r => r.speaker === speaker).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return filtered.slice(0, limit);
  }
}

