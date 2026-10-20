# 🏆 MatchMind AI — Hackathon Submission & Demo Guide

**Hackathon:** Inside the Game: Developer Hackathon  
**Organizers:** Microsoft & Premier League  
**Submission Window:** October 6, 2026 – October 27, 2026  
**Project:** MatchMind AI — Explainable Football Match Intelligence & Broadcast Analytics Platform  

---

## 📋 1. Official Hackathon Requirements & Compliance Check

| Requirement | Official Rule | MatchMind AI Status | Notes |
| :--- | :--- | :--- | :--- |
| **New Project** | Must be created within hackathon window | ✅ **Compliant** | Repository created October 2026. |
| **Working Application** | Must install, run, and function as demonstrated | ✅ **Compliant** | Verified with 22/22 passing tests, clean build in ~270ms. |
| **Tech Focus** | Football data intelligence & explainability | ✅ **Compliant** | Turns synthetic and real match events into explainable tactical & player intelligence. |
| **Third-Party Data & Licenses** | Must comply with open licenses | ✅ **Compliant** | OpenFootball (CC0) & StatsBomb standards (CC BY 4.0). Verified zero cost. |
| **Public GitHub Repo** | Link to public repository with clear `README.md` | ✅ **Ready** | Public repo at `https://github.com/240009001kl/matchmind-ai`. |
| **Demo Video Duration** | **Must be strictly under 2 minutes (< 120s)** | ✅ **Prepared** | See Section 2 below for exact 1m 45s script. |
| **Video Hosting** | Publicly accessible (YouTube, Vimeo, etc.) | ⏳ **User Action** | Upload recording to YouTube as Unlisted/Public. |
| **Zero-Cost Mandate** | No paid cloud resources or unverified services | ✅ **Compliant** | 100% local, free, reproducible execution. |

