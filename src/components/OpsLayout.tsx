import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store'

const links = [
  { to: '/ops', label: '개요', end: true },
  { to: '/ops/league', label: '리그' },
  { to: '/ops/teams', label: '팀' },
  { to: '/ops/players', label: '선수' },
  { to: '/ops/stats', label: '시즌 기록' },
  { to: '/ops/schedule', label: '일정' },
]

export function OpsLayout() {
  const { resetDemo } = useStore()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand-mark">
            그라운드<span>북</span>
          </NavLink>
          <nav className="nav-links open" style={{ display: 'flex' }}>
            <NavLink to="/">공개 홈</NavLink>
            <NavLink to="/ops" className="ops">
              운영실
            </NavLink>
          </nav>
        </div>
      </header>
      <div className="ops-layout">
        <aside className="ops-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={resetDemo}>
            데모 데이터 초기화
          </button>
        </aside>
        <div className="ops-panel">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
