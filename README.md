# To-Do App

A simple to-do list app. Add tasks, mark them done, filter by status, and clear completed items. Tasks are stored in a SQLite database on the server, so they're shared by anyone hitting the same server rather than tied to one browser.

## Run it

```
npm install
npm start
```

Then open http://localhost:3000. Requires Node.js 22.5 or newer (uses the built-in `node:sqlite` module, no extra database install needed).

## How it's built

- `server.js` — Express server: serves the frontend and exposes a REST API at `/api/tasks`.
- `db.js` — opens/creates `tasks.db` (SQLite file, created automatically, not committed to git).
- `public/` — the frontend (HTML/CSS/JS), talks to the API instead of browser storage.
