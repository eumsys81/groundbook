import { Link } from 'react-router-dom'
import { TeamLogo } from '../components/TeamLogo'
import { media } from '../media'
import { computeStandings, formatPct } from '../lib/standings'
import { useStore } from '../store'

export function Teams() {
  const { state } = useStore()
  const standings = computeStandings(state)

  return (
    <div className="page">
      <header className="page-banner">
        <img src={media.dugout} alt="" aria-hidden />
        <div className="page-banner-shade" />
        <div className="page-banner-copy">
          <h1 className="page-title">팀 현황</h1>
          <p className="page-lead">
            로고·창단·홈구장·연혁과 현재 순위입니다. 팀을 누르면 상세를 봅니다.
          </p>
        </div>
      </header>

      <div className="team-directory">
        {state.teams.map((t) => {
          const row = standings.find((s) => s.teamId === t.id)
          const rank = standings.findIndex((s) => s.teamId === t.id) + 1
          return (
            <Link key={t.id} to={`/teams/${t.id}`} className="team-dir-card">
              <TeamLogo team={t} size={72} />
              <div>
                <h2>{t.name}</h2>
                <p className="row-meta">
                  {t.foundedYear}년 창단 · {t.homeGround}
                </p>
                <p className="team-history-snip">{t.history}</p>
                <p className="row-meta">
                  순위 {rank || '—'}위 · {row?.wins ?? 0}승 {row?.losses ?? 0}패
                  · 승률 {row ? formatPct(row.pct) : '.000'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
