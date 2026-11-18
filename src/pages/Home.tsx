import { Link } from 'react-router-dom'
import { battingLeaders, pitchingLeaders } from '../lib/stats'
import { computeStandings, formatGameDate, formatPct } from '../lib/standings'
import { useStore } from '../store'

export function Home() {
  const { state } = useStore()
  const upcoming = [...state.games]
    .filter((g) => g.status === 'scheduled')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 4)

  const standings = computeStandings(state).slice(0, 4)
  const avgTop = battingLeaders(state, 'avg', 3)
  const hrTop = battingLeaders(state, 'hr', 3)
  const eraTop = pitchingLeaders(state, 'era', 3)

  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? '—'
  const teamShort = (id: string) =>
    state.teams.find((t) => t.id === id)?.shortName ?? '—'

  return (
    <>
      <section className="hero" aria-label="그라운드북 소개">
        <div className="hero-bg" aria-hidden />
        <div className="hero-diamond" aria-hidden />
        <div className="hero-content">
          <h1 className="hero-brand">
            그라운드<em>북</em>
          </h1>
          <p className="hero-headline">리그 순위와 기록을 한곳에서</p>
          <p className="hero-support">
            팀 순위·타율·홈런·방어율·삼진까지. 일정은 슬라이드로, 운영은
            운영실에서.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/standings">
              순위·기록 보기
            </Link>
            <Link className="btn btn-ghost" to="/schedule">
              일정 슬라이드
            </Link>
          </div>
        </div>
      </section>

      <div className="page">
        <section className="section">
          <h2>{state.league.name}</h2>
          <p className="muted">
            {state.league.seasonLabel} · {state.league.region}
          </p>
          <p>{state.league.description}</p>
        </section>

        <section className="section">
          <h2>다가오는 경기</h2>
          <p className="muted">가로로 넘겨 한눈에 보세요.</p>
          {upcoming.length === 0 ? (
            <p className="empty">예정된 경기가 없습니다.</p>
          ) : (
            <div className="home-rail">
              {upcoming.map((g) => (
                <article key={g.id} className="home-rail-card">
                  <time>{formatGameDate(g.startsAt)}</time>
                  <p className="matchup">
                    {teamShort(g.awayTeamId)} @ {teamShort(g.homeTeamId)}
                  </p>
                  <p className="row-meta">
                    {teamName(g.awayTeamId)} vs {teamName(g.homeTeamId)}
                  </p>
                  <p className="row-meta">{g.venue}</p>
                </article>
              ))}
            </div>
          )}
          <div className="cta-row" style={{ marginTop: '1.25rem' }}>
            <Link className="btn btn-ghost" to="/schedule">
              전체 일정
            </Link>
            <Link className="btn btn-ghost" to="/results">
              지난 결과
            </Link>
          </div>
        </section>

        <section className="section">
          <h2>현재 순위</h2>
          <p className="muted">확정 경기 기준 팀 순위 요약.</p>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>팀</th>
                  <th className="num">승</th>
                  <th className="num">패</th>
                  <th className="num">무</th>
                  <th className="num">승률</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, idx) => {
                  const team = state.teams.find((t) => t.id === row.teamId)
                  return (
                    <tr key={row.teamId}>
                      <td>{idx + 1}</td>
                      <td>
                        <span
                          className="team-swatch"
                          style={{ background: team?.colorHint }}
                        />
                        {team?.name}
                      </td>
                      <td className="num">{row.wins}</td>
                      <td className="num">{row.losses}</td>
                      <td className="num">{row.ties}</td>
                      <td className="num">{formatPct(row.pct)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h2>기록 하이라이트</h2>
          <p className="muted">타율 · 홈런 · 방어율 상위.</p>
          <div className="leader-preview-grid">
            <MiniLeaders title="타율" rows={avgTop} />
            <MiniLeaders title="홈런" rows={hrTop} />
            <MiniLeaders title="방어율" rows={eraTop} />
          </div>
          <div className="cta-row" style={{ marginTop: '1.25rem' }}>
            <Link className="btn btn-primary" to="/leaders">
              전체 항목 순위
            </Link>
            <Link className="btn btn-ghost" to="/ops">
              운영실 열기
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

function MiniLeaders({
  title,
  rows,
}: {
  title: string
  rows: ReturnType<typeof battingLeaders>
}) {
  return (
    <section className="leader-preview">
      <header>
        <h3>{title}</h3>
        <Link to="/leaders">더보기</Link>
      </header>
      <ol>
        {rows.map((r) => (
          <li key={r.player.id}>
            <Link to={`/players/${r.player.id}`}>
              <span className="rank">{r.rank}</span>
              <span className="name">
                {r.player.name}
                <em>{r.team?.shortName}</em>
              </span>
              <strong>{r.display}</strong>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
