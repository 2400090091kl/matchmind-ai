
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.analytics import calculate_analytics, filter_events

app = FastAPI(
    title="MatchMind AI",
    description="AI-powered football match intelligence",
    version="0.4.0"
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

# Fictional sample match data for testing
MATCH = {
    "match_id": 1,
    "home_team": "Manchester City",
    "away_team": "Arsenal",
    "status": "DEMO",
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
}


@app.get("/")
def home():
    return {
        "message": "Welcome to MatchMind AI!",
        "status": "running",
        "version": "0.4.0"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/matches")
def get_matches():
    return [MATCH]


@app.get("/api/matches/{match_id}")
def get_match(match_id: int):
    if match_id != MATCH["match_id"]:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )
    return MATCH


@app.get("/api/matches/{match_id}/insights")
def get_insights(match_id: int):
    if match_id != MATCH["match_id"]:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    home = MATCH["stats"]["home"]
    away = MATCH["stats"]["away"]

    return {
        "match": f'{MATCH["home_team"]} vs {MATCH["away_team"]}',
        "insights": [
            f'{MATCH["home_team"]} has {home["possession"]}% possession.',
            f'{MATCH["home_team"]} has '
            f'{home["shots"] - away["shots"]} more shots.',
            f'{MATCH["home_team"]} leads '
            f'{MATCH["score"]["home"]}-{MATCH["score"]["away"]}.'
        ],
        "note": "Fictional demonstration data, not a real live match."
    }


@app.get("/api/matches/{match_id}/analytics")
def get_analytics(match_id: int):
    if match_id != MATCH["match_id"]:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    return calculate_analytics()


@app.get("/api/matches/{match_id}/events")
def get_match_events(
    match_id: int,
    team: str | None = None,
    start_minute: int = 0,
    end_minute: int = 90
):
    if match_id != MATCH["match_id"]:
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
        team=team,
        start_minute=start_minute,
        end_minute=end_minute
    )


@app.get("/api/matches/{match_id}/tactical-analysis")
def get_tactical_analysis(
    match_id: int,
    team: str | None = None
):
    if match_id != MATCH["match_id"]:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    data = calculate_analytics()
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
        "match": f'{MATCH["home_team"]} vs {MATCH["away_team"]}',
        "analysis_type": "Rule-based tactical analysis",
        "note": (
            "Based on fictional sample events. "
            "These are preliminary suggestions, not live-match conclusions."
        ),
        "reports": reports
    }
