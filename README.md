# ⚽ MatchMind AI

### Explainable Football Match Intelligence & Broadcast Analytics Platform

MatchMind AI transforms raw football match records and event streams into explainable tactical recommendations, player-level performance metrics, broadcast-ready streaming overlays, pattern detection, and dynamic event ingestion.

Built for the **Inside the Game: Developer Hackathon** presented by **Microsoft & Premier League**.

---

## 🚀 Key Features

1. **Dual Match Dataset Architecture + Dynamic Ingestion:**
   - **Match 1 (Demonstration Showcase):** Manchester City 2 – 1 Arsenal (*Fictional sample events for baseline testing and rule calibration*).
   - **Match 2 (Illustrative Premier League Record):** Arsenal 1 – 0 Manchester City (*Gameweek 8, 8 October 2023 at Emirates Stadium; verified official box score with illustrative key-event sample*).
   - **Dynamic Match Ingestion:** Ingest arbitrary synthetic or recorded matches via REST API with automated possession, shot, pass, and conversion calculations.
2. **Dynamic Dataset Switcher:** One-click toggle between demonstration showcase, real-world match record, and custom ingested matches with distinct provenance badges (`DEMO DATA`, `ILLUSTRATIVE REAL RECORD`, `CUSTOM INGESTED`).
3. **Audience Persona Switcher (Analyst Mode vs Casual Fan Mode):** Seamless one-click toggle in top navigation:
   - **Analyst Mode:** Detailed telemetry, tactical coaching recommendations, pass accuracy/shot conversion ratios, player leaderboards with tie-breaker criteria, and raw event comparisons.
   - **Casual Fan Mode:** Plain-English storytelling, 1-minute match narrative cards, "What Went Well" coaching summaries, simplified player spotlight badges (Goal Decider, Attack Catalyst, Midfield Engine), and supporter head-to-head verdicts.
4. **Broadcast Overlay Mode (OBS / Studio Stream Ready):**
   - Professional television broadcast graphics designed for OBS browser capture or live studio monitors.
   - **Compact Scorebug Mode:** Docked top-left broadcast scorebug with team colors and verified scoreline.
   - **Full Lower-Third Mode:** Television match summary graphics, key moment ticker, and team stat bars.
   - **Clean Studio Backdrop & Transparency Toggle:** Switch to 100% transparent alpha channel for OBS window and browser source integration.
   - **Strict Data Integrity:** Renders verified match records and observed event timeline without fabricated match clocks or invented real-time events.
5. **Important Moments Breakdown:**
   - Chronological breakdown separating **Observed Factual Events** from **Analytical Significance**.
   - Event filter controls (`All Moments`, `Goals Only`, `Shots on Target`).
   - Explicit sequence caveats reminding viewers that event intervals do not imply uninterrupted sequences without continuous tracking data.
6. **Football Pattern Detection Engine:**
   - Automated detection of tactical patterns directly supported by event evidence:
     - **Finishing Precision & Conversion Margin:** Quantifies attacking efficiency and shot-to-goal conversion.
     - **Ball Circulation Composure:** Analyzes passing success rates under high vs normal match tempo.
     - **Temporal Danger Clumping:** Detects attacking flurries and momentum clusters across match phases.
   - Confidence scoring and evidence-based limitations displayed for transparent explainability.
7. **Match Centre & Scoreboard:** Official scores, possession share, total shots, shots on target, and completed pass tracking.
8. **Automated Match Insights:** Deterministic, rule-based observations highlighting possession dominance, attacking efficiency, and conversion margins.
9. **Visual Match Analytics:**
   - Interactive **Shot Timeline** (0′ to 90′) with team color-coding and goal markers.
   - **Team Performance Comparison** bars for shots, shots on target, and goals.
   - **Passing Accuracy** visual tracking with progress fills.
