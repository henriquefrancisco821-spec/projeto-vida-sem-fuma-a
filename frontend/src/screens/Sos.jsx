import { useEffect, useState } from 'react'
import { useApp } from '../state.jsx'
import { pad } from '../utils.js'
import ReasonCard from '../components/ReasonCard.jsx'
import Modal from '../components/Modal.jsx'

// A fissura costuma passar em menos de 5 minutos: o cronômetro acompanha esse tempo (RF08)
const DURACAO = 5 * 60

// Mesmo ritmo da animação .breath (10s): 4s inspirando, 2s segurando, 4s soltando
function fase(segundos) {
  const t = segundos % 10
  if (t < 4) return 'Inspire'
  if (t < 6) return 'Segure'
  return 'Solte'
}

export default function Sos({ go }) {
  const { addLog, addCrise } = useApp()
  const [segundos, setSegundos] = useState(0)
  const [estrategia, setEstrategia] = useState('respiracao') // respiracao | agua | jogo | cvv | outra
  const [resultado, setResultado] = useState(null) // venceu | fumou (abre a pergunta da intensidade)

  useEffect(() => {
    const t = setInterval(() => setSegundos((s) => Math.min(s + 1, DURACAO)), 1000)
    return () => clearInterval(t)
  }, [])

  const restante = DURACAO - segundos
  const acabou = restante === 0

  // Futuro: POST /crises + POST /registros (CONTEXTO_IA.md, seção 6.4)
  const salvar = (intensidade) => {
    addCrise({ intensidade, estrategia, resultado })
    // POST /registros: a vontade vencida leva a intensidade junto (nivel_vontade)
    addLog({ type: resultado === 'fumou' ? 'cigarro' : 'vontade', trigger: '', nivel: resultado === 'venceu' ? intensidade : undefined })
    go('home')
  }

  return (
    <div className="screen padded sos-screen">
      <div className="alert-banner">
        <b>Está com muita vontade de fumar?</b>
        <small>A vontade passa em poucos minutos. Você não está sozinho.</small>
      </div>

      <div className="breath-wrap">
        <div className="breath" role="timer" aria-label={`Respiração guiada, faltam ${Math.floor(restante / 60)} minutos e ${restante % 60} segundos`}>
          <b>{acabou ? 'Passou!' : fase(segundos)}</b>
          <span>{pad(Math.floor(restante / 60))}:{pad(restante % 60)}</span>
        </div>
      </div>
      <p className="breath-hint">
        {acabou
          ? 'Você atravessou o pico da vontade. Como está agora?'
          : 'Inspire em 4 segundos, segure por 2 e solte em 4, acompanhando o círculo.'}
      </p>

      <div className="card todo">
        <b>Enquanto a vontade passa</b>
        <ol>
          <li>Beba um copo de água devagar.</li>
          <li>Mastigue algo ou escove os dentes.</li>
          <li>Caminhe por alguns minutos.</li>
          <li>Converse com alguém de apoio.</li>
        </ol>
      </div>

      <ReasonCard />

      <a className="btn-cvv" href="tel:188" onClick={() => setEstrategia('cvv')}>
        Ligar para o CVV – 188 (gratuito, 24 horas)
      </a>

      <div className="sos-actions">
        <button className="btn-primary" onClick={() => setResultado('venceu')}>Resisti à vontade</button>
        <button className="btn-outline" onClick={() => setResultado('fumou')}>Acabei fumando</button>
      </div>
      <button className="btn-outline" onClick={() => go('comunidade')}>Pedir ajuda na comunidade</button>

      {resultado && (
        <Modal title="Quão forte foi a vontade?" onClose={() => setResultado(null)}>
          {resultado === 'fumou' && (
            <p className="muted">Tudo bem. Uma recaída não apaga o seu progresso. Registrar ajuda a entender os seus gatilhos.</p>
          )}
          <div className="intensity">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => salvar(n)} aria-label={`Intensidade ${n} de 5`}>{n}</button>
            ))}
          </div>
          <div className="intensity-legend"><span>Fraca</span><span>Muito forte</span></div>
        </Modal>
      )}
    </div>
  )
}
