import { useState } from 'react'
import { useApp } from '../state.jsx'
import { MILESTONES, brl, computeStats, dateKey, DAY } from '../utils.js'

export default function Progresso() {
  const { me } = useApp()
  const [now] = useState(Date.now())
  const s = computeStats(me, now)

  // Cigarros fumados nos últimos 7 dias (RF03)
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now - (6 - i) * DAY)
    const key = dateKey(day.getTime())
    const count = (me.logs || []).filter((l) => l.type === 'cigarro' && dateKey(l.ts) === key).reduce((a, l) => a + (l.qty || 1), 0)
    return { label: day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), count }
  })
  const max = Math.max(1, ...days.map((d) => d.count))
  const cravings = (me.logs || []).filter((l) => l.type === 'vontade').length

  return (
    <div className="screen padded">
      <h1 className="title-teal">Seu progresso</h1>

      <section className="stats">
        <div><b>{brl(s.saved)}</b><small>Economizados</small></div>
        <div><b>{s.avoided}</b><small>Cigarros a menos</small></div>
        <div><b>{cravings}</b><small>Vontades vencidas</small></div>
      </section>

      <div className="card">
        <b>Cigarros nos últimos 7 dias</b>
        <div className="bars-chart">
          {days.map((d, i) => (
            <div key={i}><i style={{ height: `${(d.count / max) * 100}%` }} /><small>{d.count}</small><small>{d.label}</small></div>
          ))}
        </div>
      </div>

      <h2 className="sub">Marcos de saúde</h2>
      <ul className="milestones">
        {MILESTONES.map((m) => {
          const ok = s.sinceLast >= m.ms
          const pct = Math.min(100, (s.sinceLast / m.ms) * 100)
          return (
            <li key={m.title} className={ok ? 'ok' : ''}>
              <div className="row"><b>{m.title}</b><small>{ok ? 'Conquistado' : `${Math.floor(pct)}%`}</small></div>
              <p>{m.text}</p>
              {!ok && <div className="progress"><i style={{ width: `${pct}%` }} /></div>}
            </li>
          )
        })}
      </ul>
      <small className="muted">Prazos aproximados, para fins educativos.</small>
    </div>
  )
}