export default function Avatar({ name = '?', photo, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.42 }
  if (photo) return <img className="avatar" style={style} src={photo} alt={name} />
  return <span className="avatar avatar-ph" style={style} aria-label={name}>{name[0]?.toUpperCase()}</span>
}