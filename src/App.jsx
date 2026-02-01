import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useStore } from './store'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { SwipeView } from './pages/SwipeView'
import { LikedList } from './components/LikedList'
import { DecksView } from './pages/DecksView'
import { DeckBuilder } from './pages/DeckBuilder'
import { AdminPage } from './pages/AdminPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toast } from './components/Toast'
import styles from './App.module.css'

function AppContent() {
  const view = useStore(s => s.view)
  const isLoading = useStore(s => s.isLoading)
  const initialize = useStore(s => s.initialize)
  const reset = useStore(s => s.reset)
  const { user, loading: authLoading } = useAuth()
  
  useEffect(() => {
    if (!authLoading) {
      reset()
      initialize()
    }
  }, [user, authLoading, initialize, reset])

  if (authLoading || isLoading) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </div>
    )
  }

  const showBottomNav = view !== 'deckbuilder' && view !== 'admin'

  return (
    <div className={styles.app}>
      <Header />
      <main className={`${styles.main} ${!showBottomNav ? styles.noBottomNav : ''}`}>
        {view === 'swipe' && <SwipeView />}
        {view === 'liked' && <LikedList />}
        {view === 'decks' && <DecksView />}
        {view === 'deckbuilder' && <DeckBuilder />}
        {view === 'admin' && <AdminPage />}
      </main>
      {showBottomNav && <BottomNav />}
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}
