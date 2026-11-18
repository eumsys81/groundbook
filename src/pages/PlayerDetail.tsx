import { Link, useParams } from 'react-router-dom'
import { media } from '../media'
import {
  battingAvg,
  era,
  formatAvg,
  formatEra,
  formatIp,
  getBatting,
  getPitching,
  onBasePct,
  slugging,
  whip,
} from '../lib/stats'
import { useStore } from '../store'

export function PlayerDetail() {
  const { id } = useParams()
  const { state } = useStore()
  const player = state.players.find((p) => p.id === id)
  const team = state.teams.find((t) => t.id === player?.teamId)
  const bat = player ? getBatting(state, player.id) : undefined
  const pit = player ? getPitching(state, player.id) : undefined

  if (!player) {
    return (
      <div className="page">
        <h1 className="page-title">선수</h1>
        <p className="empty">선수를 찾을 수 없습니다.</p>
        <Link className="btn btn-ghost" to="/roster">
          명단으로
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="player-hero">
        <img src={media.ball} alt="" aria-hidden />
        <div className="player-hero-shade" />
        <div className="player-hero-copy">
          <p className="crumb">
            <Link to="/roster">명단</Link> / {player.name}
          </p>
          <h1 className="page-title">
            #{player.number} {player.name}
          </h1>
          <p className="page-lead">
            <span
              className="team-swatch"
              style={{ background: team?.colorHint }}
            />
            {team?.name} · {player.position} · {state.league.seasonLabel}
          </p>
        </div>
      </header>

      {bat && (
        <section className="section" style={{ paddingTop: '0.5rem' }}>
          <h2>타격</h2>
          <div className="stat-grid">
            <div>
              <strong>{formatAvg(battingAvg(bat))}</strong>
              <span>타율</span>
            </div>
            <div>
              <strong>{bat.hr}</strong>
              <span>홈런</span>
            </div>
            <div>
              <strong>{bat.h}</strong>
              <span>안타</span>
            </div>
            <div>
              <strong>{bat.rbi}</strong>
              <span>타점</span>
            </div>
            <div>
              <strong>{bat.bb}</strong>
              <span>볼넷</span>
            </div>
            <div>
              <strong>{bat.sb}</strong>
              <span>도루</span>
            </div>
            <div>
              <strong>{formatAvg(onBasePct(bat))}</strong>
              <span>출루율</span>
            </div>
            <div>
              <strong>{formatAvg(slugging(bat))}</strong>
              <span>장타율</span>
            </div>
          </div>
          <div className="table-wrap" style={{ marginTop: '1rem' }}>
            <table className="data">
              <thead>
                <tr>
                  <th className="num">G</th>
                  <th className="num">타석</th>
                  <th className="num">타수</th>
                  <th className="num">득점</th>
                  <th className="num">2루타</th>
                  <th className="num">3루타</th>
                  <th className="num">삼진</th>
                  <th className="num">도루실패</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="num">{bat.g}</td>
                  <td className="num">{bat.pa}</td>
                  <td className="num">{bat.ab}</td>
                  <td className="num">{bat.r}</td>
                  <td className="num">{bat.doubles}</td>
                  <td className="num">{bat.triples}</td>
                  <td className="num">{bat.so}</td>
                  <td className="num">{bat.cs}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pit && (
        <section className="section">
          <h2>투수</h2>
          <div className="stat-grid">
            <div>
              <strong>{formatEra(era(pit))}</strong>
              <span>방어율</span>
            </div>
            <div>
              <strong>{pit.so}</strong>
              <span>삼진</span>
            </div>
            <div>
              <strong>
                {pit.w}–{pit.l}
              </strong>
              <span>승–패</span>
            </div>
            <div>
              <strong>{pit.sv}</strong>
              <span>세이브</span>
            </div>
            <div>
              <strong>{formatIp(pit.ipOuts)}</strong>
              <span>이닝</span>
            </div>
            <div>
              <strong>{whip(pit).toFixed(2)}</strong>
              <span>WHIP</span>
            </div>
            <div>
              <strong>{pit.bb}</strong>
              <span>볼넷</span>
            </div>
            <div>
              <strong>{pit.hr}</strong>
              <span>피홈런</span>
            </div>
          </div>
        </section>
      )}

      {!bat && !pit && (
        <p className="empty">아직 등록된 시즌 기록이 없습니다.</p>
      )}

      <div className="cta-row" style={{ marginTop: '1.5rem' }}>
        <Link className="btn btn-ghost" to="/leaders">
          항목 순위
        </Link>
        <Link className="btn btn-ghost" to="/standings">
          팀 순위
        </Link>
      </div>
    </div>
  )
}
