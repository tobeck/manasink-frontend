import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store'
import { useCommanderQueue } from '../hooks/useCommanderQueue'
import { SwipeCard, ErrorCard } from '../components/SwipeCard'
import { ActionButtons } from '../components/ActionButtons'
import { FilterModal } from '../components/FilterModal'
import styles from './SwipeView.module.css'

// Haptic feedback helper
function triggerHaptic(style = 'light') {
  if (navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    }
    navigator.vibrate(patterns[style] || 10)
  }
}

export function SwipeView() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState(null)
  
  const colorFilters = useStore(s => s.preferences.colorFilters)
  const likeCommander = useStore(s => s.likeCommander)
  const passCommander = useStore(s => s.passCommander)
  
  const {
    currentCommander,
    nextUpCommander,
    nextCommander,
    resetQueue,
    isLoading,
    error,
    retry,
  } = useCommanderQueue(colorFilters)

  const handleSwipe = useCallback((direction) => {
    if (isAnimating || !currentCommander) return
    
    setAnimationDirection(direction)
    setIsAnimating(true)
    
    if (direction === 'right') {
      likeCommander(currentCommander)
    } else {
      passCommander(currentCommander)
    }
    
    setTimeout(() => {
      nextCommander()
      setIsAnimating(false)
      setAnimationDirection(null)
    }, 350)
  }, [isAnimating, currentCommander, likeCommander, passCommander, nextCommander])

  const handleLike = useCallback(() => {
    triggerHaptic('medium')
    handleSwipe('right')
  }, [handleSwipe])
  
  const handlePass = useCallback(() => {
    triggerHaptic('light')
    handleSwipe('left')
  }, [handleSwipe])

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'l') handleLike()
      if (e.key === 'ArrowLeft' || e.key === 'h') handlePass()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleLike, handlePass])

  // Preload next image
  useEffect(() => {
    if (nextUpCommander?.imageLarge) {
      const img = new Image()
      img.src = nextUpCommander.imageLarge
    }
  }, [nextUpCommander])

  return (
    <div className={styles.container}>
      <div className={styles.cardArea}>
        <div className={styles.cardWrapper}>
          {error ? (
            <ErrorCard message={error} onRetry={retry} />
          ) : (
            <SwipeCard
              commander={currentCommander}
              onLike={handleLike}
              onPass={handlePass}
              isAnimating={isAnimating}
              animationDirection={animationDirection}
              nextCommander={nextUpCommander}
            />
          )}
        </div>
      </div>
      
      <ActionButtons
        onLike={handleLike}
        onPass={handlePass}
        disabled={isLoading || isAnimating || !!error}
      />
      
      <FilterModal onApply={resetQueue} />
    </div>
  )
}
