import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  battingAvg,
  era,
  formatAvg,
  formatEra,
  formatIp,
  getBatting,
  getPitching,
} from '../lib/stats'
import { useStore } from '../store'

export function Roster() {
  const { state } = useStore()
  const [teamId, setTeamId] = useState(state.teams[0]?.id ?? '')
  const [view, setView] = useState<'bat' | 'pitch'>('bat')

  const players = useMemo(
    () =>
      state.players
        .filter((p) => p.teamId === teamId)
        .sort((a, b) => a.number - b.number),
    [state.players, teamId],
  )

  const team = state.teams.find((t) => t.id === teamId)

  return (
    <div className="page">
      <h1 className="page-title">명단</h1>
      <p className="page-lead">
        팀별 로스터와 시즌 타격·투수 기록입니다. 선수를 누르면 개인 상세로
        이동합니다.
      </p>
      <div className="tabs">
        {state.teams.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${t.id === teamId ? ' active' : ''}`}
            onClick={() => setTeamId(t.id)}
          >
            {t.shortName}
          </button>
        ))}
      </div>
      {team && (
        <p className="muted" style={{ marginBottom: '1rem' }}>
          {team.name} · 매니저 {team.managerName}
        </p>
      )}

      <div className="tabs">
        <button
          type="button"
          className={`tab${view === 'bat' ? ' active' : ''}`}
          onClick={() => setView('bat')}
        >
          타격
        </button>
        <button
          type="button"
          className={`tab${view === 'pitch' ? ' active' : ''}`}
          onClick={() => setView('pitch')}
        >
          투수
        </button>
      </div>

      <div className="table-wrap">
        {view === 'bat' ? (
          <table className="data">
            <thead>
              <tr>
                <th className="num">번호</th>
                <th>이름</th>
                <th>포지션</th>
                <th className="num">G</th>
                <th className="num">타율</th>
                <th className="num">안타</th>
                <th className="num">홈런</th>
                <th className="num">타점</th>
                <th className="num">볼넷</th>
                <th className="num">도루</th>
                <th className="num">삼진</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const bat = getBatting(state, p.id)
                return (
                  <tr key={p.id}>
                    <td className="num">{p.number}</td>
                    <td>
                      <Link className="player-link" to={`/players/${p.id}`}>
                        {p.name}
                      </Link>
                    </td>
                    <td>{p.position}</td>
                    <td className="num">{bat?.g ?? '—'}</td>
                    <td className="num">
                      {bat ? formatAvg(battingAvg(bat)) : '—'}
                    </td>
                    <td className="num">{bat?.h ?? '—'}</td>
                    <td className="num">{bat?.hr ?? '—'}</td>
                    <td className="num">{bat?.rbi ?? '—'}</td>
                    <td className="num">{bat?.bb ?? '—'}</td>
                    <td className="num">{bat?.sb ?? '—'}</td>
                    <td className="num">{bat?.so ?? '—'}</td>
                  </tr>
                )
              })}
              {players.length === 0 && (
                <tr>
                  <td colSpan={11}>등록된 선수가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th className="num">번호</th>
                <th>이름</th>
                <th className="num">G</th>
                <th className="num">승</th>
                <th className="num">패</th>
                <th className="num">세</th>
                <th className="num">이닝</th>
                <th className="num">방어율</th>
                <th className="num">삼진</th>
                <th className="num">볼넷</th>
              </tr>
            </thead>
            <tbody>
              {players
                .filter((p) => getPitching(state, p.id))
                .map((p) => {
                  const pit = getPitching(state, p.id)!
                  return (
                    <tr key={p.id}>
                      <td className="num">{p.number}</td>
                      <td>
                        <Link className="player-link" to={`/players/${p.id}`}>
                          {p.name}
                        </Link>
                      </td>
                      <td className="num">{pit.g}</td>
                      <td className="num">{pit.w}</td>
                      <td className="num">{pit.l}</td>
                      <td className="num">{pit.sv}</td>
                      <td className="num">{formatIp(pit.ipOuts)}</td>
                      <td className="num">{formatEra(era(pit))}</td>
                      <td className="num">{pit.so}</td>
                      <td className="num">{pit.bb}</td>
                    </tr>
                  )
                })}
              {players.every((p) => !getPitching(state, p.id)) && (
                <tr>
                  <td colSpan={10}>투수 기록이 있는 선수가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
