import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: '홈', end: true },
  { to: '/schedule', label: '일정' },
  { to: '/results', label: '결과' },
  { to: '/standings', label: '순위' },
  { to: '/leaders', label: '기록', end: false },
  { to: '/roster', label: '명단' },
  { to: '/ops', label: '운영실', ops: true },
]

export function PublicLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand-mark">
            그라운드<span>북</span>
          </NavLink>
          <nav className="nav-links" aria-label="주요 메뉴">
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
