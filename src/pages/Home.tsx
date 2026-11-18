import { Link } from 'react-router-dom'
import { media, venueImage } from '../media'
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
  const teamColor = (id: string) =>
    state.teams.find((t) => t.id === id)?.colorHint

  return (
    <>
      <section className="hero hero-photo" aria-label="그라운드북 소개">
        <img
          className="hero-photo-img"
          src={media.hero}
          alt=""
          aria-hidden
        />
        <div className="hero-photo-shade" aria-hidden />
        <div className="hero-light-sweep" aria-hidden />
        <div className="hero-content">
          <h1 className="hero-brand">
            그라운드<em>북</em>
          </h1>
          <p className="hero-headline">리그 순위와 기록을 한곳에서</p>
          <p className="hero-support">
            야간 그라운드 분위기 그대로, 일정·순위·선수 기록을 바로 엽니다.
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

      <section className="atmosphere-strip" aria-label="리그 분위기">
        <figure className="atmosphere-panel">
          <img src={media.dugout} alt="더그아웃 장비와 잔디" />
          <figcaption>
            <strong>{state.league.name}</strong>
            <span>
              {state.league.seasonLabel} · {state.league.region}
            </span>
          </figcaption>
        </figure>
        <figure className="atmosphere-panel">
          <img src={media.outfield} alt="야간 외야 조명" />
          <figcaption>
            <strong>주말 야간 그라운드</strong>
            <span>샘플 사진 · 실제 리그 사진으로 교체 가능</span>
          </figcaption>
        </figure>
        <figure className="atmosphere-panel atmosphere-panel-square">
          <img src={media.ball} alt="파울라인 위의 야구공" />
          <figcaption>
            <strong>기록은 그라운드에서</strong>
            <span>타율·홈런·방어율까지 한 화면</span>
          </figcaption>
        </figure>
      </section>

      <div className="page">
        <section className="section">
          <h2>다가오는 경기</h2>
          <p className="muted">사진 타일로 넘겨 보세요.</p>
          {upcoming.length === 0 ? (
            <p className="empty">예정된 경기가 없습니다.</p>
          ) : (
            <div className="home-rail visual-rail">
              {upcoming.map((g, i) => (
                <article
                  key={g.id}
                  className="match-poster"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <img src={venueImage(g.id + g.venue)} alt="" aria-hidden />
                  <div className="match-poster-shade" />
                  <div className="match-poster-body">
                    <time>{formatGameDate(g.startsAt)}</time>
                    <p className="matchup">
                      <span
                        className="team-swatch"
                        style={{ background: teamColor(g.awayTeamId) }}
                      />
                      {teamShort(g.awayTeamId)}
                      <em>@</em>
                      <span
                        className="team-swatch"
                        style={{ background: teamColor(g.homeTeamId) }}
                      />
                      {teamShort(g.homeTeamId)}
                    </p>
                    <p className="row-meta">
                      {teamName(g.awayTeamId)} vs {teamName(g.homeTeamId)}
                    </p>
                    <p className="row-meta">{g.venue}</p>
                  </div>
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
          <h2>전광판 순위</h2>
          <p className="muted">확정 경기 기준 팀 순위 요약.</p>
          <div className="scoreboard board-enter">
            <div className="scoreboard-glow" aria-hidden />
            <table className="data scoreboard-table">
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
                      <td className="board-rank">{idx + 1}</td>
                      <td>
                        <span
                          className="team-swatch"
                          style={{ background: team?.colorHint }}
                        />
                        {team?.name}
                      </td>
                      <td className="num board-num">{row.wins}</td>
                      <td className="num board-num">{row.losses}</td>
                      <td className="num board-num">{row.ties}</td>
                      <td className="num board-num">{formatPct(row.pct)}</td>
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
          <div className="leader-preview-grid leader-visual">
            <MiniLeaders title="타율" rows={avgTop} tone="grass" />
            <MiniLeaders title="홈런" rows={hrTop} tone="amber" />
            <MiniLeaders title="방어율" rows={eraTop} tone="mist" />
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
  tone,
}: {
  title: string
  rows: ReturnType<typeof battingLeaders>
  tone: 'grass' | 'amber' | 'mist'
}) {
  return (
    <section className={`leader-preview leader-chip tone-${tone}`}>
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
