import type { AppState, StandingRow } from '../types'

export function computeStandings(state: AppState): StandingRow[] {
  const map = new Map<string, StandingRow>()
  for (const t of state.teams) {
    map.set(t.id, {
      teamId: t.id,
      wins: 0,
      losses: 0,
      ties: 0,
      runsFor: 0,
      runsAgainst: 0,
      pct: 0,
      gb: 0,
    })
  }

  for (const game of state.games) {
    if (game.status !== 'final') continue
    const result = state.results.find((r) => r.gameId === game.id)
    if (!result) continue
    const home = map.get(game.homeTeamId)
    const away = map.get(game.awayTeamId)
    if (!home || !away) continue

    home.runsFor += result.homeRuns
    home.runsAgainst += result.awayRuns
    away.runsFor += result.awayRuns
    away.runsAgainst += result.homeRuns

    if (result.homeRuns > result.awayRuns) {
      home.wins += 1
      away.losses += 1
    } else if (result.homeRuns < result.awayRuns) {
      away.wins += 1
      home.losses += 1
    } else {
      home.ties += 1
      away.ties += 1
    }
  }

  const rows = [...map.values()]
  for (const row of rows) {
    const decided = row.wins + row.losses
    row.pct = decided === 0 ? 0 : row.wins / decided
  }

  rows.sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct
    if (b.wins !== a.wins) return b.wins - a.wins
    const aDiff = a.runsFor - a.runsAgainst
    const bDiff = b.runsFor - b.runsAgainst
    return bDiff - aDiff
  })

  const leader = rows[0]
  if (leader) {
    for (const row of rows) {
      row.gb = (leader.wins - row.wins + (row.losses - leader.losses)) / 2
    }
  }

  return rows
}

export function formatGb(gb: number): string {
  if (gb === 0) return '—'
  return Number.isInteger(gb) ? String(gb) : gb.toFixed(1)
}

export function formatPct(pct: number): string {
  if (pct === 0) return '.000'
  if (pct === 1) return '1.000'
  return pct.toFixed(3).replace(/^0/, '')
}

export function formatGameDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
