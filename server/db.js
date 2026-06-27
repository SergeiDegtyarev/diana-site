import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_SITE_CONTENT } from "../src/data/siteContent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dbPath = process.env.SQLITE_PATH || path.join(rootDir, "data", "site.sqlite");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const getContentStatement = db.prepare("SELECT value FROM site_content WHERE key = ?");
const saveContentStatement = db.prepare(`
  INSERT INTO site_content (key, value, updated_at)
  VALUES (@key, @value, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP
`);

export function getSiteContent() {
  const row = getContentStatement.get("main");
  if (!row) {
    saveSiteContent(DEFAULT_SITE_CONTENT);
    return DEFAULT_SITE_CONTENT;
  }

  try {
    return JSON.parse(row.value);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function saveSiteContent(content) {
  saveContentStatement.run({
    key: "main",
    value: JSON.stringify(content),
  });
}
