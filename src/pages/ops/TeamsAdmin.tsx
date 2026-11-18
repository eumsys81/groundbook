import { useState, type FormEvent } from 'react'
import { useStore } from '../../store'

const empty = {
  name: '',
  shortName: '',
  colorHint: '#7CFFB2',
  managerName: '',
}

export function TeamsAdmin() {
  const { state, upsertTeam, deleteTeam } = useStore()
  const [form, setForm] = useState({ ...empty, id: '' as string })
  const editing = Boolean(form.id)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    upsertTeam({
      id: form.id || undefined,
      name: form.name,
      shortName: form.shortName,
      colorHint: form.colorHint,
      managerName: form.managerName,
    })
    setForm({ ...empty, id: '' })
  }

  return (
    <>
      <h1 className="page-title">팀</h1>
      <p className="page-lead">소속 팀을 추가·수정·삭제합니다.</p>

      <div className="interact-box">
        <h3>{editing ? '팀 수정' : '팀 추가'}</h3>
        <form className="form-grid two" onSubmit={onSubmit}>
          <label className="field">
            팀 이름
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="field">
            짧은 이름
            <input
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              required
            />
          </label>
          <label className="field">
            포인트 컬러
            <input
              type="color"
              value={form.colorHint}
              onChange={(e) => setForm({ ...form, colorHint: e.target.value })}
            />
          </label>
          <label className="field">
            매니저
            <input
              value={form.managerName}
              onChange={(e) =>
                setForm({ ...form, managerName: e.target.value })
              }
              required
            />
          </label>
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">
              {editing ? '수정 저장' : '추가'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setForm({ ...empty, id: '' })}
              >
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list">
        {state.teams.map((t) => (
          <div key={t.id} className="row-item">
            <div>
              <div className="matchup">
                <span
                  className="team-swatch"
                  style={{ background: t.colorHint }}
                />
                {t.name} ({t.shortName})
              </div>
              <div className="row-meta">매니저 {t.managerName}</div>
            </div>
            <div className="inline-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setForm({
                    id: t.id,
                    name: t.name,
                    shortName: t.shortName,
                    colorHint: t.colorHint,
                    managerName: t.managerName,
                  })
                }
              >
                수정
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (confirm(`${t.name} 팀을 삭제할까요?`)) deleteTeam(t.id)
                }}
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
