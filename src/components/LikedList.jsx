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
        <div className={styles.emptyIcon}>💜</div>
        <h2>No liked commanders</h2>
        <p>Swipe right on commanders you want to build with</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {likedCommanders.map(commander => (
          <div key={commander.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img 
                src={commander.image || commander.imageLarge} 
                alt={commander.name}
                className={styles.image}
              />
              <button
                className={styles.removeBtn}
                onClick={() => unlikeCommander(commander.id)}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
            
            <div className={styles.info}>
              <h3 className={styles.name}>{commander.name}</h3>
              <div className={styles.meta}>
                <ColorIdentity colors={commander.colorIdentity} size="small" />
                {commander.priceUsd && (
                  <span className={styles.price}>
                    ${parseFloat(commander.priceUsd).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            
            <button
              className={styles.buildBtn}
              onClick={() => setBuildingCommander(commander)}
            >
              Build Deck
            </button>
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
