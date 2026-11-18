/** Generate a simple circular team emblem as a data-URL SVG (sample branding). */
export function makeEmblem(shortName: string, color: string): string {
  const label = (shortName || '팀').slice(0, 3)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <radialGradient id="g" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#1a3d2e"/>
      <stop offset="100%" stop-color="#06140f"/>
    </radialGradient>
  </defs>
  <circle cx="80" cy="80" r="76" fill="url(#g)" stroke="${color}" stroke-width="6"/>
  <circle cx="80" cy="80" r="58" fill="none" stroke="${color}" stroke-width="2" opacity="0.45"/>
  <path d="M40 96 Q80 48 120 96" fill="none" stroke="${color}" stroke-width="3" opacity="0.7"/>
  <circle cx="80" cy="72" r="10" fill="${color}"/>
  <text x="80" y="128" text-anchor="middle" font-family="Black Han Sans, sans-serif" font-size="22" fill="#e8f5ee">${label}</text>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
