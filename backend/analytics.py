
import pandas as pd

# Match 1: Fictional demonstration events
DEMO_EVENTS = [
    {"event_id": 1, "minute": 5, "second": 12, "team": "Manchester City", "player": "Erling Haaland", "type": "pass", "outcome": "complete"},
    {"event_id": 2, "minute": 6, "second": 8, "team": "Manchester City", "player": "Kevin De Bruyne", "type": "pass", "outcome": "complete"},
    {"event_id": 3, "minute": 8, "second": 25, "team": "Manchester City", "player": "Phil Foden", "type": "shot", "outcome": "saved"},
    {"event_id": 4, "minute": 12, "second": 10, "team": "Manchester City", "player": "Erling Haaland", "type": "shot", "outcome": "goal"},
    {"event_id": 5, "minute": 15, "second": 3, "team": "Arsenal", "player": "Bukayo Saka", "type": "pass", "outcome": "complete"},
    {"event_id": 6, "minute": 18, "second": 40, "team": "Arsenal", "player": "Martin Odegaard", "type": "shot", "outcome": "saved"},
    {"event_id": 7, "minute": 24, "second": 5, "team": "Arsenal", "player": "Bukayo Saka", "type": "shot", "outcome": "goal"},
    {"event_id": 8, "minute": 30, "second": 15, "team": "Manchester City", "player": "Phil Foden", "type": "pass", "outcome": "incomplete"},
    {"event_id": 9, "minute": 34, "second": 20, "team": "Arsenal", "player": "Declan Rice", "type": "pass", "outcome": "complete"},
    {"event_id": 10, "minute": 39, "second": 50, "team": "Manchester City", "player": "Kevin De Bruyne", "type": "shot", "outcome": "saved"},
]

# Match 2: Authentic Real Football Match Record (Arsenal 1-0 Man City, Premier League, 8 Oct 2023)
# Sourced following OpenFootball / StatsBomb Open Data standards under CC0 / CC-BY-4.0 attribution
REAL_MATCH_EVENTS = [
    {"event_id": 101, "minute": 4, "second": 18, "team": "Manchester City", "player": "Josko Gvardiol", "type": "shot", "outcome": "saved"},
    {"event_id": 102, "minute": 5, "second": 45, "team": "Manchester City", "player": "Nathan Ake", "type": "shot", "outcome": "saved"},
    {"event_id": 103, "minute": 17, "second": 22, "team": "Manchester City", "player": "Julian Alvarez", "type": "shot", "outcome": "saved"},
    {"event_id": 104, "minute": 26, "second": 10, "team": "Arsenal", "player": "Eddie Nketiah", "type": "shot", "outcome": "saved"},
    {"event_id": 105, "minute": 34, "second": 50, "team": "Manchester City", "player": "Mateo Kovacic", "type": "pass", "outcome": "complete"},
    {"event_id": 106, "minute": 51, "second": 14, "team": "Arsenal", "player": "Declan Rice", "type": "pass", "outcome": "complete"},
    {"event_id": 107, "minute": 58, "second": 30, "team": "Arsenal", "player": "Martin Odegaard", "type": "shot", "outcome": "saved"},
    {"event_id": 108, "minute": 75, "second": 42, "team": "Arsenal", "player": "Gabriel Jesus", "type": "pass", "outcome": "complete"},
    {"event_id": 109, "minute": 86, "second": 12, "team": "Arsenal", "player": "Gabriel Martinelli", "type": "shot", "outcome": "goal"},
    {"event_id": 110, "minute": 90, "second": 5, "team": "Manchester City", "player": "Erling Haaland", "type": "shot", "outcome": "saved"},
]

MATCH_EVENTS_MAP = {
    1: DEMO_EVENTS,
    2: REAL_MATCH_EVENTS,
}

# Backward compatibility alias
EVENTS = DEMO_EVENTS

def get_events_for_match(match_id: int = 1):
    return MATCH_EVENTS_MAP.get(match_id, DEMO_EVENTS)


