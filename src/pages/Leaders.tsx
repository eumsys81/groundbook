import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { media } from '../media'
import {
  BAT_LEADER_META,
  PITCH_LEADER_META,
  battingLeaders,
  pitchingLeaders,
  type BatLeaderKey,
  type PitchLeaderKey,
} from '../lib/stats'
import { useStore } from '../store'

type Mode = 'bat' | 'pitch'

export function Leaders() {
  const { state } = useStore()
  const [mode, setMode] = useState<Mode>('bat')
  const [batKey, setBatKey] = useState<BatLeaderKey>('avg')
  const [pitchKey, setPitchKey] = useState<PitchLeaderKey>('era')

  const rows = useMemo(() => {
    if (mode === 'bat') return battingLeaders(state, batKey, 12)
    return pitchingLeaders(state, pitchKey, 12)
  }, [state, mode, batKey, pitchKey])

  const activeLabel =
    mode === 'bat'
      ? BAT_LEADER_META.find((m) => m.key === batKey)?.label
      : PITCH_LEADER_META.find((m) => m.key === pitchKey)?.label

  return (
    <div className="page">
      <header className="page-banner">
        <img src={media.ball} alt="" aria-hidden />
        <div className="page-banner-shade" />
        <div className="page-banner-copy">
          <h1 className="page-title">기록</h1>
          <p className="page-lead">
            시즌 누적 기준으로 타율·홈런·안타·볼넷·도루·방어율·삼진 등 항목별
            순위를 봅니다. (타율·출루·장타·방어율·WHIP은 규정 타석/이닝 충족
            선수만)
          </p>
        </div>
      </header>

      <div className="tabs">
        <button
          type="button"
          className={`tab${mode === 'bat' ? ' active' : ''}`}
          onClick={() => setMode('bat')}
        >
          타격
        </button>
        <button
          type="button"
          className={`tab${mode === 'pitch' ? ' active' : ''}`}
          onClick={() => setMode('pitch')}
        >
          투수
        </button>
      </div>

      <div className="tabs metric-tabs">
        {mode === 'bat'
          ? BAT_LEADER_META.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`tab${batKey === m.key ? ' active' : ''}`}
                onClick={() => setBatKey(m.key)}
              >
                {m.label}
              </button>
            ))
          : PITCH_LEADER_META.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`tab${pitchKey === m.key ? ' active' : ''}`}
                onClick={() => setPitchKey(m.key)}
              >
                {m.label}
              </button>
            ))}
      </div>

      <h2 className="board-heading">{activeLabel} 순위</h2>
      <div className="scoreboard board-enter table-wrap">
        <div className="scoreboard-glow" aria-hidden />
        <table className="data scoreboard-table">
          <thead>
            <tr>
              <th className="num">#</th>
              <th>선수</th>
              <th>팀</th>
              <th className="num">{activeLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.player.id}>
                <td className="num">{row.rank}</td>
                <td>
                  <Link className="player-link" to={`/players/${row.player.id}`}>
                    #{row.player.number} {row.player.name}
                  </Link>
                </td>
                <td>
                  <span
                    className="team-swatch"
                    style={{ background: row.team?.colorHint }}
                  />
                  {row.team?.shortName}
                </td>
                <td className="num leader-val pulse-amber">{row.display}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4}>해당 조건의 기록이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
