import { useEffect, useState } from 'react'
import { useApp } from '../state.jsx'
import { GOALS, TRIGGERS, brl, splitDuration, todayKey } from '../utils.js'
import { Icon } from '../components/Icons.jsx'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import ReasonCard from '../components/ReasonCard.jsx'

export default function Home({ go }) {
  const { me, progresso, plano, tempoSemFumar, addLog, toggleGoal } = useApp()
  const [now, setNow] = useState(Date.now())
  const [modal, setModal] = useState(null) // 'registro' | 'metas'
  const [trigger, setTrigger] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  // Os números vêm da API (GET /progresso e /plano/hoje). O contador anda sozinho entre as consultas.
  const { d, h, m } = splitDuration(tempoSemFumar(now))
  const today = todayKey()
  const done = me.goals?.date === today ? me.goals.done : []
  const limit = plano?.limite_hoje
  const smokedToday = progresso?.fumados_hoje ?? 0
  const passouDoLimite = me.perfil === 'fuma' && limit != null && smokedToday > limit

  // POST /registros
  const save = async (type) => {
    setErro('')
    const r = await addLog({ type, trigger })
    if (!r.ok) return setErro(r.msg)
    setTrigger('')
    setModal(null)
  }

  return (
    <div className="screen padded">
      <header className="home-head">
        <div>
          <h1 className="hello">Olá, {me.name}!</h1>
          <small>{progresso ? `Dia ${progresso.dia_jornada} da sua jornada` : 'Carregando sua jornada...'}</small>
        </div>
        <Avatar name={me.name} photo={me.photo} size={44} />
      </header>

      <section className="counter">
        <small>Você está sem fumar há</small>
        <strong>{d} {d === 1 ? 'Dia' : 'Dias'}, {h}h e {String(m).padStart(2, '0')}min</strong>
        <span>{passouDoLimite ? 'Cada tentativa conta. Respire e siga o plano.' : 'Continue assim! Está indo muito bem'}</span>
      </section>

      <section className="stats">
        <div><b>{progresso ? brl(progresso.economia).replace(/\s/g, ' ') : '—'}</b><small>Economizados</small></div>
        <div><b>{progresso ? progresso.cigarros_evitados : '—'}</b><small>Cigarros a menos</small></div>
        <div><b>{progresso ? `+${progresso.marcos_atingidos}` : '—'}</b><small>Marcos de saúde</small></div>
      </section>

      <button className="card goals" onClick={() => setModal('metas')}>
        <div className="row"><small>Metas de hoje</small><small>{done.length} de {GOALS.length}</small></div>
        <div className="progress"><i style={{ width: `${(done.length / GOALS.length) * 100}%` }} /></div>
        <small className="muted">
          {!plano
            ? 'Carregando o plano de hoje...'
            : plano.perfil === 'fuma'
              ? limit === 0
                ? `Hoje é o seu dia de parar! Zero cigarros (${smokedToday} fumados)`
                : `Plano de redução gradual: hoje no máximo ${limit} ${limit === 1 ? 'cigarro' : 'cigarros'} (${smokedToday} fumados)`
              : plano.mensagem /* perfil "parou": dica do dia contra um dos gatilhos */}
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
          {erro && <p className="login-msg cadastro-erro" role="alert">{erro}</p>}
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