// Única porta de saída do front para a API (CONTEXTO_IA.md, seções 6 e 8).
// As telas nunca chamam fetch: elas usam as funções do state.jsx, que usam este arquivo.

const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const CHAVE_TOKEN = 'vsf:token'

// ---------- Token (o "crachá" que a API devolve no login) ----------
export function lerToken() {
  try { return localStorage.getItem(CHAVE_TOKEN) } catch { return null }
}
export function salvarToken(token) {
  try { localStorage.setItem(CHAVE_TOKEN, token) } catch { /* sem armazenamento */ }
}
export function apagarToken() {
  try { localStorage.removeItem(CHAVE_TOKEN) } catch { /* ignora */ }
}

// Traduz os erros da API para mensagens que o usuário entende
function mensagemDeErro(status, corpo) {
  if (typeof corpo?.detail === 'string') return corpo.detail
  if (status === 422 && Array.isArray(corpo?.detail)) {
    const campo = corpo.detail[0]?.loc?.at(-1)
    return campo ? `Confira o campo "${campo}".` : 'Alguns dados estão inválidos.'
  }
  return 'Algo deu errado. Tente de novo em instantes.'
}

// Faz uma chamada à API. Lança um Error com a mensagem pronta quando der errado.
export async function api(caminho, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = lerToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let resposta
  try {
    resposta = await fetch(BASE + caminho, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Não foi possível falar com o servidor. Confira a internet e tente de novo.')
  }

  if (resposta.status === 204) return null
  const corpo = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // 401 numa rota protegida = crachá vencido ou inválido: volta para o login
    if (resposta.status === 401 && token) {
      apagarToken()
      window.dispatchEvent(new Event('vsf:sessao-expirada'))
    }
    const erro = new Error(mensagemDeErro(resposta.status, corpo))
    erro.status = resposta.status
    throw erro
  }
  return corpo
}

// ---------- De-para: nomes da API -> nomes que as telas já usam (seção 8) ----------
export function usuarioDaApi(u) {
  return {
    id: u.id_usuario,
    email: u.email,
    name: u.apelido,
    perfil: u.perfil,
    startDate: new Date(u.data_inicio).getTime(),
    cigsPerDay: u.cigarros_por_dia,
    packPrice: u.preco_maco,
    cigsPerPack: u.cigarros_por_maco,
    targetDate: u.data_alvo,
    triggers: u.gatilhos,
    reason: u.motivo,
    reasonPhoto: u.foto_motivo,
    photo: u.foto_perfil,
    reminders: u.lembretes,
  }
}

// Campos do perfil que a API guarda (PATCH /usuarios/me), com o nome de cada lado
export const CAMPOS_DA_API = {
  name: 'apelido',
  reason: 'motivo',
  reasonPhoto: 'foto_motivo',
  photo: 'foto_perfil',
  reminders: 'lembretes',
  perfil: 'perfil',
}
