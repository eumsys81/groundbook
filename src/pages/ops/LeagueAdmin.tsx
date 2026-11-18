import { useState, type FormEvent } from 'react'
import { useStore } from '../../store'

export function LeagueAdmin() {
  const { state, updateLeague } = useStore()
  const [form, setForm] = useState({ ...state.league })
  const [saved, setSaved] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateLeague({
      name: form.name,
      seasonLabel: form.seasonLabel,
      region: form.region,
      description: form.description,
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <h1 className="page-title">리그 기본정보</h1>
      <p className="page-lead">공개 홈에 노출되는 리그 소개를 수정합니다.</p>
      {saved && <div className="banner">저장했습니다.</div>}
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          리그 이름
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className="field">
          시즌 표기
          <input
            value={form.seasonLabel}
            onChange={(e) => setForm({ ...form, seasonLabel: e.target.value })}
            required
          />
        </label>
        <label className="field">
          지역
          <input
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            required
          />
        </label>
        <label className="field">
          소개
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            저장
          </button>
        </div>
      </form>
    </>
  )
}
