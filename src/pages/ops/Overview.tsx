import { Link } from 'react-router-dom'
import { computeStandings } from '../../lib/standings'
import { useStore } from '../../store'

export function OpsOverview() {
  const { state } = useStore()
  const finals = state.games.filter((g) => g.status === 'final').length
  const scheduled = state.games.filter((g) => g.status === 'scheduled').length
  const leader = computeStandings(state)[0]
  const leaderName =
    state.teams.find((t) => t.id === leader?.teamId)?.name ?? '—'

  return (
    <>
      <h1 className="page-title">운영실</h1>
      <p className="page-lead">
        리그 관리자와 기록원을 위한 작업 공간입니다. 데모에서는 별도 로그인 없이
        진입합니다.
      </p>
      <div className="stat-strip">
        <div className="interact-box">
          <strong>{state.teams.length}</strong>
          <span>팀</span>
        </div>
        <div className="interact-box">
          <strong>{state.players.length}</strong>
          <span>선수</span>
        </div>
        <div className="interact-box">
          <strong>{scheduled}</strong>
          <span>예정 경기</span>
        </div>
        <div className="interact-box">
          <strong>{finals}</strong>
          <span>확정 결과</span>
        </div>
      </div>
      <div className="interact-box">
        <h3>현재 선두</h3>
        <p style={{ margin: 0 }}>
          {leaderName} ({leader?.wins ?? 0}승 {leader?.losses ?? 0}패)
        </p>
      </div>
      <div className="cta-row">
        <Link className="btn btn-primary" to="/ops/stats">
          시즌 기록 입력
        </Link>
        <Link className="btn btn-ghost" to="/ops/schedule">
          일정·경기 기록
        </Link>
        <Link className="btn btn-ghost" to="/ops/teams">
          팀 편집
        </Link>
        <Link className="btn btn-ghost" to="/ops/league">
          리그 정보
        </Link>
      </div>
    </>
  )
}
