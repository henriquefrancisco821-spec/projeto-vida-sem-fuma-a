import { useEffect, useState } from 'react'
import { useApp } from '../state.jsx'
import { DAY, brl, dateKey } from '../utils.js'

// Dados da API: GET /progresso, GET /registros?dias=7 e GET /conquistas (RF03, RF06, RF07)
export default function Progresso() {
  const { progresso, registros, conquistas, tempoSemFumar, carregarProgresso } = useApp()
  const [now] = useState(Date.now())

  // Ao abrir a tela, atualiza os números
  useEffect(() => { carregarProgresso() }, [])

  // Cigarros fumados em cada um dos últimos 7 dias (data local, não UTC)
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now - (6 - i) * DAY)
    const key = dateKey(day.getTime())
    const count = registros
      .filter((r) => r.tipo === 'cigarro' && dateKey(new Date(r.data_hora).getTime()) === key)
      .reduce((total, r) => total + r.quantidade, 0)
    return { label: day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), count }
  })
  const max = Math.max(1, ...days.map((d) => d.count))
  const segundosSemFumar = tempoSemFumar(now) / 1000

  return (
    <div className="screen padded">
      <h1 className="title-teal">Seu progresso</h1>

      <section className="stats">
        <div><b>{progresso ? brl(progresso.economia) : '—'}</b><small>Economizados</small></div>
        <div><b>{progresso ? progresso.cigarros_evitados : '—'}</b><small>Cigarros a menos</small></div>
        <div><b>{progresso ? progresso.vontades_vencidas : '—'}</b><small>Vontades vencidas</small></div>
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
      {conquistas.length === 0 && <p className="empty">Os marcos de saúde ainda não foram carregados.</p>}
      <ul className="milestones">
        {conquistas.map((c) => {
          const pct = Math.min(100, (segundosSemFumar / c.segundos_necessarios) * 100)
          const ok = c.atingida || pct >= 100
          return (
            <li key={c.id_conquista} className={ok ? 'ok' : ''}>
              <div className="row"><b>{c.titulo}</b><small>{ok ? 'Conquistado' : `${Math.floor(pct)}%`}</small></div>
              <p>{c.descricao}</p>
              {!ok && <div className="progress"><i style={{ width: `${pct}%` }} /></div>}
            </li>
          )
        })}
      </ul>
      <small className="muted">Prazos aproximados, para fins educativos.</small>
    </div>
  )
}
