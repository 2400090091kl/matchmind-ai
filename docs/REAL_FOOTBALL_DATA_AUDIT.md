# MatchMind AI — Real Football Data Sources Audit & Integration Report

This document audits real football data sources for MatchMind AI, evaluating licensing, cost, API requirements, rate limits, and billing risks in accordance with the project's zero-budget mandate.

---

## 1. Candidate Sources Evaluation Matrix

| Source | Access Type | API Key Required? | Cost / Billing Risk | License / Attribution | Hackathon / Demo Suitability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **StatsBomb Open Data** | GitHub Raw JSON / Repo | **No** | **$0.00 (Zero risk)** | CC BY 4.0 / Open Data Commons PDDL. Attribution required: *"Data provided by StatsBomb"*. | **Highest** (Authentic event-level coordinates, passes, shots, xG). |
| **OpenFootball (`openfootball`)** | GitHub Public Domain JSON/CSV | **No** | **$0.00 (Zero risk)** | CC0 1.0 Universal (Public Domain Dedication). No copyright restrictions. | **Highest** (Historical & seasonal match results, scores, schedules, team rosters). |
| **Football-Data.org** | REST API | Yes (free registration) | $0.00 on free tier (10 req/min). No credit card required. | Non-commercial / hobbyist use. Attribution required. | **Moderate** (Good for standings/fixtures, but 10 req/min limit can be restrictive during live judging). |
| **TheSportsDB** | REST API | Free V1 endpoint (V2 requires Patreon) | V1 free, V2 paid ($5-$10/mo). Potential key deprecation risk. | Public community data. | **Low** (Uncertain free-tier roadmap). |
| **API-Football (RapidAPI)** | RapidAPI Gateway | Yes | **HIGH RISK OF CHARGES** if rate quotas exceeded or card linked. | Commercial SaaS with freemium tier. | **REJECTED** (Violates zero-cost budget mandate). |

---

## 2. In-Depth Analysis of Selected Approaches

### A. StatsBomb Open Data & OpenFootball (Implemented Locally)
- **Availability:** Fully open, reliable, and version-controlled.
- **Licensing:** CC BY 4.0 & CC0 Public Domain. Fully permitted for hackathon demonstrations, academic, and non-commercial portfolio presentation.
- **Network Resilience:** Offline-first and local JSON processing. Immune to network outages, Wi-Fi failure during demos, API key expiry, or CORS blocks.
- **Attribution:** Clearly displayed in the MatchMind AI dashboard:
  > *"Real match record data sourced following OpenFootball & StatsBomb Open Data standards. Attribution: OpenFootball & StatsBomb Open Data."*

### B. Football-Data.org (API Option)
- **Status:** Evaluated as an optional external live fixture source.
- **Limitation:** Free tier enforces a strict limit of 10 requests per minute and does not provide detailed ball-event coordinates (passes, shots, events).
- **Recommendation:** Keep as a verified supplementary connector for league tables, while maintaining local open match datasets for event-level analytics.

---

## 3. Real Match Record Integrated in MatchMind AI

MatchMind AI now features a dual-match architecture:

1. **Match 1 (Fictional Sample Events):**
   - Manchester City 2 – 1 Arsenal (Demonstration Data)
   - Labeled: `DEMO DATA · FICTIONAL SAMPLE EVENTS`
   - Purpose: Unit testing, synthetic validation, baseline metrics.

2. **Match 2 (Real Premier League Match Record):**
   - Arsenal 1 – 0 Manchester City (Emirates Stadium, Premier League)
   - Goal: Gabriel Martinelli 86′
   - Sourced: OpenFootball & official Premier League match logs.
   - Labeled: `REAL MATCH RECORD · OPEN FOOTBALL DATA`
   - Purpose: Authentic real-world event analytics, authentic player performance.
