import { useState } from 'react'
import { useStore } from '../store'
import { ColorIdentity } from './ColorPip'
import { BootstrapModal } from './BootstrapModal'
import styles from './LikedList.module.css'

export function LikedList() {
  const likedCommanders = useStore(s => s.likedCommanders)
  const unlikeCommander = useStore(s => s.unlikeCommander)
  const [buildingCommander, setBuildingCommander] = useState(null)

  if (likedCommanders.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>💔</span>
        <h2>No liked commanders yet</h2>
        <p>Swipe right on commanders you like to add them here</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Liked Commanders</h2>
        <span className={styles.count}>{likedCommanders.length}</span>
      </div>
      
      <div className={styles.list}>
        {likedCommanders.map(commander => (
          <div key={commander.id} className={styles.card}>
            <img 
              src={commander.image || commander.imageLarge} 
              alt={commander.name}
              className={styles.image}
            />
            
            <div className={styles.info}>
              <h3 className={styles.name}>{commander.name}</h3>
              <p className={styles.type}>{commander.typeLine}</p>
              <ColorIdentity colors={commander.colorIdentity} size="small" />
              
              <div className={styles.meta}>
                {commander.priceUsd && (
                  <span className={styles.price}>
                    ${parseFloat(commander.priceUsd).toFixed(2)}
                  </span>
                )}
                <a 
                  href={commander.scryfallUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.scryfallLink}
                >
                  Scryfall ↗
                </a>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button
                className={styles.buildBtn}
                onClick={() => setBuildingCommander(commander)}
                title="Build deck"
              >
                Build
              </button>
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

      {buildingCommander && (
        <BootstrapModal
          commander={buildingCommander}
          onClose={() => setBuildingCommander(null)}
        />
      )}
    </div>
  )
}
