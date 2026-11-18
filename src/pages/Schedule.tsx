import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { media, venueImage } from '../media'
import { formatGameDate } from '../lib/standings'
import { useStore } from '../store'

const statusLabel = {
  scheduled: '예정',
  final: '종료',
  postponed: '연기',
} as const

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function dayHeading(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(iso))
}

export function Schedule() {
  const { state } = useStore()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'done'>('all')

  const games = useMemo(() => {
    let list = [...state.games].sort((a, b) =>
      a.startsAt.localeCompare(b.startsAt),
    )
    if (filter === 'upcoming') {
      list = list.filter(
        (g) => g.status === 'scheduled' || g.status === 'postponed',
      )
    } else if (filter === 'done') {
      list = list.filter((g) => g.status === 'final')
    }
    return list
  }, [state.games, filter])

  const days = useMemo(() => {
    const map = new Map<string, typeof games>()
    for (const g of games) {
      const key = dayKey(g.startsAt)
      const bucket = map.get(key) ?? []
      bucket.push(g)
      map.set(key, bucket)
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: dayHeading(items[0].startsAt),
      items,
      cover: venueImage(key + items[0].venue),
    }))
  }, [games])

  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? '—'
  const teamShort = (id: string) =>
    state.teams.find((t) => t.id === id)?.shortName ?? '—'
  const teamColor = (id: string) =>
    state.teams.find((t) => t.id === id)?.colorHint

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.85, 360),
      behavior: 'smooth',
    })
  }

  return (
    <div className="page">
      <header className="page-banner">
        <img src={media.outfield} alt="" aria-hidden />
        <div className="page-banner-shade" />
        <div className="page-banner-copy">
          <h1 className="page-title">일정</h1>
          <p className="page-lead">
            {state.league.name} {state.league.seasonLabel} — 날짜별 슬라이드로
            한눈에 봅니다.
          </p>
        </div>
      </header>

      <div className="tabs">
        <button
          type="button"
          className={`tab${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          type="button"
          className={`tab${filter === 'upcoming' ? ' active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          예정·연기
        </button>
        <button
          type="button"
          className={`tab${filter === 'done' ? ' active' : ''}`}
          onClick={() => setFilter('done')}
        >
          종료
        </button>
      </div>

      <div className="rail-controls">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => scrollBy(-1)}
        >
          이전
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => scrollBy(1)}
        >
          다음
        </button>
      </div>

      <div className="day-rail" ref={scrollerRef}>
        {days.map((day) => (
          <section key={day.key} className="day-slide day-slide-photo" aria-label={day.label}>
            <img className="day-slide-bg" src={day.cover} alt="" aria-hidden />
            <div className="day-slide-overlay" />
            <header className="day-slide-head">
              <h2>{day.label}</h2>
              <span>{day.items.length}경기</span>
            </header>
            <div className="day-slide-body">
              {day.items.map((g) => {
                const result = state.results.find((r) => r.gameId === g.id)
                return (
                  <article key={g.id} className="match-tile match-tile-glass">
                    <div className="match-tile-meta">
                      <time dateTime={g.startsAt}>
                        {formatGameDate(g.startsAt)}
                      </time>
                      <span className={`status-pill status-${g.status}`}>
                        {statusLabel[g.status]}
                      </span>
                    </div>
                    <div className="match-tile-teams">
                      <div>
                        <span
                          className="team-swatch"
                          style={{ background: teamColor(g.awayTeamId) }}
                        />
                        <strong>{teamShort(g.awayTeamId)}</strong>
                        <span className="muted-inline">
                          {teamName(g.awayTeamId)}
                        </span>
                      </div>
                      <div>
                        <span
                          className="team-swatch"
                          style={{ background: teamColor(g.homeTeamId) }}
                        />
                        <strong>{teamShort(g.homeTeamId)}</strong>
                        <span className="muted-inline">
                          {teamName(g.homeTeamId)}
                        </span>
                      </div>
                    </div>
                    {result ? (
                      <div className="score-chip match-score pulse-amber">
                        {result.awayRuns} — {result.homeRuns}
                      </div>
                    ) : (
                      <p className="match-venue">{g.venue}</p>
                    )}
                    {result && (
                      <p className="match-venue">
                        {g.venue}
                        {result.note ? ` · ${result.note}` : ''}
                      </p>
                    )}
                    {g.status === 'final' && (
                      <Link className="row-meta" to={`/ops/games/${g.id}`}>
                        이닝 득점판
                      </Link>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        ))}
        {days.length === 0 && <p className="empty">표시할 일정이 없습니다.</p>}
      </div>

      <section className="section">
        <h2>목록으로 보기</h2>
        <p className="muted">전체 대진을 세로로도 확인할 수 있습니다.</p>
        <div className="list">
          {games.map((g, i) => {
            const result = state.results.find((r) => r.gameId === g.id)
            return (
              <div
                key={g.id}
                className="row-item row-item-visual"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <img
                  className="row-thumb"
                  src={venueImage(g.id)}
                  alt=""
                  aria-hidden
                />
                <div>
                  <div className="matchup">
                    {teamName(g.awayTeamId)} @ {teamName(g.homeTeamId)}
                  </div>
                  <div className="row-meta">
                    {formatGameDate(g.startsAt)} · {g.venue}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {result ? (
                    <div className="score-chip">
                      {result.awayRuns} — {result.homeRuns}
                    </div>
                  ) : (
                    <span className="row-meta">{statusLabel[g.status]}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
