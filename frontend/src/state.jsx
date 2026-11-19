import { createContext, useContext, useEffect, useState } from 'react'
import { newId } from './utils.js'

// Camada de dados do protótipo: tudo fica no aparelho (localStorage).
// Quando a API FastAPI estiver pronta, troque as funções abaixo por chamadas fetch().
// v2: login passou a ser por e-mail (dados da v1 não são reaproveitados)
const KEY = 'vsf:v2'

const seedPosts = [
  { id: 'p1', author: 'Ana', type: 'conquista', ago: 'há 2h', apoios: 24, comentarios: 5,
    text: 'Passei pela primeira semana limpa, estou extremamente orgulhosa e contente com o aplicativo' },
  { id: 'p2', author: 'João', type: 'ajuda', ago: 'há 2h', apoios: 2000, comentarios: 867,
    text: 'Preciso de ajuda, agora a pouco tive o primeiro momento de crise. Passei pelo momento estressante e estou com muita vontade de usar, o que posso fazer?' },
]

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    if (raw && raw.users) return raw
  } catch { /* ignora */ }
  return { users: {}, session: null, posts: seedPosts }
}

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [db, setDb] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* sem espaço */ }
  }, [db])

  const me = db.session ? db.users[db.session] : null

  const patchMe = (patch) =>
    setDb((d) => ({ ...d, users: { ...d.users, [d.session]: { ...d.users[d.session], ...patch } } }))

  const api = {
    db,
    me,
    userExists: (email) => !!db.users[email.toLowerCase()],

    // Futuro: POST /auth/login. Mesma mensagem para e-mail inexistente e senha errada (igual à API).
    login(email, senha) {
      const id = email.toLowerCase()
      const u = db.users[id]
      if (!u || u.senha !== senha) return { ok: false, msg: 'E-mail ou senha incorretos.' }
      setDb((d) => ({ ...d, session: id }))
      return { ok: true }
    },

    // Futuro: POST /auth/cadastro (envia tudo de uma vez e recebe o token).
    // PROVISÓRIO: a senha só fica no aparelho enquanto o login não chama a API.
    // Quando login() e register() chamarem a API, apague a linha "senha" abaixo.
    register(creds, profile) {
      const id = creds.email.toLowerCase()
      const { apelido, ...resto } = profile
      const user = {
        email: id,
        name: apelido,
        senha: creds.senha,
        startDate: profile.startDate ?? Date.now(),
        logs: [],
        goals: { date: '', done: [] },
        following: [],
        supported: [],
        crises: [],
        ...resto,
      }
      setDb((d) => ({ ...d, users: { ...d.users, [id]: user }, session: id }))
    },

    logout: () => setDb((d) => ({ ...d, session: null })),
    patchMe,

    addLog(entry) {
      patchMe({ logs: [...(me.logs || []), { id: newId(), ts: Date.now(), ...entry }] })
    },

    // Futuro: POST /crises { intensidade, estrategia, resultado }
    addCrise({ intensidade, estrategia, resultado }) {
      patchMe({ crises: [...(me.crises || []), { id: newId(), ts: Date.now(), intensidade, estrategia, resultado }] })
    },

    toggleGoal(index, today) {
      const g = me.goals?.date === today ? me.goals : { date: today, done: [] }
      const done = g.done.includes(index) ? g.done.filter((i) => i !== index) : [...g.done, index]
      patchMe({ goals: { date: today, done } })
    },

    addPost(text, type, photo) {
      const post = { id: newId(), author: me.name, ts: Date.now(), type, text, photo, apoios: 0, comentarios: 0, mine: true }
      setDb((d) => ({ ...d, posts: [post, ...d.posts] }))
    },

    toggleSupport(postId) {
      const has = (me.supported || []).includes(postId)
      patchMe({ supported: has ? me.supported.filter((i) => i !== postId) : [...(me.supported || []), postId] })
    },

    toggleFollow(name) {
      const has = (me.following || []).includes(name)
      patchMe({ following: has ? me.following.filter((n) => n !== name) : [...(me.following || []), name] })
    },
  }

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}