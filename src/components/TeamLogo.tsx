import type { Team } from '../types'

export function TeamLogo({
  team,
  size = 48,
  className = '',
}: {
  team?: Pick<Team, 'name' | 'shortName' | 'colorHint' | 'logoDataUrl'> | null
  size?: number
  className?: string
}) {
  if (!team) {
    return (
      <span
        className={`team-logo fallback ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    )
  }
  return (
    <img
      className={`team-logo ${className}`}
      src={team.logoDataUrl}
      alt={`${team.name} 엠블럼`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  )
}
