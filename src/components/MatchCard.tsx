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
  large = false,
}: {
  game: Game
  home?: Team
  away?: Team
  result?: GameResult
  large?: boolean
}) {
  const logoSize = large ? 88 : 64
  return (
    <article className={`fixture-card${large ? ' fixture-card-lg' : ''}`}>
      <div className="fixture-card-top">
        <time dateTime={game.startsAt}>{formatGameDate(game.startsAt)}</time>
        <span className={`status-pill status-${game.status}`}>
          {statusLabel[game.status]}
        </span>
      </div>
      <div className="fixture-card-match">
        <div className="fixture-side">
          <TeamLogo team={away} size={logoSize} />
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
          <TeamLogo team={home} size={logoSize} />
          <strong>{home?.shortName ?? '—'}</strong>
          <span>{home?.name}</span>
        </div>
      </div>
      <p className="fixture-meta">{game.venue}</p>
      {result?.note ? <p className="fixture-note">{result.note}</p> : null}
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