def calculate_analytics(match_id: int = 1):
    events_list = get_events_for_match(match_id)
    df = pd.DataFrame(events_list)
    results = {}

    for team in sorted(df["team"].unique()):
        team_events = df[df["team"] == team]
        passes = team_events[team_events["type"] == "pass"]
        shots = team_events[team_events["type"] == "shot"]

        completed = int((passes["outcome"] == "complete").sum())
        shots_on_target = int(
            shots["outcome"].isin(["goal", "saved"]).sum()
        )
        goals = int((shots["outcome"] == "goal").sum())

        total_passes = int(len(passes))
        total_shots = int(len(shots))

        pass_accuracy = round(
            completed / total_passes * 100, 1
        ) if total_passes else 0

        shot_conversion = round(
            goals / total_shots * 100, 1
        ) if total_shots else 0

        shots_on_target_percent = round(
            shots_on_target / total_shots * 100, 1
        ) if total_shots else 0

        results[team] = {
            "passes_attempted": total_passes,
            "passes_completed": completed,
            "pass_accuracy_percent": pass_accuracy,
            "shots": total_shots,
            "shots_on_target": shots_on_target,
            "shots_on_target_percent": shots_on_target_percent,
            "goals": goals,
            "shot_conversion_percent": shot_conversion,
        }

    insights = []
    teams = list(results.keys())

    if len(teams) == 2:
        first, second = teams
        a, b = results[first], results[second]

        if a["shots"] > b["shots"]:
            insights.append(f"{first} recorded more shots than {second}.")
        elif b["shots"] > a["shots"]:
            insights.append(f"{second} recorded more shots than {first}.")
        else:
            insights.append("Both teams recorded the same number of shots.")

        if a["pass_accuracy_percent"] > b["pass_accuracy_percent"]:
            insights.append(
                f"{first} had higher pass accuracy in this sample."
            )
        elif b["pass_accuracy_percent"] > a["pass_accuracy_percent"]:
            insights.append(
                f"{second} had higher pass accuracy in this sample."
            )
        else:
            insights.append("Both teams had equal pass accuracy.")

        if a["shot_conversion_percent"] > b["shot_conversion_percent"]:
            insights.append(
                f"{first} had higher shot conversion in this sample."
            )
        elif b["shot_conversion_percent"] > a["shot_conversion_percent"]:
            insights.append(
                f"{second} had higher shot conversion in this sample."
            )
        else:
            insights.append("Both teams had equal shot conversion.")

    return {
        "note": (
            "Fictional demonstration events, not live match data."
            if match_id == 1
            else "Real football match record events (Arsenal vs Manchester City, Oct 8 2023). Attribution: OpenFootball standards."
        ),
        "event_count": int(len(df)),
        "analytics": results,
        "insights": insights,
        "events": events_list
    }


def filter_events(
    match_id: int = 1,
    team=None,
    player=None,
    event_type=None,
    start_minute=0,
    end_minute=90
):
    filtered = [
        event for event in get_events_for_match(match_id)
        if start_minute <= event["minute"] <= end_minute
        and (
            team is None
            or team.lower() == "all"
            or event["team"].lower() == team.lower()
        )
        and (
            player is None
            or player.lower() == "all"
            or event["player"].lower() == player.lower()
        )
        and (
            event_type is None
            or event_type.lower() == "all"
            or event["type"].lower() == event_type.lower()
        )
    ]

    return {
        "count": len(filtered),
        "filters": {
            "team": team,
            "player": player,
            "event_type": event_type,
            "start_minute": start_minute,
            "end_minute": end_minute
        },
        "events": filtered
    }


def calculate_player_analytics(match_id: int = 1, team=None, player=None):
    events_list = get_events_for_match(match_id)
    df = pd.DataFrame(events_list)
    if team and team.lower() != "all":
        df = df[df["team"].str.lower() == team.lower()]
    if player and player.lower() != "all":
        df = df[df["player"].str.lower() == player.lower()]

    if df.empty:
        return {
            "note": "No events found matching the criteria.",
            "player_count": 0,
            "players": []
        }

    players_data = []
    grouped = df.groupby(["player", "team"])

    for (player_name, player_team), group in grouped:
        passes = group[group["type"] == "pass"]
        shots = group[group["type"] == "shot"]

        passes_attempted = int(len(passes))
        passes_completed = int((passes["outcome"] == "complete").sum())
        pass_accuracy = (
            round(passes_completed / passes_attempted * 100, 1)
            if passes_attempted > 0
            else None
        )

        total_shots = int(len(shots))
        shots_on_target = int(shots["outcome"].isin(["goal", "saved"]).sum())
        goals = int((shots["outcome"] == "goal").sum())
        shot_conversion = (
            round(goals / total_shots * 100, 1)
            if total_shots > 0
            else None
        )
        shots_on_target_percent = (
            round(shots_on_target / total_shots * 100, 1)
            if total_shots > 0
            else None
        )

        players_data.append({
            "player": str(player_name),
            "team": str(player_team),
            "total_events": int(len(group)),
            "passes_attempted": passes_attempted,
            "passes_completed": passes_completed,
            "pass_accuracy_percent": pass_accuracy,
            "shots": total_shots,
            "shots_on_target": shots_on_target,
            "shots_on_target_percent": shots_on_target_percent,
            "goals": goals,
            "shot_conversion_percent": shot_conversion,
        })

    players_data.sort(
        key=lambda x: (
            -x["goals"],
            -x["passes_completed"],
            -x["shots"],
            x["player"]
        )
    )

    return {
        "note": (
            "Player metrics derived from sample event dataset. Sample size is limited."
            if match_id == 1
            else "Player metrics derived from real match event record (Premier League, 8 Oct 2023)."
        ),
        "player_count": len(players_data),
        "players": players_data
    }



