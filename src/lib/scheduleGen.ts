import type { Game, GameStatus } from '../types'

export type ScheduleDraft = Omit<Game, 'id' | 'leagueId'>

export type GenerateScheduleInput = {
  teamIds: string[]
  /** Target games each team should play (e.g. 60). */
  gamesPerTeam: number
  /** Inclusive start date YYYY-MM-DD (local calendar). */
  startDate: string
  /** Inclusive end date YYYY-MM-DD. */
  endDate: string
  venues: string[]
  /** Prefer Sat/Sun slots when true. */
  weekendOnly: boolean
  /** Optional seed for reproducible shuffle. */
  seed?: number
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Build weekend (or daily) date slots between start/end. */
export function buildDateSlots(
  startDate: string,
  endDate: string,
  weekendOnly: boolean,
): string[] {
  const slots: string[] = []
  const cur = parseYmd(startDate)
  const end = parseYmd(endDate)
  while (cur <= end) {
    const dow = cur.getDay()
    if (!weekendOnly || dow === 0 || dow === 6) {
      slots.push(ymd(cur))
    }
    cur.setDate(cur.getDate() + 1)
  }
  return slots
}

/**
 * Generate a random-ish balanced schedule.
 * Expands home/away pairings until each team is near gamesPerTeam.
 */
export function generateSchedule(input: GenerateScheduleInput): {
  drafts: ScheduleDraft[]
  perTeam: Record<string, number>
  warnings: string[]
} {
  const warnings: string[] = []
  const teams = [...new Set(input.teamIds)]
  if (teams.length < 2) {
    return { drafts: [], perTeam: {}, warnings: ['팀이 2개 이상 필요합니다.'] }
  }
  const gamesPerTeam = Math.max(1, Math.floor(input.gamesPerTeam))
  const venues =
    input.venues.map((v) => v.trim()).filter(Boolean).length > 0
      ? input.venues.map((v) => v.trim()).filter(Boolean)
      : ['미정 구장']

  const rand = mulberry32(input.seed ?? Date.now() % 1_000_000_000)
  const slots = buildDateSlots(input.startDate, input.endDate, input.weekendOnly)
  if (slots.length === 0) {
    return {
      drafts: [],
      perTeam: {},
      warnings: ['선택한 기간에 배정 가능한 날짜가 없습니다.'],
    }
  }

  // Desired total games (each game counts for 2 team-slots)
  let targetTotal = Math.round((teams.length * gamesPerTeam) / 2)
  if (targetTotal < 1) targetTotal = 1

  const counts: Record<string, number> = Object.fromEntries(
    teams.map((id) => [id, 0]),
  )
  const homeAway: Record<string, { home: number; away: number }> =
    Object.fromEntries(teams.map((id) => [id, { home: 0, away: 0 }]))

  type Pair = { home: string; away: string }
  const pairPool: Pair[] = []
  for (let a = 0; a < teams.length; a += 1) {
    for (let b = 0; b < teams.length; b += 1) {
      if (a === b) continue
      pairPool.push({ home: teams[a], away: teams[b] })
    }
  }

  const drafts: ScheduleDraft[] = []
  let guard = 0
  while (
    teams.some((id) => counts[id] < gamesPerTeam) &&
    guard < targetTotal * 100
  ) {
    guard += 1
    const needy = teams
      .filter((id) => counts[id] < gamesPerTeam)
      .sort((a, b) => counts[a] - counts[b])
    if (!needy.length) break

    const focus = needy[0]
    // Partner: prefer other needy, else lowest count
    const partners = shuffle(
      teams.filter((id) => id !== focus),
      rand,
    ).sort((a, b) => {
      const an = counts[a] < gamesPerTeam ? 0 : 1
      const bn = counts[b] < gamesPerTeam ? 0 : 1
      return an - bn || counts[a] - counts[b]
    })
    const partner = partners[0]
    if (!partner) break

    // Home/away by balance for focus team
    const focusWantsHome =
      homeAway[focus].home <= homeAway[focus].away || rand() > 0.5
    const pick: Pair = focusWantsHome
      ? { home: focus, away: partner }
      : { home: partner, away: focus }

    const day = slots[drafts.length % slots.length]
    const slotInDay = Math.floor(drafts.length / slots.length) % 2
    const hour = slotInDay === 0 ? 10 : 13
    const startsAt = new Date(
      `${day}T${String(hour).padStart(2, '0')}:00:00`,
    ).toISOString()
    const venue = venues[drafts.length % venues.length]

    drafts.push({
      homeTeamId: pick.home,
      awayTeamId: pick.away,
      startsAt,
      venue,
      status: 'scheduled' as GameStatus,
    })
    counts[pick.home] += 1
    counts[pick.away] += 1
    homeAway[pick.home].home += 1
    homeAway[pick.away].away += 1
  }

  const short = teams.filter((id) => counts[id] < gamesPerTeam)
  if (short.length) {
    warnings.push(
      `일부 팀은 목표(${gamesPerTeam}경기)에 못 미쳤습니다: ` +
        short.map((id) => `${id} ${counts[id]}`).join(', '),
    )
  }
  if (slots.length * 2 < targetTotal) {
    warnings.push(
      '날짜 슬롯이 적어 하루에 여러 경기가 겹칠 수 있습니다. 기간을 늘리거나 주중 포함을 검토하세요.',
    )
  }

  return { drafts, perTeam: counts, warnings }
}
