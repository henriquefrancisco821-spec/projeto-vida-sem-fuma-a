import { useState } from 'react'
import { useApp } from '../state.jsx'
import { ago, fileToDataUrl, fmtCount } from '../utils.js'
import { Icon } from '../components/Icons.jsx'
import Avatar from '../components/Avatar.jsx'

const FILTERS = [
  ['todos', 'Todos'],
  ['conquista', 'Conquistas'],
  ['ajuda', 'Preciso de ajuda'],
]

export default function Comunidade() {
  const { me, db, addPost, toggleSupport, toggleFollow } = useApp()
  const [filter, setFilter] = useState('todos')
  const [text, setText] = useState('')
  const [type, setType] = useState('conquista')
  const [photo, setPhoto] = useState('')

  const posts = db.posts.filter((p) => filter === 'todos' || p.type === filter)

  const publish = () => {
    if (!text.trim()) return
    addPost(text.trim(), type, photo)
    setText('')
    setPhoto('')
  }

  return (
    <div className="screen padded">
      <h1 className="title-teal">Bem vindo a nossa Comunidade!</h1>

      <div className="composer">
        <Avatar name={me.name} photo={me.photo} size={34} />
        <input placeholder="Compartilhe o que você está pensando hoje..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && publish()} />
        <button className="pill-btn" onClick={publish}>Publicar</button>
      </div>
      {(text || photo) && (
        <div className="composer-opts">
          <button className={`tab ${type === 'conquista' ? 'on' : ''}`} onClick={() => setType('conquista')}>Conquista</button>
          <button className={`tab ${type === 'ajuda' ? 'on' : ''}`} onClick={() => setType('ajuda')}>Preciso de ajuda</button>
          <label className="tab"><Icon.camera width={14} /> Foto
            <input type="file" accept="image/*" hidden onChange={async (e) => e.target.files[0] && setPhoto(await fileToDataUrl(e.target.files[0], 800))} />
          </label>
        </div>
      )}

      <div className="tabs">
        {FILTERS.map(([id, label]) => (
          <button key={id} className={`tab ${filter === id ? 'on' : ''}`} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      {posts.map((p) => {
        const supported = (me.supported || []).includes(p.id)
        const following = (me.following || []).includes(p.author)
        return (
          <article className="post" key={p.id}>
            <header>
              <Avatar name={p.author} photo={p.mine ? me.photo : ''} size={34} />
              <div><b>{p.author}</b><small>{p.ts ? ago(p.ts) : p.ago}</small></div>
              {!p.mine && (
                <button className={`pill-btn small ${following ? 'on' : ''}`} onClick={() => toggleFollow(p.author)}>
                  {following ? 'Seguindo' : '+ Seguir'}
                </button>
              )}
            </header>
            <p>{p.text}</p>
            {p.photo && <img src={p.photo} alt="" />}
            <footer>
              <button className={supported ? 'on' : ''} onClick={() => toggleSupport(p.id)}>
                <Icon.bookmark width={14} /> Apoiar - {fmtCount(p.apoios + (supported ? 1 : 0))}
              </button>
              <span>Comentar - {fmtCount(p.comentarios)}</span>
            </footer>
          </article>
        )
      })}
      {posts.length === 0 && <p className="empty">Ainda não há publicações aqui. Que tal ser o primeiro a compartilhar?</p>}
    </div>
  )
}