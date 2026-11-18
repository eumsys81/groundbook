import type { LineupRow, PlateMark, Position } from '../types'

export const PLATE_MARKS: { value: PlateMark; label: string; tone: string }[] = [
  { value: '', label: '비움', tone: 'tone-empty' },
  { value: '1B', label: '안타', tone: 'tone-hit' },
  { value: '2B', label: '2루타', tone: 'tone-hit' },
  { value: '3B', label: '3루타', tone: 'tone-hit' },
  { value: 'HR', label: '홈런', tone: 'tone-power' },
  { value: 'BB', label: '볼넷', tone: 'tone-free' },
  { value: 'SO', label: '삼진', tone: 'tone-out' },
  { value: 'OUT', label: '아웃', tone: 'tone-out' },
  { value: 'SF', label: '희생', tone: 'tone-free' },
  { value: 'E', label: '실책출루', tone: 'tone-misc' },
  { value: 'SB', label: '도루', tone: 'tone-misc' },
]

export const LINEUP_SIZE = 9
export const INNING_COLS = 7

export function emptyMarks(): PlateMark[] {
  return Array.from({ length: INNING_COLS }, () => '' as PlateMark)
}

export function blankLineup(defaultPos: Position = '지명타자'): LineupRow[] {
  return Array.from({ length: LINEUP_SIZE }, (_, i) => ({
    order: i + 1,
    playerId: '',
    position: i === 0 ? '투수' : defaultPos,
    marks: emptyMarks(),
  }))
}

export function summarizeLine(marks: PlateMark[]) {
  let ab = 0
  let h = 0
  let rbi = 0
  let r = 0
  let sb = 0
  for (const m of marks) {
    if (!m) continue
    if (m === 'SB') {
      sb += 1
      continue
    }
    if (m === 'BB' || m === 'SF' || m === 'E') {
      // PA but not AB for BB/SF; E counts as AB commonly varied — treat as AB
      if (m === 'BB' || m === 'SF') {
        /* no AB */
      } else ab += 1
    } else if (m === '1B' || m === '2B' || m === '3B' || m === 'HR') {
      ab += 1
      h += 1
      if (m === 'HR') {
        r += 1
        rbi += 1
      }
    } else if (m === 'SO' || m === 'OUT') {
      ab += 1
    }
  }
  return { ab, h, rbi, r, sb }
}

export function markClass(mark: PlateMark): string {
  const found = PLATE_MARKS.find((m) => m.value === mark)
  return found?.tone ?? 'tone-empty'
}

export function markLabel(mark: PlateMark): string {
  if (!mark) return ''
  return PLATE_MARKS.find((m) => m.value === mark)?.label ?? mark
}
