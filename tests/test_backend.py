
import unittest
from backend.main import (
    home,
    health,
    get_matches,
    get_match,
    get_insights,
    get_analytics,
    get_match_events,
    get_match_players,
    get_match_player_rankings,
    get_match_player_comparison,
    get_tactical_analysis,
)
from backend.analytics import (
    calculate_analytics,
    filter_events,
    calculate_player_analytics,
    get_player_rankings,
    compare_players,
)
from fastapi import HTTPException


class TestMatchMindBackend(unittest.TestCase):
    def test_home_and_health(self):
        h = home()
        self.assertEqual(h["status"], "running")
        hl = health()
        self.assertEqual(hl["status"], "healthy")

    def test_get_matches(self):
        matches = get_matches()
        self.assertIsInstance(matches, list)
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["match_id"], 1)

    def test_get_match(self):
        match = get_match(1)
        self.assertEqual(match["home_team"], "Manchester City")
        with self.assertRaises(HTTPException):
            get_match(999)

    def test_get_insights(self):
        res = get_insights(1)
        self.assertIn("insights", res)
        self.assertGreaterEqual(len(res["insights"]), 1)
        with self.assertRaises(HTTPException):
            get_insights(999)

    def test_get_analytics(self):
        res = get_analytics(1)
        self.assertIn("analytics", res)
        self.assertIn("Manchester City", res["analytics"])
        self.assertIn("Arsenal", res["analytics"])

    def test_filter_events(self):
        all_events = get_match_events(1)
        self.assertEqual(all_events["count"], 10)

        city_events = get_match_events(1, team="Manchester City")
        self.assertEqual(city_events["count"], 6)

        arsenal_events = get_match_events(1, team="Arsenal")
        self.assertEqual(arsenal_events["count"], 4)

        early_events = get_match_events(1, start_minute=0, end_minute=10)
        self.assertEqual(early_events["count"], 3)

        # Stage 10: Event type filtering
        shot_events = get_match_events(1, event_type="shot")
        self.assertEqual(shot_events["count"], 5)
        for ev in shot_events["events"]:
            self.assertEqual(ev["type"], "shot")

        pass_events = get_match_events(1, event_type="pass")
        self.assertEqual(pass_events["count"], 5)
        for ev in pass_events["events"]:
            self.assertEqual(ev["type"], "pass")

        # Stage 10: Player filtering
        saka_events = get_match_events(1, player="Bukayo Saka")
        self.assertEqual(saka_events["count"], 2)
        for ev in saka_events["events"]:
            self.assertEqual(ev["player"], "Bukayo Saka")

        # Stage 10: Combined filtering
        combined = get_match_events(1, team="Arsenal", event_type="shot", start_minute=10, end_minute=25)
        self.assertEqual(combined["count"], 2)

        with self.assertRaises(HTTPException):
            get_match_events(1, start_minute=50, end_minute=20)

    def test_player_analytics(self):
        players_res = get_match_players(1)
        self.assertIn("players", players_res)
        self.assertEqual(players_res["player_count"], 6)

        # Filter by team
        arsenal_players = get_match_players(1, team="Arsenal")
        self.assertEqual(arsenal_players["player_count"], 3)
        for p in arsenal_players["players"]:
            self.assertEqual(p["team"], "Arsenal")

        # Filter by player
        haaland = get_match_players(1, player="Erling Haaland")
        self.assertEqual(haaland["player_count"], 1)
        self.assertEqual(haaland["players"][0]["goals"], 1)
        self.assertEqual(haaland["players"][0]["passes_completed"], 1)

        with self.assertRaises(HTTPException):
            get_match_players(999)

    def test_player_rankings(self):
        rankings = get_match_player_rankings(1)
        self.assertIn("top_scorers", rankings)
        self.assertIn("top_shooters", rankings)
        self.assertIn("top_passers", rankings)
        self.assertIn("criteria", rankings)

        # Two players scored in sample: Bukayo Saka and Erling Haaland
        self.assertEqual(len(rankings["top_scorers"]), 2)
        scorers = [p["player"] for p in rankings["top_scorers"]]
        self.assertIn("Erling Haaland", scorers)
        self.assertIn("Bukayo Saka", scorers)

        # Rankings by team
        city_rankings = get_match_player_rankings(1, team="Manchester City")
        self.assertEqual(len(city_rankings["top_scorers"]), 1)
        self.assertEqual(city_rankings["top_scorers"][0]["player"], "Erling Haaland")

        with self.assertRaises(HTTPException):
            get_match_player_rankings(999)

    def test_player_comparison(self):
        comp = get_match_player_comparison(1, player1="Erling Haaland", player2="Bukayo Saka")
        self.assertEqual(comp["player1"]["player"], "Erling Haaland")
        self.assertEqual(comp["player2"]["player"], "Bukayo Saka")
        self.assertGreaterEqual(len(comp["observations"]), 1)

        # Comparing same player should fail
        with self.assertRaises(HTTPException):
            get_match_player_comparison(1, player1="Erling Haaland", player2="Erling Haaland")

        # Unknown player should fail
        with self.assertRaises(HTTPException):
            get_match_player_comparison(1, player1="Unknown Player", player2="Bukayo Saka")

    def test_tactical_analysis(self):
        tactical = get_tactical_analysis(1)
        self.assertEqual(len(tactical["reports"]), 2)

        city_tactical = get_tactical_analysis(1, team="Manchester City")
        self.assertEqual(len(city_tactical["reports"]), 1)
        self.assertEqual(city_tactical["reports"][0]["team"], "Manchester City")

        with self.assertRaises(HTTPException):
            get_tactical_analysis(1, team="Invalid Team")


if __name__ == "__main__":
    unittest.main()
