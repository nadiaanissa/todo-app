const noteList = document.getElementById("note-list");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const newNoteBtn = document.getElementById("new-note-btn");

const editorEmpty = document.getElementById("editor-empty");
const editorForm = document.getElementById("editor-form");
const titleInput = document.getElementById("title-input");
const tagsInput = document.getElementById("tags-input");
const bodyInput = document.getElementById("body-input");
const savedState = document.getElementById("saved-state");
const deleteBtn = document.getElementById("delete-btn");

let notes = [];
let selectedId = null;
let saveTimer = null;

async function api(path, options) {
  const res = await fetch(`/api/notes${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok && res.status !== 404) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

function snippet(body) {
  const oneLine = body.replace(/\s+/g, " ").trim();
  return oneLine.length > 60 ? oneLine.slice(0, 60) + "…" : oneLine;
}

async function loadNotes(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  notes = await api(query);
  renderList();
}

function renderList() {
  noteList.innerHTML = "";
  notes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-item" + (note.id === selectedId ? " active" : "");

    const title = document.createElement("div");
    title.className = "note-title";
    title.textContent = note.title || "Untitled";

    const sub = document.createElement("div");
    sub.className = "note-snippet";
    sub.textContent = snippet(note.body);

    li.append(title, sub);
    li.addEventListener("click", () => selectNote(note.id));
    noteList.appendChild(li);
  });

  emptyState.hidden = notes.length > 0;
}

function selectNote(id) {
  selectedId = id;
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  editorEmpty.hidden = true;
  editorForm.hidden = false;
  titleInput.value = note.title;
  tagsInput.value = note.tags;
  bodyInput.value = note.body;
  savedState.textContent = "";
  renderList();
}

async function createNote() {
  const note = await api("", {
    method: "POST",
    body: JSON.stringify({ title: "Untitled", body: "", tags: "" }),
  });
  notes.unshift(note);
  selectNote(note.id);
  titleInput.focus();
  titleInput.select();
}

function scheduleSave() {
  savedState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCurrentNote, 500);
}

async function saveCurrentNote() {
  if (selectedId == null) return;
  const title = titleInput.value.trim() || "Untitled";
  const updated = await api(`/${selectedId}`, {
    method: "PATCH",
    body: JSON.stringify({ title, body: bodyInput.value, tags: tagsInput.value }),
  });
  const idx = notes.findIndex((n) => n.id === selectedId);
  if (idx !== -1) notes[idx] = updated;
  savedState.textContent = "Saved";
  renderList();
}

async function deleteCurrentNote() {
  if (selectedId == null) return;
  await api(`/${selectedId}`, { method: "DELETE" });
  notes = notes.filter((n) => n.id !== selectedId);
  selectedId = null;
  editorForm.hidden = true;
  editorEmpty.hidden = false;
  renderList();
}

newNoteBtn.addEventListener("click", createNote);
deleteBtn.addEventListener("click", deleteCurrentNote);

[titleInput, tagsInput, bodyInput].forEach((el) => {
  el.addEventListener("input", scheduleSave);
});

let searchTimer = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadNotes(searchInput.value.trim()), 250);
});

loadNotes();
