# MatchMind AI — Architecture Overview

MatchMind AI is built as a modular, explainable football match intelligence platform. It processes match-level statistics and ball-event streams locally, generating automated tactical diagnoses, player performance analytics, and dynamic visual dashboards without external paid API dependencies.

---

## 🏗️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph UI ["Frontend (React 19 + Vite)"]
        A[Dashboard Topbar & Match Switcher]
        B[Match Centre & Scoreboard]
        C[Overview Statistics & Comparison Tracks]
        D[Interactive Multi-Factor Filter Bar]
        E[Visual Match Analytics: Shot Timeline & Pass Track]
        F[Tactical Intelligence Report Engine]
        G[Player Analytics & Metric Cards]
        H[Player Leaderboards & Tie-Breakers]
        I[Head-to-Head Player Comparison]
        J[Key Match Event Log]
    end

    subgraph API ["Backend API (FastAPI)"]
        K["/api/matches"]
        L["/api/matches/{id}"]
        M["/api/matches/{id}/analytics"]
        N["/api/matches/{id}/insights"]
        O["/api/matches/{id}/events"]
        P["/api/matches/{id}/players"]
        Q["/api/matches/{id}/player-rankings"]
        R["/api/matches/{id}/player-comparison"]
        S["/api/matches/{id}/tactical-analysis"]
    end

    subgraph ENGINE ["Analytics & Data Layer (pandas)"]
        T[Event Filter & Minute Slicer]
        U[Advanced Metric Engine: Pass Acc, Shots on Target, Conv %]
        V[Tactical Rule Engine]
        W[Individual Player Analytics Engine]
        X[Deterministic Ranking & Tie-Breaker Engine]
        Y[Head-to-Head Observation Generator]
    end

    subgraph DATA ["Match Datasets"]
        Z1["Match 1: Demo Showcase (Fictional Sample Events)"]
        Z2["Match 2: Premier League 2023/24 Record (Verified Box Score & Illustrative Key Events)"]
    end

    A --> K
    B --> L
    C --> L
    D --> O
    E --> M & O
    F --> S
    G --> P
    H --> Q
    I --> R
    J --> O

    K & L & M & N & O & P & Q & R & S --> ENGINE
    ENGINE --> DATA
```

---

## 🧩 Architectural Components

### 1. Frontend Layer (`frontend/`)
- **Technology:** React 19, Vite, Vanilla CSS.
- **Design System:** Dark theme (`#0b100e`, `#151d18`) with high-contrast electric green (`#b6f36b`) and tactical accents.
- **State Management:** Reactive component-level state with zero unnecessary re-renders. Uses derived state patterns for player comparisons to prevent out-of-sync states during match switching.
- **Responsive Layout:** CSS Grid and Flexbox with mobile-first breakpoints (<=600px, <=850px, desktop).

### 2. Backend REST API Layer (`backend/main.py`)
- **Technology:** FastAPI, Uvicorn, Starlette.
- **CORS Support:** Configured for local development (`http://localhost:5173`, `http://127.0.0.1:5173`).
- **RESTful Endpoints:**
  - `GET /health` — Service health probe.
  - `GET /api/matches` — Lists all available match datasets with provenance metadata.
  - `GET /api/matches/{id}` — Match overview, score, venue, and box-score statistics.
  - `GET /api/matches/{id}/analytics` — Team-level event analytics.
  - `GET /api/matches/{id}/insights` — Automated rule-based observations.
  - `GET /api/matches/{id}/events` — Event stream with multi-factor filtering (`team`, `player`, `event_type`, `start_minute`, `end_minute`).
  - `GET /api/matches/{id}/players` — Individual player metrics.
  - `GET /api/matches/{id}/player-rankings` — Deterministic leaderboards with explicit tie-breakers.
  - `GET /api/matches/{id}/player-comparison` — Head-to-head comparison between any two players.
  - `GET /api/matches/{id}/tactical-analysis` — Tactical diagnostic report and coaching recommendations.

### 3. Analytics & Rule Engine (`backend/analytics.py`)
- **Technology:** pandas, NumPy.
- **Calculation Logic:**
  - **Pass Accuracy %:** `(completed / attempted) * 100`, guarded against zero division (`None` when attempted = 0).
  - **Shots on Target %:** `(shots on target / total shots) * 100`.
  - **Shot Conversion %:** `(goals / total shots) * 100`.
- **Ranking Engine:** Multi-key deterministic sorting:
  - Top Scorers: `(-goals, -shot_conversion_percent, -shots)`
  - Shot Threats: `(-shots, -shots_on_target, -shots_on_target_percent)`
  - Completed Passes: `(-passes_completed, -pass_accuracy_percent)`

### 4. Dual-Dataset Design
- **Match 1:** Fictional demonstration events designed for rule calibration, edge-case testing, and baseline validation.
- **Match 2:** Authentic Premier League 2023/24 fixture (Arsenal 1–0 Manchester City, 8 Oct 2023). Match-level box score is verified from official public records; event data is an illustrative reconstructed sample of key attacking moments.

---

## 🔒 Security & Zero-Cost Principles

- **Zero Paid Dependencies:** No cloud subscriptions, no paid APIs, no rate-limited paywalls.
- **No Secrets Exposed:** Zero API keys, passwords, or credentials in codebase or Git history.
- **Resilient Execution:** 100% functional locally and offline.
