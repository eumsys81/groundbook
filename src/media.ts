import fieldNight from './assets/field-night-hero.jpg'
import dugout from './assets/dugout-gear.jpg'
import outfield from './assets/outfield-lights.jpg'
import ball from './assets/ball-chalk.jpg'

export const media = {
  hero: fieldNight,
  dugout,
  outfield,
  ball,
} as const

const venuePool = [fieldNight, dugout, outfield, ball] as const

export function venueImage(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h + seed.charCodeAt(i) * (i + 1)) % 997
  return venuePool[h % venuePool.length]
}
