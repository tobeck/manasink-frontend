import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store'
import { useShallow } from 'zustand/react/shallow'
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
  const { isOpen, setOpen, colorFilters, toggleColorFilter } = useStore(
    useShallow(s => ({
      isOpen: s.filterModalOpen,
      setOpen: s.setFilterModalOpen,
      colorFilters: s.preferences.colorFilters,
      toggleColorFilter: s.toggleColorFilter,
    }))
  )

  const modalRef = useRef(null)
  const firstFocusRef = useRef(null)

  const handleClose = useCallback(() => {
    setOpen(false)
    onApply?.()
  }, [setOpen, onApply])

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return

    // Focus the first button when modal opens
    firstFocusRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

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
      <div
        className={styles.backdrop}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-desc"
      >
        <div className={styles.handle} aria-hidden="true" />

        <h2 id="filter-modal-title" className={styles.title}>Color Identity</h2>
        <p id="filter-modal-desc" className={styles.desc}>Show commanders that include these colors</p>

        <div className={styles.colors} role="group" aria-label="Color filters">
          {COLORS.map((color, index) => {
            const isSelected = colorFilters.includes(color.id)
            return (
              <button
                key={color.id}
                ref={index === 0 ? firstFocusRef : null}
                className={`${styles.colorBtn} ${isSelected ? styles.active : ''}`}
                onClick={() => toggleColorFilter(color.id)}
                style={{ '--color': color.color }}
                aria-pressed={isSelected}
                aria-label={`${color.name}${isSelected ? ' (selected)' : ''}`}
              >
                <span className={styles.pip} aria-hidden="true">{color.symbol}</span>
                <span className={styles.colorName}>{color.name}</span>
              </button>
            )
          })}
        </div>

        <div className={styles.quickActions}>
          <button
            className={styles.quickBtn}
            onClick={handleSelectAll}
            disabled={allSelected}
            aria-label="Select all colors"
          >
            Select all
          </button>
          <button
            className={styles.quickBtn}
            onClick={handleSelectNone}
            disabled={noneSelected}
            aria-label="Clear all color selections"
          >
            Clear
          </button>
        </div>

        <button
          className={styles.doneBtn}
          onClick={handleClose}
          aria-label="Apply filters and close"
        >
          Done
        </button>
      </div>
    </>
  )
}
