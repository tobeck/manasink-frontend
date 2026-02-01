import { useSwipeGesture } from '../hooks/useSwipeGesture'
import styles from './SwipeCard.module.css'

// Haptic feedback
function triggerHaptic(style = 'light') {
  if (navigator.vibrate) {
    navigator.vibrate(style === 'medium' ? 15 : 8)
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
    threshold: 80,
  })

  if (!commander) {
    return <LoadingCard />
  }

  const animStyle = isAnimating
    ? {
        transform: `translateX(${animationDirection === 'right' ? '120%' : '-120%'}) rotate(${animationDirection === 'right' ? 20 : -20}deg)`,
        opacity: 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }
    : style

  const price = commander.priceUsd 
    ? `$${parseFloat(commander.priceUsd).toFixed(2)}`
    : null

  return (
    <div className={styles.wrapper}>
      {/* Preload next card */}
      {nextCommander && (
        <link rel="preload" as="image" href={nextCommander.imageLarge} />
      )}
      
      <div className={styles.card} style={animStyle} {...handlers}>
        <img
          className={styles.image}
          src={commander.imageLarge}
          alt={commander.name}
          draggable={false}
        />
        
        {/* Swipe indicators */}
        <div 
          className={`${styles.indicator} ${styles.like}`}
          style={{ opacity: Math.max(0, swipeProgress * 1.5) }}
        >
          LIKE
        </div>
        <div 
          className={`${styles.indicator} ${styles.pass}`}
          style={{ opacity: Math.max(0, -swipeProgress * 1.5) }}
        >
          NOPE
        </div>
      </div>
      
      {/* Info below card */}
      <div className={styles.info}>
        <a 
          href={commander.scryfallUri}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Scryfall ↗
        </a>
        {price && <span className={styles.price}>{price}</span>}
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
        </div>
      </div>
    </div>
  )
}

export function ErrorCard({ message, onRetry }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.loadingContent}>
          <span className={styles.errorIcon}>😕</span>
          <p className={styles.errorText}>{message || 'Something went wrong'}</p>
          <button className={styles.retryBtn} onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
