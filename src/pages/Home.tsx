import { Link } from 'react-router-dom'
import { formatGameDate } from '../lib/standings'
import { useStore } from '../store'

export function Home() {
  const { state } = useStore()
  const upcoming = [...state.games]
    .filter((g) => g.status === 'scheduled')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 3)

  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? '—'

  return (
    <>
      <section className="hero" aria-label="그라운드북 소개">
        <div className="hero-bg" aria-hidden />
        <div className="hero-diamond" aria-hidden />
        <div className="hero-content">
          <h1 className="hero-brand">
            그라운드<em>북</em>
          </h1>
          <p className="hero-headline">아마추어 리그 운영을 한곳에</p>
          <p className="hero-support">
            일정·결과·순위·명단을 운영실에서 정리하고, 공개 페이지로 바로
            공유하세요.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/schedule">
              이번 주 일정 보기
            </Link>
            <Link className="btn btn-ghost" to="/ops">
              운영실 열기
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
          <p className="muted">시드 데모 일정 중 예정된 경기입니다.</p>
          {upcoming.length === 0 ? (
            <p className="empty">예정된 경기가 없습니다.</p>
          ) : (
            <div className="list">
              {upcoming.map((g, i) => (
                <div
                  key={g.id}
                  className="row-item"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div>
                    <div className="matchup">
                      {teamName(g.awayTeamId)} @ {teamName(g.homeTeamId)}
                    </div>
                    <div className="row-meta">
                      {formatGameDate(g.startsAt)} · {g.venue}
                    </div>
                  </div>
                  <span className="row-meta">예정</span>
                </div>
              ))}
            </div>
          )}
          <div className="cta-row" style={{ marginTop: '1.25rem' }}>
            <Link className="btn btn-ghost" to="/results">
              지난 결과
            </Link>
            <Link className="btn btn-ghost" to="/standings">
              순위표
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
