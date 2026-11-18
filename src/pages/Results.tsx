import { Link } from 'react-router-dom'
import { formatGameDate } from '../lib/standings'
import { useStore } from '../store'

export function Results() {
  const { state } = useStore()
  const finals = state.games
    .filter((g) => g.status === 'final')
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))

  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? '—'

  return (
    <div className="page">
      <h1 className="page-title">결과</h1>
      <p className="page-lead">확정된 경기 스코어와 한줄 메모입니다.</p>
      <div className="list">
        {finals.map((g, i) => {
          const r = state.results.find((x) => x.gameId === g.id)
          return (
            <div
              key={g.id}
              className="row-item"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div>
                <div className="matchup">
                  {teamName(g.awayTeamId)} @ {teamName(g.homeTeamId)}
                </div>
                <div className="row-meta">
                  {formatGameDate(g.startsAt)} · {g.venue}
                  {r?.note ? ` · ${r.note}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="score-chip">
                  {r ? `${r.awayRuns} — ${r.homeRuns}` : '—'}
                </div>
                <Link className="row-meta" to={`/ops/games/${g.id}`}>
                  기록 보기
                </Link>
              </div>
            </div>
          )
        })}
        {finals.length === 0 && <p className="empty">확정 결과가 없습니다.</p>}
      </div>
    </div>
  )
}
