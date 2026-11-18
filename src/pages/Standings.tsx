import { computeStandings, formatPct } from '../lib/standings'
import { useStore } from '../store'

export function Standings() {
  const { state } = useStore()
  const rows = computeStandings(state)

  return (
    <div className="page">
      <h1 className="page-title">순위</h1>
      <p className="page-lead">
        확정 경기 기준 승·패·무와 득실입니다. 승률은 승÷(승+패).
      </p>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>팀</th>
              <th className="num">승</th>
              <th className="num">패</th>
              <th className="num">무</th>
              <th className="num">득</th>
              <th className="num">실</th>
              <th className="num">승률</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const team = state.teams.find((t) => t.id === row.teamId)
              return (
                <tr key={row.teamId}>
                  <td>{idx + 1}</td>
                  <td>
                    <span
                      className="team-swatch"
                      style={{ background: team?.colorHint }}
                    />
                    {team?.name}
                  </td>
                  <td className="num">{row.wins}</td>
                  <td className="num">{row.losses}</td>
                  <td className="num">{row.ties}</td>
                  <td className="num">{row.runsFor}</td>
                  <td className="num">{row.runsAgainst}</td>
                  <td className="num">{formatPct(row.pct)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
