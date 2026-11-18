import { Link } from 'react-router-dom'
import { TeamLogo } from './TeamLogo'
import { formatGameDate } from '../lib/standings'
import type { Game, GameResult, Team } from '../types'

const statusLabel = {
  scheduled: '경기예정',
  final: '경기종료',
  postponed: '연기',
} as const

export function MatchCard({
  game,
  home,
  away,
  result,
}: {
  game: Game
  home?: Team
  away?: Team
  result?: GameResult
}) {
  return (
    <article className="fixture-card">
      <div className="fixture-card-top">
        <time dateTime={game.startsAt}>{formatGameDate(game.startsAt)}</time>
        <span className={`status-pill status-${game.status}`}>
          {statusLabel[game.status]}
        </span>
      </div>
      <div className="fixture-card-match">
        <div className="fixture-side">
          <TeamLogo team={away} size={56} />
          <strong>{away?.shortName ?? '—'}</strong>
          <span>{away?.name}</span>
        </div>
        <div className="fixture-score">
          {result ? (
            <span className="score-chip pulse-amber">
              {result.awayRuns}:{result.homeRuns}
            </span>
          ) : (
            <span className="fixture-vs">VS</span>
          )}
        </div>
        <div className="fixture-side">
          <TeamLogo team={home} size={56} />
          <strong>{home?.shortName ?? '—'}</strong>
          <span>{home?.name}</span>
        </div>
      </div>
      <p className="fixture-meta">{game.venue}</p>
      {game.status === 'final' ? (
        <Link className="fixture-link" to={`/ops/games/${game.id}`}>
          경기 기록 보기
        </Link>
      ) : (
        <Link className="fixture-link" to="/schedule">
          일정에서 보기
        </Link>
      )}
    </article>
  )
}
