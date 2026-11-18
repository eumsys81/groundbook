import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/PublicLayout'
import { OpsLayout } from './components/OpsLayout'
import { Home } from './pages/Home'
import { Schedule } from './pages/Schedule'
import { Results } from './pages/Results'
import { Standings } from './pages/Standings'
import { Roster } from './pages/Roster'
import { OpsOverview } from './pages/ops/Overview'
import { LeagueAdmin } from './pages/ops/LeagueAdmin'
import { TeamsAdmin } from './pages/ops/TeamsAdmin'
import { PlayersAdmin } from './pages/ops/PlayersAdmin'
import { ScheduleAdmin } from './pages/ops/ScheduleAdmin'
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
            <Route path="roster" element={<Roster />} />
          </Route>
          <Route path="ops" element={<OpsLayout />}>
            <Route index element={<OpsOverview />} />
            <Route path="league" element={<LeagueAdmin />} />
            <Route path="teams" element={<TeamsAdmin />} />
            <Route path="players" element={<PlayersAdmin />} />
            <Route path="schedule" element={<ScheduleAdmin />} />
            <Route path="games/:id" element={<GameEntry />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
