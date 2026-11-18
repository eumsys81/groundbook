import { useMemo, useState, type FormEvent } from 'react'
import type { BattingLine, PitchingLine } from '../../types'
import { useStore } from '../../store'
import { formatIp } from '../../lib/stats'

const emptyBat = (playerId: string): BattingLine => ({
  playerId,
  g: 0,
  pa: 0,
  ab: 0,
  r: 0,
  h: 0,
  doubles: 0,
  triples: 0,
  hr: 0,
  rbi: 0,
  bb: 0,
  so: 0,
  sb: 0,
  cs: 0,
})

const emptyPit = (playerId: string): PitchingLine => ({
  playerId,
  g: 0,
  gs: 0,
  w: 0,
  l: 0,
  sv: 0,
  ipOuts: 0,
  h: 0,
  r: 0,
  er: 0,
  bb: 0,
  so: 0,
  hr: 0,
})

export function StatsAdmin() {
  const { state, upsertBatting, upsertPitching } = useStore()
  const [playerId, setPlayerId] = useState(state.players[0]?.id ?? '')
  const [mode, setMode] = useState<'bat' | 'pitch'>('bat')

  const player = state.players.find((p) => p.id === playerId)
  const team = state.teams.find((t) => t.id === player?.teamId)

  const bat = useMemo(() => {
    return (
      state.batting.find((b) => b.playerId === playerId) ??
      emptyBat(playerId)
    )
  }, [state.batting, playerId])

  const pit = useMemo(() => {
    return (
      state.pitching.find((p) => p.playerId === playerId) ??
      emptyPit(playerId)
    )
  }, [state.pitching, playerId])

  const [batForm, setBatForm] = useState(bat)
  const [pitForm, setPitForm] = useState(pit)
  const [ipText, setIpText] = useState(formatIp(pit.ipOuts))

  // sync when player changes
  const selectPlayer = (id: string) => {
    setPlayerId(id)
    const nextBat =
      state.batting.find((b) => b.playerId === id) ?? emptyBat(id)
    const nextPit =
      state.pitching.find((p) => p.playerId === id) ?? emptyPit(id)
    setBatForm(nextBat)
    setPitForm(nextPit)
    setIpText(formatIp(nextPit.ipOuts))
  }

  const parseIp = (text: string): number => {
    const t = text.trim()
    if (!t) return 0
    if (t.includes('.')) {
      const [w, f] = t.split('.')
      const frac = Number(f)
      const outs = frac === 1 || frac === 2 ? frac : 0
      return Number(w) * 3 + outs
    }
    return Number(t) * 3
  }

  const saveBat = (e: FormEvent) => {
    e.preventDefault()
    upsertBatting({ ...batForm, playerId })
  }

  const savePit = (e: FormEvent) => {
    e.preventDefault()
    upsertPitching({ ...pitForm, playerId, ipOuts: parseIp(ipText) })
  }

  const num = (
    label: string,
    value: number,
    onChange: (n: number) => void,
  ) => (
    <label className="field">
      {label}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )

  return (
    <>
      <h1 className="page-title">시즌 기록</h1>
      <p className="page-lead">
        선수별 타격·투수 누적 기록을 수정합니다. 공개 기록·순위 화면에 바로
        반영됩니다.
      </p>

      <label className="field" style={{ maxWidth: '20rem', marginBottom: '1rem' }}>
        선수
        <select value={playerId} onChange={(e) => selectPlayer(e.target.value)}>
          {state.players.map((p) => {
            const t = state.teams.find((x) => x.id === p.teamId)
            return (
              <option key={p.id} value={p.id}>
                {t?.shortName} #{p.number} {p.name}
              </option>
            )
          })}
        </select>
      </label>

      {player && (
        <p className="muted" style={{ marginBottom: '1rem' }}>
          {team?.name} · {player.position}
        </p>
      )}

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

      {mode === 'bat' ? (
        <form className="interact-box" onSubmit={saveBat}>
          <h3>타격 누적</h3>
          <div className="form-grid two">
            {num('경기', batForm.g, (n) => setBatForm({ ...batForm, g: n }))}
            {num('타석', batForm.pa, (n) => setBatForm({ ...batForm, pa: n }))}
            {num('타수', batForm.ab, (n) => setBatForm({ ...batForm, ab: n }))}
            {num('득점', batForm.r, (n) => setBatForm({ ...batForm, r: n }))}
            {num('안타', batForm.h, (n) => setBatForm({ ...batForm, h: n }))}
            {num('2루타', batForm.doubles, (n) =>
              setBatForm({ ...batForm, doubles: n }),
            )}
            {num('3루타', batForm.triples, (n) =>
              setBatForm({ ...batForm, triples: n }),
            )}
            {num('홈런', batForm.hr, (n) => setBatForm({ ...batForm, hr: n }))}
            {num('타점', batForm.rbi, (n) => setBatForm({ ...batForm, rbi: n }))}
            {num('볼넷', batForm.bb, (n) => setBatForm({ ...batForm, bb: n }))}
            {num('삼진', batForm.so, (n) => setBatForm({ ...batForm, so: n }))}
            {num('도루', batForm.sb, (n) => setBatForm({ ...batForm, sb: n }))}
            {num('도루실패', batForm.cs, (n) =>
              setBatForm({ ...batForm, cs: n }),
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              타격 저장
            </button>
          </div>
        </form>
      ) : (
        <form className="interact-box" onSubmit={savePit}>
          <h3>투수 누적</h3>
          <div className="form-grid two">
            {num('경기', pitForm.g, (n) => setPitForm({ ...pitForm, g: n }))}
            {num('선발', pitForm.gs, (n) => setPitForm({ ...pitForm, gs: n }))}
            {num('승', pitForm.w, (n) => setPitForm({ ...pitForm, w: n }))}
            {num('패', pitForm.l, (n) => setPitForm({ ...pitForm, l: n }))}
            {num('세이브', pitForm.sv, (n) => setPitForm({ ...pitForm, sv: n }))}
            <label className="field">
              이닝 (예: 6.1)
              <input
                value={ipText}
                onChange={(e) => setIpText(e.target.value)}
              />
            </label>
            {num('피안타', pitForm.h, (n) => setPitForm({ ...pitForm, h: n }))}
            {num('실점', pitForm.r, (n) => setPitForm({ ...pitForm, r: n }))}
            {num('자책', pitForm.er, (n) => setPitForm({ ...pitForm, er: n }))}
            {num('볼넷', pitForm.bb, (n) => setPitForm({ ...pitForm, bb: n }))}
            {num('삼진', pitForm.so, (n) => setPitForm({ ...pitForm, so: n }))}
            {num('피홈런', pitForm.hr, (n) => setPitForm({ ...pitForm, hr: n }))}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              투수 저장
            </button>
          </div>
        </form>
      )}
    </>
  )
}
