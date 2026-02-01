import { useState, useRef, useCallback, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useStore } from '../store'
import { useShallow } from 'zustand/react/shallow'
import { ColorIdentity } from './ColorPip'
import { BootstrapModal } from './BootstrapModal'
import { trackEvent } from '../lib/analytics'
import { ALLOWED_DOMAINS } from '../constants'
import styles from './LikedList.module.css'

/**
 * Hook to detect number of columns based on screen width
 */
function useColumns() {
  const [columns, setColumns] = useState(() => {
    if (typeof window === 'undefined') return 2
    if (window.innerWidth >= 1200) return 4
    if (window.innerWidth >= 768) return 3
    return 2
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) setColumns(4)
      else if (window.innerWidth >= 768) setColumns(3)
      else setColumns(2)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return columns
}

/**
 * Validates a URL is safe to use as an external link.
 * Must be HTTPS and from an allowed domain.
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    const hostname = parsed.hostname.toLowerCase()
    return ALLOWED_DOMAINS.some(
      domain => hostname === domain || hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

export function LikedList() {
  const { likedCommanders, unlikeCommander } = useStore(
    useShallow(s => ({
      likedCommanders: s.likedCommanders,
      unlikeCommander: s.unlikeCommander,
    }))
  )
  const [buildingCommander, setBuildingCommander] = useState(null)
  const [expandedBuy, setExpandedBuy] = useState(null)
  const parentRef = useRef(null)
  const columns = useColumns()

  // Group commanders into rows based on column count
  const rows = []
  for (let i = 0; i < likedCommanders.length; i += columns) {
    rows.push(likedCommanders.slice(i, i + columns))
  }

  // Estimate row height based on screen size (cards are taller on larger screens)
  const estimatedRowHeight = columns === 2 ? 340 : columns === 3 ? 380 : 400

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => estimatedRowHeight, [estimatedRowHeight]),
    overscan: 2,
  })

  if (likedCommanders.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>💜</div>
        <h2>No liked commanders</h2>
        <p>Swipe right on commanders you want to build with</p>
      </div>
    )
  }

  const toggleBuy = (commanderId, commanderName) => {
    const isExpanding = expandedBuy !== commanderId
    setExpandedBuy(isExpanding ? commanderId : null)

    if (isExpanding) {
      trackEvent('buy_expand', { commander_id: commanderId, commander_name: commanderName })
    }
  }

  return (
    <div ref={parentRef} className={styles.container}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowCommanders = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              className={styles.grid}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                // Higher rows get higher z-index to prevent overlap issues
                zIndex: rows.length - virtualRow.index,
              }}
            >
              {rowCommanders.map(commander => (
                <div key={commander.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={commander.image || commander.imageLarge}
                      alt={commander.name}
                      className={styles.image}
                      loading="lazy"
                    />
                    <button
                      className={styles.removeBtn}
                      onClick={() => unlikeCommander(commander.id)}
                      aria-label={`Remove ${commander.name}`}
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
                      onClick={() => toggleBuy(commander.id, commander.name)}
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
          )
        })}
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

  const handleClick = (storeName) => {
    trackEvent('buy_click', { 
      commander_id: commander.id, 
      commander_name: commander.name,
      store: storeName 
    })
  }

  return (
    <div className={styles.buyOptions}>
      {options.map(option => {
        if (!isValidUrl(option.url)) return null
        return (
          <a
            key={option.name}
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.buyOption}
            onClick={() => handleClick(option.name)}
          >
            <span className={styles.buyName}>{option.name}</span>
            {option.price && <span className={styles.buyPrice}>{option.price}</span>}
          </a>
        )
      })}
    </div>
  )
}
