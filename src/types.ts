export type GameStatus = 'scheduled' | 'final' | 'postponed'
export type Position = '투수' | '포수' | '1루수' | '2루수' | '3루수' | '유격수' | '좌익수' | '중견수' | '우익수' | '지명타자' | '내야수' | '외야수'

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

export interface GameResult {
  gameId: string
  homeRuns: number
  awayRuns: number
  innings: InningScore[]
  note: string
  recordedAt: string
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

export interface AppState {
  league: League
  teams: Team[]
  players: Player[]
  games: Game[]
  results: GameResult[]
}

export interface StandingRow {
  teamId: string
  wins: number
  losses: number
  ties: number
  runsFor: number
  runsAgainst: number
  pct: number
}