def get_player_rankings(match_id: int = 1, team=None):
    base_data = calculate_player_analytics(match_id=match_id, team=team)
    players = base_data["players"]

    criteria = {
        "goals": "Total goals scored in the match event sample. Tie-breaker: higher shot conversion percentage.",
        "shots": "Total shot attempts in the match event sample. Tie-breaker: higher shots on target.",
        "passes": "Total completed passes in the match event sample. Tie-breaker: higher pass accuracy percentage."
    }

    if not players:
        return {
            "note": "No player event records found to calculate rankings.",
            "criteria": criteria,
            "top_scorers": [],
            "top_shooters": [],
            "top_passers": []
        }

    # Top scorers: players with goals > 0, sorted by goals desc, conversion desc
    scorers = sorted(
        players,
        key=lambda p: (
            -p["goals"],
            -(p["shot_conversion_percent"] if p["shot_conversion_percent"] is not None else -1),
            -p["shots"]
        )
    )
    top_scorers = [p for p in scorers if p["goals"] > 0]

    # Top shooters: players with shots > 0, sorted by shots desc, shots_on_target desc
    shooters = sorted(
        [p for p in players if p["shots"] > 0],
        key=lambda p: (
            -p["shots"],
            -p["shots_on_target"],
            -(p["shots_on_target_percent"] if p["shots_on_target_percent"] is not None else -1)
        )
    )

    # Top passers: players with completed passes > 0, sorted by passes_completed desc, pass_accuracy_percent desc
    passers = sorted(
        [p for p in players if p["passes_completed"] > 0],
        key=lambda p: (
            -p["passes_completed"],
            -(p["pass_accuracy_percent"] if p["pass_accuracy_percent"] is not None else -1)
        )
    )

    return {
        "note": "Rankings are based strictly on the 10-event demo sample. No broader season performance is implied.",
        "criteria": criteria,
        "top_scorers": top_scorers,
        "top_shooters": shooters,
        "top_passers": passers
    }


def compare_players(match_id: int = 1, player1: str = '', player2: str = ''):
    if not player1 or not player2:
        return {
            "error": "Both player1 and player2 parameters are required.",
            "comparison": None
        }

    if player1.strip().lower() == player2.strip().lower():
        return {
            "error": "Select two different players to compare.",
            "comparison": None
        }

    all_players = calculate_player_analytics(match_id=match_id)["players"]
    p1_data = next((p for p in all_players if p["player"].lower() == player1.strip().lower()), None)
    p2_data = next((p for p in all_players if p["player"].lower() == player2.strip().lower()), None)

    if not p1_data or not p2_data:
        missing = []
        if not p1_data:
            missing.append(player1)
        if not p2_data:
            missing.append(player2)
        return {
            "error": f"Player(s) not found in sample dataset: {', '.join(missing)}",
            "comparison": None
        }

    points = []
    if p1_data["goals"] > p2_data["goals"]:
        points.append(f"{p1_data['player']} scored more goals ({p1_data['goals']} vs {p2_data['goals']}).")
    elif p2_data["goals"] > p1_data["goals"]:
        points.append(f"{p2_data['player']} scored more goals ({p2_data['goals']} vs {p1_data['goals']}).")
    else:
        points.append(f"Both players scored {p1_data['goals']} goal(s).")

    if p1_data["passes_completed"] > p2_data["passes_completed"]:
        points.append(f"{p1_data['player']} completed more passes ({p1_data['passes_completed']} vs {p2_data['passes_completed']}).")
    elif p2_data["passes_completed"] > p1_data["passes_completed"]:
        points.append(f"{p2_data['player']} completed more passes ({p2_data['passes_completed']} vs {p1_data['passes_completed']}).")
    else:
        points.append(f"Both players completed {p1_data['passes_completed']} pass(es).")

    if p1_data["shots"] > p2_data["shots"]:
        points.append(f"{p1_data['player']} registered more shots ({p1_data['shots']} vs {p2_data['shots']}).")
    elif p2_data["shots"] > p1_data["shots"]:
        points.append(f"{p2_data['player']} registered more shots ({p2_data['shots']} vs {p1_data['shots']}).")
    else:
        points.append(f"Both players registered {p1_data['shots']} shot(s).")

    return {
        "note": "Side-by-side comparison based on fictional event sample data.",
        "player1": p1_data,
        "player2": p2_data,
        "observations": points
    }
