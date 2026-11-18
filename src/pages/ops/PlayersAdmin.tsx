import { useMemo, useState, type FormEvent } from 'react'
import type { Position } from '../../types'
import { useStore } from '../../store'

const positions: Position[] = [
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

export function PlayersAdmin() {
  const { state, upsertPlayer, deletePlayer } = useStore()
  const [teamFilter, setTeamFilter] = useState(state.teams[0]?.id ?? '')
  const [form, setForm] = useState({
    id: '',
    teamId: state.teams[0]?.id ?? '',
    name: '',
    number: 1,
    position: '투수' as Position,
  })

  const players = useMemo(
    () =>
      state.players
        .filter((p) => !teamFilter || p.teamId === teamFilter)
        .sort((a, b) => a.number - b.number),
    [state.players, teamFilter],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    upsertPlayer({
      id: form.id || undefined,
      teamId: form.teamId,
      name: form.name,
      number: Number(form.number),
      position: form.position,
    })
    setForm({
      id: '',
      teamId: form.teamId,
      name: '',
      number: 1,
      position: '투수',
    })
  }

  return (
    <>
      <h1 className="page-title">선수</h1>
      <p className="page-lead">팀별 선수를 등록합니다.</p>

      <div className="tabs">
        <button
          type="button"
          className={`tab${!teamFilter ? ' active' : ''}`}
          onClick={() => setTeamFilter('')}
        >
          전체
        </button>
        {state.teams.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${teamFilter === t.id ? ' active' : ''}`}
            onClick={() => setTeamFilter(t.id)}
          >
            {t.shortName}
          </button>
        ))}
      </div>

      <div className="interact-box">
        <h3>{form.id ? '선수 수정' : '선수 추가'}</h3>
        <form className="form-grid two" onSubmit={onSubmit}>
          <label className="field">
            팀
            <select
              value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              required
            >
              {state.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            등번호
            <input
              type="number"
              min={0}
              max={99}
              value={form.number}
              onChange={(e) =>
                setForm({ ...form, number: Number(e.target.value) })
              }
              required
            />
          </label>
          <label className="field">
            이름
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="field">
            포지션
            <select
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value as Position })
              }
            >
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">
              {form.id ? '수정 저장' : '추가'}
            </button>
          </div>
        </form>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>팀</th>
              <th className="num">번호</th>
              <th>이름</th>
              <th>포지션</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const team = state.teams.find((t) => t.id === p.teamId)
              return (
                <tr key={p.id}>
                  <td>{team?.shortName}</td>
                  <td className="num">{p.number}</td>
                  <td>{p.name}</td>
                  <td>{p.position}</td>
                  <td>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setForm({
                            id: p.id,
                            teamId: p.teamId,
                            name: p.name,
                            number: p.number,
                            position: p.position,
                          })
                        }
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => deletePlayer(p.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