> [!IMPORTANT]
> **Honest Compliance Statement:** MatchMind AI is built using React 19, FastAPI, and pandas. To maintain complete integrity, we do not claim active Azure cloud deployment or Microsoft Foundry API calls in the demo, as the solution currently runs locally. Azure Container Apps (ACA) / AKS deployment is documented as the cloud scaling roadmap in [`docs/ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 🎬 2. Video Recording Script (Strictly Under 2 Minutes: ~1m 45s)

*Judges will stop watching at the 2:00 mark. Practice this script to hit 1 minute 45 seconds comfortably.*

```
[0:00 - 0:20] THE HOOK (Screen: Dashboard Home & Welcome Banner)
"Football generates thousands of data points every match, but broadcasters, analysts, 
and fans are often overwhelmed by raw numbers or locked behind expensive enterprise feeds. 
This is MatchMind AI — an explainable football match intelligence platform that transforms 
match events into visual analytics, automated tactical recommendations, broadcast overlays, 
and pattern detection — running completely locally and 100% free."

[0:20 - 0:40] DUAL DATASETS & DYNAMIC INGESTION (Screen: Click Active Match Dataset dropdown, show Ingest API badge)
"In the topbar, we provide a Match Dataset Switcher. 
Judges can toggle between Match 1 — our baseline demonstration showcase with synthetic events — 
Match 2 — an authentic Premier League fixture: Arsenal 1-0 Manchester City from October 2023 — 
or dynamically ingest custom event feeds via our REST API. 
Notice how our UI explicitly labels verified official box scores from illustrative event samples, 
maintaining absolute data integrity."

[0:40 - 1:00] PERSONA EXPERIENCE: ANALYST VS CASUAL FAN (Screen: Click 'Casual Fan' toggle in topbar, then back to 'Analyst')
"MatchMind AI personalizes the experience with a topbar Persona Switcher.
In Analyst Mode, coaches and analysts get full telemetry, passing matrices, and tactical recommendations.
With one click into Casual Fan Mode, the platform instantly translates data into plain-English match narratives,
hero moments, 'What Went Well' coach summaries, and simplified player spotlight badges without changing the verified facts."

[1:00 - 1:20] IMPORTANT MOMENTS & PATTERN DETECTION (Screen: Scroll to Important Moments & Football Pattern sections)
"Crucially, our Important Moments engine strictly separates observed factual events from analytical interpretations,
with explicit sequence disclaimers. 
Below that, our Pattern Detection Engine quantifies finishing precision, passing composure under pressure, 
and temporal danger clumping with confidence scoring."

[1:20 - 1:35] BROADCAST OVERLAY MODE (Screen: Click 'Broadcast Overlay' button in topbar)
"For streaming and television production, we feature a Broadcast Overlay Mode. 
It supports OBS browser capture with clean transparent backdrops, lower-third graphics, 
live event tickers, and a compact scorebug mode — displaying authentic telemetry with zero fabricated clocks."

[1:35 - 1:45] CALL TO ACTION & VERIFICATION (Screen: Back to Dashboard, adjust minute filter slider)
"With 22 automated backend tests, zero paid dependencies, and single-command Docker deployment, 
MatchMind AI brings explainable football intelligence to everyone. 
MatchMind AI: See beyond the score."
```

---

## 🎤 3. Live 3-Minute Presentation Script (For Q&A / Live Pitch)

If presenting live to a judging panel with 3 minutes allotted:

1. **0:00 – 0:30 (Problem & Value):**
   - Address the gap between complex raw data streams and actionable insights.
   - Introduce MatchMind AI's mission: explainable, accessible football intelligence for broadcast, coaching, and fans.
2. **0:30 – 1:10 (Dual Datasets & Dynamic Ingestion):**
   - Demonstrate the **Match Switcher**: explain the dual-architecture (Demo baseline vs verified Premier League box score with illustrative events) and dynamic REST ingestion (`POST /api/custom-matches/ingest`).
   - Highlight the **Important Moments** separation between facts and interpretations.
3. **1:10 – 1:45 (Persona Switching & Pattern Engine):**
   - Demonstrate the **Analyst Mode vs Casual Fan Mode** live toggle.
   - Showcase the **Football Pattern Detection** cards (conversion margins, composure, danger clumping).
4. **1:45 – 2:20 (Broadcast Overlay & OBS Mode):**
   - Toggle into **Broadcast Overlay Mode**, demonstrate the lower-third graphics, transparent alpha-channel toggle, and compact scorebug mode for live streaming.
5. **2:20 – 3:00 (Engineering, Testing & Azure Roadmap):**
   - Highlight the 22 automated unit tests, clean modular REST API, and zero-cost design.
   - Outline the cloud containerization roadmap on Azure Container Apps.

---

## 📝 4. Final Submission Checklist (Before Submitting)

Perform these steps before submitting on the hackathon portal:

- [ ] **1. Run Full Verification Suite:**
  ```powershell
  # Backend 22 tests
  .\.venv\Scripts\python.exe -m unittest discover -s tests -v

  # Frontend lint & build
  npm --prefix frontend run lint
  npm --prefix frontend run build
  ```
- [ ] **2. Push all local commits to GitHub:**
  ```powershell
  git push origin main
  ```
- [ ] **3. Verify GitHub Repository is Public:**
  - Visit `https://github.com/240009001kl/matchmind-ai` in an incognito window.
  - Verify that `README.md`, `backend/`, `frontend/`, `tests/`, `examples/`, `docs/`, `Dockerfile`, and `docker-compose.yml` are visible.
- [ ] **4. Record & Upload the Video:**
  - Record the screen using OBS, Loom, or Windows Game Bar (`Win + G`).
  - Follow the **Under-2-Minute Script** (keep runtime between 1m 30s and 1m 55s).
  - Upload to YouTube (set to **Public** or **Unlisted**).
  - Test the video link in incognito mode.
- [ ] **5. Fill Out the Submission Form:**
  - **Project Name:** MatchMind AI
  - **Short Pitch:** Explainable AI football match intelligence and broadcast platform featuring tactical recommendations, OBS streaming overlay, pattern detection, dynamic ingestion, and dual persona views.
  - **Repository URL:** `https://github.com/240009001kl/matchmind-ai`
  - **Demo Video URL:** *(Your YouTube link)*
  - **Technology Tags:** Python, FastAPI, React, Vite, pandas, Docker, Football Analytics.
