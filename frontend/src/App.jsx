
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const responses = await Promise.all([
          fetch(`${API}/api/matches/1`),
          fetch(`${API}/api/matches/1/analytics`),
          fetch(`${API}/api/matches/1/insights`),
          fetch(`${API}/api/matches/1/events`),
        ]);

        if (responses.some((response) => !response.ok)) {
          throw new Error("Could not load match data.");
        }

        const [matchData, analyticsData, insightsData, eventsData] =
          await Promise.all(responses.map((response) => response.json()));

        setMatch(matchData);
        setAnalytics(analyticsData);
        setInsights([
          ...insightsData.insights,
          ...analyticsData.insights,
        ]);
        setEvents(eventsData.events);
      } catch (err) {
        setError(
          "Unable to connect to the backend. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    async function loadTacticalAnalysis() {
      try {
        setTacticalLoading(true);
        setTacticalError("");

        const url =
          tacticalTeam === "All"
            ? `${API}/api/matches/1/tactical-analysis`
            : `${API}/api/matches/1/tactical-analysis?team=${encodeURIComponent(tacticalTeam)}`;

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
  }, [tacticalTeam]);

  const teamNames = analytics
    ? Object.keys(analytics.analytics)
    : [];

  const visibleEvents = events.filter((event) => {
    return team === "All" || event.team === team;
  });

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
        <span className="demo-badge">DEMO DATA</span>
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

      {/* Match centre */}
      <section className="score-card">
        <div className="match-heading">
          <span>⚽ MATCH CENTRE</span>
          <span className="demo-label">FICTIONAL MATCH</span>
        </div>

        <div className="score-content">
          <div className="club">
            <div className="club-emblem city">M</div>
            <h2>{match.home_team}</h2>
            <span className="club-label">HOME</span>
          </div>

          <div className="score">
            <div className="score-numbers">
              {match.score.home}
              <span>:</span>
              {match.score.away}
            </div>
            <span className="match-status">SAMPLE SCORE</span>
          </div>

          <div className="club">
            <div className="club-emblem arsenal">A</div>
            <h2>{match.away_team}</h2>
            <span className="club-label">AWAY</span>
          </div>
        </div>

        <div className="score-footer">
          <span>Match ID: {match.match_id}</span>
          <span>Sample match data · Not live</span>
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
            suffix="%"
          />
          <StatCard
            title="Total shots"
            home={match.stats.home.shots}
            away={match.stats.away.shots}
          />
          <StatCard
            title="Shots on target"
            home={match.stats.home.shots_on_target}
            away={match.stats.away.shots_on_target}
          />
          <StatCard
            title="Passes completed"
            home={match.stats.home.passes_completed}
            away={match.stats.away.passes_completed}
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

      {/* Visual match analytics */}
      <VisualAnalytics
        events={events}
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

function StatCard({ title, home, away, suffix = "" }) {
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
        <span>Man City</span>
        <span>Arsenal</span>
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

export default App;
