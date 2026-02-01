import { useStore } from '../store'
import { ColorIdentity } from '../components/ColorPip'
import styles from './DecksView.module.css'

export function DecksView() {
  const decks = useStore(s => s.decks)
  const setActiveDeck = useStore(s => s.setActiveDeck)
  const deleteDeck = useStore(s => s.deleteDeck)

  if (decks.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📚</div>
        <h2>No decks yet</h2>
        <p>Build a deck from your liked commanders</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {decks.map(deck => (
          <div key={deck.id} className={styles.card}>
            <button 
              className={styles.cardContent}
              onClick={() => setActiveDeck(deck.id)}
            >
              <img 
                src={deck.commander?.image || deck.commander?.imageLarge} 
                alt={deck.commander?.name}
                className={styles.image}
              />
              <div className={styles.info}>
                <h3 className={styles.name}>{deck.name}</h3>
                <div className={styles.meta}>
                  <ColorIdentity colors={deck.commander?.colorIdentity} size="small" />
                  <span className={styles.cardCount}>
                    {deck.cards?.length || 0}/99
                  </span>
                </div>
              </div>
              <ChevronRight />
            </button>
            
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Delete this deck?')) {
                  deleteDeck(deck.id)
                }
              }}
              aria-label="Delete deck"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChevronRight() {
  return (
    <svg className={styles.chevron} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
