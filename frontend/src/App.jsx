import { useEffect, useState } from 'react'
import { useApp } from './state.jsx'
import BottomNav from './components/BottomNav.jsx'
import Login from './screens/Login.jsx'
import Cadastro from './screens/Cadastro.jsx'
import Home from './screens/Home.jsx'
import Comunidade from './screens/Comunidade.jsx'
import Sos from './screens/Sos.jsx'
import Progresso from './screens/Progresso.jsx'
import Perfil from './screens/Perfil.jsx'

const SCREENS = { home: Home, comunidade: Comunidade, sos: Sos, progresso: Progresso, perfil: Perfil }

export default function App() {
  const { me, carregando } = useApp()
  const [screen, setScreen] = useState('home')
  const [pending, setPending] = useState(null) // e-mail e senha vindos da tela de login, antes do cadastro

  const go = (s) => setScreen(s)

  // Ao sair da conta, a próxima entrada começa sempre pela tela inicial
  useEffect(() => {
    if (!me) setScreen('home')
  }, [me])

  if (carregando) {
    return <div className="app"><p className="empty" role="status">Carregando...</p></div>
  }

  if (!me) {
    return (
      <div className="app">
        {pending
          ? <Cadastro creds={pending} onBack={() => setPending(null)} onDone={() => setPending(null)} />
          : <Login onRegister={setPending} />}
      </div>
    )
  }

  const Current = SCREENS[screen]
  return (
    <div className="app">
      <Current go={go} />
      <BottomNav screen={screen} go={go} />
    </div>
  )
}