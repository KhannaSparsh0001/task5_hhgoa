# HabitGrid — Privacy-First Local-First Habit & Streak Tracker

HabitGrid is a modern, dark-mode personal habit tracker featuring GitHub-style contribution activity heatmaps, streak analytics, and zero-telemetry local sandbox persistence.

Built as part of the **Wispr Flow Development Showcase** using voice-directed workflows.

---

## 🔒 100% Privacy-First & Local-First

- **Zero Cloud / Zero Telemetry**: Your habits and daily routines never touch external servers or third-party trackers.
- **Persistent Local Sandbox**: All records are stored client-side via browser `localStorage` (with JSON export backup support).
- **Offline Capable**: Functions seamlessly without an active internet connection.

---

## ✨ Features

- **GitHub-Style Contribution Heatmaps**:
  - Interactive 52-week, 26-week, and 12-week commit activity matrix grids.
  - Click any cell in the grid to log or toggle completion for that day.
  - Hover tooltips showing exact completion dates and status.
- **Streak & Consistency Analytics**:
  - Real active streak calculator (counting backwards from today).
  - All-time longest streak in the current 365-day window.
  - Annual consistency rate percentage.
  - Total cumulative check-in counter.
- **"Quick Daily Log" Bar**:
  - One-click daily toggle chips for morning and evening habit check-ins.
- **Data Portability**:
  - 1-click JSON export to backup or transfer your habit vault.
- **Synthesized Audio Feedback**:
  - Subtle feedback sounds generated in-browser with the Web Audio API.

---

## 🚀 How to Run

### Method 1: Direct Browser (No Server Needed)
Double click `index.html` or run:
```powershell
start index.html
```

### Method 2: Python Local Server
```powershell
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

### Method 3: Node.js (npx serve)
```powershell
npx serve .
```

---

## 🎙️ Built with Wispr Flow

Created using voice-driven development with [Wispr Flow](https://wisprflow.ai), turning spoken specifications and prompts into a production-ready application.
