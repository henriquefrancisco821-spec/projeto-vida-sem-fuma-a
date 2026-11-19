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

// Marcos de recuperação da saúde (valores aproximados, RF07)
export const MILESTONES = [
  { ms: 20 * MIN, title: '20 minutos', text: 'Batimentos e pressão começam a voltar ao normal' },
  { ms: 12 * HOUR, title: '12 horas', text: 'O monóxido de carbono no sangue volta ao normal' },
  { ms: 2 * DAY, title: '2 dias', text: 'Olfato e paladar começam a melhorar' },
  { ms: 14 * DAY, title: '2 semanas', text: 'A circulação melhora e caminhar fica mais fácil' },
  { ms: 90 * DAY, title: '3 meses', text: 'A função dos pulmões aumenta' },
  { ms: 365 * DAY, title: '1 ano', text: 'O risco de doença do coração cai pela metade' },
]

// RF06: tempo sem fumar, dinheiro economizado, cigarros a menos
export function computeStats(me, now) {
  const logs = me.logs || []
  const smoked = logs.filter((l) => l.type === 'cigarro')
  const smokedCount = smoked.reduce((s, l) => s + (l.qty || 1), 0)
  const last = smoked.length ? Math.max(...smoked.map((l) => l.ts)) : me.startDate
  const sinceLast = Math.max(0, now - last)
  const elapsedDays = Math.max(0, (now - me.startDate) / DAY)
  const avoided = Math.max(0, Math.round(me.cigsPerDay * elapsedDays - smokedCount))
  const saved = avoided * (me.packPrice / 20)
  const doneMilestones = MILESTONES.filter((m) => sinceLast >= m.ms).length
  return {
    sinceLast,
    avoided,
    saved,
    doneMilestones,
    journeyDay: Math.floor(elapsedDays) + 1,
    elapsedDays,
  }
}

// RF05: plano de redução gradual do perfil "fuma": 1 cigarro a menos por dia.
// Dia 1 = consumo - 1; dia 7 = consumo - 7; chega a 0 no dia igual ao consumo (CONTEXTO_IA.md, 4.4)
export function dailyLimit(me, journeyDay) {
  return Math.max(0, me.cigsPerDay - journeyDay)
}

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