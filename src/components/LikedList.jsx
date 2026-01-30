import { useStore } from '../store'
import { ColorIdentity } from './ColorPip'
import styles from './LikedList.module.css'

export function LikedList() {
  const likedCommanders = useStore(s => s.likedCommanders)
  const unlikeCommander = useStore(s => s.unlikeCommander)
  const setView = useStore(s => s.setView)

  if (likedCommanders.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>💔</span>
        <p>No liked commanders yet</p>
        <p className={styles.emptyHint}>Swipe right on commanders you like!</p>
        <button className={styles.discoverBtn} onClick={() => setView('swipe')}>
          Start Discovering
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Liked Commanders 
        <span className={styles.count}>({likedCommanders.length})</span>
      </h2>
      
      <div className={styles.list}>
        {likedCommanders.map(commander => (
          <div key={commander.id} className={styles.card}>
            <img
              src={commander.image}
              alt={commander.name}
              className={styles.thumb}
              loading="lazy"
            />
            <div className={styles.info}>
              <h3 className={styles.name}>{commander.name}</h3>
              <ColorIdentity colors={commander.colorIdentity} size="sm" />
            </div>
            <div className={styles.actions}>
              <a
                href={commander.scryfallUri}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkBtn}
                title="View on Scryfall"
              >
                ↗
              </a>
              <button
                className={styles.removeBtn}
                onClick={() => unlikeCommander(commander.id)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Future: Build deck button will go here */}
    </div>
  )
}
