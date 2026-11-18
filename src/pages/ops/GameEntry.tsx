import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TeamLogo } from '../../components/TeamLogo'
import {
  INNING_COLS,
  PLATE_MARKS,
  blankLineup,
  markClass,
  markLabel,
  summarizeLine,
} from '../../lib/plate'
import type {
  InningScore,
  LineupRow,
  PitcherRow,
  PlateMark,
  Position,
  SideBox,
} from '../../types'
import { useStore } from '../../store'

const POSITIONS: Position[] = [
  '투수',
  '포수',
  '1루수',
  '2루수',
  '3루수',
  '유격수',
  '좌익수',
  '중견수',
  '우익수',
  '지명타자',
  '내야수',
  '외야수',
]

function blankInnings(existing?: InningScore[]): InningScore[] {
  return Array.from({ length: INNING_COLS }, (_, i) => {
    const found = existing?.find((x) => x.inning === i + 1)
    return {
      inning: i + 1,
      home: found?.home ?? 0,
      away: found?.away ?? 0,
    }
  })
}

function blankPitcher(): PitcherRow {
  return {
    playerId: '',
    role: '선발',
    decision: '',
    ipText: '0.0',
    bf: 0,
    ab: 0,
    h: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    wp: 0,
    bk: 0,
    r: 0,
    er: 0,
    pitches: 0,
  }
}

function ensureBox(box?: SideBox): SideBox {
  return {
    lineup: box?.lineup?.length ? box.lineup : blankLineup(),
    pitchers: box?.pitchers?.length ? box.pitchers : [blankPitcher()],
  }
}

