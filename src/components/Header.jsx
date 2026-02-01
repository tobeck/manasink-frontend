import { useStore } from '../store'
import { useAuth } from '../context/AuthContext'
import { UserMenu } from './UserMenu'
import styles from './Header.module.css'

export function Header() {
  const view = useStore(s => s.view)
  const setView = useStore(s => s.setView)
  const { isAuthenticated } = useAuth()

  // Show back button in deck builder
  if (view === 'deckbuilder') {
    return (
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => setView('decks')}>
          <ChevronLeft />
          <span>Decks</span>
        </button>
      </header>
    )
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>
        manasink
        {isAuthenticated && <span className={styles.dot} />}
      </h1>
      <UserMenu />
    </header>
  )
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
