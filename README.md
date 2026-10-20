# ⚽ MatchMind AI

### AI-Powered Football Match Intelligence Platform

MatchMind AI is an explainable football match intelligence dashboard that transforms football match records and event data into visual analytics, automated tactical recommendations, player-level performance metrics, interactive multi-factor filters, and head-to-head comparisons.

---

## 🚀 Key Features

1. **Dual Match Dataset Architecture:**
   - **Match 1 (Demo Showcase):** Manchester City 2 – 1 Arsenal (*Fictional sample events for baseline testing and rule validation*).
   - **Match 2 (Illustrative Premier League Record):** Arsenal 1 – 0 Manchester City (*Gameweek 8, 8 October 2023 at Emirates Stadium; verified official box score with illustrative key-event sample*).
2. **Dynamic Dataset Switcher:** One-click toggle between demonstration showcase and real-world match record with distinct visual badges (`DEMO DATA` vs `ILLUSTRATIVE REAL RECORD`).
3. **Match Centre & Scoreboard:** Official scores, possession share, total shots, shots on target, and completed pass tracking.
4. **Automated Match Insights:** Deterministic, rule-based observations highlighting possession dominance, attacking efficiency, and conversion margins.
5. **Visual Match Analytics:**
   - Interactive **Shot Timeline** (0′ to 90′) with team color-coding and goal icons.
   - **Team Performance Comparison** bars for shots, shots on target, and goals.
   - **Passing Accuracy** visual tracking.
6. **Tactical Intelligence Engine:** Automated diagnosis of attacking volume and ball circulation safety with actionable coaching recommendations.
7. **Player Performance Analytics:** Individual player statistics for passes attempted/completed, pass accuracy percentage (with zero-division protection when no passes are attempted), total shots, shots on target, goals, and conversion percentage.
8. **Player Rankings & Leaderboards:** Leaderboards for Top Goalscorers, Shot Threats, and Pass Completers with transparent tie-breaker criteria and team filter controls.
9. **Head-to-Head Player Comparison:** Interactive comparison tool comparing any two players side-by-side with automated observation highlights.
10. **Interactive Multi-Factor Match Filters:** Live filtering by Team, Player, Event Type (Passes/Shots), and Match Minute range (0′–90′), updating charts, timeline, and event logs in real time.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Vanilla CSS (Dark theme with `#b6f36b` green accents)
- **Backend:** Python FastAPI, Uvicorn
- **Analytics & Data Processing:** pandas, NumPy
- **Testing:** Python `unittest` (17 automated tests), Oxlint
- **Architecture:** Local REST API + Client-side reactive state

---

## 🏃 Setup and Run Instructions

### Prerequisites
- Python 3.11+ (or existing `.venv`)
- Node.js 18+ and npm

### 1. Backend Setup
From the repository root:

```powershell
# Activate the existing virtual environment (PowerShell)
.\.venv\Scripts\Activate.ps1

# Start the FastAPI server on port 8000
python -m uvicorn backend.main:app --port 8000 --reload
```

The API will be available at:
- **API Base:** `http://127.0.0.1:8000/`
- **Interactive OpenAPI Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check Endpoint:** `http://127.0.0.1:8000/health`

### 2. Frontend Setup
In a second terminal window:

```powershell
# Navigate into the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

Open your browser to:
- **Frontend Application:** `http://localhost:5173/`

---

## 🧪 Testing and Verification

### Backend Automated Test Suite
Run the 17 automated tests covering endpoints, analytics calculations, zero-division guards, rankings, and filters:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

### Frontend Linting & Production Build Checks
```powershell
# Run Oxlint
npm --prefix frontend run lint

# Run Vite production build
npm --prefix frontend run build
```

---

## 📊 Free Football Data Evaluation & Limitations

MatchMind AI operates under a strict **Zero-Cost & Zero-Risk Mandate**:
- **No Paid APIs:** Commercial feeds (Opta, Sportmonks, Wyscout) require paid enterprise subscriptions ($50 to $500+/month) or have credit card overage billing risks.
- **Free Tier Limitations:** Services such as Football-Data.org enforce strict rate limits (10 requests/minute) and only offer high-level match results without raw pitch event coordinates.
- **Match 2 Data Provenance:**
  - **Verified Box Score:** Sourced from official Premier League match records for Arsenal 1–0 Manchester City on 8 October 2023 (Possession: 49% vs 51%, Shots: 12 vs 4, Shots on target: 2 vs 1, Passes completed: 433 vs 453).
  - **Illustrative Key Events:** Full live matches generate ~1,800 micro-events. The 10 recorded match events represent an illustrative reconstructed key-event sample based on official match timeline logs (e.g. Martinelli 86′ winner, Gvardiol 4′ shot off the line).
  - **Data Attribution:** Sourced following OpenFootball (`openfootball`) and StatsBomb Open Data standards under CC0 1.0 Universal / CC BY 4.0 licenses.
  - **Detailed Audit:** See [`docs/REAL_FOOTBALL_DATA_AUDIT.md`](docs/REAL_FOOTBALL_DATA_AUDIT.md) for the complete evaluation matrix.

---

## 🏆 Hackathon Demo Walkthrough (3-Minute Script)

When presenting MatchMind AI to judges or stakeholders:

1. **The Vision (0:00 – 0:30):**
   - Explain how raw football event streams overwhelm analysts, while commercial platforms cost thousands. MatchMind AI provides explainable, zero-cost match intelligence running locally.
2. **Dataset Switcher (0:30 – 1:00):**
   - Toggle between **Match 1 (Demo Data)** and **Match 2 (Illustrative Premier League Record)**.
   - Show how the scoreboard, venue, and data provenance badges dynamically update.
3. **Tactical & Visual Analytics (1:00 – 1:45):**
   - Walk through the **Shot Timeline** (0′ to 90′) and **Team Performance Comparison**.
   - Show how the rule-based tactical engine diagnoses shot conversion and recommends strategic adjustments.
4. **Player Analytics & Rankings (1:45 – 2:30):**
   - Scroll to **Player Performance Analytics** and toggle the team filter to see individual player stats.
   - Review the **Leaderboards** (Goals, Shots, Completed Passes) with transparent tie-breaker criteria.
   - Open the **Head-to-Head Comparison** tool, select any two players, and highlight the automated observation statements.
5. **Interactive Filtering (2:30 – 3:00):**
   - In the **Interactive Match Filters** panel, select a team (e.g. `Arsenal`), event type (`Shots Only`), and minute range (`10′ to 90′`).
   - Demonstrate how the shot timeline, event counter, and key event logs update instantly.
   - Click **↺ Reset All Filters** to showcase quick recovery.

For the full presentation checklist, see [`docs/DEMO_PRESENTATION_GUIDE.md`](docs/DEMO_PRESENTATION_GUIDE.md).
