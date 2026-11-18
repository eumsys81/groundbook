import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { InningScore } from '../../types'
import { useStore } from '../../store'

const INNING_COUNT = 7

function blankInnings(existing?: InningScore[]): InningScore[] {
  return Array.from({ length: INNING_COUNT }, (_, i) => {
    const found = existing?.find((x) => x.inning === i + 1)
    return {
      inning: i + 1,
      home: found?.home ?? 0,
      away: found?.away ?? 0,
    }
  })
}

export function GameEntry() {
  const { id } = useParams()
  const { state, saveResult } = useStore()
  const game = state.games.find((g) => g.id === id)
  const existing = state.results.find((r) => r.gameId === id)

  const [innings, setInnings] = useState(() => blankInnings(existing?.innings))
  const [note, setNote] = useState(existing?.note ?? '')
  const [saved, setSaved] = useState(false)

  const homeName =
    state.teams.find((t) => t.id === game?.homeTeamId)?.name ?? '홈'
  const awayName =
    state.teams.find((t) => t.id === game?.awayTeamId)?.name ?? '원정'

  const totals = useMemo(() => {
    const home = innings.reduce((s, x) => s + (Number(x.home) || 0), 0)
    const away = innings.reduce((s, x) => s + (Number(x.away) || 0), 0)
    return { home, away }
  }, [innings])

  if (!game) {
    return (
      <div>
        <p>경기를 찾을 수 없습니다.</p>
        <Link to="/ops/schedule">일정으로</Link>
      </div>
    )
  }

  const setCell = (
    inning: number,
    side: 'home' | 'away',
    value: string,
  ) => {
    const n = value === '' ? 0 : Math.max(0, Number(value))
    setInnings((rows) =>
      rows.map((r) => (r.inning === inning ? { ...r, [side]: n } : r)),
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    saveResult({
      gameId: game.id,
      homeRuns: totals.home,
      awayRuns: totals.away,
      innings,
      note,
      recordedAt: new Date().toISOString(),
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <>
      <h1 className="page-title">경기 기록</h1>
      <p className="page-lead">
        {awayName} @ {homeName} · 이닝 득점판에 점수를 넣고 확정합니다. (독창적
        이닝 그리드 — 타석 코드표 없음)
      </p>
      {saved && <div className="banner">결과를 저장하고 경기를 종료 처리했습니다.</div>}

      <div className="interact-box">
        <h3>스코어보드 요약</h3>
        <p
          className="score-chip"
          style={{ margin: 0, animation: 'fade-up 0.5s ease both' }}
        >
          {awayName} {totals.away} — {totals.home} {homeName}
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="inning-grid">
          <table>
            <thead>
              <tr>
                <th>팀</th>
                {innings.map((inn) => (
                  <th key={inn.inning}>{inn.inning}</th>
                ))}
                <th>R</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{awayName}</td>
                {innings.map((inn) => (
                  <td key={`a-${inn.inning}`}>
                    <input
                      inputMode="numeric"
                      value={inn.away ?? 0}
                      onChange={(e) =>
                        setCell(inn.inning, 'away', e.target.value)
                      }
                      aria-label={`${awayName} ${inn.inning}회`}
                    />
                  </td>
                ))}
                <td>
                  <strong>{totals.away}</strong>
                </td>
              </tr>
              <tr>
                <td>{homeName}</td>
                {innings.map((inn) => (
                  <td key={`h-${inn.inning}`}>
                    <input
                      inputMode="numeric"
                      value={inn.home ?? 0}
                      onChange={(e) =>
                        setCell(inn.inning, 'home', e.target.value)
                      }
                      aria-label={`${homeName} ${inn.inning}회`}
                    />
                  </td>
                ))}
                <td>
                  <strong>{totals.home}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-grid" style={{ marginTop: '1rem' }}>
          <label className="field">
            한줄 메모
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 결승 적시타, 투수 교체 시점 등"
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              결과 확정 저장
            </button>
            <Link className="btn btn-ghost" to="/ops/schedule">
              일정으로
            </Link>
            <Link className="btn btn-ghost" to="/results">
              공개 결과
            </Link>
          </div>
        </div>
      </form>
    </>
  )
}
