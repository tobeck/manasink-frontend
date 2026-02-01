import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store'
import { useAuth } from '../context/AuthContext'
import { useCommanderQueue } from '../hooks/useCommanderQueue'
import { SwipeCard, ErrorCard } from '../components/SwipeCard'
import { FilterModal } from '../components/FilterModal'
import { SignInPrompt } from '../components/SignInPrompt'
import styles from './SwipeView.module.css'

const HINTS_DISMISS_AFTER = 3
const SIGNIN_PROMPT_AFTER = 3
const SIGNIN_PROMPT_KEY = 'manasink:signInPromptDismissed'

export function SwipeView() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState(null)
  const [swipeCount, setSwipeCount] = useState(() => {
    const saved = localStorage.getItem('manasink:swipeCount')
    return saved ? parseInt(saved, 10) : 0
  })
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  
  const { user } = useAuth()
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

  const showHints = swipeCount < HINTS_DISMISS_AFTER

  const handleSwipe = useCallback((direction) => {
    if (isAnimating || !currentCommander) return
    
    setAnimationDirection(direction)
    setIsAnimating(true)
    
    const newCount = swipeCount + 1
    setSwipeCount(newCount)
    localStorage.setItem('manasink:swipeCount', newCount.toString())
    
    if (direction === 'right') {
      likeCommander(currentCommander)
    } else {
      passCommander(currentCommander)
    }
    
    // Show sign-in prompt after N swipes (only if not signed in and not dismissed)
    if (
      newCount === SIGNIN_PROMPT_AFTER && 
      !user && 
      !localStorage.getItem(SIGNIN_PROMPT_KEY)
    ) {
      setTimeout(() => setShowSignInPrompt(true), 400)
    }
    
    setTimeout(() => {
      nextCommander()
      setIsAnimating(false)
      setAnimationDirection(null)
    }, 300)
  }, [isAnimating, currentCommander, likeCommander, passCommander, nextCommander, swipeCount, user])

  const handleLike = useCallback(() => handleSwipe('right'), [handleSwipe])
  const handlePass = useCallback(() => handleSwipe('left'), [handleSwipe])

  const handleDismissSignIn = () => {
    setShowSignInPrompt(false)
    localStorage.setItem(SIGNIN_PROMPT_KEY, 'true')
  }

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
      {/* Swipe hints - fade out after 3 swipes */}
      {showHints && (
        <>
          <div className={`${styles.hint} ${styles.hintLeft}`}>
            <span className={styles.hintArrow}>‹</span>
            <span className={styles.hintLabel}>pass</span>
          </div>
          <div className={`${styles.hint} ${styles.hintRight}`}>
            <span className={styles.hintLabel}>like</span>
            <span className={styles.hintArrow}>›</span>
          </div>
        </>
      )}
      
      <div className={styles.cardArea}>
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
      
      <FilterModal onApply={resetQueue} />
      
      {showSignInPrompt && (
        <SignInPrompt onClose={handleDismissSignIn} />
      )}
    </div>
  )
}
