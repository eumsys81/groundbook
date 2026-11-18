import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedState } from './data/seed'
import type {
  AppState,
  Game,
  GameResult,
  League,
  Player,
  Team,
} from './types'
import { uid } from './lib/standings'

const STORAGE_KEY = 'groundbook-mvp-v1'

type StoreApi = {
  state: AppState
  resetDemo: () => void
  updateLeague: (patch: Partial<League>) => void
  upsertTeam: (team: Omit<Team, 'id' | 'leagueId'> & { id?: string }) => void
  deleteTeam: (id: string) => void
  upsertPlayer: (player: Omit<Player, 'id'> & { id?: string }) => void
  deletePlayer: (id: string) => void
  upsertGame: (
    game: Omit<Game, 'id' | 'leagueId'> & { id?: string },
  ) => void
  deleteGame: (id: string) => void
  saveResult: (result: GameResult) => void
}

const StoreContext = createContext<StoreApi | null>(null)

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(seedState)
    return JSON.parse(raw) as AppState
  } catch {
    return structuredClone(seedState)
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const api = useMemo<StoreApi>(
    () => ({
      state,
      resetDemo: () => setState(structuredClone(seedState)),
      updateLeague: (patch) =>
        setState((s) => ({
          ...s,
          league: {
            ...s.league,
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        })),
      upsertTeam: (team) =>
        setState((s) => {
          if (team.id) {
            return {
              ...s,
              teams: s.teams.map((t) =>
                t.id === team.id
                  ? { ...t, ...team, id: t.id, leagueId: s.league.id }
                  : t,
              ),
            }
          }
          const next: Team = {
            id: uid('tm'),
            leagueId: s.league.id,
            name: team.name,
            shortName: team.shortName,
            colorHint: team.colorHint,
            managerName: team.managerName,
          }
          return { ...s, teams: [...s.teams, next] }
        }),
      deleteTeam: (id) =>
        setState((s) => ({
          ...s,
          teams: s.teams.filter((t) => t.id !== id),
          players: s.players.filter((p) => p.teamId !== id),
          games: s.games.filter(
            (g) => g.homeTeamId !== id && g.awayTeamId !== id,
          ),
          results: s.results.filter((r) => {
            const g = s.games.find((x) => x.id === r.gameId)
            if (!g) return false
            return g.homeTeamId !== id && g.awayTeamId !== id
          }),
        })),
      upsertPlayer: (player) =>
        setState((s) => {
          if (player.id) {
            return {
              ...s,
              players: s.players.map((p) =>
                p.id === player.id ? { ...p, ...player, id: p.id } : p,
              ),
            }
          }
          const next: Player = {
            id: uid('pl'),
            teamId: player.teamId,
            name: player.name,
            number: player.number,
            position: player.position,
          }
          return { ...s, players: [...s.players, next] }
        }),
      deletePlayer: (id) =>
        setState((s) => ({
          ...s,
          players: s.players.filter((p) => p.id !== id),
        })),
      upsertGame: (game) =>
        setState((s) => {
          if (game.id) {
            return {
              ...s,
              games: s.games.map((g) =>
                g.id === game.id
                  ? { ...g, ...game, id: g.id, leagueId: s.league.id }
                  : g,
              ),
            }
          }
          const next: Game = {
            id: uid('gm'),
            leagueId: s.league.id,
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
            startsAt: game.startsAt,
            venue: game.venue,
            status: game.status,
          }
          return { ...s, games: [...s.games, next] }
        }),
      deleteGame: (id) =>
        setState((s) => ({
          ...s,
          games: s.games.filter((g) => g.id !== id),
          results: s.results.filter((r) => r.gameId !== id),
        })),
      saveResult: (result) =>
        setState((s) => {
          const exists = s.results.some((r) => r.gameId === result.gameId)
          const results = exists
            ? s.results.map((r) => (r.gameId === result.gameId ? result : r))
            : [...s.results, result]
          return {
            ...s,
            results,
            games: s.games.map((g) =>
              g.id === result.gameId ? { ...g, status: 'final' as const } : g,
            ),
          }
        }),
    }),
    [state],
  )

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useTeamName(id: string): string {
  const { state } = useStore()
  return state.teams.find((t) => t.id === id)?.name ?? '—'
}
