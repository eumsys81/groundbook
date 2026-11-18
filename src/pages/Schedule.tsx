import { useMemo, useRef, useState } from 'react'
import { MatchCard } from '../components/MatchCard'
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
            {state.league.name} {state.league.seasonLabel} — 팀 로고와 스코어
            카드로 최근 경기를 봅니다.
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

      <section className="section" style={{ paddingTop: '0.5rem' }}>
        <h2>경기 카드</h2>
        <p className="muted">가로로 넘겨 일정을 확인하세요.</p>
        <div className="fixture-rail">
          {games.map((g) => (
            <MatchCard
              key={g.id}
              game={g}
              home={state.teams.find((t) => t.id === g.homeTeamId)}
              away={state.teams.find((t) => t.id === g.awayTeamId)}
              result={state.results.find((r) => r.gameId === g.id)}
            />
          ))}
        </div>
      </section>

      <div className="rail-controls">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => scrollBy(-1)}
        >
          이전 날짜
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => scrollBy(1)}
        >
          다음 날짜
        </button>
      </div>

      <div className="day-rail" ref={scrollerRef}>
        {days.map((day) => (
          <section
            key={day.key}
            className="day-slide day-slide-photo"
            aria-label={day.label}
          >
            <img className="day-slide-bg" src={day.cover} alt="" aria-hidden />
            <div className="day-slide-overlay" />
            <header className="day-slide-head">
              <h2>{day.label}</h2>
              <span>{day.items.length}경기</span>
            </header>
            <div className="day-slide-body">
              {day.items.map((g) => {
                const result = state.results.find((r) => r.gameId === g.id)
                const home = state.teams.find((t) => t.id === g.homeTeamId)
                const away = state.teams.find((t) => t.id === g.awayTeamId)
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
                    <div className="mini-logos">
                      <img src={away?.logoDataUrl} alt="" width={36} height={36} />
                      <span>
                        {away?.shortName} vs {home?.shortName}
                      </span>
                      <img src={home?.logoDataUrl} alt="" width={36} height={36} />
                    </div>
                    {result ? (
                      <div className="score-chip match-score pulse-amber">
                        {result.awayRuns}:{result.homeRuns}
                      </div>
                    ) : (
                      <p className="match-venue">{g.venue}</p>
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
                      {result.awayRuns}:{result.homeRuns}
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
