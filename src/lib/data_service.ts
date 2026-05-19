import { getDb } from './local_db';

export class DataService {
  /**
   * Saves analyzed speech data to the local SQLite database
   */
  async saveAnalyzedSpeech(data: {
    politician_id: string;
    content: string;
    source_type: string;
    analysis: any;
  }) {
    const db = getDb();
    
    try {
      // 1. Insert Speech
      const stmt = db.prepare(`
        INSERT INTO speeches (politician_id, content, source, sentiment_score, policy_relevance, summary, analysis_raw)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.politician_id,
        data.content,
        data.source_type,
        data.analysis.sentiment?.score || 0,
        data.analysis.score || 0,
        data.analysis.summary || '',
        JSON.stringify(data.analysis)
      );

      const speechId = result.lastInsertRowid;

      // 2. Insert Topics
      if (data.analysis.tags && Array.isArray(data.analysis.tags)) {
        const topicStmt = db.prepare('INSERT INTO topic_classifications (speech_id, topic, confidence) VALUES (?, ?, ?)');
        for (const tag of data.analysis.tags) {
          topicStmt.run(speechId, tag, 0.9);
        }
      }

      return { id: speechId, ...data };
    } catch (error) {
      console.error('[DataService] Error saving to SQLite:', error);
      throw error;
    }
  }

  /**
   * Ensures a politician profile exists in the database
   */
  async ensurePoliticianExists(id: string, name: string, party: string, country: string = 'JP') {
    const db = getDb();
    try {
      const politician = db.prepare('SELECT * FROM politicians WHERE id = ? OR name = ?').get(id, name);
      if (politician) {
        return politician as any;
      }
      
      db.prepare(`
        INSERT INTO politicians (id, name, country, party, position)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, name, country, party, '議員');
      
      return { id, name, country, party, position: '議員' };
    } catch (e) {
      console.error('[DataService] Error in ensurePoliticianExists:', e);
      return null;
    }
  }

  /**
   * Fetches a KOL's profile with their recent analyzed activity from SQLite
   */
  async getKOLProfile(id: string) {
    const db = getDb();
    
    try {
      const politician = db.prepare('SELECT * FROM politicians WHERE id = ?').get(id);
      if (!politician) return null;

      const speeches = db.prepare(`
        SELECT s.*, GROUP_CONCAT(t.topic) as topics
        FROM speeches s
        LEFT JOIN topic_classifications t ON s.id = t.speech_id
        WHERE s.politician_id = ?
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT 10
      `).all(id);

      return {
        ...(politician as any),
        recentActivity: speeches.map((s: any) => ({
          ...s,
          topics: s.topics ? s.topics.split(',') : []
        }))
      };
    } catch (error) {
      console.error('[DataService] Error fetching from SQLite:', error);
      return null;
    }
  }

  /**
   * List all politicians
   */
  async getAllPoliticians() {
    const db = getDb();
    return db.prepare('SELECT * FROM politicians ORDER BY name ASC').all();
  }
}
