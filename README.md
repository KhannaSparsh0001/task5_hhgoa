# HabitGrid — GitHub-Style Habit & Streak Tracker

HabitGrid is a modern, dark-mode habit tracking dashboard featuring GitHub-inspired 52-week activity contribution heatmaps, streak analytics, and zero-asset synthesized sound effects.

Built as part of the **Wispr Flow Development Showcase** using voice-directed workflows.

---

## ✨ Features

- **GitHub-Style Contribution Heatmaps**:
  - Exact 52-week, 26-week, and 12-week commit-style activity matrix grids.
  - Interactive cells: click any cell on the grid to log or toggle completion for that day.
  - Interactive hover tooltips displaying date and completion status.
  - GitHub-authentic month labels and day-of-week rows (`Mon`, `Wed`, `Fri`).
- **Real-Time Streak & Consistency Analytics**:
  - Current active streak counter.
  - All-time best longest streak tracker.
  - 365-day annual consistency percentage.
  - Total cumulative check-ins counter.
- **"Today's Focus" Quick Check-in Bar**:
  - One-click daily toggle chips for rapid morning/evening habit logging.
- **Multi-Palette Theming**:
  - GitHub Emerald (`#39d353`)
  - Cyber Cyan (`#38bdf8`)
  - Electric Violet (`#c084fc`)
  - Sunset Amber (`#fbbf24`)
  - Neon Rose (`#fb7185`)
- **Zero Asset Conflicts**:
  - 100% self-contained HTML, CSS, and Vanilla JavaScript.
  - Audio feedback synthesized directly in-browser using the **Web Audio API** (no missing audio assets or CDN dependencies).
  - Pure SVG vector icons.
- **Data Persistence & Demo Mode**:
  - Auto-saves all habits and history in browser `localStorage`.
  - **"Load Demo Data"** button to instantly populate realistic active streaks and heatmaps for presentations and screen recording.

---

## 🚀 Quick Start / How to Run

No build step or Node packages required!

1. Clone or download the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
2. Open `index.html` in any modern web browser:
   - On Windows: Double-click `index.html` or run `start index.html` in PowerShell/CMD.
   - Or use VS Code Live Server / Python simple server:
     ```bash
     python -m http.server 8000
     ```

---

## 🛠️ Tech Stack

- **Markup**: Semantic HTML5
- **Styling**: Vanilla CSS (CSS Variables, Glassmorphism, CSS Grid & Flexbox, Ambient Glows)
- **Logic**: Vanilla JavaScript (ES6+ Classes, Date Matrix Math, LocalStorage State)
- **Audio**: Web Audio API Oscillator & Gain Nodes

---

## 🎙️ Built with Wispr Flow

This project was created using voice-driven development with [Wispr Flow](https://wisprflow.ai), turning spoken design requirements and architectural prompts into a functional application.
