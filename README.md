# Notes App

A simple notes/journal app. Create notes with a title, tags, and body text; search across all of them; edits autosave. Notes are stored in a SQLite database on the server.

## Run it

```
npm install
npm start
```

Then open http://localhost:3000. Requires Node.js 22.5 or newer (uses the built-in `node:sqlite` module, no extra database install needed).

## How it's built

- `server.js` — Express server: serves the frontend and exposes a REST API at `/api/notes` (supports `?search=` for filtering by title/body/tags).
- `db.js` — opens/creates `notes.db` (SQLite file, created automatically, not committed to git).
- `public/` — the frontend (HTML/CSS/JS): a note list sidebar plus an editor panel that autosaves as you type.
