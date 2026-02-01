import { useSwipeGesture } from '../hooks/useSwipeGesture'
import styles from './SwipeCard.module.css'

// Haptic feedback helper
function triggerHaptic(style = 'light') {
  if (navigator.vibrate) {
    const patterns = { light: 10, medium: 20, heavy: 30 }
    navigator.vibrate(patterns[style] || 10)
  }
}

export function SwipeCard({ 
  commander, 
  onLike, 
  onPass, 
  isAnimating, 
  animationDirection,
  nextCommander,
}) {
  const handleSwipeRight = () => {
    triggerHaptic('medium')
    onLike()
  }
  
  const handleSwipeLeft = () => {
    triggerHaptic('light')
    onPass()
  }

  const { handlers, style, swipeProgress } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 100,
  })

  if (!commander) {
    return <LoadingCard />
  }

  const animStyle = isAnimating
    ? {
        transform: `translateX(${animationDirection === 'right' ? '150%' : '-150%'}) rotate(${animationDirection === 'right' ? 30 : -30}deg)`,
        opacity: 0,
        transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
      }
    : style

  // Format price
  const price = commander.priceUsd 
    ? `$${parseFloat(commander.priceUsd).toFixed(2)}`
    : null

  return (
    <div className={styles.cardContainer}>
      <div className={styles.card} style={animStyle} {...handlers}>
        <img
          className={styles.image}
          src={commander.imageLarge}
          alt={commander.name}
          draggable={false}
        />
        
        {/* Preload next card image */}
        {nextCommander && (
          <link rel="preload" as="image" href={nextCommander.imageLarge} />
        )}
        
        {/* Swipe indicators - LIKE on left (shows when swiping right), PASS on right */}
        <div 
          className={`${styles.indicator} ${styles.like}`}
          style={{ opacity: Math.max(0, swipeProgress) }}
        >
          LIKE
        </div>
        <div 
          className={`${styles.indicator} ${styles.pass}`}
          style={{ opacity: Math.max(0, -swipeProgress) }}
        >
          PASS
        </div>
      </div>
      
      {/* Card info below the card */}
      <div className={styles.cardInfo}>
        <a 
          className={styles.scryfallLink}
          href={commander.scryfallUri}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Scryfall ↗
        </a>
        {price && (
          <span className={styles.price}>{price}</span>
        )}
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.card}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
          <p>Finding commanders...</p>
        </div>
      </div>
    </div>
  )
}

export function ErrorCard({ message, onRetry }) {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.card}>
        <div className={styles.loadingContent}>
          <span className={styles.errorIcon}>😕</span>
          <p>{message || 'Something went wrong'}</p>
          <button className={styles.retryBtn} onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
