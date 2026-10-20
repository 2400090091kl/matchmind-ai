
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [selectedMatchId, setSelectedMatchId] = useState(1);
  const [matchesList, setMatchesList] = useState([]);
  const [match, setMatch] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState("All");

  const [tacticalTeam, setTacticalTeam] = useState("All");
  const [tacticalReports, setTacticalReports] = useState([]);
  const [tacticalNote, setTacticalNote] = useState("");
  const [tacticalLoading, setTacticalLoading] = useState(true);
  const [tacticalError, setTacticalError] = useState("");

  const [players, setPlayers] = useState([]);
  const [playerTeam, setPlayerTeam] = useState("All");
  const [rankings, setRankings] = useState(null);

  // Stage 10: Interactive filters
  const [filterPlayer, setFilterPlayer] = useState("All");
  const [filterEventType, setFilterEventType] = useState("All");
  const [startMinute, setStartMinute] = useState(0);
  const [endMinute, setEndMinute] = useState(90);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [matchesRes, matchRes, analyticsRes, insightsRes, eventsRes, playersRes, rankingsRes] =
          await Promise.all([
            fetch(`${API}/api/matches`),
            fetch(`${API}/api/matches/${selectedMatchId}`),
            fetch(`${API}/api/matches/${selectedMatchId}/analytics`),
            fetch(`${API}/api/matches/${selectedMatchId}/insights`),
            fetch(`${API}/api/matches/${selectedMatchId}/events`),
            fetch(`${API}/api/matches/${selectedMatchId}/players`),
            fetch(`${API}/api/matches/${selectedMatchId}/player-rankings`),
          ]);

        if (!matchRes.ok || !analyticsRes.ok) {
          throw new Error("Could not load match intelligence.");
        }

        const [
          matchesData,
          matchData,
          analyticsData,
          insightsData,
          eventsData,
          playersData,
          rankingsData,
        ] = await Promise.all([
          matchesRes.json(),
          matchRes.json(),
          analyticsRes.json(),
          insightsRes.json(),
          eventsRes.json(),
          playersRes.json(),
          rankingsRes.json(),
        ]);

        setMatchesList(matchesData);
        setMatch(matchData);
        setAnalytics(analyticsData);
        setInsights([
          ...insightsData.insights,
          ...analyticsData.insights,
        ]);
        setEvents(eventsData.events);
        setPlayers(playersData.players ?? []);
        setRankings(rankingsData);

        // Reset interactive filters on match switch
        setTeam("All");
        setPlayerTeam("All");
        setFilterPlayer("All");
        setFilterEventType("All");
        setStartMinute(0);
        setEndMinute(90);
      } catch {
        setError(
          "Unable to connect to the backend. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [selectedMatchId]);

  useEffect(() => {
    async function loadTacticalAnalysis() {
      try {
        setTacticalLoading(true);
        setTacticalError("");

        const url =
          tacticalTeam === "All"
            ? `${API}/api/matches/${selectedMatchId}/tactical-analysis`
            : `${API}/api/matches/${selectedMatchId}/tactical-analysis?team=${encodeURIComponent(tacticalTeam)}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Tactical analysis request failed (${response.status}).`);
        }

        const data = await response.json();

        setTacticalReports(data.reports ?? []);
        setTacticalNote(data.note ?? "");
      } catch (err) {
        setTacticalError(
          err.message || "Unable to load tactical analysis."
        );
        setTacticalReports([]);
      } finally {
        setTacticalLoading(false);
      }
    }

    loadTacticalAnalysis();
  }, [selectedMatchId, tacticalTeam]);

  const teamNames = analytics
    ? Object.keys(analytics.analytics)
    : [];

  const allPlayerNames = Array.from(new Set(events.map((e) => e.player))).sort();

  const filteredEvents = events.filter((event) => {
    const matchesTeam = team === "All" || event.team === team;
    const matchesPlayer = filterPlayer === "All" || event.player === filterPlayer;
    const matchesType = filterEventType === "All" || event.type === filterEventType;
    const matchesMinute = event.minute >= startMinute && event.minute <= endMinute;
    return matchesTeam && matchesPlayer && matchesType && matchesMinute;
  });

  const visibleEvents = filteredEvents;

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loader" />
        <h2>MatchMind AI</h2>
        <p>Loading match intelligence...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="loading-screen">
        <h1>MatchMind AI</h1>
        <p className="error">{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry connection
        </button>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">M</span>
          <span>
            MatchMind <b>AI</b>
          </span>
        </a>
        {match.is_real_data ? (
          <span className="real-badge">REAL FOOTBALL RECORD</span>
        ) : (
          <span className="demo-badge">DEMO DATA</span>
        )}
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">FOOTBALL INTELLIGENCE PLATFORM</p>
          <h1>
            See beyond <span>the score.</span>
          </h1>
          <p className="subtitle">
            Match analytics, team performance and tactical insights in one place.
          </p>
        </div>

        <div className="status-pill">
          <span className="status-dot" /> API CONNECTED
        </div>
      </section>

      {/* Stage 11: Real football data switcher */}
      <section className="match-selector-bar">
        <div className="match-selector-group">
          <span className="match-selector-label">Active Match Dataset:</span>
          <select
            className="match-selector-select"
            aria-label="Select match dataset"
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(Number(e.target.value))}
          >
            {matchesList.map((m) => (
              <option key={m.match_id} value={m.match_id}>
                {m.match_id === 1 ? "★ " : "⚽ "}
                {m.home_team} vs {m.away_team} — {m.competition} ({m.is_real_data ? "Illustrative Record" : "Demo Data"})
              </option>
            ))}
          </select>
        </div>

        <div className="source-attribution-pill">
          {match.is_real_data
            ? "Source: Premier League 2023/24 (Verified Box Score & Illustrative Key Events)"
            : "Source: Fictional demonstration events"}
        </div>
      </section>

      {/* Match centre */}
      <section className="score-card">
        <div className="match-heading">
          <span>{match.is_real_data ? "⚽ OFFICIAL MATCH RECORD" : "⚽ MATCH CENTRE"}</span>
          <span className={match.is_real_data ? "real-badge" : "demo-label"}>
            {match.is_real_data ? match.competition : "FICTIONAL MATCH"}
          </span>
        </div>

        <div className="score-content">
          <div className="club">
            <div className={`club-emblem ${match.home_team.toLowerCase().includes("city") ? "city" : "arsenal"}`}>
              {match.home_team[0]}
            </div>
            <h2>{match.home_team}</h2>
            <span className="club-label">HOME</span>
          </div>

          <div className="score">
            <div className="score-numbers">
              {match.score.home}
              <span>:</span>
              {match.score.away}
            </div>
            <span className="match-status">
              {match.is_real_data ? "FINAL SCORE" : "SAMPLE SCORE"}
            </span>
          </div>

          <div className="club">
            <div className={`club-emblem ${match.away_team.toLowerCase().includes("arsenal") ? "arsenal" : "city"}`}>
              {match.away_team[0]}
            </div>
            <h2>{match.away_team}</h2>
            <span className="club-label">AWAY</span>
          </div>
        </div>

        <div className="score-footer">
          <span>Match ID: {match.match_id} · {match.venue ?? "Venue Demo"}</span>
          <span>
            {match.is_real_data
              ? "Authentic Match Record · OpenFootball Data Standards"
              : "Sample match data · Not live"}
          </span>
        </div>
      </section>

      {/* Match statistics */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PERFORMANCE OVERVIEW</p>
            <h2>Match statistics</h2>
          </div>
          <span className="section-note">From sample data</span>
        </div>

        <div className="stat-grid">
          <StatCard
            title="Possession"
            home={match.stats.home.possession}
            away={match.stats.away.possession}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            suffix="%"
          />
          <StatCard
            title="Total shots"
            home={match.stats.home.shots}
            away={match.stats.away.shots}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
          />
          <StatCard
            title="Shots on target"
            home={match.stats.home.shots_on_target}
            away={match.stats.away.shots_on_target}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
          />
          <StatCard
            title="Passes completed"
            home={match.stats.home.passes_completed}
            away={match.stats.away.passes_completed}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
          />
        </div>
      </section>

      {/* Team analytics */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EVENT DATA ANALYSIS</p>
            <h2>Team analytics</h2>
          </div>
        </div>

        <div className="analytics-grid">
          {teamNames.map((name) => {
            const stats = analytics.analytics[name];

            return (
              <article className="panel team-panel" key={name}>
                <div className="team-panel-heading">
                  <h3>{name}</h3>
                  <span className="mini-tag">EVENT SAMPLE</span>
                </div>

                <div className="metric-row">
                  <span>Passes completed</span>
                  <strong>
                    {stats.passes_completed}/{stats.passes_attempted}
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stats.pass_accuracy_percent}%`,
                    }}
                  />
                </div>

                <div className="metric-row">
                  <span>Pass accuracy</span>
                  <strong>{stats.pass_accuracy_percent}%</strong>
                </div>

                <div className="metric-row">
                  <span>Shots</span>
                  <strong>{stats.shots}</strong>
                </div>

                <div className="metric-row">
                  <span>Shots on target</span>
                  <strong>{stats.shots_on_target}</strong>
                </div>

                <div className="metric-row">
                  <span>Shots on target %</span>
                  <strong>{stats.shots_on_target_percent ?? 0}%</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, stats.shots_on_target_percent ?? 0))}%`,
                    }}
                  />
                </div>

                <div className="metric-row">
                  <span>Shot conversion</span>
                  <strong>{stats.shot_conversion_percent ?? 0}%</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, stats.shot_conversion_percent ?? 0))}%`,
                    }}
                  />
                </div>

                <div className="metric-row">
                  <span>Goals in event sample</span>
                  <strong>{stats.goals}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Existing insights */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AUTOMATED OBSERVATIONS</p>
            <h2>Match insights</h2>
          </div>
          <span className="ai-tag">✦ RULE-BASED</span>
        </div>

        <div className="insights-grid">
          {insights.map((insight, index) => (
            <article
              className="panel insight-card"
              key={`${insight}-${index}`}
            >
              <span className="insight-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p>{insight}</p>
            </article>
          ))}
        </div>

        <p className="footnote">
          Observations are generated from fictional sample data.
        </p>
      </section>

      {/* Stage 10: Interactive filter controls */}
      <FilterControlBar
        team={team}
        onTeamChange={setTeam}
        teamNames={teamNames}
        player={filterPlayer}
        onPlayerChange={setFilterPlayer}
        playerNames={allPlayerNames}
        eventType={filterEventType}
        onEventTypeChange={setFilterEventType}
        startMinute={startMinute}
        onStartMinuteChange={setStartMinute}
        endMinute={endMinute}
        onEndMinuteChange={setEndMinute}
        totalCount={events.length}
        filteredCount={filteredEvents.length}
        onReset={() => {
          setTeam("All");
          setFilterPlayer("All");
          setFilterEventType("All");
          setStartMinute(0);
          setEndMinute(90);
        }}
      />

      {/* Visual match analytics with live filtered events */}
      <VisualAnalytics
        events={filteredEvents}
        teamAnalytics={analytics.analytics}
      />

      {/* NEW: Tactical analysis */}
      <section className="section" id="tactical-analysis">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TACTICAL INTELLIGENCE</p>
            <h2>Tactical analysis</h2>
          </div>

          <span className="ai-tag">✦ MATCHMIND ANALYST</span>
        </div>

        <div className="panel team-panel">
          <div className="team-panel-heading">
            <div>
              <h3>Team analysis report</h3>
              <p className="section-note">
                Explore sample statistics and suggested actions.
              </p>
            </div>

            <select
              aria-label="Select team for tactical analysis"
              value={tacticalTeam}
              onChange={(event) => setTacticalTeam(event.target.value)}
            >
              <option value="All">Both teams</option>
              {teamNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {tacticalLoading && (
            <p className="empty-state">
              Generating tactical report...
            </p>
          )}

          {!tacticalLoading && tacticalError && (
            <div>
              <p className="error">{tacticalError}</p>
              <button
                onClick={() =>
                  setTacticalTeam((current) => current)
                }
              >
                Try again
              </button>
              <p className="footnote">
                If the report endpoint is missing, check the FastAPI terminal.
              </p>
            </div>
          )}

          {!tacticalLoading &&
            !tacticalError &&
            tacticalReports.map((report) => (
              <article
                className="panel team-panel"
                key={report.team}
                style={{ marginTop: "18px" }}
              >
                <div className="team-panel-heading">
                  <h3>{report.team}</h3>
                  <span className="mini-tag">SAMPLE REPORT</span>
                </div>

                <div className="metric-row">
                  <span>Pass accuracy</span>
                  <strong>
                    {report.sample_stats.pass_accuracy_percent}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${report.sample_stats.pass_accuracy_percent}%`,
                    }}
                  />
                </div>

                <div className="metric-row">
                  <span>Shots recorded</span>
                  <strong>{report.sample_stats.shots}</strong>
                </div>

                <div className="metric-row">
                  <span>Goals in event sample</span>
                  <strong>{report.sample_stats.goals}</strong>
                </div>

                <h4 style={{ marginTop: "24px" }}>
                  Analysis
                </h4>

                <div className="insights-grid">
                  {report.analysis.map((item, index) => (
                    <div
                      className="panel insight-card"
                      key={`${report.team}-analysis-${index}`}
                    >
                      <span className="insight-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>

                <h4 style={{ marginTop: "24px" }}>
                  Tactical recommendations
                </h4>

                <div className="insights-grid">
                  {report.recommendations.map((recommendation, index) => (
                    <div
                      className="panel insight-card"
                      key={`${report.team}-recommendation-${index}`}
                    >
                      <span className="insight-number">✦</span>
                      <p>{recommendation}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}

          {!tacticalLoading &&
            !tacticalError &&
            tacticalReports.length === 0 && (
              <p className="empty-state">
                No tactical reports are available for this selection.
              </p>
            )}

          {tacticalNote && !tacticalError && (
            <p className="footnote" style={{ marginTop: "18px" }}>
              Note: {tacticalNote}
            </p>
          )}
        </div>
      </section>

      {/* Player performance analytics */}
      <PlayerAnalytics
        players={players}
        teamNames={teamNames}
        selectedTeam={playerTeam}
        onTeamChange={setPlayerTeam}
      />

      {/* Stage 9: Player rankings & top performers */}
      <PlayerRankings rankings={rankings} teamNames={teamNames} />

      {/* Stage 9: Head-to-head player comparison */}
      <PlayerComparison players={players} />

      {/* Match event log */}
      <section className="section">
        <div className="section-heading event-heading">
          <div>
            <p className="eyebrow">MATCH EVENT LOG</p>
            <h2>Key events</h2>
          </div>

          <select
            aria-label="Filter events by team"
            value={team}
            onChange={(event) => setTeam(event.target.value)}
          >
            <option value="All">All teams</option>
            {teamNames.map((name) => (
              <option value={name} key={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="panel event-panel">
          {visibleEvents.length === 0 ? (
            <p className="empty-state">No events found.</p>
          ) : (
            visibleEvents.map((event) => (
              <div className="event-row" key={event.event_id}>
                <span className="event-minute">
                  {event.minute}&apos;
                </span>

                <span
                  className={`event-icon ${
                    event.outcome === "goal" ? "goal" : ""
                  }`}
                >
                  {event.outcome === "goal"
                    ? "⚽"
                    : event.type === "shot"
                      ? "◉"
                      : "↗"}
                </span>

                <div className="event-description">
                  <strong>{event.player}</strong>
                  <span>{event.team}</span>
                </div>

                <div className="event-result">
                  <span>{event.type}</span>
                  <strong>{event.outcome}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="footer">
        <span>MatchMind AI</span>
        <span>
          Football data exploration · Fictional demo version
        </span>
      </footer>
    </main>
  );
}

function StatCard({
  title,
  home,
  away,
  homeTeam = "Home",
  awayTeam = "Away",
  suffix = "",
}) {
  const total = Number(home) + Number(away);
  const homeShare = total ? (Number(home) / total) * 100 : 50;

  return (
    <article className="panel stat-card">
      <p>{title}</p>

      <div className="stat-values">
        <strong>
          {home}
          {suffix}
        </strong>
        <span>vs</span>
        <strong>
          {away}
          {suffix}
        </strong>
      </div>

      <div className="comparison-track">
        <div style={{ width: `${homeShare}%` }} />
      </div>

      <div className="stat-teams">
        <span>{homeTeam}</span>
        <span>{awayTeam}</span>
      </div>
    </article>
  );
}

function VisualAnalytics({ events, teamAnalytics }) {
  const teams = Object.entries(teamAnalytics || {});

  const shots = events
    .filter((event) => event.type === "shot")
    .sort((a, b) => a.minute - b.minute);

  const maxShots = Math.max(
    1,
    ...teams.map(([, stats]) => stats.shots)
  );

  const maxGoals = Math.max(
    1,
    ...teams.map(([, stats]) => stats.goals)
  );

  return (
    <section className="section" id="visual-analytics">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DATA VISUALIZATION</p>
          <h2>Visual match analytics</h2>
        </div>
        <span className="ai-tag">✦ EVENT DATA</span>
      </div>

      <div className="analytics-grid">
        <article className="panel team-panel">
          <h3>Shot timeline</h3>
          <p className="section-note">
            Shots and goals by minute in the sample events.
          </p>

          <div className="shot-timeline">
            <div className="timeline-axis">
              <span>0′</span>
              <span>45′</span>
              <span>90′</span>
            </div>

            <div className="timeline-track">
              {shots.map((event) => {
                const isGoal = event.outcome === "goal";
                const isCity = event.team === "Manchester City";

                return (
                  <div
                    key={event.event_id}
                    className={`timeline-event ${
                      isGoal ? "timeline-goal" : ""
                    } ${isCity ? "timeline-city" : "timeline-arsenal"}`}
                    style={{
                      left: `${(event.minute / 90) * 100}%`,
                      top: isCity ? "15%" : "65%",
                    }}
                    title={`${event.minute}′ — ${event.team}: ${event.outcome}`}
                  >
                    {isGoal ? "⚽" : "●"}
                  </div>
                );
              })}
            </div>

            <div className="timeline-legend">
              <span><i className="legend-city" /> Manchester City</span>
              <span><i className="legend-arsenal" /> Arsenal</span>
              <span>⚽ Goal</span>
            </div>
          </div>

          <div className="shot-event-list">
            {shots.length === 0 ? (
              <p className="empty-state">No shot events available.</p>
            ) : (
              shots.map((event) => (
                <div className="metric-row" key={event.event_id}>
                  <span>
                    {event.minute}′ · {event.team} · {event.player}
                  </span>
                  <strong>
                    {event.outcome === "goal" ? "GOAL" : event.outcome}
                  </strong>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel team-panel">
          <h3>Team performance comparison</h3>
          <p className="section-note">
            Compare event-based shots, shots on target, and goals.
          </p>

          {teams.map(([name, stats]) => (
            <div className="visual-team" key={name}>
              <h4>{name}</h4>

              <div className="visual-metric">
                <div className="metric-row">
                  <span>Shots</span>
                  <strong>{stats.shots}</strong>
                </div>
                <div className="visual-track">
                  <div
                    className="visual-fill"
                    style={{
                      width: `${(stats.shots / maxShots) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="visual-metric">
                <div className="metric-row">
                  <span>Shots on target</span>
                  <strong>{stats.shots_on_target}</strong>
                </div>
                <div className="visual-track">
                  <div
                    className="visual-fill target-fill"
                    style={{
                      width: `${
                        (stats.shots_on_target / maxShots) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="visual-metric">
                <div className="metric-row">
                  <span>Goals</span>
                  <strong>{stats.goals}</strong>
                </div>
                <div className="visual-track">
                  <div
                    className="visual-fill goal-fill"
                    style={{
                      width: `${(stats.goals / maxGoals) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <p className="footnote">
            These charts use the available fictional event sample,
            not the separate match scoreboard totals.
          </p>
        </article>
      </div>

      <article className="panel team-panel passing-visual">
        <h3>Passing accuracy</h3>
        <p className="section-note">
          Percentage of recorded passes marked complete in the event sample.
        </p>

        {teams.map(([name, stats]) => (
          <div className="passing-team" key={name}>
            <div className="metric-row">
              <span>{name}</span>
              <strong>{stats.pass_accuracy_percent}%</strong>
            </div>
            <div
              className="visual-track passing-track"
              role="progressbar"
              aria-label={`${name} passing accuracy`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stats.pass_accuracy_percent}
            >
              <div
                className="visual-fill"
                style={{
                  width: `${stats.pass_accuracy_percent}%`,
                }}
              />
            </div>
          </div>
        ))}
      </article>
    </section>
  );
}

function PlayerAnalytics({ players, teamNames, selectedTeam, onTeamChange }) {
  const filteredPlayers = players.filter((p) => {
    return selectedTeam === "All" || p.team === selectedTeam;
  });

  return (
    <section className="section" id="player-analytics">
      <div className="section-heading event-heading">
        <div>
          <p className="eyebrow">INDIVIDUAL METRICS</p>
          <h2>Player performance analytics</h2>
        </div>
        <select
          aria-label="Filter players by team"
          value={selectedTeam}
          onChange={(e) => onTeamChange(e.target.value)}
        >
          <option value="All">All teams</option>
          {teamNames.map((name) => (
            <option value={name} key={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="player-grid">
        {filteredPlayers.length === 0 ? (
          <p className="empty-state">No player records available for this filter.</p>
        ) : (
          filteredPlayers.map((player) => {
            const isCity = player.team === "Manchester City";
            return (
              <article className="panel player-card" key={player.player}>
                <div className="player-card-header">
                  <div>
                    <h3 className="player-name">{player.player}</h3>
                    <span className={`player-team-pill ${isCity ? "team-city" : "team-arsenal"}`}>
                      {player.team}
                    </span>
                  </div>
                  <span className="player-events-badge">
                    {player.total_events} {player.total_events === 1 ? "event" : "events"}
                  </span>
                </div>

                <div className="player-stats-grid">
                  <div className="player-stat-box">
                    <span className="stat-label">Goals</span>
                    <strong className="stat-value highlight-green">{player.goals}</strong>
                  </div>
                  <div className="player-stat-box">
                    <span className="stat-label">Shots (Target)</span>
                    <strong className="stat-value">
                      {player.shots} <span className="stat-sub">({player.shots_on_target})</span>
                    </strong>
                  </div>
                  <div className="player-stat-box">
                    <span className="stat-label">Passes (C/A)</span>
                    <strong className="stat-value">
                      {player.passes_completed}/{player.passes_attempted}
                    </strong>
                  </div>
                  <div className="player-stat-box">
                    <span className="stat-label">Pass Accuracy</span>
                    <strong className="stat-value">
                      {player.pass_accuracy_percent !== null
                        ? `${player.pass_accuracy_percent}%`
                        : "N/A*"}
                    </strong>
                  </div>
                </div>

                {player.pass_accuracy_percent !== null ? (
                  <div className="progress-track" style={{ marginTop: "12px" }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${player.pass_accuracy_percent}%` }}
                    />
                  </div>
                ) : (
                  <p className="stat-footnote">*No passes recorded in sample</p>
                )}

                <div className="player-card-footer">
                  <span>Conversion: {player.shot_conversion_percent !== null ? `${player.shot_conversion_percent}%` : "N/A"}</span>
                  <span>On-target %: {player.shots_on_target_percent !== null ? `${player.shots_on_target_percent}%` : "N/A"}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
      <p className="footnote" style={{ marginTop: "14px" }}>
        * Pass accuracy is marked N/A where a player attempted zero passes in the sample. Statistics are derived strictly from the recorded event sample.
      </p>
    </section>
  );
}

function PlayerRankings({ rankings, teamNames = [] }) {
  const [rankingTeam, setRankingTeam] = useState("All");

  if (!rankings) {
    return null;
  }

  const { top_scorers, top_shooters, top_passers, criteria } = rankings;

  const filterList = (list) => {
    return (list || []).filter(
      (p) => rankingTeam === "All" || p.team === rankingTeam
    );
  };

  const filteredScorers = filterList(top_scorers);
  const filteredShooters = filterList(top_shooters);
  const filteredPassers = filterList(top_passers);

  return (
    <section className="section" id="player-rankings">
      <div className="section-heading event-heading">
        <div>
          <p className="eyebrow">LEADERBOARDS & RANKINGS</p>
          <h2>Top performers</h2>
        </div>
        <select
          aria-label="Filter rankings by team"
          value={rankingTeam}
          onChange={(e) => setRankingTeam(e.target.value)}
        >
          <option value="All">All teams</option>
          {teamNames.map((name) => (
            <option value={name} key={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="rankings-grid">
        {/* Top Goalscorers */}
        <article className="panel ranking-card">
          <h3>⚽ Top Goalscorers</h3>
          <span className="criteria-badge" title={criteria?.goals}>
            Criteria: Most goals (tie-breaker: conversion %)
          </span>

          {filteredScorers.length === 0 ? (
            <p className="empty-state">
              {rankingTeam === "All" ? "No goals recorded in this sample." : `No goals recorded for ${rankingTeam} in sample.`}
            </p>
          ) : (
            <div className="ranking-list">
              {filteredScorers.map((player, idx) => (
                <div
                  className={`ranking-item ${idx === 0 ? "top-rank" : ""}`}
                  key={player.player}
                >
                  <span className="ranking-pos">#{idx + 1}</span>
                  <div className="ranking-player-info">
                    <span className="ranking-player-name">{player.player}</span>
                    <span className="ranking-player-team">{player.team}</span>
                  </div>
                  <div>
                    <span className="ranking-stat-val">
                      {player.goals} {player.goals === 1 ? "goal" : "goals"}
                    </span>
                    <span className="ranking-stat-sub">
                      {player.shot_conversion_percent}% conv.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Top Shooters */}
        <article className="panel ranking-card">
          <h3>🎯 Shot Threats</h3>
          <span className="criteria-badge" title={criteria?.shots}>
            Criteria: Most shots (tie-breaker: on target)
          </span>

          {filteredShooters.length === 0 ? (
            <p className="empty-state">
              {rankingTeam === "All" ? "No shot attempts recorded in sample." : `No shots recorded for ${rankingTeam} in sample.`}
            </p>
          ) : (
            <div className="ranking-list">
              {filteredShooters.map((player, idx) => (
                <div
                  className={`ranking-item ${idx === 0 ? "top-rank" : ""}`}
                  key={player.player}
                >
                  <span className="ranking-pos">#{idx + 1}</span>
                  <div className="ranking-player-info">
                    <span className="ranking-player-name">{player.player}</span>
                    <span className="ranking-player-team">{player.team}</span>
                  </div>
                  <div>
                    <span className="ranking-stat-val">
                      {player.shots} {player.shots === 1 ? "shot" : "shots"}
                    </span>
                    <span className="ranking-stat-sub">
                      {player.shots_on_target} on target
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Top Pass Completers */}
        <article className="panel ranking-card">
          <h3>↗ Completed Passes</h3>
          <span className="criteria-badge" title={criteria?.passes}>
            Criteria: Most passes (tie-breaker: accuracy %)
          </span>

          {filteredPassers.length === 0 ? (
            <p className="empty-state">
              {rankingTeam === "All" ? "No completed passes recorded in sample." : `No passes recorded for ${rankingTeam} in sample.`}
            </p>
          ) : (
            <div className="ranking-list">
              {filteredPassers.map((player, idx) => (
                <div
                  className={`ranking-item ${idx === 0 ? "top-rank" : ""}`}
                  key={player.player}
                >
                  <span className="ranking-pos">#{idx + 1}</span>
                  <div className="ranking-player-info">
                    <span className="ranking-player-name">{player.player}</span>
                    <span className="ranking-player-team">{player.team}</span>
                  </div>
                  <div>
                    <span className="ranking-stat-val">
                      {player.passes_completed} completed
                    </span>
                    <span className="ranking-stat-sub">
                      {player.pass_accuracy_percent}% accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <p className="footnote">
        Notice: Rankings are strictly limited to the recorded 10-event dataset. They highlight active players in this sample and do not represent full match or season performance.
      </p>
    </section>
  );
}

function PlayerComparison({ players }) {
  const playerNames = players.map((p) => p.player);
  const [selectedP1, setSelectedP1] = useState("");
  const [selectedP2, setSelectedP2] = useState("");

  const player1Name = players.some((p) => p.player === selectedP1)
    ? selectedP1
    : (playerNames[0] || "");
  const player2Name = players.some((p) => p.player === selectedP2)
    ? selectedP2
    : (playerNames[1] || "");

  const p1 = players.find((p) => p.player === player1Name);
  const p2 = players.find((p) => p.player === player2Name);

  const isSame = player1Name && player2Name && player1Name === player2Name;

  const compareMetric = (val1, val2) => {
    if (val1 === null || val2 === null) return { p1Lead: false, p2Lead: false };
    return {
      p1Lead: val1 > val2,
      p2Lead: val2 > val1,
    };
  };

  return (
    <section className="section" id="player-comparison">
      <div className="section-heading">
        <div>
          <p className="eyebrow">HEAD-TO-HEAD</p>
          <h2>Player comparison</h2>
        </div>
        <span className="ai-tag">✦ SAMPLE COMPARISON</span>
      </div>

      <article className="panel comparison-panel">
        <div className="comparison-selectors">
          <div className="comparison-select-box">
            <label htmlFor="p1-select">Player 1</label>
            <select
              id="p1-select"
              value={player1Name}
              onChange={(e) => setSelectedP1(e.target.value)}
            >
              {playerNames.map((name) => (
                <option key={`p1-${name}`} value={name}>
                  {name} ({players.find((p) => p.player === name)?.team})
                </option>
              ))}
            </select>
          </div>

          <span className="comparison-vs">VS</span>

          <div className="comparison-select-box">
            <label htmlFor="p2-select">Player 2</label>
            <select
              id="p2-select"
              value={player2Name}
              onChange={(e) => setSelectedP2(e.target.value)}
            >
              {playerNames.map((name) => (
                <option key={`p2-${name}`} value={name}>
                  {name} ({players.find((p) => p.player === name)?.team})
                </option>
              ))}
            </select>
          </div>
        </div>

        {isSame && (
          <p className="empty-state">
            Please select two different players to compare head-to-head metrics.
          </p>
        )}

        {!isSame && (!p1 || !p2) && (
          <p className="empty-state">Insufficient player data to render comparison.</p>
        )}

        {!isSame && p1 && p2 && (
          <>
            <div className="comparison-grid">
              {/* Goals */}
              <div className="comparison-card">
                <span className="comparison-metric-title">Goals Scored</span>
                <div className="comparison-metric-values">
                  <span className={`p1-val ${compareMetric(p1.goals, p2.goals).p1Lead ? "val-leader" : ""}`}>
                    {p1.goals}
                  </span>
                  <span className={`p2-val ${compareMetric(p1.goals, p2.goals).p2Lead ? "val-leader" : ""}`}>
                    {p2.goals}
                  </span>
                </div>
              </div>

              {/* Shots */}
              <div className="comparison-card">
                <span className="comparison-metric-title">Shots (Target)</span>
                <div className="comparison-metric-values">
                  <span className={`p1-val ${compareMetric(p1.shots, p2.shots).p1Lead ? "val-leader" : ""}`}>
                    {p1.shots} ({p1.shots_on_target})
                  </span>
                  <span className={`p2-val ${compareMetric(p1.shots, p2.shots).p2Lead ? "val-leader" : ""}`}>
                    {p2.shots} ({p2.shots_on_target})
                  </span>
                </div>
              </div>

              {/* Passes Completed */}
              <div className="comparison-card">
                <span className="comparison-metric-title">Passes Completed</span>
                <div className="comparison-metric-values">
                  <span className={`p1-val ${compareMetric(p1.passes_completed, p2.passes_completed).p1Lead ? "val-leader" : ""}`}>
                    {p1.passes_completed} / {p1.passes_attempted}
                  </span>
                  <span className={`p2-val ${compareMetric(p1.passes_completed, p2.passes_completed).p2Lead ? "val-leader" : ""}`}>
                    {p2.passes_completed} / {p2.passes_attempted}
                  </span>
                </div>
              </div>

              {/* Pass Accuracy */}
              <div className="comparison-card">
                <span className="comparison-metric-title">Pass Accuracy</span>
                <div className="comparison-metric-values">
                  <span className={`p1-val ${compareMetric(p1.pass_accuracy_percent, p2.pass_accuracy_percent).p1Lead ? "val-leader" : ""}`}>
                    {p1.pass_accuracy_percent !== null ? `${p1.pass_accuracy_percent}%` : "N/A"}
                  </span>
                  <span className={`p2-val ${compareMetric(p1.pass_accuracy_percent, p2.pass_accuracy_percent).p2Lead ? "val-leader" : ""}`}>
                    {p2.pass_accuracy_percent !== null ? `${p2.pass_accuracy_percent}%` : "N/A"}
                  </span>
                </div>
              </div>

              {/* Total Events */}
              <div className="comparison-card">
                <span className="comparison-metric-title">Total Sample Events</span>
                <div className="comparison-metric-values">
                  <span className={`p1-val ${compareMetric(p1.total_events, p2.total_events).p1Lead ? "val-leader" : ""}`}>
                    {p1.total_events}
                  </span>
                  <span className={`p2-val ${compareMetric(p1.total_events, p2.total_events).p2Lead ? "val-leader" : ""}`}>
                    {p2.total_events}
                  </span>
                </div>
              </div>
            </div>

            <div className="comparison-observations">
              <h4>Sample Observations</h4>
              <ul>
                <li>
                  {p1.goals > p2.goals
                    ? `${p1.player} scored more goals in this event sample (${p1.goals} vs ${p2.goals}).`
                    : p2.goals > p1.goals
                      ? `${p2.player} scored more goals in this event sample (${p2.goals} vs ${p1.goals}).`
                      : `Both players scored equal goals (${p1.goals}) in this event sample.`}
                </li>
                <li>
                  {p1.passes_completed > p2.passes_completed
                    ? `${p1.player} completed more passes (${p1.passes_completed} vs ${p2.passes_completed}).`
                    : p2.passes_completed > p1.passes_completed
                      ? `${p2.player} completed more passes (${p2.passes_completed} vs ${p1.passes_completed}).`
                      : `Both players completed ${p1.passes_completed} pass(es).`}
                </li>
              </ul>
            </div>
          </>
        )}
      </article>
      <p className="footnote" style={{ marginTop: "14px" }}>
        Comparison Caveat: Head-to-head metrics reflect strictly the 10 recorded sample match events and should not be used to make broad claims about player capability.
      </p>
    </section>
  );
}

function FilterControlBar({
  team,
  onTeamChange,
  teamNames,
  player,
  onPlayerChange,
  playerNames,
  eventType,
  onEventTypeChange,
  startMinute,
  onStartMinuteChange,
  endMinute,
  onEndMinuteChange,
  totalCount,
  filteredCount,
  onReset,
}) {
  const isFiltered =
    team !== "All" ||
    player !== "All" ||
    eventType !== "All" ||
    startMinute !== 0 ||
    endMinute !== 90;

  return (
    <section className="section" id="interactive-filters">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DEEP MATCH EXPLORATION</p>
          <h2>Interactive match filters</h2>
        </div>
        <span className="filter-summary-pill">
          Showing {filteredCount} of {totalCount} events
        </span>
      </div>

      <div className="panel filter-panel">
        <div className="filter-heading">
          <h3>⚡ Filter Analytics & Timeline</h3>
          {isFiltered && (
            <button className="filter-reset-btn" onClick={onReset}>
              ↺ Reset All Filters
            </button>
          )}
        </div>

        <div className="filter-grid">
          {/* Team Filter */}
          <div className="filter-group">
            <label htmlFor="filter-team">Team</label>
            <select
              id="filter-team"
              value={team}
              onChange={(e) => onTeamChange(e.target.value)}
            >
              <option value="All">All Teams</option>
              {teamNames.map((name) => (
                <option key={`filter-${name}`} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Player Filter */}
          <div className="filter-group">
            <label htmlFor="filter-player">Player</label>
            <select
              id="filter-player"
              value={player}
              onChange={(e) => onPlayerChange(e.target.value)}
            >
              <option value="All">All Players</option>
              {playerNames.map((p) => (
                <option key={`filter-${p}`} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="filter-group">
            <label htmlFor="filter-type">Event Type</label>
            <select
              id="filter-type"
              value={eventType}
              onChange={(e) => onEventTypeChange(e.target.value)}
            >
              <option value="All">All Events (Pass & Shot)</option>
              <option value="shot">Shots Only</option>
              <option value="pass">Passes Only</option>
            </select>
          </div>

          {/* Minute Range Filter */}
          <div className="filter-group">
            <label>Minute Range (0′ - 90′)</label>
            <div className="filter-minute-range">
              <input
                type="number"
                min="0"
                max={endMinute}
                value={startMinute}
                aria-label="Start minute"
                onChange={(e) => {
                  const val = Math.max(0, Math.min(Number(e.target.value), endMinute));
                  onStartMinuteChange(val);
                }}
              />
              <span>to</span>
              <input
                type="number"
                min={startMinute}
                max="90"
                value={endMinute}
                aria-label="End minute"
                onChange={(e) => {
                  const val = Math.min(90, Math.max(Number(e.target.value), startMinute));
                  onEndMinuteChange(val);
                }}
              />
              <span>min</span>
            </div>
          </div>
        </div>

        {/* Active filter summary chips */}
        <div className="filter-actions">
          <div className="filter-active-tags">
            <span className="filter-tag-chip">Team: {team}</span>
            <span className="filter-tag-chip">Player: {player}</span>
            <span className="filter-tag-chip">Type: {eventType}</span>
            <span className="filter-tag-chip">Minutes: {startMinute}′ - {endMinute}′</span>
          </div>

          <span className="footnote">
            Charts, timeline, and match event log dynamically update with active filters.
          </span>
        </div>
      </div>
    </section>
  );
}

export default App;
