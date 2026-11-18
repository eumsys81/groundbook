import { formatGameDate } from '../lib/standings'
import { useStore } from '../store'

const statusLabel = {
  scheduled: '예정',
  final: '종료',
  postponed: '연기',
} as const

export function Schedule() {
  const { state } = useStore()
  const games = [...state.games].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  )
  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? '—'

  return (
    <div className="page">
      <h1 className="page-title">일정</h1>
      <p className="page-lead">
        {state.league.name} {state.league.seasonLabel} 대진표입니다.
      </p>
      <div className="list">
        {games.map((g, i) => (
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
              </div>
            </div>
            <span className="row-meta">{statusLabel[g.status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
