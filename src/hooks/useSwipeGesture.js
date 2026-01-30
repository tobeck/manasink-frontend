import { useState, useCallback, useRef } from 'react'

export function useSwipeGesture({ onSwipeLeft, onSwipeRight, threshold = 100 }) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  const handlePointerDown = useCallback((e) => {
    // Don't capture if clicking links/buttons
    if (e.target.closest('a, button')) return
    
    setIsDragging(true)
    startX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return
    setOffset(e.clientX - startX.current)
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    
    if (offset > threshold) {
      onSwipeRight?.()
    } else if (offset < -threshold) {
      onSwipeLeft?.()
    }
    
    setOffset(0)
  }, [isDragging, offset, threshold, onSwipeLeft, onSwipeRight])

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  }

  const style = {
    transform: `translateX(${offset}px) rotate(${offset * 0.05}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  }

  // -1 to 1, where -1 is full left, 1 is full right
  const swipeProgress = Math.max(-1, Math.min(1, offset / threshold))

  return { handlers, style, isDragging, swipeProgress }
}
