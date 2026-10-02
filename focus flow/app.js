/**
 * FocusFlow — Main Application Logic
 */

// --- DEFAULT INITIAL STATE ---
const DEFAULT_STATE = {
  activeProfile: 'deepwork',
  taskAnchor: '',
  profiles: {
    deepwork: {
      id: 'deepwork',
      name: 'Deep Work',
      icon: '🧠',
      themeClass: 'theme-deepwork',
      links: [
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'ChatGPT', url: 'https://chatgpt.com' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
      ],
      notes: 'Focusing on core application logic and architectural fixes today.',
      tasks: [
        { id: 't1', text: 'Refactor state manager module', completed: false },
        { id: 't2', text: 'Write unit test cases', completed: true }
      ]
    },
    admin: {
      id: 'admin',
      name: 'Admin / Inbox',
      icon: '📥',
      themeClass: 'theme-admin',
      links: [
        { name: 'Gmail', url: 'https://mail.google.com' },
        { name: 'Calendar', url: 'https://calendar.google.com' },
        { name: 'Notion', url: 'https://notion.so' }
      ],
      notes: 'Inbox Zero target. Review calendar invites and update weekly deliverables.',
      tasks: [
        { id: 't3', text: 'Reply to client email regarding timeline', completed: false }
      ]
    },
    learning: {
      id: 'learning',
      name: 'Learning',
      icon: '📚',
      themeClass: 'theme-learning',
      links: [
        { name: 'MDN Docs', url: 'https://developer.mozilla.org' },
        { name: 'YouTube', url: 'https://youtube.com' }
      ],
      notes: 'Notes from TypeScript & Web Audio API docs...',
      tasks: []
    },
    creative: {
      id: 'creative',
      name: 'Creative Studio',
      icon: '🎨',
      themeClass: 'theme-creative',
      links: [
        { name: 'Figma', url: 'https://figma.com' },
        { name: 'Dribbble', url: 'https://dribbble.com' }
      ],
      notes: 'Drafting UI wireframes and color schemes.',
      tasks: []
    }
  },
  quickCaptures: [
    { id: 'c1', text: 'Remember to check Web Audio oscillator node disposal on stop.', context: 'deepwork', timestamp: '10:42 AM' }
  ],
  timer: {
    durationMinutes: 25,
    secondsLeft: 25 * 60,
    isRunning: false
  }
};

// State Object
let state = loadState();

// Audio Context Reference for Synthesizer
let audioCtx = null;
let noiseNode = null;
let gainNode = null;
let timerInterval = null;

// --- DOM ELEMENTS ---
const elements = {
  taskAnchorInput: document.getElementById('taskAnchorInput'),
  clearAnchorBtn: document.getElementById('clearAnchorBtn'),
  profilesContainer: document.getElementById('profilesContainer'),
  activeContextBadge: document.getElementById('activeContextBadge'),
  linksContainer: document.getElementById('linksContainer'),
  addLinkBtn: document.getElementById('addLinkBtn'),
  contextNotesArea: document.getElementById('contextNotesArea'),
  tabNotesBtn: document.getElementById('tabNotesBtn'),
  tabTasksBtn: document.getElementById('tabTasksBtn'),
  notesView: document.getElementById('notesView'),
  tasksView: document.getElementById('tasksView'),
  addTaskForm: document.getElementById('addTaskForm'),
  newTaskInput: document.getElementById('newTaskInput'),
  tasksList: document.getElementById('tasksList'),
  quickCaptureFeed: document.getElementById('quickCaptureFeed'),
  captureCount: document.getElementById('captureCount'),
  openQuickCaptureBtn: document.getElementById('openQuickCaptureBtn'),
  quickCaptureModal: document.getElementById('quickCaptureModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalCaptureInput: document.getElementById('modalCaptureInput'),
  saveCaptureBtn: document.getElementById('saveCaptureBtn'),
  timerDisplay: document.getElementById('timerDisplay'),
  timerProgressRing: document.getElementById('timerProgressRing'),
  toggleTimerBtn: document.getElementById('toggleTimerBtn'),
  resetTimerBtn: document.getElementById('resetTimerBtn'),
  ambientToggleBtn: document.getElementById('ambientToggleBtn'),
  ambientStatus: document.getElementById('ambientStatus'),
  ambientVolume: document.getElementById('ambientVolume'),
  exportDataBtn: document.getElementById('exportDataBtn')
};

// --- INITIALIZATION ---
function init() {
  applyTheme(state.profiles[state.activeProfile].themeClass);
  renderProfiles();
  renderWorkspace();
  renderQuickCaptures();
  setupEventListeners();
  updateTimerUI();

  if (state.taskAnchor) {
    elements.taskAnchorInput.value = state.taskAnchor;
    elements.clearAnchorBtn.classList.remove('hidden');
  }
}

// --- STATE MANAGEMENT ---
function loadState() {
  const saved = localStorage.getItem('focusflow_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load state', e);
    }
  }
  return DEFAULT_STATE;
}

