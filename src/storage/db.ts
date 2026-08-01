import Database from 'better-sqlite3';
import { CONFIG } from '../shared/config';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(CONFIG.DATABASE_PATH);
    dbInstance.pragma('foreign_keys = ON');
    initializeSchema(dbInstance);
  }
  return dbInstance;
}

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      source_type TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      metadata TEXT NOT NULL,
      ingested_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      from_concept_id TEXT NOT NULL,
      to_concept_id TEXT NOT NULL,
      type TEXT NOT NULL,
      FOREIGN KEY (from_concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
      FOREIGN KEY (to_concept_id) REFERENCES concepts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      concept_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      summary_text TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_concepts_name ON concepts(name);
    CREATE INDEX IF NOT EXISTS idx_relationships_from_concept_id ON relationships(from_concept_id);
    CREATE INDEX IF NOT EXISTS idx_relationships_to_concept_id ON relationships(to_concept_id);
  `);
}

if (require.main === module) {
  const db = getDatabase();
  console.log(`Database initialized successfully at ${CONFIG.DATABASE_PATH}`);
  db.close();
}
