import { createContext, useContext, useEffect, useState } from 'react'
import { CAMPOS_DA_API, api, apagarToken, lerToken, salvarToken, usuarioDaApi } from './api.js'
import { newId } from './utils.js'

// Camada de dados do app. Já usa a API em:
//   Sprint 1: cadastro, login e perfil (/auth/cadastro, /auth/login, /usuarios/me)
//   Sprint 2: diário, progresso, plano do dia e marcos (/registros, /progresso, /plano/hoje, /conquistas)
// Ainda fica no aparelho (localStorage), até as rotas das próximas sprints:
//   metas do dia (checklist), crises e comunidade.
// A senha NUNCA é guardada no aparelho: ela vai uma única vez para a API.
const KEY = 'vsf:v3'

const seedPosts = [
  { id: 'p1', author: 'Ana', type: 'conquista', ago: 'há 2h', apoios: 24, comentarios: 5,
    text: 'Passei pela primeira semana limpa, estou extremamente orgulhosa e contente com o aplicativo' },
  { id: 'p2', author: 'João', type: 'ajuda', ago: 'há 2h', apoios: 2000, comentarios: 867,
    text: 'Preciso de ajuda, agora a pouco tive o primeiro momento de crise. Passei pelo momento estressante e estou com muita vontade de usar, o que posso fazer?' },
]

const LOCAL_PADRAO = { goals: { date: '', done: [] }, following: [], supported: [], crises: [] }

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    if (raw && raw.locais) return raw
  } catch { /* ignora */ }
  return { locais: {}, posts: seedPosts }
}

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [db, setDb] = useState(load) // dados que ainda ficam no aparelho
  const [usuario, setUsuario] = useState(null) // dados que vêm da API
  const [carregando, setCarregando] = useState(() => !!lerToken())
  // Dados da Sprint 2, vindos da API. "recebidoEm" deixa o contador andar sozinho entre uma consulta e outra.
  const [painel, setPainel] = useState({ progresso: null, plano: null, registros: [], conquistas: [], recebidoEm: 0 })

  const carregarProgresso = async () => {
    try {
      const [progresso, plano, registros, conquistas] = await Promise.all([
        api('/progresso'), api('/plano/hoje'), api('/registros?dias=7'), api('/conquistas'),
      ])
      setPainel({ progresso, plano, registros, conquistas, recebidoEm: Date.now() })
    } catch { /* sem internet: mantém os últimos dados */ }
  }

  // Sempre que alguém entra, busca o progresso dessa pessoa
  useEffect(() => {
    if (usuario) carregarProgresso()
    else setPainel({ progresso: null, plano: null, registros: [], conquistas: [], recebidoEm: 0 })
  }, [usuario?.id])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* sem espaço */ }
  }, [db])

  // Ao abrir o app: se já existe um crachá guardado, pergunta à API quem é o usuário
  useEffect(() => {
    if (!lerToken()) return
    api('/usuarios/me')
      .then((u) => setUsuario(usuarioDaApi(u)))
      .catch(() => apagarToken())
      .finally(() => setCarregando(false))
  }, [])

  // Se a API disser que o crachá venceu (401), volta para a tela de login
  useEffect(() => {
    const sair = () => setUsuario(null)
    window.addEventListener('vsf:sessao-expirada', sair)
    return () => window.removeEventListener('vsf:sessao-expirada', sair)
  }, [])

  const me = usuario ? { ...LOCAL_PADRAO, ...(db.locais[usuario.email] || {}), ...usuario } : null

  // Atualiza só a parte que ainda fica no aparelho
  const patchLocal = (patch) =>
    setDb((d) => ({ ...d, locais: { ...d.locais, [usuario.email]: { ...(d.locais[usuario.email] || {}), ...patch } } }))

  const entrar = (resposta) => {
    salvarToken(resposta.access_token)
    setUsuario(usuarioDaApi(resposta.usuario))
  }

  const value = {
    db,
    me,
    carregando,
    ...painel,
    carregarProgresso,

    // Milissegundos sem fumar agora: o valor da API + o tempo que passou desde a consulta
    tempoSemFumar(agora) {
      const p = painel.progresso
      return p ? p.segundos_sem_fumar * 1000 + Math.max(0, agora - painel.recebidoEm) : 0
    },

    // POST /auth/login
    async login(email, senha) {
      try {
        entrar(await api('/auth/login', { method: 'POST', body: { email, senha } }))
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    },

    // POST /auth/cadastro: as 4 etapas vão de uma vez e a API já devolve o crachá
    async register(creds, profile) {
      try {
        entrar(await api('/auth/cadastro', {
          method: 'POST',
          body: {
            email: creds.email,
            senha: creds.senha,
            apelido: profile.apelido,
            perfil: profile.perfil,
            cigarros_por_dia: profile.cigsPerDay,
            preco_maco: profile.packPrice,
            cigarros_por_maco: 20,
            dias_sem_fumar: profile.perfil === 'parou' ? profile.quitDays : null,
            gatilhos: profile.triggers,
            motivo: profile.reason,
            foto_motivo: profile.reasonPhoto || null,
          },
        }))
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    },

    logout() {
      apagarToken()
      setUsuario(null)
    },

    // Separa o que vai para a API (PATCH /usuarios/me) do que fica no aparelho
    async patchMe(patch) {
      const paraApi = {}
      const paraLocal = {}
      for (const [campo, valor] of Object.entries(patch)) {
        if (campo in CAMPOS_DA_API) paraApi[CAMPOS_DA_API[campo]] = valor
        else paraLocal[campo] = valor
      }
      if (Object.keys(paraLocal).length) patchLocal(paraLocal)
      if (!Object.keys(paraApi).length) return { ok: true }
      try {
        setUsuario(usuarioDaApi(await api('/usuarios/me', { method: 'PATCH', body: paraApi })))
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    },

    // POST /registros (cigarro fumado ou vontade vencida) e atualiza a Home
    async addLog({ type, trigger, nivel }) {
      try {
        await api('/registros', { method: 'POST', body: { tipo: type, gatilho: trigger || null, nivel_vontade: nivel ?? null } })
        await carregarProgresso()
        return { ok: true }
      } catch (e) {
        return { ok: false, msg: e.message }
      }
    },

    toggleGoal(index, today) {
      const g = me.goals?.date === today ? me.goals : { date: today, done: [] }
      const done = g.done.includes(index) ? g.done.filter((i) => i !== index) : [...g.done, index]
      patchLocal({ goals: { date: today, done } })
    },

    // Futuro: POST /crises (Sprint 3)
    addCrise({ intensidade, estrategia, resultado }) {
      patchLocal({ crises: [...(me.crises || []), { id: newId(), ts: Date.now(), intensidade, estrategia, resultado }] })
    },

    // Futuro: POST /publicacoes, /apoio e /seguir (Sprint 4)
    addPost(text, type, photo) {
      const post = { id: newId(), author: me.name, ts: Date.now(), type, text, photo, apoios: 0, comentarios: 0, mine: true }
      setDb((d) => ({ ...d, posts: [post, ...d.posts] }))
    },

    toggleSupport(postId) {
      const has = (me.supported || []).includes(postId)
      patchLocal({ supported: has ? me.supported.filter((i) => i !== postId) : [...(me.supported || []), postId] })
    },

    toggleFollow(name) {
      const has = (me.following || []).includes(name)
      patchLocal({ following: has ? me.following.filter((n) => n !== name) : [...(me.following || []), name] })
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