function saveState() {
  localStorage.setItem('focusflow_state', JSON.stringify(state));
}

// --- THEME & CONTEXT SWITCHING ---
function switchContext(profileId) {
  state.activeProfile = profileId;
  const profile = state.profiles[profileId];
  applyTheme(profile.themeClass);
  renderProfiles();
  renderWorkspace();
  saveState();
}

function applyTheme(themeClass) {
  document.body.className = `min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-500 ${themeClass}`;
}

// --- RENDER FUNCTIONS ---
function renderProfiles() {
  elements.profilesContainer.innerHTML = '';
  Object.values(state.profiles).forEach(profile => {
    const isActive = profile.id === state.activeProfile;
    const btn = document.createElement('button');
    btn.className = `p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
      isActive 
        ? 'bg-slate-800/90 border-accent-primary ring-1 ring-accent-primary/50 shadow-lg' 
        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
    }`;
    btn.innerHTML = `
      <span class="text-xl">${profile.icon}</span>
      <span class="text-xs font-bold text-slate-200">${profile.name}</span>
      <span class="text-[10px] text-slate-500">${profile.links.length} links</span>
    `;
    btn.onclick = () => switchContext(profile.id);
    elements.profilesContainer.appendChild(btn);
  });
}

function renderWorkspace() {
  const profile = state.profiles[state.activeProfile];
  elements.activeContextBadge.textContent = profile.name;

  // Render Links
  elements.linksContainer.innerHTML = '';
  if (profile.links.length === 0) {
    elements.linksContainer.innerHTML = `<p class="text-xs text-slate-500 col-span-full py-2">No links added to this context yet.</p>`;
  } else {
    profile.links.forEach((link, idx) => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center justify-between group transition-all hover:translate-y-[-1px] shadow-sm';
      a.innerHTML = `
        <span class="text-xs font-semibold text-slate-300 group-hover:text-accent-primary transition-colors flex items-center gap-2">
          <span>🌐</span> ${link.name}
        </span>
        <button data-idx="${idx}" class="delete-link-btn text-xs text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">✕</button>
      `;
      elements.linksContainer.appendChild(a);
    });

    // Delete Link Event
    document.querySelectorAll('.delete-link-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-idx'));
        profile.links.splice(idx, 1);
        renderWorkspace();
        saveState();
      };
    });
  }

  // Render Notes
  elements.contextNotesArea.value = profile.notes || '';

  // Render Tasks
  renderTasks();
}

function renderTasks() {
  const profile = state.profiles[state.activeProfile];
  elements.tasksList.innerHTML = '';
  
  if (profile.tasks.length === 0) {
    elements.tasksList.innerHTML = `<li class="text-xs text-slate-500 py-2">No tasks for this context.</li>`;
    return;
  }

  profile.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-slate-950/40 border border-slate-800/80 px-3 py-2 rounded-lg text-xs';
    li.innerHTML = `
      <label class="flex items-center gap-2.5 cursor-pointer flex-1">
        <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="task-checkbox rounded border-slate-700 bg-slate-900 text-accent-primary focus:ring-0">
        <span class="${task.completed ? 'line-through text-slate-500' : 'text-slate-300'} font-medium">${task.text}</span>
      </label>
      <button data-id="${task.id}" class="delete-task-btn text-slate-600 hover:text-red-400 transition-colors px-1">✕</button>
    `;
    elements.tasksList.appendChild(li);
  });

  // Task Events
  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.onchange = (e) => {
      const taskId = e.target.getAttribute('data-id');
      const task = profile.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = e.target.checked;
        renderTasks();
        saveState();
      }
    };
  });

  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-id');
      profile.tasks = profile.tasks.filter(t => t.id !== taskId);
      renderTasks();
      saveState();
    };
  });
}

