import { useMemo, useState } from 'react'
import { useStore } from '../store'

export function Roster() {
  const { state } = useStore()
  const [teamId, setTeamId] = useState(state.teams[0]?.id ?? '')

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
      <p className="page-lead">팀별 로스터 스냅샷입니다.</p>
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
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th className="num">번호</th>
              <th>이름</th>
              <th>포지션</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td className="num">{p.number}</td>
                <td>{p.name}</td>
                <td>{p.position}</td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={3}>등록된 선수가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