export function GameEntry() {
  const { id } = useParams()
  const { state, saveResult } = useStore()
  const game = state.games.find((g) => g.id === id)
  const existing = state.results.find((r) => r.gameId === id)
  const home = state.teams.find((t) => t.id === game?.homeTeamId)
  const away = state.teams.find((t) => t.id === game?.awayTeamId)

  const [side, setSide] = useState<'away' | 'home'>('away')
  const [innings, setInnings] = useState(() => blankInnings(existing?.innings))
  const [note, setNote] = useState(existing?.note ?? '')
  const [awayBox, setAwayBox] = useState(() => ensureBox(existing?.awayBox))
  const [homeBox, setHomeBox] = useState(() => ensureBox(existing?.homeBox))
  const [saved, setSaved] = useState(false)

  const activeBox = side === 'away' ? awayBox : homeBox
  const setActiveBox = side === 'away' ? setAwayBox : setHomeBox
  const teamId = side === 'away' ? game?.awayTeamId : game?.homeTeamId
  const roster = state.players.filter((p) => p.teamId === teamId)

  const totals = useMemo(() => {
    const homeRuns = innings.reduce((s, x) => s + (Number(x.home) || 0), 0)
    const awayRuns = innings.reduce((s, x) => s + (Number(x.away) || 0), 0)
    return { home: homeRuns, away: awayRuns }
  }, [innings])

  if (!game) {
    return (
      <div>
        <p>경기를 찾을 수 없습니다.</p>
        <Link to="/ops/schedule">일정으로</Link>
      </div>
    )
  }

  const setCell = (inning: number, which: 'home' | 'away', value: string) => {
    const n = value === '' ? 0 : Math.max(0, Number(value))
    setInnings((rows) =>
      rows.map((r) => (r.inning === inning ? { ...r, [which]: n } : r)),
    )
  }

  const updateLine = (idx: number, patch: Partial<LineupRow>) => {
    setActiveBox((box) => ({
      ...box,
      lineup: box.lineup.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }))
  }

  const setMark = (rowIdx: number, innIdx: number, mark: PlateMark) => {
    setActiveBox((box) => ({
      ...box,
      lineup: box.lineup.map((row, i) => {
        if (i !== rowIdx) return row
        const marks = [...row.marks]
        marks[innIdx] = mark
        return { ...row, marks }
      }),
    }))
  }

  const updatePitcher = (idx: number, patch: Partial<PitcherRow>) => {
    setActiveBox((box) => ({
      ...box,
      pitchers: box.pitchers.map((row, i) =>
        i === idx ? { ...row, ...patch } : row,
      ),
    }))
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
      homeBox,
      awayBox,
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <>
      <h1 className="page-title">경기 기록</h1>
      <p className="page-lead">
        이닝 득점 + 타순 타석판 + 마운드 기록입니다. 표기·색은 그라운드북 방식이며
        타 사이트 기록 코드표를 따르지 않습니다.
      </p>
      {saved && (
        <div className="banner">결과를 저장하고 경기를 종료 처리했습니다.</div>
      )}

      <div className="game-hero-bar">
        <div className="fixture-side">
          <TeamLogo team={away} size={56} />
          <strong>{away?.name}</strong>
        </div>
        <div className="score-chip pulse-amber">
          {totals.away} : {totals.home}
        </div>
        <div className="fixture-side">
          <TeamLogo team={home} size={56} />
          <strong>{home?.name}</strong>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="interact-box">
          <h3>이닝 득점판</h3>
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
                  <td>{away?.shortName}</td>
                  {innings.map((inn) => (
                    <td key={`a-${inn.inning}`}>
                      <input
                        inputMode="numeric"
                        value={inn.away ?? 0}
                        onChange={(e) =>
                          setCell(inn.inning, 'away', e.target.value)
                        }
                      />
                    </td>
                  ))}
                  <td>{totals.away}</td>
                </tr>
                <tr>
                  <td>{home?.shortName}</td>
                  {innings.map((inn) => (
                    <td key={`h-${inn.inning}`}>
                      <input
                        inputMode="numeric"
                        value={inn.home ?? 0}
                        onChange={(e) =>
                          setCell(inn.inning, 'home', e.target.value)
                        }
                      />
                    </td>
                  ))}
                  <td>{totals.home}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab${side === 'away' ? ' active' : ''}`}
            onClick={() => setSide('away')}
          >
            {away?.name} 타석·마운드
          </button>
          <button
            type="button"
            className={`tab${side === 'home' ? ' active' : ''}`}
            onClick={() => setSide('home')}
          >
            {home?.name} 타석·마운드
          </button>
        </div>

        <div className="interact-box">
          <h3>타석판 (타순 × 이닝)</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            칸을 눌러 결과를 고릅니다. 우측은 자동 합계(타수·안타·도루).
          </p>
          <div className="plate-legend">
            {PLATE_MARKS.filter((m) => m.value).map((m) => (
              <span key={m.value} className={`plate-chip ${m.tone}`}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="table-wrap sheet-wrap">
            <table className="data sheet-table">
              <thead>
                <tr>
                  <th>타순</th>
                  <th>선수</th>
                  <th>포지션</th>
                  {Array.from({ length: INNING_COLS }, (_, i) => (
                    <th key={i} className="num">
                      {i + 1}
                    </th>
                  ))}
                  <th className="num">타수</th>
                  <th className="num">안타</th>
                  <th className="num">도루</th>
                </tr>
              </thead>
              <tbody>
                {activeBox.lineup.map((row, idx) => {
                  const sum = summarizeLine(row.marks)
                  return (
                    <tr key={row.order}>
                      <td className="num">{row.order}</td>
                      <td>
                        <select
                          value={row.playerId}
                          onChange={(e) =>
                            updateLine(idx, { playerId: e.target.value })
                          }
                        >
                          <option value="">선수 선택</option>
                          {roster.map((p) => (
                            <option key={p.id} value={p.id}>
                              #{p.number} {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={row.position}
                          onChange={(e) =>
                            updateLine(idx, {
                              position: e.target.value as Position,
                            })
                          }
                        >
                          {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </td>
                      {row.marks.map((mark, innIdx) => (
                        <td key={innIdx}>
                          <select
                            className={`plate-select ${markClass(mark)}`}
                            value={mark}
                            onChange={(e) =>
                              setMark(
                                idx,
                                innIdx,
                                e.target.value as PlateMark,
                              )
                            }
                            aria-label={`${row.order}번 ${innIdx + 1}회`}
                          >
                            {PLATE_MARKS.map((m) => (
                              <option key={m.value || 'empty'} value={m.value}>
                                {m.value ? markLabel(m.value) : '—'}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))}
                      <td className="num">{sum.ab}</td>
                      <td className="num">{sum.h}</td>
                      <td className="num">{sum.sb}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="interact-box">
          <h3>마운드 기록</h3>
          <div className="table-wrap sheet-wrap">
            <table className="data sheet-table">
              <thead>
                <tr>
                  <th>역할</th>
                  <th>투수</th>
                  <th>판정</th>
                  <th>이닝</th>
                  <th className="num">타자</th>
                  <th className="num">타수</th>
                  <th className="num">피안타</th>
                  <th className="num">피홈런</th>
                  <th className="num">볼넷</th>
                  <th className="num">사구</th>
                  <th className="num">삼진</th>
                  <th className="num">폭투</th>
                  <th className="num">보크</th>
                  <th className="num">실점</th>
                  <th className="num">자책</th>
                  <th className="num">투구수</th>
                </tr>
              </thead>
              <tbody>
                {activeBox.pitchers.map((p, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        value={p.role}
                        onChange={(e) =>
                          updatePitcher(idx, {
                            role: e.target.value as PitcherRow['role'],
                          })
                        }
                      >
                        <option value="선발">선발</option>
                        <option value="불펜">불펜</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={p.playerId}
                        onChange={(e) =>
                          updatePitcher(idx, { playerId: e.target.value })
                        }
                      >
                        <option value="">투수 선택</option>
                        {roster.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            #{pl.number} {pl.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={p.decision}
                        onChange={(e) =>
                          updatePitcher(idx, {
                            decision: e.target.value as PitcherRow['decision'],
                          })
                        }
                      >
                        <option value="">—</option>
                        <option value="W">승</option>
                        <option value="L">패</option>
                        <option value="SV">세</option>
                        <option value="HLD">홀</option>
                      </select>
                    </td>
                    <td>
                      <input
                        value={p.ipText}
                        onChange={(e) =>
                          updatePitcher(idx, { ipText: e.target.value })
                        }
                        style={{ width: '3.5rem' }}
                      />
                    </td>
                    {(
                      [
                        'bf',
                        'ab',
                        'h',
                        'hr',
                        'bb',
                        'hbp',
                        'so',
                        'wp',
                        'bk',
                        'r',
                        'er',
                        'pitches',
                      ] as const
                    ).map((key) => (
                      <td key={key}>
                        <input
                          type="number"
                          min={0}
                          value={p[key]}
                          onChange={(e) =>
                            updatePitcher(idx, {
                              [key]: Number(e.target.value),
                            })
                          }
                          style={{ width: '3.2rem' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setActiveBox((box) => ({
                ...box,
                pitchers: [...box.pitchers, blankPitcher()],
              }))
            }
          >
            + 마운드 추가
          </button>
        </div>

        <label className="field" style={{ maxWidth: '40rem' }}>
          한줄 메모
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="결승타, 호투 등"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            저장하고 경기 종료
          </button>
          <Link className="btn btn-ghost" to="/ops/schedule">
            일정으로
          </Link>
        </div>
      </form>
    </>
  )
}
