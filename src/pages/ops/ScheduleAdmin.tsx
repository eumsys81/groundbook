import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { generateSchedule } from '../../lib/scheduleGen'
import type { GameStatus } from '../../types'
import { formatGameDate } from '../../lib/standings'
import { useStore } from '../../store'

export function ScheduleAdmin() {
  const { state, upsertGame, deleteGame, applyGeneratedSchedule } = useStore()
  const [form, setForm] = useState({
    id: '',
    homeTeamId: state.teams[0]?.id ?? '',
    awayTeamId: state.teams[1]?.id ?? '',
    startsAt: '2026-12-06T10:00',
    venue: '',
    status: 'scheduled' as GameStatus,
  })

  const defaultVenues = useMemo(() => {
    const homes = state.teams
      .map((t) => t.homeGround)
      .filter(Boolean)
    return [...new Set(homes)].join('\n') || '여의도 잔디구장\n뚝섬 한강공원 야구장\n잠실 보조야구장'
  }, [state.teams])

  const [gen, setGen] = useState({
    gamesPerTeam: 60,
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    weekendOnly: true,
    venuesText: defaultVenues,
    replaceOpen: true,
    seed: '',
  })
  const [genMsg, setGenMsg] = useState<string | null>(null)

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

  const onGenerate = (e: FormEvent) => {
    e.preventDefault()
    if (state.teams.length < 2) {
      alert('팀이 2개 이상 있어야 일정을 만들 수 있습니다.')
      return
    }
    const venues = gen.venuesText
      .split(/\n|,/)
      .map((v) => v.trim())
      .filter(Boolean)
    const { drafts, perTeam, warnings } = generateSchedule({
      teamIds: state.teams.map((t) => t.id),
      gamesPerTeam: Number(gen.gamesPerTeam) || 60,
      startDate: gen.startDate,
      endDate: gen.endDate,
      venues,
      weekendOnly: gen.weekendOnly,
      seed: gen.seed ? Number(gen.seed) : undefined,
    })
    if (!drafts.length) {
      setGenMsg(warnings.join(' ') || '생성된 경기가 없습니다.')
      return
    }
    applyGeneratedSchedule(drafts, gen.replaceOpen)
    const lines = state.teams.map((t) => {
      const n = perTeam[t.id] ?? 0
      return `${t.shortName} ${n}경기`
    })
    setGenMsg(
      `자동 생성 ${drafts.length}경기. ${lines.join(' · ')}` +
        (warnings.length ? ` / 참고: ${warnings.join(' ')}` : ''),
    )
  }

  return (
    <>
      <h1 className="page-title">일정 관리</h1>
      <p className="page-lead">
        시즌 시작 전 일정을 한 번에 만들거나, 경기를 개별 추가합니다. 자동
        생성은 팀당 목표 경기 수(예: 60)를 기준으로 대진을 섞어 배정합니다.
      </p>

      <div className="interact-box">
        <h3>시즌 일정 자동 생성</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          예: 팀당 60경기 · 주말 위주 · 기간 내 랜덤 홈/원정 균형.
        </p>
        <form className="form-grid two" onSubmit={onGenerate}>
          <label className="field">
            팀당 경기 수
            <input
              type="number"
              min={1}
              max={200}
              value={gen.gamesPerTeam}
              onChange={(e) =>
                setGen({ ...gen, gamesPerTeam: Number(e.target.value) })
              }
            />
          </label>
          <label className="field">
            시드(선택, 같은 결과 재현)
            <input
              value={gen.seed}
              onChange={(e) => setGen({ ...gen, seed: e.target.value })}
              placeholder="비우면 매번 다르게"
            />
          </label>
          <label className="field">
            시작일
            <input
              type="date"
              value={gen.startDate}
              onChange={(e) => setGen({ ...gen, startDate: e.target.value })}
              required
            />
          </label>
          <label className="field">
            종료일
            <input
              type="date"
              value={gen.endDate}
              onChange={(e) => setGen({ ...gen, endDate: e.target.value })}
              required
            />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            구장 목록 (줄바꿈 또는 쉼표)
            <textarea
              value={gen.venuesText}
              onChange={(e) => setGen({ ...gen, venuesText: e.target.value })}
              rows={3}
            />
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={gen.weekendOnly}
              onChange={(e) =>
                setGen({ ...gen, weekendOnly: e.target.checked })
              }
            />
            주말만 배정
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={gen.replaceOpen}
              onChange={(e) =>
                setGen({ ...gen, replaceOpen: e.target.checked })
              }
            />
            기존 미종료 일정 지우고 다시 만들기 (종료 경기는 유지)
          </label>
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">
              랜덤 일정 생성
            </button>
            <span className="row-meta">
              현재 팀 {state.teams.length}개 · 목표 총경기 약{' '}
              {Math.round((state.teams.length * (Number(gen.gamesPerTeam) || 0)) / 2)}
              경기
            </span>
          </div>
        </form>
        {genMsg && <div className="banner" style={{ marginTop: '0.85rem' }}>{genMsg}</div>}
      </div>

      <div className="interact-box">
        <h3>{form.id ? '경기 수정' : '경기 개별 추가'}</h3>
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
