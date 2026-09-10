import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/tasks", (req, res) => {
  const rows = db.prepare("SELECT id, text, done FROM tasks ORDER BY created_at ASC").all();
  res.json(rows.map((r) => ({ ...r, done: Boolean(r.done) })));
});

app.post("/api/tasks", (req, res) => {
  const text = String(req.body?.text ?? "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });

  const result = db.prepare("INSERT INTO tasks (text) VALUES (?)").run(text);
  const task = db.prepare("SELECT id, text, done FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ ...task, done: Boolean(task.done) });
});

app.patch("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT id FROM tasks WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "task not found" });

  const done = Boolean(req.body?.done);
  db.prepare("UPDATE tasks SET done = ? WHERE id = ?").run(done ? 1 : 0, id);
  res.json({ id: Number(id), done });
});

app.delete("/api/tasks/completed", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE done = 1").run();
  res.status(204).end();
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  if (result.changes === 0) return res.status(404).json({ error: "task not found" });
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`todo-app listening on http://localhost:${PORT}`);
});