10. **Tactical Intelligence Engine:** Automated diagnosis of attacking volume and ball circulation safety with actionable coaching recommendations.
11. **Player Performance Analytics:** Individual statistics for passes attempted/completed, pass accuracy percentage (with zero-division protection when no passes are attempted), total shots, shots on target, goals, and conversion percentage.
12. **Player Rankings & Leaderboards:** Leaderboards for Top Goalscorers, Shot Threats, and Pass Completers with transparent tie-breaker criteria and team filter controls.
13. **Head-to-Head Player Comparison:** Interactive tool comparing any two players side-by-side with automated observation highlights.
14. **Interactive Multi-Factor Filters:** Live filtering by Team, Player, Event Type (Passes/Shots), and Match Minute range (0′–90′), updating charts, timeline, and event logs in real time.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    subgraph UI ["Frontend (React 19 + Vite)"]
        A[Dashboard Topbar & Persona Switcher]
        B[Broadcast Overlay View OBS Ready]
        C[Match Centre & Scoreboard]
        D[Important Moments Breakdown]
        E[Pattern Detection Cards]
        F[Shot Timeline & Pass Accuracy Tracks]
        G[Tactical Intelligence Report]
        H[Player Leaderboards & Comparison]
    end

    subgraph API ["FastAPI REST Service (Python 3.11)"]
        I["/api/matches & /api/custom-matches"]
        J["/api/matches/{id}/important-moments"]
        K["/api/matches/{id}/patterns"]
        L["/api/custom-matches/ingest (Pydantic)"]
        M["/api/matches/{id}/analytics & events"]
        N["/api/matches/{id}/players & rankings"]
    end

    subgraph ENGINE ["pandas Analytics & Intelligence Layer"]
        O[Dynamic Event Aggregator]
        P[Pattern & Momentum Detection]
        Q[Important Moments Classifier]
        R[Deterministic Ranking & Tie-Breaker]
    end

    A & B & C & D & E & F & G & H <-->|REST API| I & J & K & L & M & N
    I & J & K & L & M & N <--> ENGINE
```

- **Frontend:** React 19, Vite, Vanilla CSS (Dark theme `#0b100e` with `#b6f36b` green accents). Zero external UI framework bloat.
- **Backend:** Python FastAPI, Uvicorn, Starlette. High-performance asynchronous REST API.
- **Data Engine:** pandas, NumPy. Vectorized aggregation for passing accuracy, shot conversion, and deterministic tie-breaking.
- **Architecture Details:** See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full component breakdown and cloud roadmap.

---

## 🏃 Setup and Run Instructions

### Prerequisites
- Python 3.11+ (or existing `.venv`)
- Node.js 18+ and npm
- Docker & Docker Compose (Optional for containerized run)

---

### Option A: Standard Local Setup

#### 1. Backend Setup
From the repository root:

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start FastAPI server on port 8000
python -m uvicorn backend.main:app --port 8000 --reload
```

The API will be available at:
- **API Base:** `http://127.0.0.1:8000/`
- **Interactive OpenAPI Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check Endpoint:** `http://127.0.0.1:8000/health`

#### 2. Frontend Setup
In a second terminal:

```powershell
# Navigate into frontend
cd frontend

# Install dependencies (if needed)
npm install

# Start Vite development server
npm run dev
```

Open your browser to:
- **Frontend Application:** `http://localhost:5173/`

---

### Option B: Docker & Docker Compose Setup

Run the entire platform with a single command:

```powershell
docker compose up --build
```

- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:8000/`
- Swagger UI: `http://localhost:8000/docs`

---

## 📥 Dynamic Event Ingestion API

MatchMind AI provides a dynamic ingestion endpoint to import new synthetic or recorded match events without restarting the application or modifying immutable built-in matches:

### Ingest Endpoint: `POST /api/custom-matches/ingest`

#### Example using PowerShell:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/custom-matches/ingest" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -InFile "examples/sample_event_ingestion.json"
```

#### Example using cURL:
```bash
curl -X POST "http://127.0.0.1:8000/api/custom-matches/ingest" \
  -H "Content-Type: application/json" \
  -d @examples/sample_event_ingestion.json
```

#### Ingestion Response:
```json
{
  "status": "success",
  "message": "Custom match ingested successfully with 10 events",
  "match_id": 1001,
  "match_summary": {
    "id": 1001,
    "home_team": "Liverpool",
    "away_team": "Chelsea",
    "home_score": 1,
    "away_score": 1,
    "provenance": "Custom Ingested Data"
  }
}
```

The newly ingested match immediately appears in the frontend match switcher, calculates all team and player analytics, and populates the broadcast overlay. Built-in matches 1 and 2 are protected and cannot be deleted or overwritten.

---

## 🧪 Testing and Verification

### Backend Automated Test Suite
Run the 22 automated tests covering endpoints, dynamic ingestion, pattern detection, important moments, analytics calculations, zero-division guards, rankings, and persona data integrity:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

### Frontend Linting & Production Build Checks
```powershell
# Run Oxlint (0 warnings, 0 errors)
npm --prefix frontend run lint

# Run Vite production build (< 300ms)
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

## 🏆 Hackathon Submission & Demo

- **Hackathon:** Inside the Game: Developer Hackathon (Microsoft & Premier League)
- **Submission Guide:** [`docs/HACKATHON_SUBMISSION_GUIDE.md`](docs/HACKATHON_SUBMISSION_GUIDE.md) — Includes:
  - Strict **Under-2-Minute Video Recording Script** (< 120s)
  - 3-Minute Live Presentation & Q&A Script
  - Devpost / Submission Portal Checklist
  - Microsoft Cloud Readiness & Azure Roadmap
