
from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from backend.analytics import (
    calculate_analytics,
    filter_events,
    calculate_player_analytics,
    get_player_rankings,
    compare_players,
    get_important_moments,
    detect_match_patterns,
    register_custom_events,
    delete_custom_events,
)

app = FastAPI(
    title="MatchMind AI",
    description="AI-powered football match intelligence",
    version="0.6.0"
)

# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for Safe Dynamic Ingestion
class EventIngestItem(BaseModel):
    event_id: int
    minute: int = Field(ge=0, le=120, description="Match minute (0-120)")
    second: int = Field(default=0, ge=0, le=59, description="Second (0-59)")
    team: str = Field(min_length=1, max_length=50)
    player: str = Field(min_length=1, max_length=50)
    type: Literal["pass", "shot"]
    outcome: Literal["complete", "incomplete", "goal", "saved", "off_target"]

    @model_validator(mode="after")
    def validate_type_and_outcome(self):
        if self.type == "pass" and self.outcome in ("goal", "saved", "off_target"):
            raise ValueError(f"Pass event cannot have outcome '{self.outcome}'. Must be 'complete' or 'incomplete'.")
        if self.type == "shot" and self.outcome in ("complete", "incomplete"):
            raise ValueError(f"Shot event cannot have outcome '{self.outcome}'. Must be 'goal', 'saved', or 'off_target'.")
        return self


class CustomMatchIngestPayload(BaseModel):
    home_team: str = Field(min_length=1, max_length=50)
    away_team: str = Field(min_length=1, max_length=50)
    competition: str = Field(default="Synthetic Custom Tournament", max_length=80)
    venue: str = Field(default="Custom Ground", max_length=80)
    events: list[EventIngestItem] = Field(min_length=1, max_length=200)

    @model_validator(mode="after")
    def validate_teams(self):
        if self.home_team.strip().lower() == self.away_team.strip().lower():
            raise ValueError("home_team and away_team must be distinct teams.")
        valid_teams = {self.home_team.strip().lower(), self.away_team.strip().lower()}
        for e in self.events:
            if e.team.strip().lower() not in valid_teams:
                raise ValueError(
                    f"Event team '{e.team}' does not match home_team ('{self.home_team}') or away_team ('{self.away_team}')."
                )
        return self

# Matches Database:
# Match 1: Fictional demonstration match
# Match 2: Real football match record (Arsenal vs Manchester City, Premier League, 8 Oct 2023)
# Box score statistics are verified from official Premier League match logs.
# The 10 match events represent an illustrative reconstructed key-event sample.
MATCHES = {
    1: {
        "match_id": 1,
        "home_team": "Manchester City",
        "away_team": "Arsenal",
        "status": "DEMO",
        "competition": "Demonstration Showcase",
        "venue": "Etihad Stadium (Demo)",
        "source_label": "Fictional Sample Events",
        "is_real_data": False,
        "score": {
            "home": 2,
            "away": 1
        },
        "stats": {
            "home": {
                "possession": 58,
                "shots": 12,
                "shots_on_target": 6,
                "passes_completed": 420
            },
            "away": {
                "possession": 42,
                "shots": 8,
                "shots_on_target": 3,
                "passes_completed": 305
            }
        }
    },
    2: {
        "match_id": 2,
        "home_team": "Arsenal",
        "away_team": "Manchester City",
        "status": "REAL_RECORD",
        "competition": "Premier League 2023/24",
        "venue": "Emirates Stadium, London",
        "source_label": "Premier League 2023/24 (Verified Box Score & Illustrative Key Events)",
        "provenance": "Verified match summary (Premier League official match records, 8 Oct 2023) with illustrative reconstructed key-event sample.",
        "is_real_data": True,
        "score": {
            "home": 1,
            "away": 0
        },
        "stats": {
            "home": {
                "possession": 49,
                "shots": 12,
                "shots_on_target": 2,
                "passes_completed": 433
            },
            "away": {
                "possession": 51,
                "shots": 4,
                "shots_on_target": 1,
                "passes_completed": 453
            }
        }
    }
}

# Backward compatibility alias
MATCH = MATCHES[1]

# Custom Matches In-Memory Store (Isolated from built-in matches 1 & 2)
CUSTOM_MATCHES = {}
_next_custom_id = 1001


def get_match_record(match_id: int):
    """Retrieves match record from built-in or custom matches."""
    if match_id in MATCHES:
        return MATCHES[match_id]
    if match_id in CUSTOM_MATCHES:
        return CUSTOM_MATCHES[match_id]
    return None


