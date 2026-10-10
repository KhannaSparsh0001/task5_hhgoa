/**
 * HabitGrid — GitHub-Style Heatmap Habit Tracker
 * Zero-asset, fully standalone Vanilla JavaScript implementation
 */

// Audio feedback system using Web Audio API (Zero external audio files)
class SoundFx {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playPop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.18);
      });
    } catch (e) {}
  }
}

const sound = new SoundFx();

// State Storage Keys
const STORAGE_KEY = 'habitgrid_data_v1';
const SETTINGS_KEY = 'habitgrid_settings_v1';

// Default Demo Habits for immediate wow-factor
const DEMO_HABITS = [
  {
    id: 'demo-1',
    name: 'Build in Public & Code',
    category: 'Coding',
    frequency: 7,
    color: 'emerald',
    createdAt: new Date().toISOString(),
    history: generateRealisticHistory(0.78, 42) // 78% consistency, 42 day current streak
  },
  {
    id: 'demo-2',
    name: 'Morning Workout & Cardio',
    category: 'Health',
    frequency: 5,
    color: 'cyan',
    createdAt: new Date().toISOString(),
    history: generateRealisticHistory(0.65, 14)
  },
  {
    id: 'demo-3',
    name: 'Read 20 Pages (Non-Fiction)',
    category: 'Learning',
    frequency: 7,
    color: 'purple',
    createdAt: new Date().toISOString(),
    history: generateRealisticHistory(0.55, 6)
  },
  {
    id: 'demo-4',
    name: 'Deep Meditation & Journaling',
    category: 'Mindset',
    frequency: 7,
    color: 'amber',
    createdAt: new Date().toISOString(),
    history: generateRealisticHistory(0.48, 3)
  }
];

// Helper to seed realistic heatmap history
function generateRealisticHistory(density, currentStreakDays) {
  const history = {};
  const today = new Date();
  
  // Fill past 365 days
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDateKey(d);

    if (i <= currentStreakDays) {
      // Guaranteed streak
      history[dateStr] = Math.floor(Math.random() * 3) + 2; // level 2, 3, or 4
    } else if (Math.random() < density) {
      const rand = Math.random();
      if (rand < 0.35) history[dateStr] = 1;
      else if (rand < 0.7) history[dateStr] = 2;
      else if (rand < 0.9) history[dateStr] = 3;
      else history[dateStr] = 4;
    }
  }
  return history;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Main Application Controller
class HabitGridApp {
  constructor() {
    this.habits = this.loadHabits();
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.weeksSpan = 52;
    this.activeColorChoice = 'emerald';
    this.editingHabitId = null;

    this.initDOMElements();
    this.attachEventListeners();
    this.render();
  }

