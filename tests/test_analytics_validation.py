
import unittest
from backend.analytics import (
    calculate_analytics,
    calculate_player_analytics,
    get_player_rankings,
    filter_events,
    compare_players,
    get_events_for_match,
)


class TestAnalyticsMathValidation(unittest.TestCase):
    def test_match_1_math(self):
        analytics = calculate_analytics(1)["analytics"]

        for team_name, stats in analytics.items():
            attempted = stats["passes_attempted"]
            completed = stats["passes_completed"]
            expected_pass_acc = round(completed / attempted * 100, 1) if attempted else 0
            self.assertEqual(stats["pass_accuracy_percent"], expected_pass_acc)

            shots = stats["shots"]
            sot = stats["shots_on_target"]
            goals = stats["goals"]

            expected_sot_pct = round(sot / shots * 100, 1) if shots else 0
            self.assertEqual(stats["shots_on_target_percent"], expected_sot_pct)

            expected_conv_pct = round(goals / shots * 100, 1) if shots else 0
            self.assertEqual(stats["shot_conversion_percent"], expected_conv_pct)

    def test_match_2_math(self):
        analytics = calculate_analytics(2)["analytics"]

        for team_name, stats in analytics.items():
            attempted = stats["passes_attempted"]
            completed = stats["passes_completed"]
            expected_pass_acc = round(completed / attempted * 100, 1) if attempted else 0
            self.assertEqual(stats["pass_accuracy_percent"], expected_pass_acc)

            shots = stats["shots"]
            sot = stats["shots_on_target"]
            goals = stats["goals"]

            expected_sot_pct = round(sot / shots * 100, 1) if shots else 0
            self.assertEqual(stats["shots_on_target_percent"], expected_sot_pct)

            expected_conv_pct = round(goals / shots * 100, 1) if shots else 0
            self.assertEqual(stats["shot_conversion_percent"], expected_conv_pct)

    def test_zero_division_guard(self):
        # Empty filter should safely return 0/None without crashing
        res = calculate_player_analytics(match_id=1, team="NonExistentTeam")
        self.assertEqual(res["player_count"], 0)
        self.assertEqual(res["players"], [])

    def test_player_stats_sum_to_events(self):
        for m_id in [1, 2]:
            events = get_events_for_match(m_id)
            players_res = calculate_player_analytics(match_id=m_id)
            total_player_events = sum(p["total_events"] for p in players_res["players"])
            self.assertEqual(total_player_events, len(events))

            total_player_goals = sum(p["goals"] for p in players_res["players"])
            event_goals = sum(1 for e in events if e.get("outcome") == "goal")
            self.assertEqual(total_player_goals, event_goals)

    def test_rankings_sorting_and_tiebreakers(self):
        rankings = get_player_rankings(1)
        top_scorers = rankings["top_scorers"]
        for i in range(len(top_scorers) - 1):
            curr, nxt = top_scorers[i], top_scorers[i + 1]
            self.assertGreaterEqual(curr["goals"], nxt["goals"])
            if curr["goals"] == nxt["goals"]:
                self.assertGreaterEqual(
                    curr["shot_conversion_percent"] or 0,
                    nxt["shot_conversion_percent"] or 0
                )

    def test_comparison_tool(self):
        comp = compare_players(1, "Erling Haaland", "Bukayo Saka")
        self.assertIn("observations", comp)
        self.assertEqual(comp["player1"]["player"], "Erling Haaland")
        self.assertEqual(comp["player2"]["player"], "Bukayo Saka")

    def test_persona_data_integrity(self):
        """Verifies underlying data consistency for both Analyst and Casual Fan representations."""
        for match_id in [1, 2]:
            players = calculate_player_analytics(match_id=match_id)["players"]
            self.assertGreater(len(players), 0, f"Match {match_id} must have players")
            for p in players:
                # Math invariant: goals cannot exceed shots
                self.assertLessEqual(p["goals"], p["shots"], f"Player {p['player']} goals > shots")
                # Shots on target cannot exceed shots
                self.assertLessEqual(p["shots_on_target"], p["shots"], f"Player {p['player']} SOT > shots")
                # Passes completed cannot exceed passes attempted
                self.assertLessEqual(p["passes_completed"], p["passes_attempted"], f"Player {p['player']} completed > attempted")
                # Accuracy must be within 0-100 if defined
                if p["pass_accuracy_percent"] is not None:
                    self.assertGreaterEqual(p["pass_accuracy_percent"], 0.0)
                    self.assertLessEqual(p["pass_accuracy_percent"], 100.0)


if __name__ == "__main__":
    unittest.main()

