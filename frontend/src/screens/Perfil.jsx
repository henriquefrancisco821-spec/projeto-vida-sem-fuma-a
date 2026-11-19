import { useState } from 'react'
import { useApp } from '../state.jsx'
import { fileToDataUrl } from '../utils.js'
import Avatar from '../components/Avatar.jsx'

export default function Perfil() {
  const { me, patchMe, logout } = useApp()
  const [reason, setReason] = useState(me.reason)
  const [saved, setSaved] = useState(false)

  const upload = (key, max) => async (e) => {
    if (e.target.files[0]) patchMe({ [key]: await fileToDataUrl(e.target.files[0], max) })
  }

  return (
    <div className="screen padded">
      <div className="profile-head">
        <Avatar name={me.name} photo={me.photo} size={84} />
        <h1>{me.name}</h1>
        <small>{me.perfil === 'parou' ? 'Já parei e quero manter' : 'Ainda fumo e quero parar'}</small>
        <label className="pill-btn small">Trocar foto<input type="file" accept="image/*" hidden onChange={upload('photo', 240)} /></label>
      </div>

      <label className="lbl">O meu porquê
        <textarea className="input" rows="3" maxLength="140" value={reason} onChange={(e) => { setReason(e.target.value); setSaved(false) }} />
      </label>
      <label className="photo-pick">Trocar a foto do meu porquê<input type="file" accept="image/*" hidden onChange={upload('reasonPhoto', 480)} /></label>
      <button className="btn-primary" onClick={() => { patchMe({ reason: reason.trim() || me.reason }); setSaved(true) }}>
        {saved ? 'Salvo!' : 'Salvar alterações'}
      </button>

      <div className="card">
        <b>Meus gatilhos</b>
        <div className="chips">{(me.triggers?.length ? me.triggers : ['Nenhum informado']).map((t) => <span className="chip on" key={t}>{t}</span>)}</div>
      </div>

      <label className="switch-row">
        Lembretes e mensagens de incentivo
        <input type="checkbox" checked={!!me.reminders} onChange={async (e) => {
          if (e.target.checked && 'Notification' in window) await Notification.requestPermission()
          patchMe({ reminders: e.target.checked })
        }} />
      </label>

      <button className="btn-outline danger" onClick={logout}>Sair</button>
    </div>
  )
}