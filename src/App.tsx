import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/PublicLayout'
import { OpsLayout } from './components/OpsLayout'
import { Home } from './pages/Home'
import { Schedule } from './pages/Schedule'
import { Results } from './pages/Results'
import { Standings } from './pages/Standings'
import { Leaders } from './pages/Leaders'
import { Roster } from './pages/Roster'
import { Teams } from './pages/Teams'
import { TeamDetail } from './pages/TeamDetail'
import { PlayerDetail } from './pages/PlayerDetail'
import { OpsOverview } from './pages/ops/Overview'
import { LeagueAdmin } from './pages/ops/LeagueAdmin'
import { TeamsAdmin } from './pages/ops/TeamsAdmin'
import { PlayersAdmin } from './pages/ops/PlayersAdmin'
import { ScheduleAdmin } from './pages/ops/ScheduleAdmin'
import { StatsAdmin } from './pages/ops/StatsAdmin'
import { GameEntry } from './pages/ops/GameEntry'
import { StoreProvider } from './store'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="results" element={<Results />} />
            <Route path="standings" element={<Standings />} />
            <Route path="leaders" element={<Leaders />} />
            <Route path="teams" element={<Teams />} />
            <Route path="teams/:id" element={<TeamDetail />} />
            <Route path="roster" element={<Roster />} />
            <Route path="players/:id" element={<PlayerDetail />} />
          </Route>
          <Route path="ops" element={<OpsLayout />}>
            <Route index element={<OpsOverview />} />
            <Route path="league" element={<LeagueAdmin />} />
            <Route path="teams" element={<TeamsAdmin />} />
            <Route path="players" element={<PlayersAdmin />} />
            <Route path="stats" element={<StatsAdmin />} />
            <Route path="schedule" element={<ScheduleAdmin />} />
            <Route path="games/:id" element={<GameEntry />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
