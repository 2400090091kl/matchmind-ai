
import pandas as pd

# Fictional sample events for testing
EVENTS = [
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


def calculate_analytics():
    df = pd.DataFrame(EVENTS)
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
        "note": "Fictional demonstration events, not live match data.",
        "event_count": int(len(df)),
        "analytics": results,
        "insights": insights,
        "events": EVENTS
    }


def filter_events(team=None, start_minute=0, end_minute=90):
    filtered = [
        event for event in EVENTS
        if start_minute <= event["minute"] <= end_minute
        and (
            team is None
            or event["team"].lower() == team.lower()
        )
    ]

    return {
        "count": len(filtered),
        "filters": {
            "team": team,
            "start_minute": start_minute,
            "end_minute": end_minute
        },
        "events": filtered
    }


def calculate_player_analytics(team=None, player=None):
    df = pd.DataFrame(EVENTS)
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
        "note": "Player metrics derived from sample event dataset. Sample size is limited.",
        "player_count": len(players_data),
        "players": players_data
    }
