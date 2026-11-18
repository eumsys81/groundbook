import type { AppState, BattingLine, PitchingLine, Player, Team } from '../types'

export function battingAvg(line: BattingLine): number {
  if (line.ab <= 0) return 0
  return line.h / line.ab
}

export function onBasePct(line: BattingLine): number {
  const den = line.ab + line.bb
  if (den <= 0) return 0
  return (line.h + line.bb) / den
}

export function slugging(line: BattingLine): number {
  if (line.ab <= 0) return 0
  const singles = line.h - line.doubles - line.triples - line.hr
  const tb = singles + 2 * line.doubles + 3 * line.triples + 4 * line.hr
  return tb / line.ab
}

export function era(line: PitchingLine): number {
  if (line.ipOuts <= 0) return 0
  return (line.er * 27) / line.ipOuts
}

export function whip(line: PitchingLine): number {
  if (line.ipOuts <= 0) return 0
  return ((line.h + line.bb) * 3) / line.ipOuts
}

export function formatAvg(n: number): string {
  if (n >= 1) return n.toFixed(3)
  return n.toFixed(3).replace(/^0/, '')
}

export function formatEra(n: number): string {
  return n.toFixed(2)
}

export function formatIp(ipOuts: number): string {
  const whole = Math.floor(ipOuts / 3)
  const rem = ipOuts % 3
  return rem === 0 ? `${whole}` : `${whole}.${rem}`
}

export type BatLeaderKey = 'avg' | 'hr' | 'h' | 'bb' | 'sb' | 'rbi' | 'obp' | 'slg'
export type PitchLeaderKey = 'era' | 'so' | 'w' | 'sv' | 'whip' | 'ip'

export const BAT_LEADER_META: {
  key: BatLeaderKey
  label: string
  minAb?: number
}[] = [
  { key: 'avg', label: '타율', minAb: 15 },
  { key: 'hr', label: '홈런' },
  { key: 'h', label: '안타' },
  { key: 'rbi', label: '타점' },
  { key: 'bb', label: '볼넷' },
  { key: 'sb', label: '도루' },
  { key: 'obp', label: '출루율', minAb: 15 },
  { key: 'slg', label: '장타율', minAb: 15 },
]

export const PITCH_LEADER_META: {
  key: PitchLeaderKey
  label: string
  minIpOuts?: number
  lowerBetter?: boolean
}[] = [
  { key: 'era', label: '방어율', minIpOuts: 12, lowerBetter: true },
  { key: 'so', label: '삼진' },
  { key: 'w', label: '승' },
  { key: 'sv', label: '세이브' },
  { key: 'whip', label: 'WHIP', minIpOuts: 12, lowerBetter: true },
  { key: 'ip', label: '이닝' },
]

export type LeaderRow = {
  rank: number
  player: Player
  team?: Team
  value: number
  display: string
}

function batValue(line: BattingLine, key: BatLeaderKey): number {
  switch (key) {
    case 'avg':
      return battingAvg(line)
    case 'hr':
      return line.hr
    case 'h':
      return line.h
    case 'bb':
      return line.bb
    case 'sb':
      return line.sb
    case 'rbi':
      return line.rbi
    case 'obp':
      return onBasePct(line)
    case 'slg':
      return slugging(line)
  }
}

function batDisplay(line: BattingLine, key: BatLeaderKey): string {
  const v = batValue(line, key)
  if (key === 'avg' || key === 'obp' || key === 'slg') return formatAvg(v)
  return String(v)
}

function pitchValue(line: PitchingLine, key: PitchLeaderKey): number {
  switch (key) {
    case 'era':
      return era(line)
    case 'so':
      return line.so
    case 'w':
      return line.w
    case 'sv':
      return line.sv
    case 'whip':
      return whip(line)
    case 'ip':
      return line.ipOuts
  }
}

function pitchDisplay(line: PitchingLine, key: PitchLeaderKey): string {
  if (key === 'era') return formatEra(era(line))
  if (key === 'whip') return whip(line).toFixed(2)
  if (key === 'ip') return formatIp(line.ipOuts)
  return String(pitchValue(line, key))
}

export function battingLeaders(
  state: AppState,
  key: BatLeaderKey,
  limit = 10,
): LeaderRow[] {
  const meta = BAT_LEADER_META.find((m) => m.key === key)!
  const rows = state.batting
    .filter((line) => (meta.minAb ? line.ab >= meta.minAb : true))
    .map((line) => {
      const player = state.players.find((p) => p.id === line.playerId)
      if (!player) return null
      const team = state.teams.find((t) => t.id === player.teamId)
      return {
        player,
        team,
        value: batValue(line, key),
        display: batDisplay(line, key),
        line,
      }
    })
    .filter(Boolean) as {
    player: Player
    team?: Team
    value: number
    display: string
  }[]

  rows.sort((a, b) => b.value - a.value || a.player.name.localeCompare(b.player.name))

  return rows.slice(0, limit).map((r, i) => ({
    rank: i + 1,
    player: r.player,
    team: r.team,
    value: r.value,
    display: r.display,
  }))
}

export function pitchingLeaders(
  state: AppState,
  key: PitchLeaderKey,
  limit = 10,
): LeaderRow[] {
  const meta = PITCH_LEADER_META.find((m) => m.key === key)!
  const rows = state.pitching
    .filter((line) => (meta.minIpOuts ? line.ipOuts >= meta.minIpOuts : true))
    .map((line) => {
      const player = state.players.find((p) => p.id === line.playerId)
      if (!player) return null
      const team = state.teams.find((t) => t.id === player.teamId)
      return {
        player,
        team,
        value: pitchValue(line, key),
        display: pitchDisplay(line, key),
      }
    })
    .filter(Boolean) as {
    player: Player
    team?: Team
    value: number
    display: string
  }[]

  rows.sort((a, b) => {
    if (meta.lowerBetter) return a.value - b.value || a.player.name.localeCompare(b.player.name)
    return b.value - a.value || a.player.name.localeCompare(b.player.name)
  })

  return rows.slice(0, limit).map((r, i) => ({
    rank: i + 1,
    player: r.player,
    team: r.team,
    value: r.value,
    display: r.display,
  }))
}

export function getBatting(state: AppState, playerId: string): BattingLine | undefined {
  return state.batting.find((b) => b.playerId === playerId)
}

export function getPitching(state: AppState, playerId: string): PitchingLine | undefined {
  return state.pitching.find((p) => p.playerId === playerId)
}
