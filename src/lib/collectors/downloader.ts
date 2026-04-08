import fs from 'fs';
import path from 'path';

export class NDLDownloader {
  private readonly STORAGE_DIR = path.join(process.cwd(), 'data', 'raw', 'ndl');

  constructor() {
    if (!fs.existsSync(this.STORAGE_DIR)) {
      fs.mkdirSync(this.STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Saves a chunk of NDL data to a local JSON file
   */
  async saveChunk(query: string, data: any, page: number): Promise<string> {
    const safeQuery = query.replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/gi, '_').toLowerCase();
    const fileName = `${safeQuery}_p${page}_${Date.now()}.json`;
    const filePath = path.join(this.STORAGE_DIR, fileName);

    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }

  /**
   * Lists all downloaded files for a query
   */
  async listFiles(query: string): Promise<string[]> {
    const safeQuery = query.replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/gi, '_').toLowerCase();
    const files = await fs.promises.readdir(this.STORAGE_DIR);
    return files
      .filter(f => f.startsWith(safeQuery))
      .map(f => path.join(this.STORAGE_DIR, f));
  }
}
