import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: '홈', end: true },
  { to: '/schedule', label: '일정' },
  { to: '/results', label: '결과' },
  { to: '/standings', label: '순위' },
  { to: '/roster', label: '명단' },
  { to: '/ops', label: '운영실', ops: true },
]

export function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand-mark" onClick={() => setOpen(false)}>
            그라운드<span>북</span>
          </NavLink>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-label="메뉴"
            onClick={() => setOpen((v) => !v)}
          >
            메뉴
          </button>
          <nav className={`nav-links${open ? ' open' : ''}`}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  [isActive ? 'active' : '', l.ops ? 'ops' : '']
                    .filter(Boolean)
                    .join(' ')
                }
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">그라운드북 · 아마추어 리그 운영 샘플 MVP</footer>
    </div>
  )
}
