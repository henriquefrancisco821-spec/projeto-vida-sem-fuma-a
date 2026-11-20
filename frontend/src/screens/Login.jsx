import { useState } from 'react'
import { useApp } from '../state.jsx'
import { Icon, LungsMark } from '../components/Icons.jsx'
import { SENHA_MAX, SENHA_MIN, isEmail } from '../utils.js'

export default function Login({ onRegister }) {
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)

  // POST /auth/login (via state.jsx)
  const enter = async () => {
    if (!isEmail(email.trim()) || !pass) return setMsg('Informe o seu e-mail e a sua senha.')
    setEnviando(true)
    setMsg('')
    const r = await login(email.trim().toLowerCase(), pass)
    setEnviando(false)
    if (!r.ok) setMsg(r.msg)
  }

  // Mesmas regras da API: e-mail válido e senha de 8 a 72 caracteres
  const register = () => {
    if (!isEmail(email.trim())) return setMsg('Para cadastrar, informe um e-mail válido.')
    if (pass.length < SENHA_MIN || pass.length > SENHA_MAX) return setMsg(`A senha precisa ter de ${SENHA_MIN} a ${SENHA_MAX} caracteres.`)
    onRegister({ email: email.trim().toLowerCase(), senha: pass })
  }

  return (
    <div className="screen login">
      <div className="brand-card">
        <span className="brand-icon"><LungsMark size={34} /></span>
        <div>
          <div className="brand-name">Vida Sem Fumaça</div>
          <div className="brand-tag">Sua jornada para parar de fumar</div>
        </div>
      </div>

      <div className="login-form">
        <label className="field">
          <Icon.user width={20} />
          <input placeholder="E-mail" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="none" autoComplete="email" />
        </label>
        <label className="field">
          <Icon.lock width={20} />
          <input placeholder="Senha" type={show ? 'text' : 'password'} value={pass} maxLength={SENHA_MAX} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
          <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
            {show ? <Icon.eyeOff width={20} /> : <Icon.eye width={20} />}
          </button>
        </label>
        <button className="link-light" onClick={() => setMsg('A recuperação de senha será liberada junto com o servidor (API).')}>
          esqueceu a senha?
        </button>
        {msg && <p className="login-msg" role="alert">{msg}</p>}
      </div>

      <div className="login-actions">
        <button className="btn-soft" onClick={enter} disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <button className="btn-soft" onClick={register} disabled={enviando}>Cadastrar</button>
      </div>
    </div>
  )
}