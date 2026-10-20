# 🏆 MatchMind AI — Hackathon Submission & Demo Guide

**Hackathon:** Inside the Game: Developer Hackathon  
**Organizers:** Microsoft & Premier League  
**Submission Window:** October 6, 2026 – October 27, 2026  
**Project:** MatchMind AI — Explainable Football Match Intelligence Platform  

---

## 📋 1. Official Hackathon Requirements & Compliance Check

| Requirement | Official Rule | MatchMind AI Status | Notes |
| :--- | :--- | :--- | :--- |
| **New Project** | Must be created within hackathon window | ✅ **Compliant** | Repository created October 2026. |
| **Working Application** | Must install, run, and function as demonstrated | ✅ **Compliant** | Verified with 17/17 passing tests, clean build in 204ms. |
| **Tech Focus** | Football data intelligence & explainability | ✅ **Compliant** | Turns synthetic and real match events into explainable tactical & player intelligence. |
| **Third-Party Data & Licenses** | Must comply with open licenses | ✅ **Compliant** | OpenFootball (CC0) & StatsBomb standards (CC BY 4.0). Verified zero cost. |
| **Public GitHub Repo** | Link to public repository with clear `README.md` | ✅ **Ready** | Public repo at `https://github.com/240009001kl/matchmind-ai`. |
| **Demo Video Duration** | **Must be strictly under 2 minutes (< 120s)** | ✅ **Prepared** | See Section 2 below for exact 1m 45s script. |
| **Video Hosting** | Publicly accessible (YouTube, Vimeo, etc.) | ⏳ **User Action** | Upload recording to YouTube as Unlisted/Public. |
| **Zero-Cost Mandate** | No paid cloud resources or unverified services | ✅ **Compliant** | 100% local, free, reproducible execution. |

> [!IMPORTANT]
> **Honest Compliance Statement:** MatchMind AI is built using React 19, FastAPI, and pandas. To maintain complete integrity, we do not claim active Azure cloud deployment or Microsoft Foundry API calls in the demo, as the solution currently runs locally. Azure Container Apps (ACA) / AKS deployment is documented as the cloud scaling roadmap.

---

## 🎬 2. Video Recording Script (Strictly Under 2 Minutes: ~1m 45s)

*Judges will stop watching at the 2:00 mark. Practice this script to hit 1 minute 45 seconds comfortably.*

```
[0:00 - 0:20] THE HOOK (Screen: Dashboard Home & Welcome Banner)
"Football generates thousands of data points every match, but broadcasters, analysts, 
and fans are often overwhelmed by raw numbers or locked behind expensive enterprise feeds. 
This is MatchMind AI — an explainable football match intelligence platform that transforms 
match events into visual analytics, automated tactical recommendations, and player 
leaderboards — running completely locally and free."

[0:20 - 0:45] DUAL DATASET ARCHITECTURE (Screen: Click Active Match Dataset dropdown)
"In the topbar, we provide a Match Dataset Switcher. 
Judges can toggle between Match 1 — our baseline demonstration showcase with synthetic events — 
and Match 2 — an authentic Premier League fixture: Arsenal 1-0 Manchester City from October 2023. 
Notice how our UI explicitly labels verified official box-score stats from illustrative event samples, 
maintaining absolute data integrity."

[0:45 - 1:10] TACTICAL & VISUAL INTELLIGENCE (Screen: Scroll down to Shot Timeline & Tactical Panel)
"Our interactive Shot Timeline maps attacking sequences from minute 0 to 90 with goal markers. 
Below it, our rule-based Tactical Intelligence Engine diagnoses team finishing and passing safety, 
generating actionable tactical reports and recommendations without hallucination."

[1:10 - 1:30] PLAYER PERFORMANCE & HEAD-TO-HEAD (Screen: Player Analytics & Comparison Tool)
"At the player level, MatchMind AI tracks passes completed, pass accuracy, shots, and conversion. 
Our Leaderboards rank top goalscorers, shot threats, and pass completers with transparent tie-breaker criteria. 
With our Head-to-Head Comparison tool, we can select any two players to compare key metrics side-by-side 
with automated observations."

[1:30 - 1:45] INTERACTIVE FILTERS & CALL TO ACTION (Screen: Adjust Minute Slider and Team Filter, then click Reset)
"Finally, our multi-factor filter lets users filter by team, player, event type, and minute range — 
dynamically updating the timeline, charts, and event log in real time. 
MatchMind AI: See beyond the score."
```

---

## 🎤 3. Live 3-Minute Presentation Script (For Q&A / Live Pitch)

If presenting live to a judging panel with 3 minutes allotted:

1. **0:00 – 0:30 (Problem & Value):**
   - Address the gap between complex raw data streams and actionable insights.
   - Introduce MatchMind AI's mission: explainable, accessible football intelligence for broadcast, coaching, and fans.
2. **0:30 – 1:15 (Live Navigation):**
   - Demonstrate the **Match Switcher**: explain the dual-architecture (Demo baseline vs verified Premier League box score with illustrative events).
   - Walk through the **Shot Timeline** and **Tactical Diagnosis** recommendations.
3. **1:15 – 2:00 (Player Metrics & Comparison):**
   - Showcase individual player analytics, leaderboards with tie-breakers, and the interactive comparison tool.
4. **2:00 – 2:40 (Multi-Factor Filtering):**
   - Filter to a single team (e.g. `Arsenal`), filter by `Shots Only`, and drag the minute slider to `10′–90′`.
   - Point out how all charts, counters, and logs update reactively.
5. **2:40 – 3:00 (Engineering & Roadmap):**
   - Highlight the 17 automated unit tests, clean modular REST API, and zero-cost design.
   - Outline the cloud roadmap (containerization on Azure Container Apps).

---

## 📝 4. Final Submission Checklist (Before Submitting)

Perform these steps before submitting on the hackathon portal:

- [ ] **1. Push all local commits to GitHub:**
  ```powershell
  git push origin main
  ```
- [ ] **2. Verify GitHub Repository is Public:**
  - Visit `https://github.com/240009001kl/matchmind-ai` in an incognito window.
  - Verify that `README.md`, `backend/`, `frontend/`, `tests/`, and `docs/` are visible.
- [ ] **3. Record & Upload the Video:**
  - Record the screen using OBS, Loom, or Windows Game Bar (`Win + G`).
  - Follow the **Under-2-Minute Script** (keep runtime between 1m 30s and 1m 55s).
  - Upload to YouTube (set to **Public** or **Unlisted**).
  - Test the video link in incognito mode.
- [ ] **4. Fill Out the Submission Form:**
  - **Project Name:** MatchMind AI
  - **Short Pitch:** Explainable AI football match intelligence platform featuring tactical recommendations, player leaderboards, interactive filtering, and dual-dataset analytics.
  - **Repository URL:** `https://github.com/240009001kl/matchmind-ai`
  - **Demo Video URL:** *(Your YouTube link)*
  - **Technology Tags:** Python, FastAPI, React, Vite, pandas, Football Analytics.
