import { Icon } from './Icons.jsx'
import Avatar from './Avatar.jsx'
import { useApp } from '../state.jsx'

export default function BottomNav({ screen, go }) {
  const { me } = useApp()
  const Btn = ({ id, label, children }) => (
    <button className={`nav-btn ${screen === id ? 'active' : ''}`} onClick={() => go(id)} aria-label={label}>
      <span className="nav-ico">{children}</span>
      <span className="nav-lbl">{label}</span>
    </button>
  )
  return (
    <nav className="nav">
      <Btn id="home" label="Início"><Icon.home /></Btn>
      <Btn id="comunidade" label="Comunidade"><Icon.globe /></Btn>
      <button className={`nav-sos ${screen === 'sos' ? 'active' : ''}`} onClick={() => go('sos')} aria-label="Emergência">
        <span className="sos-circle">SOS</span>
        <span className="nav-lbl sos-lbl">Emergência</span>
      </button>
      <Btn id="progresso" label="Progresso"><Icon.chart /></Btn>
      <Btn id="perfil" label="Perfil"><Avatar name={me.name} photo={me.photo} size={36} /></Btn>
    </nav>
  )
}