import { useState, type FormEvent } from 'react'
import { TeamLogo } from '../../components/TeamLogo'
import { makeEmblem } from '../../lib/emblem'
import { useStore } from '../../store'

const empty = {
  name: '',
  shortName: '',
  colorHint: '#7CFFB2',
  managerName: '',
  logoDataUrl: '',
  foundedYear: new Date().getFullYear(),
  homeGround: '',
  history: '',
}

export function TeamsAdmin() {
  const { state, upsertTeam, deleteTeam } = useStore()
  const [form, setForm] = useState({ ...empty, id: '' as string })
  const editing = Boolean(form.id)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const logo =
      form.logoDataUrl || makeEmblem(form.shortName || form.name, form.colorHint)
    upsertTeam({
      id: form.id || undefined,
      name: form.name,
      shortName: form.shortName,
      colorHint: form.colorHint,
      managerName: form.managerName,
      logoDataUrl: logo,
      foundedYear: Number(form.foundedYear) || new Date().getFullYear(),
      homeGround: form.homeGround,
      history: form.history,
    })
    setForm({ ...empty, id: '' })
  }

  const onLogoFile = (file?: File | null) => {
    if (!file) return
    if (file.size > 1024 * 1024) {
      alert('로고는 1MB 이하로 올려 주세요.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, logoDataUrl: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <h1 className="page-title">팀</h1>
      <p className="page-lead">
        팀 로고·창단연도·홈구장·연혁까지 등록합니다. 공개 일정·팀 현황에
        엠블럼이 표시됩니다.
      </p>

      <div className="interact-box">
        <h3>{editing ? '팀 수정' : '팀 등록'}</h3>
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
          <label className="field">
            창단 연도
            <input
              type="number"
              min={1950}
              max={2100}
              value={form.foundedYear}
              onChange={(e) =>
                setForm({ ...form, foundedYear: Number(e.target.value) })
              }
            />
          </label>
          <label className="field">
            홈 구장
            <input
              value={form.homeGround}
              onChange={(e) => setForm({ ...form, homeGround: e.target.value })}
              placeholder="예: 여의도 잔디구장"
            />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            팀 연혁
            <textarea
              value={form.history}
              onChange={(e) => setForm({ ...form, history: e.target.value })}
              placeholder="창단 배경, 주요 시즌, 팀 특징"
            />
          </label>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <span>팀 로고 (권장 160×160, 1MB 이하)</span>
            <div className="logo-upload-row">
              <TeamLogo
                team={{
                  name: form.name || '미리보기',
                  shortName: form.shortName || '팀',
                  colorHint: form.colorHint,
                  logoDataUrl:
                    form.logoDataUrl ||
                    makeEmblem(form.shortName || '팀', form.colorHint),
                }}
                size={72}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onLogoFile(e.target.files?.[0])}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setForm({
                    ...form,
                    logoDataUrl: makeEmblem(
                      form.shortName || form.name || '팀',
                      form.colorHint,
                    ),
                  })
                }
              >
                기본 엠블럼 생성
              </button>
            </div>
          </div>
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">
              {editing ? '수정 저장' : '등록'}
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

      <div className="team-admin-grid">
        {state.teams.map((t) => (
          <div key={t.id} className="team-admin-card">
            <TeamLogo team={t} size={64} />
            <div>
              <div className="matchup">{t.name}</div>
              <div className="row-meta">
                {t.foundedYear}년 · {t.homeGround || '홈구장 미정'} · 매니저{' '}
                {t.managerName}
              </div>
              <p className="team-history-snip">{t.history || '연혁 없음'}</p>
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
                    logoDataUrl: t.logoDataUrl,
                    foundedYear: t.foundedYear,
                    homeGround: t.homeGround,
                    history: t.history,
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