@app.get("/")
def home():
    return {
        "message": "Welcome to MatchMind AI!",
        "status": "running",
        "version": "0.6.0"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/matches")
def get_matches():
    return list(MATCHES.values()) + list(CUSTOM_MATCHES.values())


@app.get("/api/matches/{match_id}")
def get_match(match_id: int):
    target = get_match_record(match_id)
    if not target:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )
    return target


@app.get("/api/matches/{match_id}/insights")
def get_insights(match_id: int):
    target_match = get_match_record(match_id)
    if not target_match:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    home = target_match["stats"]["home"]
    away = target_match["stats"]["away"]

    lead_str = (
        f'{target_match["home_team"]} leads {target_match["score"]["home"]}-{target_match["score"]["away"]}.'
        if target_match["score"]["home"] > target_match["score"]["away"]
        else f'{target_match["away_team"]} leads {target_match["score"]["away"]}-{target_match["score"]["home"]}.'
        if target_match["score"]["away"] > target_match["score"]["home"]
        else f'Match is tied {target_match["score"]["home"]}-{target_match["score"]["away"]}.'
    )

    shot_diff = home["shots"] - away["shots"]
    shot_str = (
        f'{target_match["home_team"]} recorded {abs(shot_diff)} more shots.'
        if shot_diff > 0
        else f'{target_match["away_team"]} recorded {abs(shot_diff)} more shots.'
        if shot_diff < 0
        else "Both teams had an equal number of shots."
    )

    note = (
        "Fictional demonstration data, not a real live match."
        if match_id == 1
        else "Real football match record (Arsenal 1-0 Man City, 8 Oct 2023) with illustrative key events."
        if match_id == 2
        else f"Custom ingested match dataset ({target_match['competition']})."
    )

    return {
        "match": f'{target_match["home_team"]} vs {target_match["away_team"]}',
        "insights": [
            f'{target_match["home_team"]} has {home["possession"]}% possession.',
            shot_str,
            lead_str
        ],
        "note": note
    }


@app.get("/api/matches/{match_id}/analytics")
def get_analytics(match_id: int):
    if not get_match_record(match_id):
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    return calculate_analytics(match_id=match_id)


@app.get("/api/matches/{match_id}/events")
def get_match_events(
    match_id: int,
    team: str | None = None,
    player: str | None = None,
    event_type: str | None = None,
    start_minute: int = 0,
    end_minute: int = 90
):
    if not get_match_record(match_id):
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    if (
        start_minute < 0
        or end_minute > 90
        or start_minute > end_minute
    ):
        raise HTTPException(
            status_code=400,
            detail="Use minutes between 0 and 90, with start <= end"
        )

    return filter_events(
        match_id=match_id,
        team=team,
        player=player,
        event_type=event_type,
        start_minute=start_minute,
        end_minute=end_minute
    )


@app.get("/api/matches/{match_id}/players")
def get_match_players(
    match_id: int,
    team: str | None = None,
    player: str | None = None
):
    if not get_match_record(match_id):
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    return calculate_player_analytics(match_id=match_id, team=team, player=player)


@app.get("/api/matches/{match_id}/player-rankings")
def get_match_player_rankings(
    match_id: int,
    team: str | None = None
):
    if not get_match_record(match_id):
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )
    return get_player_rankings(match_id=match_id, team=team)


@app.get("/api/matches/{match_id}/player-comparison")
def get_match_player_comparison(
    match_id: int,
    player1: str = "",
    player2: str = ""
):
    if not get_match_record(match_id):
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )
    result = compare_players(match_id=match_id, player1=player1, player2=player2)
    if "error" in result and result.get("player1") is None:
        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )
    return result


@app.get("/api/matches/{match_id}/tactical-analysis")
def get_tactical_analysis(
    match_id: int,
    team: str | None = None
):
    target_match = get_match_record(match_id)
    if not target_match:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    data = calculate_analytics(match_id=match_id)
    analytics = data["analytics"]
    team_names = list(analytics.keys())

    if team is not None and team not in team_names:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Unknown team",
                "available_teams": team_names
            }
        )

    selected_teams = [team] if team else team_names
    reports = []

    for name in selected_teams:
        stats = analytics[name]
        recommendations = []

        if stats["shots"] == 0:
            recommendations.append(
                "Create more shooting opportunities in the attacking third."
            )
        elif stats["goals"] == 0:
            recommendations.append(
                "Review shot placement and shot quality to improve finishing."
            )
        else:
            recommendations.append(
                "Review the goal-scoring sequences to identify effective attacks."
            )

        if stats["pass_accuracy_percent"] < 70:
            recommendations.append(
                "Improve passing accuracy by choosing safer passing options."
            )
        else:
            recommendations.append(
                "Maintain passing accuracy while looking for forward passes."
            )

        reports.append({
            "team": name,
            "sample_stats": stats,
            "analysis": [
                (
                    f"{name} recorded {stats['shots']} shots "
                    f"and {stats['goals']} goals in the event sample."
                ),
                (
                    f"Pass accuracy in the sample was "
                    f"{stats['pass_accuracy_percent']}%."
                )
            ],
            "recommendations": recommendations
        })

    return {
        "match": f'{target_match["home_team"]} vs {target_match["away_team"]}',
        "analysis_type": "Rule-based tactical analysis",
        "note": (
            "Based on fictional sample events. "
            "These are preliminary suggestions, not live-match conclusions."
            if match_id == 1
            else "Based on illustrative key events from the 8 Oct 2023 Premier League match record."
            if match_id == 2
            else f"Based on custom ingested events for {target_match['competition']}."
        ),
        "reports": reports
    }


