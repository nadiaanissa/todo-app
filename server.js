import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function parseTags(tags) {
  return String(tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
}

app.get("/api/notes", (req, res) => {
  const search = String(req.query.search ?? "").trim().toLowerCase();
  const rows = db.prepare("SELECT * FROM notes ORDER BY updated_at DESC").all();
  const filtered = search
    ? rows.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.body.toLowerCase().includes(search) ||
          n.tags.toLowerCase().includes(search)
      )
    : rows;
  res.json(filtered);
});

app.get("/api/notes/:id", (req, res) => {
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  if (!note) return res.status(404).json({ error: "note not found" });
  res.json(note);
});

app.post("/api/notes", (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  const body = String(req.body?.body ?? "");
  const tags = parseTags(req.body?.tags);
  if (!title) return res.status(400).json({ error: "title is required" });

  const result = db
    .prepare("INSERT INTO notes (title, body, tags) VALUES (?, ?, ?)")
    .run(title, body, tags);
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(note);
});

app.patch("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "note not found" });

  const title = req.body?.title !== undefined ? String(req.body.title).trim() : existing.title;
  const body = req.body?.body !== undefined ? String(req.body.body) : existing.body;
  const tags = req.body?.tags !== undefined ? parseTags(req.body.tags) : existing.tags;
  if (!title) return res.status(400).json({ error: "title is required" });

  db.prepare(
    "UPDATE notes SET title = ?, body = ?, tags = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(title, body, tags, id);
  res.json(db.prepare("SELECT * FROM notes WHERE id = ?").get(id));
});

app.delete("/api/notes/:id", (req, res) => {
  const result = db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "note not found" });
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`notes-app listening on http://localhost:${PORT}`);
});
