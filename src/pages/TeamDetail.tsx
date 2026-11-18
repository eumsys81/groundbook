import { Link, useParams } from 'react-router-dom'
import { TeamLogo } from '../components/TeamLogo'
import { media } from '../media'
import {
  battingAvg,
  formatAvg,
  getBatting,
} from '../lib/stats'
import { computeStandings, formatPct } from '../lib/standings'
import { useStore } from '../store'

export function TeamDetail() {
  const { id } = useParams()
  const { state } = useStore()
  const team = state.teams.find((t) => t.id === id)
  const standings = computeStandings(state)
  const row = standings.find((s) => s.teamId === id)
  const rank = standings.findIndex((s) => s.teamId === id) + 1
  const players = state.players
    .filter((p) => p.teamId === id)
    .sort((a, b) => a.number - b.number)

  if (!team) {
    return (
      <div className="page">
        <p className="empty">팀을 찾을 수 없습니다.</p>
        <Link className="btn btn-ghost" to="/teams">
          팀 목록
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-banner">
        <img src={media.outfield} alt="" aria-hidden />
        <div className="page-banner-shade" />
        <div className="page-banner-copy team-detail-head">
          <TeamLogo team={team} size={88} />
          <div>
            <p className="crumb">
              <Link to="/teams">팀 현황</Link> / {team.name}
            </p>
            <h1 className="page-title">{team.name}</h1>
            <p className="page-lead">
              {team.foundedYear}년 창단 · 홈 {team.homeGround || '미정'} · 매니저{' '}
              {team.managerName}
            </p>
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2>연혁</h2>
        <p>{team.history || '등록된 연혁이 없습니다.'}</p>
      </section>

      <section className="section">
        <h2>시즌 성적</h2>
        <div className="scoreboard board-enter">
          <table className="data scoreboard-table">
            <thead>
              <tr>
                <th>순위</th>
                <th className="num">승</th>
                <th className="num">패</th>
                <th className="num">무</th>
                <th className="num">승률</th>
                <th className="num">득</th>
                <th className="num">실</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="board-rank">{rank || '—'}</td>
                <td className="num board-num">{row?.wins ?? 0}</td>
                <td className="num board-num">{row?.losses ?? 0}</td>
                <td className="num board-num">{row?.ties ?? 0}</td>
                <td className="num board-num">
                  {row ? formatPct(row.pct) : '.000'}
                </td>
                <td className="num board-num">{row?.runsFor ?? 0}</td>
                <td className="num board-num">{row?.runsAgainst ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>로스터 · 타율</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th className="num">번호</th>
                <th>이름</th>
                <th>포지션</th>
                <th className="num">타율</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const bat = getBatting(state, p.id)
                return (
                  <tr key={p.id}>
                    <td className="num">{p.number}</td>
                    <td>
                      <Link className="player-link" to={`/players/${p.id}`}>
                        {p.name}
                      </Link>
                    </td>
                    <td>{p.position}</td>
                    <td className="num">
                      {bat ? formatAvg(battingAvg(bat)) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
