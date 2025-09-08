// Simple To-Do App with LocalStorage persistence

(function () {
  const STORAGE_KEY = 'todo_tasks_v1';

  /** @typedef {{ id: string, text: string, status: 'pending'|'completed', createdAt: string, completedAt?: string }} Task */

  /** @type {Task[]} */
  let tasks = [];

  const inputEl = () => document.getElementById('taskInput');
  const addBtnEl = () => document.getElementById('addBtn');
  const pendingListEl = () => document.getElementById('pendingTasks');
  const completedListEl = () => document.getElementById('completedTasks');

  function generateId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks:', err);
    }
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error('Failed to load tasks, starting fresh:', err);
      return [];
    }
  }

  function render() {
    // Clear lists
    pendingListEl().innerHTML = '';
    completedListEl().innerHTML = '';

    for (const task of tasks) {
      const li = createTaskItem(task);
      if (task.status === 'pending') {
        pendingListEl().appendChild(li);
      } else {
        completedListEl().appendChild(li);
      }
    }
  }

  function addTaskFromInput() {
    const input = inputEl();
    const text = String(input.value || '').trim();
    if (!text) {
      alert('Enter a task');
      return;
    }
    const now = new Date();
    const task = {
      id: generateId(),
      text,
      status: 'pending',
      createdAt: now.toLocaleString(),
    };
    tasks.push(task);
    saveTasks();
    input.value = '';
    render();
  }

  function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    task.status = 'completed';
    task.completedAt = new Date().toLocaleString();
    saveTasks();
    render();
  }

  function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newText = prompt('Edit your task:', task.text);
    if (newText && newText.trim()) {
      task.text = newText.trim();
      saveTasks();
      render();
    }
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    render();
  }

  function createTaskItem(task) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const content = document.createElement('div');
    const timeLabel = task.status === 'pending' ? 'Added' : 'Completed';
    const timeValue = task.status === 'pending' ? task.createdAt : (task.completedAt || '');
    content.innerHTML = `<strong>${escapeHtml(task.text)}</strong><small>${timeLabel}: ${escapeHtml(timeValue)}</small>`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    if (task.status === 'pending') {
      const completeBtn = document.createElement('button');
      completeBtn.innerHTML = '✔';
      completeBtn.className = 'complete-btn';
      completeBtn.addEventListener('click', () => completeTask(task.id));
      actions.appendChild(completeBtn);
    }

    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✎';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => editTask(task.id));
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    actions.appendChild(deleteBtn);

    li.appendChild(content);
    li.appendChild(actions);
    return li;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function init() {
    tasks = loadTasks();
    render();

    addBtnEl().addEventListener('click', addTaskFromInput);
    inputEl().addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTaskFromInput();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


