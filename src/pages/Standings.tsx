import { Link } from 'react-router-dom'
import { media } from '../media'
import { battingLeaders, pitchingLeaders } from '../lib/stats'
import { computeStandings, formatGb, formatPct } from '../lib/standings'
import { useStore } from '../store'

export function Standings() {
  const { state } = useStore()
  const rows = computeStandings(state)
  const avgLeaders = battingLeaders(state, 'avg', 5)
  const hrLeaders = battingLeaders(state, 'hr', 5)
  const eraLeaders = pitchingLeaders(state, 'era', 5)
  const soLeaders = pitchingLeaders(state, 'so', 5)

  return (
    <div className="page">
      <header className="page-banner">
        <img src={media.dugout} alt="" aria-hidden />
        <div className="page-banner-shade" />
        <div className="page-banner-copy">
          <h1 className="page-title">순위</h1>
          <p className="page-lead">
            팀 승패 순위와 주요 개인 기록 톱5입니다. 전체 항목 순위는{' '}
            <Link className="inline-link" to="/leaders">
              기록
            </Link>
            에서 확인하세요.
          </p>
        </div>
      </header>

      <h2 className="board-heading">팀 순위</h2>
      <div className="scoreboard board-enter table-wrap">
        <div className="scoreboard-glow" aria-hidden />
        <table className="data scoreboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>팀</th>
              <th className="num">승</th>
              <th className="num">패</th>
              <th className="num">무</th>
              <th className="num">승률</th>
              <th className="num">게임차</th>
              <th className="num">득</th>
              <th className="num">실</th>
              <th className="num">득실</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const team = state.teams.find((t) => t.id === row.teamId)
              const diff = row.runsFor - row.runsAgainst
              return (
                <tr key={row.teamId}>
                  <td className="board-rank">{idx + 1}</td>
                  <td>
                    <span
                      className="team-swatch"
                      style={{ background: team?.colorHint }}
                    />
                    {team?.name}
                  </td>
                  <td className="num board-num">{row.wins}</td>
                  <td className="num board-num">{row.losses}</td>
                  <td className="num board-num">{row.ties}</td>
                  <td className="num board-num">{formatPct(row.pct)}</td>
                  <td className="num board-num">{formatGb(row.gb)}</td>
                  <td className="num board-num">{row.runsFor}</td>
                  <td className="num board-num">{row.runsAgainst}</td>
                  <td className="num board-num">
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="leader-preview-grid">
        <LeaderPreview title="타율" rows={avgLeaders} />
        <LeaderPreview title="홈런" rows={hrLeaders} />
        <LeaderPreview title="방어율" rows={eraLeaders} />
        <LeaderPreview title="삼진" rows={soLeaders} />
      </div>

      <div className="cta-row" style={{ marginTop: '1.25rem' }}>
        <Link className="btn btn-primary" to="/leaders">
          전체 기록 순위
        </Link>
        <Link className="btn btn-ghost" to="/roster">
          팀 명단·기록
        </Link>
      </div>
    </div>
  )
}

function LeaderPreview({
  title,
  rows,
}: {
  title: string
  rows: ReturnType<typeof battingLeaders>
}) {
  return (
    <section className="leader-preview">
      <header>
        <h3>{title}</h3>
        <Link to="/leaders">더보기</Link>
      </header>
      <ol>
        {rows.map((r) => (
          <li key={r.player.id}>
            <Link to={`/players/${r.player.id}`}>
              <span className="rank">{r.rank}</span>
              <span className="name">
                {r.player.name}
                <em>{r.team?.shortName}</em>
              </span>
              <strong>{r.display}</strong>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
