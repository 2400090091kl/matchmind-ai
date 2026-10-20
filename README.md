# ⚽ MatchMind AI

### AI-Powered Football Match Intelligence Platform

MatchMind AI transforms football match and event data into visual analytics, automated tactical recommendations, player-level performance metrics, interactive multi-factor filters, and head-to-head comparisons.

---

## 🚀 Key Features

1. **Dual Match Dataset Architecture:**
   - **Demo Match 1:** Manchester City 2 – 1 Arsenal (*Fictional sample events for baseline testing*).
   - **Real Match 2:** Arsenal 1 – 0 Manchester City (*Authentic 2023/24 Premier League record sourced from OpenFootball / StatsBomb open data standards*).
2. **Match Centre & Scoreboard:** Dynamic score display, possession, shot totals, shots on target, and completed passes.
3. **Automated Match Insights:** Rule-based automated observations highlighting possession balance, shot dominance, and conversion efficiency.
4. **Visual Analytics:**
   - Interactive **Shot Timeline** spanning 0′ to 90′ with goal indicators.
   - **Team Performance Comparison** bar graphs for shots, target accuracy, and goals.
   - **Passing Accuracy** progress tracks.
5. **Tactical Intelligence Engine:** Automated tactical reports diagnosing attacking frequency and passing safety with actionable recommendations.
6. **Player Performance Analytics:** Individual statistics for passes attempted/completed, pass accuracy, shots, shots on target, goals, and conversion percentage.
7. **Player Rankings & Leaderboards:** Top performers ranked by goals, shot threats, and completed passes with transparent ranking criteria and tie-breakers.
8. **Head-to-Head Player Comparison:** Interactive tool comparing any two players side-by-side with automatic observation highlights.
9. **Interactive Multi-Factor Filtering:** Live filtering by Team, Player, Event Type (Passes/Shots), and Match Minute range (0′–90′).
10. **Zero-Cost & Free Data Compliance:** Fully functional offline or locally without any paid APIs, billing risks, or required external subscriptions.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Vanilla CSS (Dark theme with `#b6f36b` green accents)
- **Backend:** Python FastAPI, Uvicorn
- **Analytics & Data Processing:** pandas, NumPy
- **Testing:** Python `unittest` (17 automated unit tests), Oxlint

---

## 🏃 Setup and Run Instructions

### Prerequisites
- Python 3.11+ (or existing `.venv`)
- Node.js 18+ and npm

### 1. Backend Setup
From the repository root:

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run the FastAPI server
python -m uvicorn backend.main:app --port 8000 --reload
```

The API will be available at:
- **API Base:** `http://127.0.0.1:8000/`
- **Interactive OpenAPI Docs:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/health`

### 2. Frontend Setup
In a second terminal:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

The application will be live at:
- **Frontend URL:** `http://localhost:5173/`

---

## 🧪 Testing and Verification

### Backend Automated Unit Tests
Run the comprehensive 17-test suite:

```powershell
.\.venv\Scripts\python.exe -m unittest discover tests
```

### Frontend Build & Linting Checks
```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
```

---

## 📊 Free Football Data & Attribution

MatchMind AI is built strictly according to zero-cost principles:
- **No Paid APIs / No Subscriptions / Zero Billing Risk.**
- **Real Match Dataset (Arsenal 1-0 Man City):** Sourced following the OpenFootball project (`openfootball`) and StatsBomb Open Data standards.
- **Licenses:** CC0 1.0 Universal (Public Domain) & CC BY 4.0.
- **Audit Documentation:** See [`docs/REAL_FOOTBALL_DATA_AUDIT.md`](docs/REAL_FOOTBALL_DATA_AUDIT.md) for full evaluation of Football-Data.org, StatsBomb, and OpenFootball.

---

## 🏆 Presentation Guide

For a 3-minute hackathon demo walkthrough and presentation checklist, see [`docs/DEMO_PRESENTATION_GUIDE.md`](docs/DEMO_PRESENTATION_GUIDE.md).
