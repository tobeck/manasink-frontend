import { useStore } from '../store'
import styles from './FilterModal.module.css'

const COLORS = [
  { id: 'W', name: 'White', symbol: '○', color: '#F8F6D8' },
  { id: 'U', name: 'Blue', symbol: '●', color: '#0E68AB' },
  { id: 'B', name: 'Black', symbol: '●', color: '#211D1E' },
  { id: 'R', name: 'Red', symbol: '●', color: '#D3202A' },
  { id: 'G', name: 'Green', symbol: '●', color: '#00733E' },
  { id: 'C', name: 'Colorless', symbol: '◇', color: '#CBC2BF' },
]

export function FilterModal({ onApply }) {
  const isOpen = useStore(s => s.filterModalOpen)
  const setOpen = useStore(s => s.setFilterModalOpen)
  const colorFilters = useStore(s => s.preferences.colorFilters)
  const toggleColorFilter = useStore(s => s.toggleColorFilter)

  if (!isOpen) return null

  const handleClose = () => {
    setOpen(false)
    onApply?.()
  }

  const allSelected = colorFilters.length === 6
  const noneSelected = colorFilters.length === 0

  const handleSelectAll = () => {
    COLORS.forEach(c => {
      if (!colorFilters.includes(c.id)) {
        toggleColorFilter(c.id)
      }
    })
  }

  const handleSelectNone = () => {
    COLORS.forEach(c => {
      if (colorFilters.includes(c.id)) {
        toggleColorFilter(c.id)
      }
    })
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose} />
      <div className={styles.modal}>
        <div className={styles.handle} />
        
        <h2 className={styles.title}>Color Identity</h2>
        <p className={styles.desc}>Show commanders that include these colors</p>
        
        <div className={styles.colors}>
          {COLORS.map(color => (
            <button
              key={color.id}
              className={`${styles.colorBtn} ${colorFilters.includes(color.id) ? styles.active : ''}`}
              onClick={() => toggleColorFilter(color.id)}
              style={{ '--color': color.color }}
            >
              <span className={styles.pip}>{color.symbol}</span>
              <span className={styles.colorName}>{color.name}</span>
            </button>
          ))}
        </div>
        
        <div className={styles.quickActions}>
          <button 
            className={styles.quickBtn} 
            onClick={handleSelectAll}
            disabled={allSelected}
          >
            Select all
          </button>
          <button 
            className={styles.quickBtn} 
            onClick={handleSelectNone}
            disabled={noneSelected}
          >
            Clear
          </button>
        </div>
        
        <button className={styles.doneBtn} onClick={handleClose}>
          Done
        </button>
      </div>
    </>
  )
}
