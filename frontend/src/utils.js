export const MIN = 60 * 1000
export const HOUR = 60 * MIN
export const DAY = 24 * HOUR

export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmtCount = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))

export const pad = (n) => String(n).padStart(2, '0')

// "Hoje" no horário do aparelho (São Paulo), e não em UTC. Com toISOString() o dia virava às 21h.
export function dateKey(ts = Date.now()) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const todayKey = () => dateKey()

// Gera um id único. Substitui crypto.randomUUID(), que só existe em HTTPS ou localhost
// e quebrava o app quando aberto no celular pelo IP da rede (http://192.168...).
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10)

// Validações iguais às da API (CONTEXTO_IA.md, seção 6.2)
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export const SENHA_MIN = 8
export const SENHA_MAX = 72

export function splitDuration(ms) {
  const total = Math.floor(Math.max(0, ms) / MIN)
  return { d: Math.floor(total / 1440), h: Math.floor((total % 1440) / 60), m: total % 60 }
}

export function ago(ts) {
  const diff = Date.now() - ts
  if (diff < MIN) return 'agora'
  if (diff < HOUR) return `há ${Math.floor(diff / MIN)} min`
  if (diff < DAY) return `há ${Math.floor(diff / HOUR)}h`
  return `há ${Math.floor(diff / DAY)} d`
}

// Tempo sem fumar, economia, cigarros evitados, plano do dia e marcos de saúde
// agora são calculados pela API (GET /progresso, /plano/hoje e /conquistas).

// Reduz a foto antes de guardar no aparelho
export function fileToDataUrl(file, max = 480) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * scale)
        c.height = Math.round(img.height * scale)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export const GOALS = [
  'Beber um copo de água ao acordar',
  'Tomar o café da manhã sem fumar',
  'Fazer 3 respirações profundas',
  'Caminhar por 10 minutos',
  'Reler o seu porquê',
  'Evitar o seu maior gatilho',
  'Mastigar algo quando bater vontade',
  'Conversar com alguém de apoio',
  'Registrar como você se sente',
  'Dormir cedo',
]

export const TRIGGERS = [
  'Estresse', 'Café', 'Depois das refeições', 'Bebida alcoólica', 'Ansiedade',
  'Trabalho', 'Tédio', 'Festas', 'Amigos que fumam', 'Pausa do trabalho',
]