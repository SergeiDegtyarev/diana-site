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
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    work_title TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
const createInquiryStatement = db.prepare(`
  INSERT INTO inquiries (name, email, message, work_title, status)
  VALUES (@name, @email, @message, @workTitle, 'new')
`);
const listInquiriesStatement = db.prepare(`
  SELECT
    id,
    name,
    email,
    message,
    work_title AS workTitle,
    status,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM inquiries
  ORDER BY datetime(created_at) DESC, id DESC
`);
const updateInquiryStatusStatement = db.prepare(`
  UPDATE inquiries
  SET status = @status, updated_at = CURRENT_TIMESTAMP
  WHERE id = @id
`);
const deleteInquiryStatement = db.prepare("DELETE FROM inquiries WHERE id = ?");

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

export function createInquiry(inquiry) {
  const result = createInquiryStatement.run(inquiry);
  return { id: result.lastInsertRowid, ...inquiry, status: "new" };
}

export function listInquiries() {
  return listInquiriesStatement.all();
}

export function updateInquiryStatus(id, status) {
  updateInquiryStatusStatement.run({ id, status });
}

export function deleteInquiry(id) {
  deleteInquiryStatement.run(id);
}
