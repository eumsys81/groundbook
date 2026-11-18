import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { MatchCard } from '../components/MatchCard'
import { TeamLogo } from '../components/TeamLogo'
import { media } from '../media'
import { battingLeaders, pitchingLeaders } from '../lib/stats'
import { computeStandings, formatPct } from '../lib/standings'
import { useStore } from '../store'

export function Home() {
  const { state } = useStore()
  const railRef = useRef<HTMLDivElement>(null)
  const recent = [...state.games].sort((a, b) =>
    b.startsAt.localeCompare(a.startsAt),
  )

  const standings = computeStandings(state).slice(0, 4)
  const avgTop = battingLeaders(state, 'avg', 3)
  const hrTop = battingLeaders(state, 'hr', 3)
  const eraTop = pitchingLeaders(state, 'era', 3)

  const scrollRail = (dir: -1 | 1) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.8, 420),
      behavior: 'smooth',
    })
  }

  return (
    <>
      <section className="hero hero-photo" aria-label="그라운드북 소개">
        <img className="hero-photo-img" src={media.hero} alt="" aria-hidden />
        <div className="hero-photo-shade" aria-hidden />
        <div className="hero-light-sweep" aria-hidden />
        <div className="hero-content">
          <h1 className="hero-brand">
            그라운드<em>북</em>
          </h1>
          <p className="hero-headline">리그 운영과 기록을 한곳에서</p>
          <p className="hero-support">
            팀 엠블럼·일정 슬라이드·타석/마운드 기록까지. 야구 운영에 필요한
            화면을 넓게 씁니다.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#schedule-slide">
              최근 경기 슬라이드
            </a>
            <Link className="btn btn-ghost" to="/teams">
              팀 현황
            </Link>
          </div>
        </div>
      </section>

      <section
        id="schedule-slide"
        className="band band-schedule"
        aria-label="최근 경기 일정"
      >
        <div className="band-inner">
          <div className="section-head">
            <div>
              <p className="band-kicker">{state.league.name}</p>
              <h2>최근 경기 일정</h2>
              <p className="muted">
                {state.league.seasonLabel} · 팀 로고와 스코어로 한눈에
              </p>
            </div>
            <div className="rail-controls">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => scrollRail(-1)}
              >
                이전
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => scrollRail(1)}
              >
                다음
              </button>
              <Link className="btn btn-primary btn-sm" to="/schedule">
                전체 일정
              </Link>
            </div>
          </div>
        </div>
        <div className="fixture-rail fixture-rail-home" ref={railRef}>
          {recent.map((g) => (
            <MatchCard
              key={g.id}
              large
              game={g}
              home={state.teams.find((t) => t.id === g.homeTeamId)}
              away={state.teams.find((t) => t.id === g.awayTeamId)}
              result={state.results.find((r) => r.gameId === g.id)}
            />
          ))}
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
        <figure className="atmosphere-panel">
          <img src={media.ball} alt="파울라인 위의 야구공" />
          <figcaption>
            <strong>기록은 그라운드에서</strong>
            <span>타석판·마운드·시즌 순위</span>
          </figcaption>
        </figure>
      </section>

      <div className="page">
        <section className="section home-split">
          <div>
            <h2>전광판 순위</h2>
            <p className="muted">확정 경기 기준 팀 순위.</p>
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
                          <Link
                            className="team-inline"
                            to={`/teams/${team?.id}`}
                          >
                            <TeamLogo team={team} size={32} />
                            {team?.name}
                          </Link>
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
          </div>
          <div>
            <h2>기록 하이라이트</h2>
            <p className="muted">타율 · 홈런 · 방어율.</p>
            <div className="leader-preview-grid home-leaders">
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
