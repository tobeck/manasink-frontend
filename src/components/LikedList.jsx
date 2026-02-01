import { useState } from 'react'
import { useStore } from '../store'
import { ColorIdentity } from './ColorPip'
import { BootstrapModal } from './BootstrapModal'
import styles from './LikedList.module.css'

export function LikedList() {
  const likedCommanders = useStore(s => s.likedCommanders)
  const unlikeCommander = useStore(s => s.unlikeCommander)
  const [buildingCommander, setBuildingCommander] = useState(null)
  const [expandedBuy, setExpandedBuy] = useState(null)

  if (likedCommanders.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>💜</div>
        <h2>No liked commanders</h2>
        <p>Swipe right on commanders you want to build with</p>
      </div>
    )
  }

  const toggleBuy = (commanderId) => {
    setExpandedBuy(expandedBuy === commanderId ? null : commanderId)
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
            
            <div className={styles.actions}>
              <button
                className={styles.buildBtn}
                onClick={() => setBuildingCommander(commander)}
              >
                Build
              </button>
              <button
                className={`${styles.buyBtn} ${expandedBuy === commander.id ? styles.active : ''}`}
                onClick={() => toggleBuy(commander.id)}
              >
                Buy ▾
              </button>
            </div>

            {expandedBuy === commander.id && (
              <BuyOptions commander={commander} />
            )}
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

function BuyOptions({ commander }) {
  const { purchaseUris, priceUsd, priceEur } = commander
  
  // Construct CardKingdom search URL
  const cardKingdomUrl = `https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=${encodeURIComponent(commander.name)}`
  
  const options = [
    {
      name: 'TCGPlayer',
      url: purchaseUris?.tcgplayer,
      price: priceUsd ? `$${parseFloat(priceUsd).toFixed(2)}` : null,
    },
    {
      name: 'CardKingdom',
      url: cardKingdomUrl,
      price: null,
    },
    {
      name: 'Cardmarket',
      url: purchaseUris?.cardmarket,
      price: priceEur ? `€${parseFloat(priceEur).toFixed(2)}` : null,
    },
  ]

  return (
    <div className={styles.buyOptions}>
      {options.map(option => (
        <a
          key={option.name}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.buyOption}
        >
          <span className={styles.buyName}>{option.name}</span>
          {option.price && <span className={styles.buyPrice}>{option.price}</span>}
        </a>
      ))}
    </div>
  )
}
