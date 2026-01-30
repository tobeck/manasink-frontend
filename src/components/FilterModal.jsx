import { useState, useEffect } from 'react'
import { useStore } from '../store'
import styles from './FilterModal.module.css'

const COLORS = [
  { id: 'W', name: 'White' },
  { id: 'U', name: 'Blue' },
  { id: 'B', name: 'Black' },
  { id: 'R', name: 'Red' },
  { id: 'G', name: 'Green' },
  { id: 'C', name: 'Colorless' },
]

export function FilterModal({ onApply }) {
  const isOpen = useStore(s => s.filterModalOpen)
  const setOpen = useStore(s => s.setFilterModalOpen)
  const colorFilters = useStore(s => s.preferences.colorFilters)
  const setColorFilters = useStore(s => s.setColorFilters)
  
  const [local, setLocal] = useState(colorFilters)

  useEffect(() => {
    if (isOpen) setLocal(colorFilters)
  }, [isOpen, colorFilters])

  const toggle = (id) => {
    setLocal(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    )
  }

  const reset = () => setLocal(['W', 'U', 'B', 'R', 'G', 'C'])

  const apply = () => {
    const filters = local.length > 0 ? local : ['W', 'U', 'B', 'R', 'G', 'C']
    setColorFilters(filters)
    setOpen(false)
    onApply?.()
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.backdrop} onClick={() => setOpen(false)} />
      <div className={styles.modal}>
        <div className={styles.handle} />
        <h2 className={styles.title}>Filter Commanders</h2>
        
        <p className={styles.label}>Color Identity</p>
        <div className={styles.colors}>
          {COLORS.map(c => (
            <button
              key={c.id}
              className={`${styles.colorBtn} ${styles[c.id]} ${local.includes(c.id) ? styles.active : ''}`}
              onClick={() => toggle(c.id)}
              title={c.name}
            >
              {c.id}
            </button>
          ))}
        </div>
        
        <div className={styles.btnRow}>
          <button className={styles.resetBtn} onClick={reset}>Reset</button>
          <button className={styles.applyBtn} onClick={apply}>Apply</button>
        </div>
      </div>
    </>
  )
}
