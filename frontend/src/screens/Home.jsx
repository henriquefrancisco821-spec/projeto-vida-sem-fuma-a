import { useEffect, useState } from 'react'
import { useApp } from '../state.jsx'
import { GOALS, TRIGGERS, brl, computeStats, dailyLimit, dateKey, splitDuration, todayKey } from '../utils.js'
import { Icon } from '../components/Icons.jsx'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import ReasonCard from '../components/ReasonCard.jsx'

export default function Home({ go }) {
  const { me, addLog, toggleGoal } = useApp()
  const [now, setNow] = useState(Date.now())
  const [modal, setModal] = useState(null) // 'registro' | 'metas'
  const [trigger, setTrigger] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const s = computeStats(me, now)
  const { d, h, m } = splitDuration(s.sinceLast)
  const today = todayKey()
  const done = me.goals?.date === today ? me.goals.done : []
  const limit = dailyLimit(me, s.journeyDay)
  const smokedToday = (me.logs || []).filter((l) => l.type === 'cigarro' && dateKey(l.ts) === today).length

  const save = (type) => {
    addLog({ type, trigger })
    setTrigger('')
    setModal(null)
  }

  return (
    <div className="screen padded">
      <header className="home-head">
        <div>
          <h1 className="hello">Olá, {me.name}!</h1>
          <small>Dia {s.journeyDay} da sua jornada</small>
        </div>
        <Avatar name={me.name} photo={me.photo} size={44} />
      </header>

      <section className="counter">
        <small>Você está sem fumar há</small>
        <strong>{d} {d === 1 ? 'Dia' : 'Dias'}, {h}h e {String(m).padStart(2, '0')}min</strong>
        <span>{me.perfil === 'fuma' && smokedToday > limit ? 'Cada tentativa conta. Respire e siga o plano.' : 'Continue assim! Está indo muito bem'}</span>
      </section>

      <section className="stats">
        <div><b>{brl(s.saved).replace(/\s/g, ' ')}</b><small>Economizados</small></div>
        <div><b>{s.avoided}</b><small>Cigarros a menos</small></div>
        <div><b>+{s.doneMilestones}</b><small>Marcos de saúde</small></div>
      </section>

      <button className="card goals" onClick={() => setModal('metas')}>
        <div className="row"><small>Metas de hoje</small><small>{done.length} de {GOALS.length}</small></div>
        <div className="progress"><i style={{ width: `${(done.length / GOALS.length) * 100}%` }} /></div>
        <small className="muted">
          {me.perfil === 'fuma'
            ? limit === 0
              ? `Hoje é o seu dia de parar! Zero cigarros (${smokedToday} fumados)`
              : `Plano de redução gradual: hoje no máximo ${limit} ${limit === 1 ? 'cigarro' : 'cigarros'} (${smokedToday} fumados)`
            : 'Plano para manter a sua conquista'}
        </small>
      </button>

      <button className="btn-primary" onClick={() => setModal('registro')}>Registrar cigarro ou as vontades de hoje</button>

      <ReasonCard />

      <a className="help-card" href="https://www.openstreetmap.org/search?query=UBS%20S%C3%A3o%20Paulo" target="_blank" rel="noreferrer">
        <span className="help-plus"><Icon.plus width={22} /></span>
        <div>
          <b>Precisa de ajuda?</b>
          <small>Encontre a UBS ou CAPS AD mais próximo de você</small>
        </div>
      </a>

      {modal === 'registro' && (
        <Modal title="O que aconteceu?" onClose={() => setModal(null)}>
          <label className="lbl">Gatilho (opcional)
            <select className="input" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
              <option value="">Nenhum em especial</option>
              {[...new Set([...(me.triggers || []), ...TRIGGERS])].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div className="modal-actions">
            <button className="btn-outline" onClick={() => save('vontade')}>Tive vontade, mas resisti</button>
            <button className="btn-outline danger" onClick={() => save('cigarro')}>Fumei um cigarro</button>
          </div>
        </Modal>
      )}

      {modal === 'metas' && (
        <Modal title="Metas de hoje" onClose={() => setModal(null)}>
          <ul className="goal-list">
            {GOALS.map((g, i) => (
              <li key={g}>
                <button className={done.includes(i) ? 'on' : ''} onClick={() => toggleGoal(i, today)}>
                  <span className="box">{done.includes(i) && <Icon.check width={14} />}</span>{g}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  )
}