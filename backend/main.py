
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.analytics import (
    calculate_analytics,
    filter_events,
    calculate_player_analytics,
    get_player_rankings,
    compare_players,
)

app = FastAPI(
    title="MatchMind AI",
    description="AI-powered football match intelligence",
    version="0.5.0"
)

# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
def home():
    return {
        "message": "Welcome to MatchMind AI!",
        "status": "running",
        "version": "0.5.0"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/matches")
def get_matches():
    return list(MATCHES.values())


@app.get("/api/matches/{match_id}")
def get_match(match_id: int):
    if match_id not in MATCHES:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )
    return MATCHES[match_id]


@app.get("/api/matches/{match_id}/insights")
def get_insights(match_id: int):
    if match_id not in MATCHES:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    target_match = MATCHES[match_id]
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
    if match_id not in MATCHES:
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
    if match_id not in MATCHES:
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
    if match_id not in MATCHES:
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
    if match_id not in MATCHES:
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
    if match_id not in MATCHES:
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
    if match_id not in MATCHES:
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
        "match": f'{MATCHES[match_id]["home_team"]} vs {MATCHES[match_id]["away_team"]}',
        "analysis_type": "Rule-based tactical analysis",
        "note": (
            "Based on fictional sample events. "
            "These are preliminary suggestions, not live-match conclusions."
            if match_id == 1
            else "Based on illustrative key events from the 8 Oct 2023 Premier League match record."
        ),
        "reports": reports
    }
