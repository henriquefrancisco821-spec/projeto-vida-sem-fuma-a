import { useApp } from '../state.jsx'

// "O meu porquê" aparece na tela inicial e na tela de emergência (RF08)
export default function ReasonCard() {
  const { me } = useApp()
  return (
    <div className="card reason">
      {me.reasonPhoto ? <img src={me.reasonPhoto} alt="" /> : <span className="reason-ph">♡</span>}
      <div>
        <b>O meu porquê</b>
        <p>{me.reason}</p>
      </div>
    </div>
  )
}