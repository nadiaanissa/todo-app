const form = document.getElementById("add-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const count = document.getElementById("count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter-btn");

let tasks = [];
let filter = "all";

async function api(path, options) {
  const res = await fetch(`/api/tasks${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok && res.status !== 404) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

async function loadTasks() {
  tasks = await api("");
  render();
}

function render() {
  const visible = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "completed") return task.done;
    return true;
  });

  list.innerHTML = "";
  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id, checkbox.checked));

    const span = document.createElement("span");
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  });

  emptyState.hidden = tasks.length > 0;
  const remaining = tasks.filter((t) => !t.done).length;
  count.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
}

async function addTask(text) {
  const task = await api("", { method: "POST", body: JSON.stringify({ text }) });
  tasks.push(task);
  render();
}

async function toggleTask(id, done) {
  await api(`/${id}`, { method: "PATCH", body: JSON.stringify({ done }) });
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = done;
  render();
}

async function deleteTask(id) {
  await api(`/${id}`, { method: "DELETE" });
  tasks = tasks.filter((t) => t.id !== id);
  render();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.focus();
  await addTask(text);
});

clearCompletedBtn.addEventListener("click", async () => {
  await api("/completed", { method: "DELETE" });
  tasks = tasks.filter((t) => !t.done);
  render();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

loadTasks();
