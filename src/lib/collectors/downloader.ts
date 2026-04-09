import fs from 'fs';
import path from 'path';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface CollectionInfo {
  id: string;
  source: string;
  query: string;
  from: string;
  until: string;
}

export class NDLDownloader {
  private readonly STORAGE_DIR = path.join(process.cwd(), 'data', 'raw', 'ndl');

  constructor() {
    if (!fs.existsSync(this.STORAGE_DIR)) {
      fs.mkdirSync(this.STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Build a canonical, FS-safe prefix for a collection unit.
   * Format: {SOURCE}_{safeQuery}_{from|any}_{until|any}
   */
  static buildPrefix(source: string, query: string, from?: string, until?: string): string {
    const safeQuery = query.replace(/[\\/:*?"<>|]/g, '_');
    return `${source}_${safeQuery}_${from || 'any'}_${until || 'any'}`;
  }

  /** Save one batch of data as a JSON chunk file */
  async saveChunk(prefix: string, data: any, page: number): Promise<string> {
    const safeName = prefix.replace(/[\\/:*?"<>|]/g, '_');
    const fileName = `${safeName}_p${page}_${Date.now()}.json`;
    const filePath = path.join(this.STORAGE_DIR, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
  }

  /** List all files matching a specific collection prefix */
  async listFiles(prefix: string): Promise<string[]> {
    if (!fs.existsSync(this.STORAGE_DIR)) return [];
    const safePrefix = prefix.replace(/[\\/:*?"<>|]/g, '_');
    const files = await fs.promises.readdir(this.STORAGE_DIR);
    return files
      .filter(f => f.startsWith(safePrefix) && f.endsWith('.json'))
      .map(f => path.join(this.STORAGE_DIR, f));
  }

  /** List ALL JSON files (for full-dataset operations like Dashboard / KOL Board) */
  async listAllFiles(): Promise<string[]> {
    if (!fs.existsSync(this.STORAGE_DIR)) return [];
    const files = await fs.promises.readdir(this.STORAGE_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(this.STORAGE_DIR, f));
  }

  /**
   * List unique collection units discovered from file naming.
   * Supports both:
   *   NEW: {SOURCE}_{query}_{YYYY-MM-DD|any}_{YYYY-MM-DD|any}_p{n}_{ts}.json
   *   OLD: {SOURCE}_{encodedQuery}_p{n}_{ts}.json  (from/until = 'any')
   */
  async listCollections(): Promise<CollectionInfo[]> {
    if (!fs.existsSync(this.STORAGE_DIR)) return [];
    const files = await fs.promises.readdir(this.STORAGE_DIR);
    const seen = new Map<string, CollectionInfo>();

    for (const f of files) {
      if (!f.endsWith('.json')) continue;

      // Match suffix: _p{digits}_{timestamp}.json
      const match = f.match(/^(.+)_p(\d+)_(\d+)\.json$/);
      if (!match) continue;

      const prefix = match[1]; // everything before _p{n}_{ts}
      if (seen.has(prefix)) continue;

      // Parse prefix: {source}_{...segments}
      // Detect new format: last 2 segments are date (YYYY-MM-DD) or 'any'
      const segments = prefix.split('_');
      if (segments.length < 2) continue;

      const source = segments[0].toUpperCase();
      const last = segments[segments.length - 1];
      const secondLast = segments[segments.length - 2];

      let from: string;
      let until: string;
      let querySegs: string[];

      const isDate = (s: string) => DATE_RE.test(s) || s === 'any';

      if (isDate(last) && isDate(secondLast)) {
        // NEW format: source_query_from_until
        from = secondLast === 'any' ? '전체' : secondLast;
        until = last === 'any' ? '전체' : last;
        querySegs = segments.slice(1, segments.length - 2);
      } else {
        // OLD format: source_encodedQuery (no date segments)
        from = '전체';
        until = '전체';
        querySegs = segments.slice(1);
      }

      const query = querySegs.join('_').replace(/_+$/, '') || '(전체)';

      seen.set(prefix, { id: prefix, source, query, from, until });
    }

    return Array.from(seen.values()).sort((a, b) => a.id.localeCompare(b.id));
  }
}
