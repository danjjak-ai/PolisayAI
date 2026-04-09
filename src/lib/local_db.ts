import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'polisay.db');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

let db: Database.Database;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    // Initialize tables
    initDb();
  }
  return db;
}

function initDb() {
  const d = new Database(DB_PATH);
  
  // Create tables if they don't exist
  d.exec(`
    CREATE TABLE IF NOT EXISTS politicians (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      party TEXT,
      position TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS speeches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      politician_id TEXT,
      content TEXT,
      source TEXT,
      sentiment_score REAL,
      policy_relevance REAL,
      summary TEXT,
      analysis_raw TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id)
    );

    CREATE TABLE IF NOT EXISTS topic_classifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      speech_id INTEGER,
      topic TEXT,
      confidence REAL,
      FOREIGN KEY (speech_id) REFERENCES speeches(id)
    );

    CREATE TABLE IF NOT EXISTS policy_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT UNIQUE NOT NULL,
      keywords TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert mock politicians and default categories if empty
  const count = d.prepare('SELECT count(*) as count FROM politicians').get() as any;
  if (count.count === 0) {
    const insert = d.prepare('INSERT INTO politicians (id, name, country, party, position) VALUES (?, ?, ?, ?, ?)');
    insert.run('1', '岸田 文雄', 'JP', '自民党', '衆議院議員');
    insert.run('2', '石破 茂', 'JP', '自민당', '衆議院議員');
    insert.run('3', '홍길동', 'KR', '국민의힘', '국회의원');
  }

  const catCount = d.prepare('SELECT count(*) as count FROM policy_categories').get() as any;
  if (catCount.count === 0) {
    const insertCat = d.prepare('INSERT INTO policy_categories (category_name, keywords) VALUES (?, ?)');
    insertCat.run('医療', '医療,病院,健康');
    insertCat.run('経済', '経済,賃金,物価');
    insertCat.run('デジタル', 'DX,デジタル,IT');
    insertCat.run('教育', '教育,学校,子供');
    insertCat.run('外交', '外交,安全保障,防衛');
  }
}
