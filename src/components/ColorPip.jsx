import styles from './ColorPip.module.css'

const COLOR_NAMES = {
  W: 'White',
  U: 'Blue', 
  B: 'Black',
  R: 'Red',
  G: 'Green',
  C: 'Colorless',
}

export function ColorPip({ color, size = 'md' }) {
  return (
    <span 
      className={`${styles.pip} ${styles[color]} ${styles[size]}`}
      title={COLOR_NAMES[color]}
    >
      {color}
    </span>
  )
}

export function ColorIdentity({ colors, size = 'md' }) {
  const displayColors = colors?.length > 0 ? colors : ['C']
  
  return (
    <div className={styles.identity}>
      {displayColors.map(color => (
        <ColorPip key={color} color={color} size={size} />
      ))}
    </div>
  )
}
