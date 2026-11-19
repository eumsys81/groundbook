import { useEffect, useMemo, useRef, useState } from 'react'
import { TeamLogo } from './TeamLogo'
import { formatGameDate } from '../lib/standings'
import type { ScheduleDraft } from '../lib/scheduleGen'
import type { Team } from '../types'

type Props = {
  open: boolean
  drafts: ScheduleDraft[]
  teams: Team[]
  perTeam: Record<string, number>
  warnings: string[]
  onCancel: () => void
  onComplete: () => void
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function dayLabel(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(iso))
}

export function ScheduleAssignBoard({
  open,
  drafts,
  teams,
  perTeam,
  warnings,
  onCancel,
  onComplete,
}: Props) {
  const [shown, setShown] = useState(0)
  const [done, setDone] = useState(false)
  const [fast, setFast] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const teamById = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t])),
    [teams],
  )

  useEffect(() => {
    if (!open) {
      setShown(0)
      setDone(false)
      setFast(false)
      return
    }
    setShown(0)
    setDone(false)
  }, [open, drafts])

  useEffect(() => {
    if (!open || done || !drafts.length) return
    if (shown >= drafts.length) {
      setDone(true)
      return
    }
    const step = fast ? 6 : 1
    const delay = fast ? 28 : 95
    const t = window.setTimeout(() => {
      setShown((n) => Math.min(drafts.length, n + step))
    }, delay)
    return () => window.clearTimeout(t)
  }, [open, shown, drafts.length, done, fast])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [shown])

  const visible = useMemo(() => drafts.slice(0, shown), [drafts, shown])
  const latest = visible[visible.length - 1]
  const progress = drafts.length ? Math.round((shown / drafts.length) * 100) : 0

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleDraft[]>()
    for (const g of visible) {
      const key = dayKey(g.startsAt)
      const bucket = map.get(key) ?? []
      bucket.push(g)
      map.set(key, bucket)
    }
    return [...map.entries()]
  }, [visible])

  const liveCounts = useMemo(() => {
    const c: Record<string, number> = Object.fromEntries(
      teams.map((t) => [t.id, 0]),
    )
    for (const g of visible) {
      c[g.homeTeamId] = (c[g.homeTeamId] ?? 0) + 1
      c[g.awayTeamId] = (c[g.awayTeamId] ?? 0) + 1
    }
    return c
  }, [visible, teams])

  if (!open) return null

  return (
    <div className="assign-overlay" role="dialog" aria-modal="true" aria-label="일정 배정판">
      <div className="assign-board">
        <header className="assign-head">
          <div>
            <p className="band-kicker">시즌 일정 배정판</p>
            <h2>리그 일정을 순서대로 배치합니다</h2>
          </div>
          <div className="assign-actions">
            {!done && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setFast(true)}
              >
                빠르게
              </button>
            )}
            {!done && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShown(drafts.length)
                  setDone(true)
                }}
              >
                건너뛰기
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
              닫기
            </button>
          </div>
        </header>

        <div className="assign-progress">
          <div className="assign-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="assign-progress-label">
          {shown} / {drafts.length} 경기 배정 · {progress}%
        </p>

        <div className="assign-stage">
          <div className="assign-spotlight">
            {latest ? (
              <div key={`${latest.homeTeamId}-${latest.awayTeamId}-${latest.startsAt}-${shown}`} className="assign-pulse">
                <div className="assign-matchup">
                  <div className="fixture-side">
                    <TeamLogo team={teamById[latest.awayTeamId]} size={72} />
                    <strong>{teamById[latest.awayTeamId]?.shortName}</strong>
                  </div>
                  <span className="fixture-vs">@</span>
                  <div className="fixture-side">
                    <TeamLogo team={teamById[latest.homeTeamId]} size={72} />
                    <strong>{teamById[latest.homeTeamId]?.shortName}</strong>
                  </div>
                </div>
                <p className="assign-meta">
                  {formatGameDate(latest.startsAt)} · {latest.venue}
                </p>
              </div>
            ) : (
              <p className="muted">배정을 시작합니다…</p>
            )}
          </div>

          <div className="assign-side">
            <h3>팀별 배정</h3>
            <ul className="assign-team-meters">
              {teams.map((t) => {
                const n = liveCounts[t.id] ?? 0
                const target = perTeam[t.id] ?? 0
                const pct = target ? Math.min(100, Math.round((n / target) * 100)) : 0
                return (
                  <li key={t.id}>
                    <div className="assign-team-row">
                      <TeamLogo team={t} size={28} />
                      <span>{t.shortName}</span>
                      <strong>
                        {n}/{target || '—'}
                      </strong>
                    </div>
                    <div className="assign-meter">
                      <i style={{ width: `${pct}%`, background: t.colorHint }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="assign-feed" ref={listRef}>
          {byDay.map(([key, items]) => (
            <section key={key} className="assign-day">
              <h4>{dayLabel(items[0].startsAt)}</h4>
              <div className="assign-day-games">
                {items.map((g, idx) => (
                  <article
                    key={`${g.startsAt}-${g.homeTeamId}-${g.awayTeamId}-${idx}`}
                    className="assign-chip"
                  >
                    <TeamLogo team={teamById[g.awayTeamId]} size={24} />
                    <span>
                      {teamById[g.awayTeamId]?.shortName} @{' '}
                      {teamById[g.homeTeamId]?.shortName}
                    </span>
                    <TeamLogo team={teamById[g.homeTeamId]} size={24} />
                    <em>{g.venue}</em>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {done && (
          <footer className="assign-foot">
            {warnings.length > 0 && (
              <p className="muted">{warnings.join(' ')}</p>
            )}
            <button type="button" className="btn btn-primary" onClick={onComplete}>
              배정 확정하고 일정에 반영
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
