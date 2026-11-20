import { useState } from 'react'
import { useApp } from '../state.jsx'
import { TRIGGERS, fileToDataUrl } from '../utils.js'
import { Icon } from '../components/Icons.jsx'

// 4 etapas (RF01 a RF04): perfil, consumo, gatilhos e motivo pessoal
export default function Cadastro({ creds, onBack, onDone }) {
  const { register } = useApp()
  const [step, setStep] = useState(1)
  const [apelido, setApelido] = useState('')
  const [perfil, setPerfil] = useState('')
  const [cigsPerDay, setCigs] = useState(10)
  const [packPrice, setPrice] = useState(10)
  const [quitDays, setQuitDays] = useState(0)
  const [triggers, setTriggers] = useState([])
  const [reason, setReason] = useState('')
  const [reasonPhoto, setPhoto] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const canNext =
    (step === 1 && perfil && apelido.trim().length >= 2) ||
    (step === 2 && cigsPerDay >= 1 && cigsPerDay <= 100 && packPrice >= 1 && packPrice <= 100) ||
    step === 3 ||
    (step === 4 && reason.trim().length > 2)

  // POST /auth/cadastro (via state.jsx). A API calcula a data de início e a data-alvo.
  const finish = async () => {
    setEnviando(true)
    setErro('')
    const r = await register(creds, {
      apelido: apelido.trim(),
      perfil,
      cigsPerDay: Number(cigsPerDay),
      packPrice: Number(packPrice),
      quitDays: Number(quitDays),
      triggers,
      reason: reason.trim(),
      reasonPhoto,
    })
    setEnviando(false)
    if (r.ok) onDone?.()
    else setErro(r.msg)
  }

  const next = () => (step < 4 ? setStep(step + 1) : finish())
  const prev = () => (step > 1 ? setStep(step - 1) : onBack())
  const toggleTrigger = (t) => setTriggers((l) => (l.includes(t) ? l.filter((x) => x !== t) : [...l, t]))

  return (
    <div className="screen cadastro">
      <button className="back" onClick={prev} aria-label="Voltar"><Icon.back width={22} /></button>

      <div className="steps">
        <div className="hero-card">
          <h1>
            {step === 1 && 'Qual seu estado atual?'}
            {step === 2 && 'Como é o seu consumo?'}
            {step === 3 && 'O que dá vontade de fumar?'}
            {step === 4 && 'Qual o seu porquê?'}
          </h1>
          <p>
            {step === 1 && 'isso define seu acompanhamento'}
            {step === 2 && 'usamos para calcular sua economia'}
            {step === 3 && 'escolha quantos quiser'}
            {step === 4 && 'ele vai aparecer nos momentos difíceis'}
          </p>
        </div>
        <small>Passo {step} de 4</small>
        <div className="bars">{[1, 2, 3, 4].map((n) => <i key={n} className={n <= step ? 'on' : ''} />)}</div>
      </div>

      <div className="step-body">
        {step === 1 && (
          <>
            <label className="lbl">Como quer ser chamado na comunidade?
              <input className="input" value={apelido} minLength={2} maxLength={40} onChange={(e) => setApelido(e.target.value)} placeholder="Ex.: Marcos, Bia, M." autoComplete="nickname" />
              <small>Pode ser um apelido. Ninguém precisa saber o seu nome real.</small>
            </label>
            <button className={`choice ${perfil === 'fuma' ? 'sel' : ''}`} onClick={() => setPerfil('fuma')}>
              <b>Ainda fumo e quero parar</b>
              <span>Vamos reduzir aos poucos</span>
            </button>
            <button className={`choice ${perfil === 'parou' ? 'sel' : ''}`} onClick={() => setPerfil('parou')}>
              <b>Já parei e quero manter</b>
              <span>Apoio para manter</span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="lbl">{perfil === 'parou' ? 'Quantos cigarros você fumava por dia?' : 'Quantos cigarros você fuma por dia?'}
              <input className="input" type="number" min="1" max="100" value={cigsPerDay} onChange={(e) => setCigs(e.target.value)} />
            </label>
            <label className="lbl">Preço de um maço (20 cigarros), em R$
              <input className="input" type="number" min="1" max="100" step="0.5" value={packPrice} onChange={(e) => setPrice(e.target.value)} />
            </label>
            {perfil === 'parou' && (
              <label className="lbl">Há quantos dias você parou?
                <input className="input" type="number" min="0" max="3650" value={quitDays} onChange={(e) => setQuitDays(e.target.value)} />
              </label>
            )}
          </>
        )}

        {step === 3 && (
          <div className="chips">
            {TRIGGERS.map((t) => (
              <button key={t} className={`chip ${triggers.includes(t) ? 'on' : ''}`} onClick={() => toggleTrigger(t)}>{t}</button>
            ))}
          </div>
        )}

        {step === 4 && (
          <>
            <label className="lbl">Por que você quer parar de fumar?
              <textarea className="input" rows="4" maxLength="140" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: Pela minha família e minha saúde" />
            </label>
            <label className="photo-pick">
              <Icon.camera width={20} /> {reasonPhoto ? 'Trocar foto' : 'Adicionar uma foto (opcional)'}
              <input type="file" accept="image/*" hidden onChange={async (e) => e.target.files[0] && setPhoto(await fileToDataUrl(e.target.files[0]))} />
            </label>
            {reasonPhoto && <img className="reason-preview" src={reasonPhoto} alt="Foto do seu porquê" />}
          </>
        )}
      </div>

      {erro && <p className="login-msg cadastro-erro" role="alert">{erro}</p>}
      <button className="btn-outline" disabled={!canNext || enviando} onClick={next}>
        {step < 4 ? 'CONTINUAR' : enviando ? 'CRIANDO SUA CONTA...' : 'COMEÇAR MINHA JORNADA'}
      </button>
    </div>
  )
}