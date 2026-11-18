export type GameStatus = 'scheduled' | 'final' | 'postponed'
export type Position =
  | '투수'
  | '포수'
  | '1루수'
  | '2루수'
  | '3루수'
  | '유격수'
  | '좌익수'
  | '중견수'
  | '우익수'
  | '지명타자'
  | '내야수'
  | '외야수'

/** Groundbook plate outcomes — labels/wording are original (not competitor code tables). */
export type PlateMark =
  | ''
  | '1B'
  | '2B'
  | '3B'
  | 'HR'
  | 'BB'
  | 'SO'
  | 'OUT'
  | 'SF'
  | 'E'
  | 'SB'

export type PitchDecision = '' | 'W' | 'L' | 'SV' | 'HLD'
export type PitchRole = '선발' | '불펜'

export interface League {
  id: string
  name: string
  seasonLabel: string
  region: string
  description: string
  updatedAt: string
}

export interface Team {
  id: string
  leagueId: string
  name: string
  shortName: string
  colorHint: string
  managerName: string
  logoDataUrl: string
  foundedYear: number
  homeGround: string
  history: string
}

export interface Player {
  id: string
  teamId: string
  name: string
  number: number
  position: Position
}

export interface InningScore {
  inning: number
  home: number | null
  away: number | null
}

export interface LineupRow {
  order: number
  playerId: string
  position: Position
  /** One mark per inning column */
  marks: PlateMark[]
}

export interface PitcherRow {
  playerId: string
  role: PitchRole
  decision: PitchDecision
  ipText: string
  bf: number
  ab: number
  h: number
  hr: number
  bb: number
  hbp: number
  so: number
  wp: number
  bk: number
  r: number
  er: number
  pitches: number
}

export interface SideBox {
  lineup: LineupRow[]
  pitchers: PitcherRow[]
}

export interface GameResult {
  gameId: string
  homeRuns: number
  awayRuns: number
  innings: InningScore[]
  note: string
  recordedAt: string
  homeBox?: SideBox
  awayBox?: SideBox
}

export interface Game {
  id: string
  leagueId: string
  homeTeamId: string
  awayTeamId: string
  startsAt: string
  venue: string
  status: GameStatus
}

export interface BattingLine {
  playerId: string
  g: number
  pa: number
  ab: number
  r: number
  h: number
  doubles: number
  triples: number
  hr: number
  rbi: number
  bb: number
  so: number
  sb: number
  cs: number
}

export interface PitchingLine {
  playerId: string
  g: number
  gs: number
  w: number
  l: number
  sv: number
  ipOuts: number
  h: number
  r: number
  er: number
  bb: number
  so: number
  hr: number
}

export interface AppState {
  league: League
  teams: Team[]
  players: Player[]
  games: Game[]
  results: GameResult[]
  batting: BattingLine[]
  pitching: PitchingLine[]
}

export interface StandingRow {
  teamId: string
  wins: number
  losses: number
  ties: number
  runsFor: number
  runsAgainst: number
  pct: number
  gb: number
}