  loadHabits() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Storage parse error:', e);
    }
    return DEMO_HABITS;
  }

  saveHabits() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.habits));
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  initDOMElements() {
    this.habitsListEl = document.getElementById('habitsList');
    this.todayChipsContainer = document.getElementById('todayChipsContainer');
    this.currentDateDisplay = document.getElementById('currentDateDisplay');
    this.searchInput = document.getElementById('searchInput');
    this.categoryFilters = document.getElementById('categoryFilters');
    this.timeRangeSelect = document.getElementById('timeRangeSelect');

    // Global Stats
    this.globalStreakEl = document.getElementById('globalCurrentStreak');
    this.globalTodayScoreEl = document.getElementById('globalTodayScore');
    this.globalTotalChecksEl = document.getElementById('globalTotalChecks');
    this.globalYearRateEl = document.getElementById('globalYearRate');

    // Modal elements
    this.modal = document.getElementById('habitModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.habitForm = document.getElementById('habitForm');
    this.habitNameInput = document.getElementById('habitName');
    this.habitCategoryInput = document.getElementById('habitCategory');
    this.habitFrequencyInput = document.getElementById('habitFrequency');
    this.editHabitIdInput = document.getElementById('editHabitId');
    this.colorPicker = document.getElementById('colorPicker');

    // Buttons
    this.newHabitBtn = document.getElementById('newHabitBtn');
    this.demoDataBtn = document.getElementById('demoDataBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.cancelModalBtn = document.getElementById('cancelModalBtn');

    // Floating Tooltip
    this.tooltip = document.getElementById('gridTooltip');
  }

  attachEventListeners() {
    // Sound toggle
    this.soundToggleBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      this.soundToggleBtn.classList.toggle('active', sound.enabled);
      this.soundToggleBtn.style.opacity = sound.enabled ? '1' : '0.4';
      if (sound.enabled) sound.playPop();
    });

    // Demo Data
    this.demoDataBtn.addEventListener('click', () => {
      this.habits = JSON.parse(JSON.stringify(DEMO_HABITS));
      this.saveHabits();
      sound.playSuccess();
      this.render();
    });

    // New Habit Modal
    this.newHabitBtn.addEventListener('click', () => this.openModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.cancelModalBtn.addEventListener('click', () => this.closeModal());

    // Color picker in modal
    this.colorPicker.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.colorPicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        this.activeColorChoice = swatch.dataset.color;
      });
    });

    // Habit form submit
    this.habitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveHabit();
    });

    // Search filter
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderHabitsList();
    });

    // Category filter tabs
    this.categoryFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      this.categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.selectedCategory = btn.dataset.category;
      this.renderHabitsList();
    });

    // Time range selector
    this.timeRangeSelect.addEventListener('change', (e) => {
      this.weeksSpan = parseInt(e.target.value, 10);
      this.renderHabitsList();
    });

    // Close modal on outside click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Keyboard ESC to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('open')) {
        this.closeModal();
      }
    });
  }

  openModal(habitToEdit = null) {
    if (habitToEdit) {
      this.modalTitle.textContent = 'Edit Habit';
      this.editingHabitId = habitToEdit.id;
      this.editHabitIdInput.value = habitToEdit.id;
      this.habitNameInput.value = habitToEdit.name;
      this.habitCategoryInput.value = habitToEdit.category;
      this.habitFrequencyInput.value = habitToEdit.frequency;
      this.activeColorChoice = habitToEdit.color || 'emerald';
    } else {
      this.modalTitle.textContent = 'Create New Habit';
      this.editingHabitId = null;
      this.editHabitIdInput.value = '';
      this.habitNameInput.value = '';
      this.habitCategoryInput.value = 'Coding';
      this.habitFrequencyInput.value = '7';
      this.activeColorChoice = 'emerald';
    }

    // Set selected swatch
    this.colorPicker.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.classList.toggle('selected', swatch.dataset.color === this.activeColorChoice);
    });

    this.modal.classList.add('open');
    this.habitNameInput.focus();
  }

  closeModal() {
    this.modal.classList.remove('open');
    this.editingHabitId = null;
    this.habitForm.reset();
  }

  handleSaveHabit() {
    const name = this.habitNameInput.value.trim();
    if (!name) return;

    const category = this.habitCategoryInput.value;
    const frequency = parseInt(this.habitFrequencyInput.value, 10);
    const color = this.activeColorChoice;

    if (this.editingHabitId) {
      const habit = this.habits.find(h => h.id === this.editingHabitId);
      if (habit) {
        habit.name = name;
        habit.category = category;
        habit.frequency = frequency;
        habit.color = color;
      }
    } else {
      const newHabit = {
        id: 'habit_' + Date.now(),
        name,
        category,
        frequency,
        color,
        createdAt: new Date().toISOString(),
        history: {}
      };
      this.habits.unshift(newHabit);
    }

    this.saveHabits();
    this.closeModal();
    sound.playSuccess();
    this.render();
  }

  deleteHabit(id) {
    if (confirm('Delete this habit and all its history?')) {
      this.habits = this.habits.filter(h => h.id !== id);
      this.saveHabits();
      sound.playPop();
      this.render();
    }
  }

  toggleDayStatus(habitId, dateKey) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    if (!habit.history) habit.history = {};

    const currentLevel = habit.history[dateKey] || 0;
    // Cycle: 0 -> 2 -> 4 -> 0
    let nextLevel = 0;
    if (currentLevel === 0) nextLevel = 2;
    else if (currentLevel <= 2) nextLevel = 4;
    else nextLevel = 0;

    if (nextLevel === 0) {
      delete habit.history[dateKey];
    } else {
      habit.history[dateKey] = nextLevel;
    }

    this.saveHabits();
    sound.playPop();
    this.renderGlobalStats();
    this.renderTodayChips();
    this.updateCardMetrics(habit);

    // Update specific cell visually without full DOM re-render for smooth 60fps interaction
    const cellEl = document.querySelector(`.heat-cell[data-habit="${habitId}"][data-date="${dateKey}"]`);
    if (cellEl) {
      cellEl.setAttribute('data-level', nextLevel);
    }
  }

  // Calculate streaks
  getHabitStats(habit) {
    const today = new Date();
    const todayKey = formatDateKey(today);
    const history = habit.history || {};

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalCheckIns = 0;

    // Check if today is completed
    const doneToday = !!history[todayKey];

    // Compute streaks over the last 365 days
    let checkDate = new Date(today);
    // If not completed today, start checking from yesterday for current streak
    if (!doneToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = formatDateKey(checkDate);
      if (history[key]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak & total checks
    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);

      if (history[key]) {
        totalCheckIns++;
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    const consistencyRate = Math.round((totalCheckIns / 365) * 100);

    return {
      currentStreak,
      longestStreak,
      totalCheckIns,
      consistencyRate,
      doneToday
    };
  }

  render() {
    this.renderDateHeader();
    this.renderGlobalStats();
    this.renderTodayChips();
    this.renderHabitsList();
  }

  renderDateHeader() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const todayFormatted = new Date().toLocaleDateString(undefined, options);
    this.currentDateDisplay.textContent = todayFormatted;
  }

  renderGlobalStats() {
    let maxCurrentStreak = 0;
    let totalChecks = 0;
    let todayDoneCount = 0;
    const todayKey = formatDateKey(new Date());

    this.habits.forEach(habit => {
      const stats = this.getHabitStats(habit);
      if (stats.currentStreak > maxCurrentStreak) maxCurrentStreak = stats.currentStreak;
      totalChecks += stats.totalCheckIns;
      if (habit.history && habit.history[todayKey]) todayDoneCount++;
    });

    const totalHabits = this.habits.length;
    const avgConsistency = totalHabits > 0
      ? Math.round(this.habits.reduce((acc, h) => acc + this.getHabitStats(h).consistencyRate, 0) / totalHabits)
      : 0;

    this.globalStreakEl.textContent = `${maxCurrentStreak} days`;
    this.globalTodayScoreEl.textContent = `${todayDoneCount} / ${totalHabits}`;
    this.globalTotalChecksEl.textContent = totalChecks.toLocaleString();
    this.globalYearRateEl.textContent = `${avgConsistency}%`;
  }

  renderTodayChips() {
    this.todayChipsContainer.innerHTML = '';
    const todayKey = formatDateKey(new Date());

    if (this.habits.length === 0) {
      this.todayChipsContainer.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem;">No habits created yet</span>';
      return;
    }

    this.habits.forEach(habit => {
      const isDone = !!(habit.history && habit.history[todayKey]);
      const chip = document.createElement('div');
      chip.className = `habit-chip ${isDone ? 'done' : ''}`;
      chip.innerHTML = `
        <span class="chip-check">${isDone ? '&#10003;' : ''}</span>
        <span>${escapeHtml(habit.name)}</span>
      `;
      chip.addEventListener('click', () => {
        this.toggleDayStatus(habit.id, todayKey);
      });
      this.todayChipsContainer.appendChild(chip);
    });
  }

  updateCardMetrics(habit) {
    const cardEl = document.getElementById(`habit-card-${habit.id}`);
    if (!cardEl) return;
    const stats = this.getHabitStats(habit);
    cardEl.querySelector('.streak-val').textContent = `${stats.currentStreak}d`;
    cardEl.querySelector('.best-val').textContent = `${stats.longestStreak}d`;
    cardEl.querySelector('.rate-val').textContent = `${stats.consistencyRate}%`;
  }

  renderHabitsList() {
    this.habitsListEl.innerHTML = '';

    const filtered = this.habits.filter(h => {
      const matchesCategory = this.selectedCategory === 'all' || h.category === this.selectedCategory;
      const matchesSearch = !this.searchQuery || 
        h.name.toLowerCase().includes(this.searchQuery) || 
        h.category.toLowerCase().includes(this.searchQuery);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      this.habitsListEl.innerHTML = `
        <div class="empty-state">
          <h3>No Habits Found</h3>
          <p>Create a new habit or reset filters to view your activity grids.</p>
          <button class="btn btn-primary" onclick="window.app.openModal()">Create Habit</button>
        </div>
      `;
      return;
    }

    filtered.forEach(habit => {
      const card = this.createHabitCard(habit);
      this.habitsListEl.appendChild(card);
    });
  }

  createHabitCard(habit) {
    const stats = this.getHabitStats(habit);
    const card = document.createElement('div');
    card.className = `habit-card ${habit.color || 'emerald'}-theme`;
    card.id = `habit-card-${habit.id}`;

    // Card Header
    const cardTop = document.createElement('div');
    cardTop.className = 'card-top';
    cardTop.innerHTML = `
      <div class="card-title-group">
        <span class="habit-badge">${escapeHtml(habit.category)}</span>
        <h3 class="habit-name">${escapeHtml(habit.name)}</h3>
      </div>
      <div class="card-metrics">
        <div class="metric-item">
          <span class="metric-label">Streak:</span>
          <span class="metric-value streak-val">${stats.currentStreak}d</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Best:</span>
          <span class="metric-value best-val">${stats.longestStreak}d</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Rate:</span>
          <span class="metric-value rate-val">${stats.consistencyRate}%</span>
        </div>
        <div class="card-actions">
          <button class="icon-action-btn edit-btn" title="Edit Habit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="icon-action-btn delete delete-btn" title="Delete Habit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    cardTop.querySelector('.edit-btn').addEventListener('click', () => this.openModal(habit));
    cardTop.querySelector('.delete-btn').addEventListener('click', () => this.deleteHabit(habit.id));

    // Heatmap Grid Container
    const heatmapWrapper = document.createElement('div');
    heatmapWrapper.className = 'heatmap-wrapper';

    const heatmapInner = document.createElement('div');
    heatmapInner.className = 'heatmap-inner';

    // Build Grid Data
    const { weeks, monthLabels } = this.calculateGridMatrix(this.weeksSpan);

    // Month Labels row
    const monthRow = document.createElement('div');
    monthRow.className = 'month-labels-row';
    monthRow.style.position = 'relative';

    monthLabels.forEach(ml => {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'month-label';
      labelSpan.textContent = ml.name;
      labelSpan.style.left = `${ml.weekIndex * 17}px`;
      monthRow.appendChild(labelSpan);
    });

    // Grid Body: Day labels column + Weeks Columns
    const gridBody = document.createElement('div');
    gridBody.className = 'grid-body';

    const dayLabelsCol = document.createElement('div');
    dayLabelsCol.className = 'day-labels-col';
    dayLabelsCol.innerHTML = `
      <span></span>
      <span>Mon</span>
      <span></span>
      <span>Wed</span>
      <span></span>
      <span>Fri</span>
      <span></span>
    `;

    const weeksColumns = document.createElement('div');
    weeksColumns.className = 'weeks-columns';

    weeks.forEach(week => {
      const weekCol = document.createElement('div');
      weekCol.className = 'week-column';

      week.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'heat-cell';

        if (day.inRange) {
          const level = (habit.history && habit.history[day.dateKey]) || 0;
          cell.setAttribute('data-level', level);
          cell.setAttribute('data-date', day.dateKey);
          cell.setAttribute('data-habit', habit.id);

          // Click to toggle
          cell.addEventListener('click', () => {
            this.toggleDayStatus(habit.id, day.dateKey);
          });

          // Hover Tooltip
          cell.addEventListener('mouseenter', (e) => this.showTooltip(e, habit, day.date, level));
          cell.addEventListener('mouseleave', () => this.hideTooltip());
        } else {
          cell.style.visibility = 'hidden';
        }

        weekCol.appendChild(cell);
      });

      weeksColumns.appendChild(weekCol);
    });

    gridBody.appendChild(dayLabelsCol);
    gridBody.appendChild(weeksColumns);

    heatmapInner.appendChild(monthRow);
    heatmapInner.appendChild(gridBody);
    heatmapWrapper.appendChild(heatmapInner);

    // Heatmap Footer with Legend
    const heatmapFooter = document.createElement('div');
    heatmapFooter.className = 'heatmap-footer';
    heatmapFooter.innerHTML = `
      <span>${stats.totalCheckIns} check-ins in the last year</span>
      <div class="legend">
        <span>Less</span>
        <div class="legend-cells">
          <div class="legend-cell" style="background-color: var(--cell-bg-empty)"></div>
          <div class="legend-cell" style="background-color: var(--${habit.color || 'emerald'}-1)"></div>
          <div class="legend-cell" style="background-color: var(--${habit.color || 'emerald'}-2)"></div>
          <div class="legend-cell" style="background-color: var(--${habit.color || 'emerald'}-3)"></div>
          <div class="legend-cell" style="background-color: var(--${habit.color || 'emerald'}-4)"></div>
        </div>
        <span>More</span>
      </div>
    `;

    card.appendChild(cardTop);
    card.appendChild(heatmapWrapper);
    card.appendChild(heatmapFooter);

    return card;
  }

  // Calculate 52-week grid matching GitHub exact 7-day columns
  calculateGridMatrix(numWeeks = 52) {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

    // End date is today
    // Total days = numWeeks * 7
    const weeks = [];
    const monthLabels = [];
    let lastMonth = -1;

    // Start date is aligned with the start of the first week (Sunday)
    const totalDays = (numWeeks - 1) * 7 + (todayDayOfWeek + 1);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    let currentDate = new Date(startDate);

    for (let w = 0; w < numWeeks; w++) {
      const week = [];

      for (let d = 0; d < 7; d++) {
        const dateKey = formatDateKey(currentDate);
        const inRange = currentDate <= today;

        // Check if month changed on Sunday of this week for month label
        if (d === 0 && inRange) {
          const curMonth = currentDate.getMonth();
          if (curMonth !== lastMonth) {
            monthLabels.push({
              weekIndex: w,
              name: currentDate.toLocaleString('default', { month: 'short' })
            });
            lastMonth = curMonth;
          }
        }

        week.push({
          date: new Date(currentDate),
          dateKey,
          inRange
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return { weeks, monthLabels };
  }

  showTooltip(e, habit, date, level) {
    const dateFormatted = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const statusText = level > 0 
      ? `Completed on ${dateFormatted}` 
      : `No activity on ${dateFormatted}`;

    this.tooltip.innerHTML = `<strong>${escapeHtml(habit.name)}</strong>: ${statusText}`;
    this.tooltip.classList.add('visible');

    const rect = e.target.getBoundingClientRect();
    const top = rect.top - 34;
    const left = rect.left + rect.width / 2;

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.transform = 'translateX(-50%)';
  }

  hideTooltip() {
    this.tooltip.classList.remove('visible');
  }
}

// Utility HTML escape
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HabitGridApp();
});