@app.get("/api/matches/{match_id}/important-moments")
def get_match_important_moments(match_id: int):
    """Returns discrete important match moments grounded strictly in recorded events."""
    if not get_match_record(match_id):
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )
    return get_important_moments(match_id=match_id)


@app.get("/api/matches/{match_id}/patterns")
def get_match_patterns_endpoint(match_id: int):
    """Returns defensible pattern detection metrics from event data without fabrication."""
    if not get_match_record(match_id):
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )
    return detect_match_patterns(match_id=match_id)


@app.post("/api/custom-matches/ingest", status_code=201)
def ingest_custom_match(payload: CustomMatchIngestPayload):
    """Safely ingests a custom synthetic football event dataset with strict Pydantic validation."""
    global _next_custom_id
    match_id = _next_custom_id
    _next_custom_id += 1

    events_data = [e.model_dump() for e in payload.events]

    # Calculate basic box-score totals from events
    home_name = payload.home_team.strip()
    away_name = payload.away_team.strip()
    home_events = [e for e in events_data if e["team"].strip().lower() == home_name.lower()]
    away_events = [e for e in events_data if e["team"].strip().lower() == away_name.lower()]

    home_goals = sum(1 for e in home_events if e["type"] == "shot" and e["outcome"] == "goal")
    away_goals = sum(1 for e in away_events if e["type"] == "shot" and e["outcome"] == "goal")

    home_shots = sum(1 for e in home_events if e["type"] == "shot")
    away_shots = sum(1 for e in away_events if e["type"] == "shot")

    home_sot = sum(1 for e in home_events if e["type"] == "shot" and e["outcome"] in ("goal", "saved"))
    away_sot = sum(1 for e in away_events if e["type"] == "shot" and e["outcome"] in ("goal", "saved"))

    home_passes = sum(1 for e in home_events if e["type"] == "pass" and e["outcome"] == "complete")
    away_passes = sum(1 for e in away_events if e["type"] == "pass" and e["outcome"] == "complete")

    total_passes = home_passes + away_passes
    home_poss = round((home_passes / total_passes) * 100) if total_passes > 0 else 50
    away_poss = 100 - home_poss

    match_record = {
        "match_id": match_id,
        "home_team": home_name,
        "away_team": away_name,
        "status": "CUSTOM_INGEST",
        "competition": payload.competition.strip(),
        "venue": payload.venue.strip(),
        "source_label": f"Custom Dataset ({len(events_data)} events)",
        "provenance": "Custom synthetic football event data ingested via validated REST API.",
        "is_real_data": False,
        "score": {"home": home_goals, "away": away_goals},
        "stats": {
            "home": {
                "possession": home_poss,
                "shots": home_shots,
                "shots_on_target": home_sot,
                "passes_completed": home_passes,
            },
            "away": {
                "possession": away_poss,
                "shots": away_shots,
                "shots_on_target": away_sot,
                "passes_completed": away_passes,
            }
        }
    }

    CUSTOM_MATCHES[match_id] = match_record
    register_custom_events(match_id, events_data)

    return {
        "status": "success",
        "match_id": match_id,
        "message": f"Successfully ingested custom dataset with {len(events_data)} events.",
        "match": match_record
    }


@app.get("/api/custom-matches")
def list_custom_matches():
    """Returns list of all dynamically ingested custom matches."""
    return list(CUSTOM_MATCHES.values())


@app.delete("/api/custom-matches/{match_id}")
def delete_custom_match_endpoint(match_id: int):
    """Deletes an ingested custom match (built-in matches 1 & 2 are protected)."""
    if match_id in (1, 2):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete built-in demonstration or historical matches."
        )
    if match_id not in CUSTOM_MATCHES:
        raise HTTPException(
            status_code=404,
            detail="Custom match not found."
        )
    del CUSTOM_MATCHES[match_id]
    delete_custom_events(match_id)
    return {
        "status": "deleted",
        "match_id": match_id,
        "message": f"Custom match {match_id} successfully deleted."
    }
