
import { useEffect, useState } from "react";
import "./App.css";

const API = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : "http://127.0.0.1:8000";

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

  // Audience persona: "analyst" (technical) vs "fan" (plain English)
  const [personaMode, setPersonaMode] = useState("analyst");

  // Important moments & pattern detection
  const [moments, setMoments] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [momentFilter, setMomentFilter] = useState("All");

  // Broadcast Overlay Mode (OBS streaming)
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [broadcastCompact, setBroadcastCompact] = useState(false);
  const [broadcastTransparent, setBroadcastTransparent] = useState(false);

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

        const [
          matchesRes,
          matchRes,
          analyticsRes,
          insightsRes,
          eventsRes,
          playersRes,
          rankingsRes,
          momentsRes,
          patternsRes,
        ] = await Promise.all([
          fetch(`${API}/api/matches`),
          fetch(`${API}/api/matches/${selectedMatchId}`),
          fetch(`${API}/api/matches/${selectedMatchId}/analytics`),
          fetch(`${API}/api/matches/${selectedMatchId}/insights`),
          fetch(`${API}/api/matches/${selectedMatchId}/events`),
          fetch(`${API}/api/matches/${selectedMatchId}/players`),
          fetch(`${API}/api/matches/${selectedMatchId}/player-rankings`),
          fetch(`${API}/api/matches/${selectedMatchId}/important-moments`),
          fetch(`${API}/api/matches/${selectedMatchId}/patterns`),
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
          momentsData,
          patternsData,
        ] = await Promise.all([
          matchesRes.json(),
          matchRes.json(),
          analyticsRes.json(),
          insightsRes.json(),
          eventsRes.json(),
          playersRes.json(),
          rankingsRes.json(),
          momentsRes.json(),
          patternsRes.json(),
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
        setMoments(momentsData.moments ?? []);
        setPatterns(patternsData.patterns ?? []);

        // Reset interactive filters on match switch
        setTeam("All");
        setPlayerTeam("All");
        setFilterPlayer("All");
        setFilterEventType("All");
        setStartMinute(0);
        setEndMinute(90);
        setMomentFilter("All");
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

  if (broadcastMode) {
    return (
      <BroadcastOverlay
        match={match}
        matchesList={matchesList}
        selectedMatchId={selectedMatchId}
        onSelectMatchId={setSelectedMatchId}
        analytics={analytics}
        insights={insights}
        moments={moments}
        isCompact={broadcastCompact}
        onToggleCompact={() => setBroadcastCompact(!broadcastCompact)}
        isTransparent={broadcastTransparent}
        onToggleTransparent={() => setBroadcastTransparent(!broadcastTransparent)}
        personaMode={personaMode}
        onExit={() => setBroadcastMode(false)}
      />
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
        <div className="topbar-controls">
          <button
            type="button"
            className="broadcast-toggle-btn"
            onClick={() => setBroadcastMode(true)}
            title="Open OBS-ready Broadcast Overlay Mode for stream graphics"
          >
            📺 Broadcast Mode
          </button>
          <div
            className="persona-switcher"
            role="radiogroup"
            aria-label="Experience Mode"
          >
            <button
              type="button"
              role="radio"
              aria-checked={personaMode === "analyst"}
              className={`persona-btn ${personaMode === "analyst" ? "active" : ""}`}
              onClick={() => setPersonaMode("analyst")}
              title="Analyst Mode: Detailed telemetry, tactical coaching recommendations, and raw metrics"
            >
              <span className="persona-icon">📊</span>
              <span>Analyst</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={personaMode === "fan"}
              className={`persona-btn ${personaMode === "fan" ? "active" : ""}`}
              onClick={() => setPersonaMode("fan")}
              title="Casual Fan Mode: Plain-English match story, hero moments, and simplified summaries"
            >
              <span className="persona-icon">🎉</span>
              <span>Casual Fan</span>
            </button>
          </div>
          {match.is_real_data ? (
            <span className="real-badge">ILLUSTRATIVE REAL RECORD</span>
          ) : (
            <span className="demo-badge">DEMO DATA</span>
          )}
        </div>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">
            {personaMode === "analyst"
              ? "FOOTBALL INTELLIGENCE PLATFORM · ANALYST EDITION"
              : "MATCHDAY COMPANION · CASUAL FAN EDITION"}
          </p>
          <h1>
            {personaMode === "analyst" ? (
              <>
                See beyond <span>the score.</span>
              </>
            ) : (
              <>
                The story behind <span>the match.</span>
              </>
            )}
          </h1>
          <p className="subtitle">
            {personaMode === "analyst"
              ? "Match analytics, team performance, advanced telemetry and tactical insights in one place."
              : "Plain-English match stories, key player moments, and simplified game summaries for supporters."}
          </p>
        </div>

        <div className="welcome-badges">
          <div className={`mode-indicator-pill ${personaMode === "fan" ? "fan-mode" : ""}`}>
            {personaMode === "analyst" ? "📊 ANALYST VIEW" : "🎉 CASUAL FAN VIEW"}
          </div>
          <div className="status-pill">
            <span className="status-dot" /> API CONNECTED
          </div>
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
              ? "Verified Match Summary (PL Official) · Illustrative Event Sample"
              : "Sample match data · Not live"}
          </span>
        </div>
      </section>

      {/* Casual Fan Mode: Plain-English narrative & key takeaways */}
      {personaMode === "fan" && (
        <section className="fan-narrative-banner panel">
          <div className="fan-narrative-header">
            <span className="fan-pill-tag">🎉 CASUAL FAN MATCH STORY</span>
            <span className="fan-read-time">1 MIN READ</span>
          </div>
          <h3 className="fan-narrative-title">
            {match.match_id === 1
              ? "City Controlled the Ball, but Arsenal Struck Back for an Exciting 1 - 1 Stalemate"
              : "Arsenal Seal Dramatic 1 - 0 Triumph Over City with Late Martinelli Strike"}
          </h3>
          <p className="fan-narrative-desc">
            {match.match_id === 1
              ? "Manchester City dictated 62% possession and fired 14 shots, opening the scoring through Erling Haaland in the 12th minute. But Arsenal stood firm, executing a clinical attacking counter for Bukayo Saka to equalize in the 24th minute to share the points."
              : "In a heavyweight battle of tactical discipline, Arsenal held reigning champions Manchester City to just 4 total shots all match. The decisive breakthrough arrived in the 86th minute when substitute Gabriel Martinelli's strike deflected past the keeper to ignite Emirates Stadium."}
          </p>
          <div className="fan-takeaways-grid">
            <div className="fan-takeaway-item">
              <span className="fan-takeaway-icon">⚡</span>
              <div>
                <strong>{match.match_id === 1 ? "Tempo & Ball Control" : "Even Territory"}</strong>
                <p>
                  {match.match_id === 1
                    ? "City dictated play with 520 passes to Arsenal's 310, setting a high attacking tempo."
                    : "Possession was split almost equally (Arsenal 51% vs 49% City) across 90 minutes."}
                </p>
              </div>
            </div>
            <div className="fan-takeaway-item">
              <span className="fan-takeaway-icon">🎯</span>
              <div>
                <strong>{match.match_id === 1 ? "Finishing Power" : "Defensive Lockout"}</strong>
                <p>
                  {match.match_id === 1
                    ? "Both teams made their big chances count, scoring with 50% shot conversion in the key sequence."
                    : "Arsenal restricted City to only 1 shot on target, shutting down Haaland and Alvarez."}
                </p>
              </div>
            </div>
            <div className="fan-takeaway-item">
              <span className="fan-takeaway-icon">⭐</span>
              <div>
                <strong>{match.match_id === 1 ? "Key Duel" : "Match Hero"}</strong>
                <p>
                  {match.match_id === 1
                    ? "Haaland vs Saka: both talismanic attackers found the back of the net in style."
                    : "Gabriel Martinelli's late 86' strike proved the difference between the title contenders."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Match statistics */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {personaMode === "analyst" ? "PERFORMANCE OVERVIEW" : "AT A GLANCE"}
            </p>
            <h2>
              {personaMode === "analyst" ? "Match statistics" : "Key scoreboard numbers"}
            </h2>
          </div>
          <span className="section-note">
            {match.is_real_data ? "Verified official match statistics" : "From sample demonstration data"}
          </span>
        </div>

        <div className="stat-grid">
          <StatCard
            title="Possession"
            home={match.stats.home.possession}
            away={match.stats.away.possession}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            suffix="%"
            fanExplanation="Share of ball control"
            personaMode={personaMode}
          />
          <StatCard
            title="Total shots"
            home={match.stats.home.shots}
            away={match.stats.away.shots}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            fanExplanation="Attempts to score"
            personaMode={personaMode}
          />
          <StatCard
            title="Shots on target"
            home={match.stats.home.shots_on_target}
            away={match.stats.away.shots_on_target}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            fanExplanation="Accurate tests on goal"
            personaMode={personaMode}
          />
          <StatCard
            title="Passes completed"
            home={match.stats.home.passes_completed}
            away={match.stats.away.passes_completed}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            fanExplanation="Successful team links"
            personaMode={personaMode}
          />
        </div>
      </section>

      {/* Team analytics */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {personaMode === "analyst" ? "EVENT DATA ANALYSIS" : "TEAM BREAKDOWN"}
            </p>
            <h2>
              {personaMode === "analyst" ? "Team analytics" : "Team performance summary"}
            </h2>
          </div>
          {personaMode === "fan" && (
            <span className="mini-tag">SIMPLIFIED VIEW</span>
          )}
        </div>

        <div className="analytics-grid">
          {teamNames.map((name) => {
            const stats = analytics.analytics[name];

            if (personaMode === "fan") {
              return (
                <article className="panel team-panel" key={name}>
                  <div className="team-panel-heading">
                    <h3>{name}</h3>
                    <span className="mini-tag">EVENT SAMPLE</span>
                  </div>

                  <div className="metric-row">
                    <span>Passing Rhythm</span>
                    <strong>{stats.passes_completed} of {stats.passes_attempted} completed</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${stats.pass_accuracy_percent}%` }}
                    />
                  </div>
                  <p className="fan-stat-tip">
                    {stats.pass_accuracy_percent}% accuracy — {stats.pass_accuracy_percent >= 80 ? "Smooth and reliable passing tempo" : "Focused on direct forward movement"}
                  </p>

                  <div className="metric-row" style={{ marginTop: "16px" }}>
                    <span>Attacking Threat</span>
                    <strong>{stats.shots} shots ({stats.shots_on_target} on target)</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, Math.max(0, stats.shots_on_target_percent ?? 0))}%` }}
                    />
                  </div>

                  <div className="metric-row" style={{ marginTop: "16px" }}>
                    <span>Goals in Sample</span>
                    <strong className="highlight-green">{stats.goals}</strong>
                  </div>

                  <div className="fan-player-note">
                    {stats.goals > 0
                      ? `🎯 ${name} converted their big chance into a goal.`
                      : `🛡️ ${name} recorded ${stats.shots} shot(s) in this key phase.`}
                  </div>
                </article>
              );
            }

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
            <p className="eyebrow">
              {personaMode === "analyst" ? "AUTOMATED OBSERVATIONS" : "PLAIN-ENGLISH MATCH SUMMARY"}
            </p>
            <h2>
              {personaMode === "analyst" ? "Match insights" : "Supporter takeaways"}
            </h2>
          </div>
          <span className="ai-tag">
            {personaMode === "analyst" ? "✦ RULE-BASED" : "✦ FAN HIGHLIGHTS"}
          </span>
        </div>

        <div className="insights-grid">
          {personaMode === "analyst"
            ? insights.map((insight, index) => (
                <article
                  className="panel insight-card"
                  key={`${insight}-${index}`}
                >
                  <span className="insight-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{insight}</p>
                </article>
              ))
            : (
                (match.match_id === 1 ? [
                  "1. Ball Control & Pressure: Manchester City controlled 62% of the ball and played 520 passes, pinning Arsenal back for extended periods.",
                  "2. Fast & Lethal Counter: Arsenal stayed disciplined in defense and punished City on the break with a clinical goal from Bukayo Saka.",
                  "3. High Shot Quality: Half of all recorded shots hit the target, showing both goalkeepers had to stay sharp under pressure.",
                  "4. Talisman Impact: Erling Haaland and Bukayo Saka proved to be the difference-makers for their respective sides."
                ] : [
                  "1. Tactical Chess Match: Possession was almost split down the middle (Arsenal 51% vs 49% City) in a tense, balanced contest.",
                  "2. Defensive Masterclass: Arsenal's backline effectively locked down Manchester City, limiting them to just a single shot on target.",
                  "3. Super-Sub Winner: Gabriel Martinelli made an immediate impact off the bench, netting the decisive 86th-minute winner.",
                  "4. Emirates Statement: This victory marked Arsenal's first Premier League win over Manchester City since December 2015."
                ]).map((summary, idx) => (
                  <article className="panel insight-card" key={`fan-insight-${idx}`}>
                    <span className="insight-number">✦</span>
                    <p>{summary}</p>
                  </article>
                ))
              )
          }
        </div>

        <p className="footnote">
          {personaMode === "analyst"
            ? (match.is_real_data
                ? "Observations are generated from verified match stats & illustrative key events."
                : "Observations are generated from fictional sample data.")
            : "Plain-English supporter summary derived from verified match stats and recorded moments."}
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
        personaMode={personaMode}
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
        isRealData={match.is_real_data}
      />

      {/* Important moments breakdown */}
      <ImportantMomentsSection
        moments={moments}
        filter={momentFilter}
        onFilterChange={setMomentFilter}
        personaMode={personaMode}
        isRealData={match.is_real_data}
      />

      {/* Football pattern detection */}
      <PatternDetectionSection
        patterns={patterns}
        personaMode={personaMode}
      />

      {/* Tactical analysis */}
      <section className="section" id="tactical-analysis">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {personaMode === "analyst" ? "TACTICAL INTELLIGENCE" : "THE MANAGER'S GAMEPLAN"}
            </p>
            <h2>
              {personaMode === "analyst" ? "Tactical analysis" : "Coach's corner for supporters"}
            </h2>
          </div>

          <span className="ai-tag">
            {personaMode === "analyst" ? "✦ MATCHMIND ANALYST" : "✦ SUPPORTER STRATEGY GUIDE"}
          </span>
        </div>

        <div className="panel team-panel">
          <div className="team-panel-heading">
            <div>
              <h3>Team analysis report</h3>
              <p className="section-note">
                {personaMode === "analyst"
                  ? "Explore sample statistics and suggested actions."
                  : "Supporter breakdown: how each team structured play and adjusted tactics."}
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
                  <span className="mini-tag">
                    {personaMode === "analyst" ? "SAMPLE REPORT" : "FAN STRATEGY GUIDE"}
                  </span>
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
                  {personaMode === "analyst" ? "Analysis" : `What Went Right for ${report.team}`}
                </h4>

                <div className="insights-grid">
                  {report.analysis.map((item, index) => (
                    <div
                      className="panel insight-card"
                      key={`${report.team}-analysis-${index}`}
                    >
                      <span className="insight-number">
                        {personaMode === "analyst" ? String(index + 1).padStart(2, "0") : "✓"}
                      </span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>

                <h4 style={{ marginTop: "24px" }}>
                  {personaMode === "analyst" ? "Tactical recommendations" : "Supporter Advice: What to Watch Next"}
                </h4>

                <div className="insights-grid">
                  {report.recommendations.map((recommendation, index) => (
                    <div
                      className="panel insight-card"
                      key={`${report.team}-recommendation-${index}`}
                    >
                      <span className="insight-number">{personaMode === "analyst" ? "✦" : "★"}</span>
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
        personaMode={personaMode}
      />

      {/* Stage 9: Player rankings & top performers */}
      <PlayerRankings rankings={rankings} teamNames={teamNames} personaMode={personaMode} />

      {/* Stage 9: Head-to-head player comparison */}
      <PlayerComparison players={players} personaMode={personaMode} />

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
  fanExplanation = "",
  personaMode = "analyst",
}) {
  const total = Number(home) + Number(away);
  const homeShare = total ? (Number(home) / total) * 100 : 50;

  return (
    <article className="panel stat-card">
      <p>{title}</p>
      {personaMode === "fan" && fanExplanation && (
        <span className="fan-stat-tip">{fanExplanation}</span>
      )}

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

function VisualAnalytics({ events, teamAnalytics, isRealData = false }) {
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
            {isRealData
              ? "These charts use the illustrative key-event sample, not the full 90-minute box score totals."
              : "These charts use the available fictional event sample, not the separate match scoreboard totals."}
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

function PlayerAnalytics({
  players,
  teamNames,
  selectedTeam,
  onTeamChange,
  personaMode = "analyst",
}) {
  const filteredPlayers = players.filter((p) => {
    return selectedTeam === "All" || p.team === selectedTeam;
  });

  return (
    <section className="section" id="player-analytics">
      <div className="section-heading event-heading">
        <div>
          <p className="eyebrow">
            {personaMode === "analyst" ? "INDIVIDUAL METRICS" : "MATCH HEROES & KEY PLAYERS"}
          </p>
          <h2>
            {personaMode === "analyst" ? "Player performance analytics" : "Player spotlight"}
          </h2>
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

            if (personaMode === "fan") {
              const roleBadge = player.goals > 0
                ? { label: "🏆 Goal Decider", className: "role-decider" }
                : player.shots >= 2
                  ? { label: "🎯 Attack Catalyst", className: "role-threat" }
                  : player.passes_completed >= 2
                    ? { label: "✨ Midfield Engine", className: "role-distributor" }
                    : { label: "⚽ Key Contributor", className: "role-contributor" };

              return (
                <article className="panel player-card" key={player.player}>
                  <div className="player-card-header">
                    <div>
                      <h3 className="player-name">{player.player}</h3>
                      <span className={`player-team-pill ${isCity ? "team-city" : "team-arsenal"}`}>
                        {player.team}
                      </span>
                      <span className={`fan-role-badge ${roleBadge.className}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                    <span className="player-events-badge">
                      {player.total_events} {player.total_events === 1 ? "moment" : "moments"}
                    </span>
                  </div>

                  <div className="player-stats-grid">
                    <div className="player-stat-box">
                      <span className="stat-label">Goals</span>
                      <strong className="stat-value highlight-green">{player.goals}</strong>
                    </div>
                    <div className="player-stat-box">
                      <span className="stat-label">Shots on Target</span>
                      <strong className="stat-value">
                        {player.shots_on_target} <span className="stat-sub">({player.shots} total)</span>
                      </strong>
                    </div>
                    <div className="player-stat-box">
                      <span className="stat-label">Passes Completed</span>
                      <strong className="stat-value">
                        {player.passes_completed}
                      </strong>
                    </div>
                    <div className="player-stat-box">
                      <span className="stat-label">Passing Accuracy</span>
                      <strong className="stat-value">
                        {player.pass_accuracy_percent !== null
                          ? `${player.pass_accuracy_percent}%`
                          : "No passes"}
                      </strong>
                    </div>
                  </div>

                  {player.pass_accuracy_percent !== null && (
                    <div className="progress-track" style={{ marginTop: "12px" }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${player.pass_accuracy_percent}%` }}
                      />
                    </div>
                  )}

                  <div className="fan-player-note">
                    {player.goals > 0
                      ? "Delivered the crucial finishing touch to score for their side."
                      : player.shots_on_target > 0
                        ? "Forced the goalkeeper into action with dangerous attempts on goal."
                        : (player.pass_accuracy_percent ?? 0) >= 80
                          ? "Tidy and composed in possession, linking play smoothly."
                          : "Worked hard to support team structure and defensive shape."}
                  </div>
                </article>
              );
            }

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

function PlayerRankings({ rankings, teamNames = [], personaMode = "analyst" }) {
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
          <p className="eyebrow">
            {personaMode === "analyst" ? "LEADERBOARDS & RANKINGS" : "MATCH LEADERS"}
          </p>
          <h2>
            {personaMode === "analyst" ? "Top performers" : "Who stepped up"}
          </h2>
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
          <h3>{personaMode === "analyst" ? "⚽ Top Goalscorers" : "🏆 Match Deciders"}</h3>
          <span className="criteria-badge" title={criteria?.goals}>
            {personaMode === "analyst"
              ? "Criteria: Most goals (tie-breaker: conversion %)"
              : "Ranked by goals scored"}
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
          <h3>{personaMode === "analyst" ? "🎯 Shot Threats" : "🎯 Attack Catalysts"}</h3>
          <span className="criteria-badge" title={criteria?.shots}>
            {personaMode === "analyst"
              ? "Criteria: Most shots (tie-breaker: on target)"
              : "Ranked by shots on target"}
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
          <h3>{personaMode === "analyst" ? "↗ Completed Passes" : "✨ Pass Masters"}</h3>
          <span className="criteria-badge" title={criteria?.passes}>
            {personaMode === "analyst"
              ? "Criteria: Most passes (tie-breaker: accuracy %)"
              : "Ranked by completed passes"}
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

function PlayerComparison({ players, personaMode = "analyst" }) {
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
          <p className="eyebrow">
            {personaMode === "analyst" ? "HEAD-TO-HEAD" : "SUPPORTER COMPARISON"}
          </p>
          <h2>
            {personaMode === "analyst" ? "Player comparison" : "Head-to-head showdown"}
          </h2>
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

            {personaMode === "fan" && (
              <div className="fan-verdict-box">
                <h4>🎉 Fan Verdict: {p1.player} vs {p2.player}</h4>
                <p>
                  {p1.goals > p2.goals
                    ? `${p1.player} had the decisive edge on the scoresheet with ${p1.goals} goal(s), proving to be the bigger scoring threat than ${p2.player}.`
                    : p2.goals > p1.goals
                      ? `${p2.player} made the key breakthrough with ${p2.goals} goal(s), carrying a more direct finishing impact than ${p1.player}.`
                      : p1.goals > 0
                        ? `Both ${p1.player} and ${p2.player} were clinical for their teams, scoring ${p1.goals} goal(s) each in their key opportunities.`
                        : `${p1.player} registered ${p1.shots} shot(s) and ${p1.passes_completed} completed pass(es), while ${p2.player} recorded ${p2.shots} shot(s) and ${p2.passes_completed} completed pass(es) in this match phase.`}
                </p>
              </div>
            )}

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
  personaMode = "analyst",
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

        {personaMode === "fan" && (
          <div className="fan-tip-banner">
            <span>💡</span>
            <span>
              Supporter Tip: Choose any player or event type to follow their exact moments on the timeline!
            </span>
          </div>
        )}

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

function ImportantMomentsSection({
  moments,
  filter,
  onFilterChange,
  personaMode,
  isRealData,
}) {
  const filtered = moments.filter((m) => {
    if (filter === "Goals") return m.is_goal;
    if (filter === "ShotsOnTarget") return m.outcome === "goal" || m.outcome === "saved";
    return true;
  });

  return (
    <section className="section" id="important-moments">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {personaMode === "analyst" ? "EVIDENCE-BASED EVENT BREAKDOWN" : "THE TURNING POINTS"}
          </p>
          <h2>
            {personaMode === "analyst" ? "Important match moments" : "Match-defining moments"}
          </h2>
        </div>
        <span className="ai-tag">✦ FACTS & CONTEXT</span>
      </div>

      <div className="moments-filter-bar">
        <span className="section-note" style={{ marginRight: "8px" }}>Filter moments:</span>
        <button
          type="button"
          className={`moment-filter-btn ${filter === "All" ? "active" : ""}`}
          onClick={() => onFilterChange("All")}
        >
          All Key Events ({moments.length})
        </button>
        <button
          type="button"
          className={`moment-filter-btn ${filter === "Goals" ? "active" : ""}`}
          onClick={() => onFilterChange("Goals")}
        >
          ⚽ Goals Only ({moments.filter((m) => m.is_goal).length})
        </button>
        <button
          type="button"
          className={`moment-filter-btn ${filter === "ShotsOnTarget" ? "active" : ""}`}
          onClick={() => onFilterChange("ShotsOnTarget")}
        >
          🎯 Shots on Target ({moments.filter((m) => m.outcome === "goal" || m.outcome === "saved").length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No moments match the active filter.</p>
      ) : (
        <div className="moments-grid">
          {filtered.map((moment) => (
            <article
              key={moment.event_id}
              className={`moment-card ${moment.is_goal ? "moment-goal" : ""}`}
            >
              <div className="moment-card-header">
                <span className="moment-minute-badge">
                  {moment.minute}′{moment.second ? ` ${moment.second}s` : ""}
                </span>
                <span
                  className={`moment-type-badge ${
                    moment.is_goal
                      ? "type-goal"
                      : moment.outcome === "saved"
                        ? "type-saved"
                        : "type-pass"
                  }`}
                >
                  {moment.is_goal ? "⚽ GOAL" : moment.type === "shot" ? "🎯 SHOT ON TARGET" : "↗ PASS"}
                </span>
              </div>

              <div className="moment-player-info">
                <strong>{moment.player}</strong>
                <span>({moment.team})</span>
              </div>

              <div className="moment-fact-block">
                <span className="moment-fact-label">Observed Fact</span>
                <p className="moment-fact-text">{moment.observed_fact}</p>
              </div>

              <div className="moment-context-block">
                <span className="moment-context-label">
                  {personaMode === "analyst" ? "Analytical Significance" : "Why It Matters for Supporters"}
                </span>
                <p className="moment-context-text">{moment.analytical_context}</p>
              </div>

              <p className="moment-caveat">
                {moment.sequence_caveat}
              </p>
            </article>
          ))}
        </div>
      )}

      <p className="footnote" style={{ marginTop: "16px" }}>
        Notice: {isRealData
          ? "Moments reflect illustrative key attacking sequences from official Premier League match logs. No unrecorded passes or movements are fabricated."
          : "Moments are strictly derived from the demonstration event dataset."}
      </p>
    </section>
  );
}

function PatternDetectionSection({ patterns, personaMode }) {
  if (!patterns || patterns.length === 0) {
    return null;
  }

  return (
    <section className="section" id="pattern-detection">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {personaMode === "analyst" ? "DATA PATTERN DETECTION" : "OBSERVABLE MATCH PATTERNS"}
          </p>
          <h2>
            {personaMode === "analyst" ? "Tactical pattern detection" : "Key trends in the data"}
          </h2>
        </div>
        <span className="ai-tag">✦ STATISTICAL EVIDENCE</span>
      </div>

      <div className="patterns-grid">
        {patterns.map((pat, idx) => (
          <article className="pattern-card" key={`pat-${idx}`}>
            <div className="pattern-header">
              <span className="pattern-category-badge">{pat.category}</span>
              <span className="pattern-confidence">{pat.team}</span>
            </div>
            <h4 className="pattern-metric">{pat.metric}</h4>
            <p className="pattern-evidence">
              <strong>Evidence:</strong> {pat.evidence}
            </p>
            <p className="pattern-interpretation">
              <strong>Interpretation:</strong> {pat.tactical_interpretation}
            </p>
          </article>
        ))}
      </div>

      <p className="footnote" style={{ marginTop: "14px" }}>
        Pattern Caveat: Observations are derived strictly from recorded discrete event fields. Spatial coordinates, pressing intensity, and tracking chains are absent and not inferred.
      </p>
    </section>
  );
}

function BroadcastOverlay({
  match,
  matchesList,
  selectedMatchId,
  onSelectMatchId,
  insights,
  moments,
  isCompact,
  onToggleCompact,
  isTransparent,
  onToggleTransparent,
  personaMode,
  onExit,
}) {
  const homeStats = match.stats.home;
  const awayStats = match.stats.away;
  const keyMoment = moments.find((m) => m.is_goal) || moments[0];
  const primaryInsight = insights[0] || "Match tracking active.";

  const isCityHome = match.home_team.toLowerCase().includes("city");
  const isArsenalAway = match.away_team.toLowerCase().includes("arsenal");

  const totalShots = homeStats.shots + awayStats.shots;
  const homeShotShare = totalShots ? (homeStats.shots / totalShots) * 100 : 50;

  return (
    <main className={`broadcast-view ${isTransparent ? "transparent-bg" : ""}`}>
      {/* Broadcast Operator Control Bar */}
      <nav className="broadcast-toolbar" aria-label="Broadcast controls">
        <div className="broadcast-toolbar-left">
          <button
            type="button"
            className="broadcast-exit-btn"
            onClick={onExit}
          >
            ← Exit Broadcast (Return to Dashboard)
          </button>

          <button
            type="button"
            className={`broadcast-mode-btn ${isCompact ? "active" : ""}`}
            onClick={onToggleCompact}
          >
            {isCompact ? "⛶ Switch to Full Overlay" : "▫ Switch to Compact Scorebug"}
          </button>

          <button
            type="button"
            className={`broadcast-mode-btn ${isTransparent ? "active" : ""}`}
            onClick={onToggleTransparent}
          >
            {isTransparent ? "⬛ Studio Dark Backdrop" : "🏁 Transparent OBS Backdrop"}
          </button>
        </div>

        <div className="broadcast-toolbar-right">
          <label htmlFor="broadcast-match-select" style={{ fontSize: "11px", color: "#8da491" }}>Active Match:</label>
          <select
            id="broadcast-match-select"
            value={selectedMatchId}
            onChange={(e) => onSelectMatchId(Number(e.target.value))}
            className="match-selector-select"
            style={{ padding: "6px 10px", fontSize: "12px" }}
          >
            {matchesList.map((m) => (
              <option key={m.match_id} value={m.match_id}>
                {m.home_team} vs {m.away_team} ({m.is_real_data ? "PL Record" : "Demo"})
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* Broadcast Canvas */}
      <div className="broadcast-canvas">
        {isCompact ? (
          /* Compact Scorebug Layout (Fits small OBS window source) */
          <div className="broadcast-compact-box">
            <div className="scorebug-top-strip">
              <span className="scorebug-league-tag">
                ⚽ {match.competition.toUpperCase()}
              </span>
              <span className="scorebug-status-tag">
                {match.is_real_data ? "FINAL SCORE (OFFICIAL)" : "SAMPLE SCORE (DEMO)"}
              </span>
            </div>
            <div className="scorebug-match-row" style={{ padding: "16px 20px" }}>
              <div className="scorebug-team">
                <div className={`scorebug-crest ${isCityHome ? "city" : "arsenal"}`}>
                  {match.home_team[0]}
                </div>
                <h2>{match.home_team}</h2>
              </div>
              <div className="scorebug-score-box" style={{ padding: "8px 18px" }}>
                <span className="scorebug-num">{match.score.home}</span>
                <span className="scorebug-colon">:</span>
                <span className="scorebug-num">{match.score.away}</span>
              </div>
              <div className="scorebug-team away">
                <div className={`scorebug-crest ${isArsenalAway ? "arsenal" : "city"}`}>
                  {match.away_team[0]}
                </div>
                <h2>{match.away_team}</h2>
              </div>
            </div>
            <div className="scorebug-lower-third" style={{ padding: "10px 18px", fontSize: "12px" }}>
              {keyMoment && (
                <span>
                  ⚽ {keyMoment.minute}′ {keyMoment.player} ({keyMoment.outcome === "goal" ? "GOAL" : keyMoment.outcome})
                </span>
              )}
              <span style={{ color: "#7b917f", fontSize: "10px" }}>
                {match.is_real_data ? "PL Verified Box Score" : "Demo Data"}
              </span>
            </div>
          </div>
        ) : (
          /* Full Broadcast Lower-Third & Graphics Frame */
          <div className="broadcast-scorebug">
            <div className="scorebug-top-strip">
              <span className="scorebug-league-tag">
                ⚽ {match.competition.toUpperCase()}
              </span>
              <span className="scorebug-status-tag">
                {match.is_real_data ? "FINAL SCORE (OFFICIAL)" : "SAMPLE SCORE (DEMO)"}
              </span>
            </div>

            <div className="scorebug-match-row">
              <div className="scorebug-team">
                <div className={`scorebug-crest ${isCityHome ? "city" : "arsenal"}`}>
                  {match.home_team[0]}
                </div>
                <div>
                  <h2>{match.home_team}</h2>
                  <span style={{ fontSize: "11px", color: "#8ea491", letterSpacing: "1px" }}>HOME</span>
                </div>
              </div>

              <div className="scorebug-score-box">
                <span className="scorebug-num">{match.score.home}</span>
                <span className="scorebug-colon">:</span>
                <span className="scorebug-num">{match.score.away}</span>
              </div>

              <div className="scorebug-team away">
                <div className={`scorebug-crest ${isArsenalAway ? "arsenal" : "city"}`}>
                  {match.away_team[0]}
                </div>
                <div>
                  <h2>{match.away_team}</h2>
                  <span style={{ fontSize: "11px", color: "#8ea491", letterSpacing: "1px" }}>AWAY</span>
                </div>
              </div>
            </div>

            {/* Lower-Third Telemetry Ticker */}
            <div className="scorebug-lower-third">
              {keyMoment ? (
                <div className="scorebug-key-moment">
                  <span className="scorebug-moment-badge">
                    {keyMoment.is_goal ? "⚽ KEY MOMENT" : "🎯 MATCH EVENT"}
                  </span>
                  <strong>
                    {keyMoment.minute}′ {keyMoment.player} ({keyMoment.team}): {keyMoment.is_goal ? "GOAL" : keyMoment.outcome}
                  </strong>
                </div>
              ) : (
                <div className="scorebug-key-moment">
                  <span className="scorebug-moment-badge">📊 TELEMETRY</span>
                  <span>{primaryInsight}</span>
                </div>
              )}

              <div className="scorebug-telemetry-pill">
                {personaMode === "fan" ? "🎉 CASUAL FAN FEED" : "📊 ANALYST FEED"} · {match.is_real_data ? "Official Summary" : "Demo Data"}
              </div>
            </div>

            {/* Broadcast Key Stats Strip */}
            <div className="broadcast-stats-strip" style={{ margin: "16px 24px 20px" }}>
              <div className="broadcast-stat-card">
                <div className="broadcast-stat-header">
                  <span>{match.home_team}</span>
                  <span>Possession</span>
                  <span>{match.away_team}</span>
                </div>
                <div className="broadcast-stat-values">
                  <span>{homeStats.possession}%</span>
                  <span>vs</span>
                  <span>{awayStats.possession}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${homeStats.possession}%` }}
                  />
                </div>
              </div>

              <div className="broadcast-stat-card">
                <div className="broadcast-stat-header">
                  <span>{match.home_team}</span>
                  <span>Total Shots</span>
                  <span>{match.away_team}</span>
                </div>
                <div className="broadcast-stat-values">
                  <span>{homeStats.shots}</span>
                  <span>vs</span>
                  <span>{awayStats.shots}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${homeShotShare}%` }}
                  />
                </div>
              </div>

              <div className="broadcast-stat-card">
                <div className="broadcast-stat-header">
                  <span>{match.home_team}</span>
                  <span>Shots on Target</span>
                  <span>{match.away_team}</span>
                </div>
                <div className="broadcast-stat-values">
                  <span>{homeStats.shots_on_target}</span>
                  <span>vs</span>
                  <span>{awayStats.shots_on_target}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(homeStats.shots_on_target / Math.max(1, homeStats.shots_on_target + awayStats.shots_on_target)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
