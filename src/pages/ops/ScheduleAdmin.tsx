import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { GameStatus } from '../../types'
import { formatGameDate } from '../../lib/standings'
import { useStore } from '../../store'

export function ScheduleAdmin() {
  const { state, upsertGame, deleteGame } = useStore()
  const [form, setForm] = useState({
    id: '',
    homeTeamId: state.teams[0]?.id ?? '',
    awayTeamId: state.teams[1]?.id ?? '',
    startsAt: '2026-12-06T10:00',
    venue: '',
    status: 'scheduled' as GameStatus,
  })

  const games = [...state.games].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  )
  const teamName = (id: string) =>
    state.teams.find((t) => t.id === id)?.name ?? '—'

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (form.homeTeamId === form.awayTeamId) {
      alert('홈과 원정 팀은 달라야 합니다.')
      return
    }
    upsertGame({
      id: form.id || undefined,
      homeTeamId: form.homeTeamId,
      awayTeamId: form.awayTeamId,
      startsAt: new Date(form.startsAt).toISOString(),
      venue: form.venue,
      status: form.status,
    })
    setForm({
      id: '',
      homeTeamId: state.teams[0]?.id ?? '',
      awayTeamId: state.teams[1]?.id ?? '',
      startsAt: '2026-12-06T10:00',
      venue: '',
      status: 'scheduled',
    })
  }

  return (
    <>
      <h1 className="page-title">일정 관리</h1>
      <p className="page-lead">경기를 만들고, 기록 화면으로 이동합니다.</p>

      <div className="interact-box">
        <h3>{form.id ? '경기 수정' : '경기 추가'}</h3>
        <form className="form-grid two" onSubmit={onSubmit}>
          <label className="field">
            원정
            <select
              value={form.awayTeamId}
              onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
            >
              {state.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            홈
            <select
              value={form.homeTeamId}
              onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
            >
              {state.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            일시
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              required
            />
          </label>
          <label className="field">
            구장
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              required
            />
          </label>
          <label className="field">
            상태
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as GameStatus })
              }
            >
              <option value="scheduled">예정</option>
              <option value="final">종료</option>
              <option value="postponed">연기</option>
            </select>
          </label>
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">
              {form.id ? '수정 저장' : '추가'}
            </button>
          </div>
        </form>
      </div>

      <div className="list">
        {games.map((g) => (
          <div key={g.id} className="row-item">
            <div>
              <div className="matchup">
                {teamName(g.awayTeamId)} @ {teamName(g.homeTeamId)}
              </div>
              <div className="row-meta">
                {formatGameDate(g.startsAt)} · {g.venue} · {g.status}
              </div>
            </div>
            <div className="inline-actions">
              <Link className="btn btn-primary btn-sm" to={`/ops/games/${g.id}`}>
                기록
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setForm({
                    id: g.id,
                    homeTeamId: g.homeTeamId,
                    awayTeamId: g.awayTeamId,
                    startsAt: g.startsAt.slice(0, 16),
                    venue: g.venue,
                    status: g.status,
                  })
                }
              >
                수정
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => deleteGame(g.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
