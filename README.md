# GitPulse — Real-Time Developer Activity & Habit Intelligence

GitPulse is a real-time developer activity tracking and habit intelligence suite connected directly to live GitHub Public APIs and contribution feeds.

Built as part of the **Wispr Flow Development Showcase** using voice-directed workflows.

---

## ⚡ Live Features

- **Live GitHub API Profile Inspector**:
  - Enter any public GitHub username (e.g. `torvalds`, `shadcn`, `antfu`, or your own username).
  - Fetches genuine avatar, bio, follower count, company, location, and public repository counts.
- **Genuine 52-Week Contribution Matrix**:
  - Pulls real 365-day commit data via live GitHub contribution feeds.
  - Interactive hover tooltips showing actual contribution counts and timestamps for each date.
- **Real Developer Velocity & Streak Engine**:
  - Computes real consecutive active streaks backwards from today.
  - Calculates all-time longest streak in the current 365-day window.
  - Computes total annual commits and activity consistency percentage.
- **Public Activity Stream**:
  - Displays real recent public GitHub events (`PushEvent`, `PullRequestEvent`, `IssueCommentEvent`) and affected repositories in real-time.
- **Personal Habit Tracker**:
  - Log offline or local developer routines (e.g., LeetCode, System Design, Gym) alongside GitHub code velocity.
  - Web Audio API synthesized feedback sounds.

---

## 🚀 How to Run

1. Open `index.html` in any browser:
   - On Windows: Double-click `index.html` or run `start index.html` in PowerShell.
2. Enter any GitHub username in the top search box and hit **Fetch Live Data**.
3. Or click one of the quick test profile chips (`Linus Torvalds`, `shadcn`, `Anthony Fu`).