function renderQuickCaptures() {
  elements.quickCaptureFeed.innerHTML = '';
  elements.captureCount.textContent = `${state.quickCaptures.length} items`;

  if (state.quickCaptures.length === 0) {
    elements.quickCaptureFeed.innerHTML = `<p class="text-xs text-slate-500 italic py-2">No captured thoughts yet. Press Alt+N anywhere to quick capture.</p>`;
    return;
  }

  state.quickCaptures.slice().reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex flex-col gap-1.5 relative group';
    div.innerHTML = `
      <div class="flex items-center justify-between text-[10px] text-slate-500">
        <span class="uppercase tracking-wider font-bold text-accent-primary">${item.context}</span>
        <span>${item.timestamp}</span>
      </div>
      <p class="text-slate-200 whitespace-pre-wrap leading-relaxed">${item.text}</p>
      <button data-id="${item.id}" class="delete-capture-btn absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
    `;
    elements.quickCaptureFeed.appendChild(div);
  });

  document.querySelectorAll('.delete-capture-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      state.quickCaptures = state.quickCaptures.filter(c => c.id !== id);
      renderQuickCaptures();
      saveState();
    };
  });
}

// --- EVENT LISTENERS & INTERACTION ---
function setupEventListeners() {
  // Task Anchor Input
  elements.taskAnchorInput.addEventListener('input', (e) => {
    state.taskAnchor = e.target.value;
    elements.clearAnchorBtn.classList.toggle('hidden', !e.target.value);
    saveState();
  });

  elements.clearAnchorBtn.addEventListener('click', () => {
    state.taskAnchor = '';
    elements.taskAnchorInput.value = '';
    elements.clearAnchorBtn.classList.add('hidden');
    saveState();
  });

  // Notes Auto-save
  elements.contextNotesArea.addEventListener('input', (e) => {
    state.profiles[state.activeProfile].notes = e.target.value;
    saveState();
  });

  // Tab Switching (Notes / Tasks)
  elements.tabNotesBtn.onclick = () => {
    elements.tabNotesBtn.className = 'px-3 py-1 rounded-md font-medium text-slate-100 bg-slate-800 shadow-sm transition-all';
    elements.tabTasksBtn.className = 'px-3 py-1 rounded-md font-medium text-slate-400 hover:text-slate-200 transition-all';
    elements.notesView.classList.remove('hidden');
    elements.tasksView.classList.add('hidden');
  };

  elements.tabTasksBtn.onclick = () => {
    elements.tabTasksBtn.className = 'px-3 py-1 rounded-md font-medium text-slate-100 bg-slate-800 shadow-sm transition-all';
    elements.tabNotesBtn.className = 'px-3 py-1 rounded-md font-medium text-slate-400 hover:text-slate-200 transition-all';
    elements.tasksView.classList.remove('hidden');
    elements.notesView.classList.add('hidden');
  };

  // Add Task
  elements.addTaskForm.onsubmit = (e) => {
    e.preventDefault();
    const text = elements.newTaskInput.value.trim();
    if (text) {
      state.profiles[state.activeProfile].tasks.push({
        id: 't_' + Date.now(),
        text,
        completed: false
      });
      elements.newTaskInput.value = '';
      renderTasks();
      saveState();
    }
  };

  // Add Link
  elements.addLinkBtn.onclick = () => {
    const name = prompt('Enter link title (e.g. Figma Dashboard):');
    if (!name) return;
    let url = prompt('Enter URL (e.g. https://figma.com):');
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    state.profiles[state.activeProfile].links.push({ name, url });
    renderWorkspace();
    saveState();
  };

  // Modal Open/Close
  elements.openQuickCaptureBtn.onclick = openModal;
  elements.closeModalBtn.onclick = closeModal;

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape' && !elements.quickCaptureModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Modal Save
  elements.saveCaptureBtn.onclick = saveQuickCapture;
  elements.modalCaptureInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      saveQuickCapture();
    }
  });

  // Export Data JSON
  elements.exportDataBtn.onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `focusflow_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Timer Controls
  elements.toggleTimerBtn.onclick = toggleTimer;
  elements.resetTimerBtn.onclick = resetTimer;

  // Ambient Audio Controls
  elements.ambientToggleBtn.onclick = toggleAmbientAudio;
  elements.ambientVolume.oninput = (e) => {
    if (gainNode) {
      gainNode.gain.value = parseFloat(e.target.value);
    }
  };
}

function openModal() {
  elements.quickCaptureModal.classList.remove('hidden');
  elements.modalCaptureInput.value = '';
  elements.modalCaptureInput.focus();
}

function closeModal() {
  elements.quickCaptureModal.classList.add('hidden');
}

function saveQuickCapture() {
  const text = elements.modalCaptureInput.value.trim();
  if (text) {
    state.quickCaptures.push({
      id: 'c_' + Date.now(),
      text,
      context: state.profiles[state.activeProfile].name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderQuickCaptures();
    saveState();
    closeModal();
  }
}

// --- FOCUS TIMER ---
function toggleTimer() {
  if (state.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  state.timer.isRunning = true;
  elements.toggleTimerBtn.textContent = 'Pause Focus';
  elements.toggleTimerBtn.classList.replace('bg-accent-primary', 'bg-amber-500');

  timerInterval = setInterval(() => {
    if (state.timer.secondsLeft > 0) {
      state.timer.secondsLeft--;
      updateTimerUI();
    } else {
      pauseTimer();
      playTimerChime();
      alert('Focus session complete! Take a quick break.');
      resetTimer();
    }
  }, 1000);
}

function pauseTimer() {
  state.timer.isRunning = false;
  clearInterval(timerInterval);
  elements.toggleTimerBtn.textContent = 'Resume Focus';
  elements.toggleTimerBtn.classList.replace('bg-amber-500', 'bg-accent-primary');
}

function resetTimer() {
  pauseTimer();
  state.timer.secondsLeft = state.timer.durationMinutes * 60;
  elements.toggleTimerBtn.textContent = 'Start Focus';
  updateTimerUI();
}

function updateTimerUI() {
  const mins = Math.floor(state.timer.secondsLeft / 60);
  const secs = state.timer.secondsLeft % 60;
  elements.timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG Circumference progress
  const totalSeconds = state.timer.durationMinutes * 60;
  const progressFraction = state.timer.secondsLeft / totalSeconds;
  const circumference = 263.89;
  const offset = circumference * (1 - progressFraction);
  elements.timerProgressRing.style.strokeDashoffset = offset;
}

// --- SYNTHESIZED WEB AUDIO API (WHITE NOISE GENERATOR) ---
function toggleAmbientAudio() {
  if (noiseNode) {
    stopAmbientAudio();
  } else {
    startAmbientAudio();
  }
}

function startAmbientAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Create 2 seconds of stereo white noise buffer
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // Filter to soften white noise into ambient pink/brownish noise
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = parseFloat(elements.ambientVolume.value);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    elements.ambientToggleBtn.textContent = '🔊';
    elements.ambientStatus.textContent = 'Playing (Synthesized)';
    elements.ambientStatus.classList.replace('text-slate-500', 'text-emerald-400');
  } catch (err) {
    console.error('Web Audio API error:', err);
  }
}

function stopAmbientAudio() {
  if (noiseNode) {
    noiseNode.stop();
    noiseNode.disconnect();
    noiseNode = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  elements.ambientToggleBtn.textContent = '🔇';
  elements.ambientStatus.textContent = 'Off';
  elements.ambientStatus.classList.replace('text-emerald-400', 'text-slate-500');
}

function playTimerChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.error(e);
  }
}

// Start App
document.addEventListener('DOMContentLoaded', init);
