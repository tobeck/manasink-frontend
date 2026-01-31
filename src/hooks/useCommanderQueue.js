import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchRandomCommander } from '../api'

const QUEUE_SIZE = 3

export function useCommanderQueue(colorFilters) {
  const [queue, setQueue] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const isFetching = useRef(false)
  const filtersRef = useRef(colorFilters)

  // Keep filters ref in sync
  useEffect(() => {
    filtersRef.current = colorFilters
  }, [colorFilters])

  const fetchOne = useCallback(async () => {
    try {
      return await fetchRandomCommander(filtersRef.current)
    } catch (e) {
      console.error('Failed to fetch commander:', e)
      return null
    }
  }, [])

  const fillQueue = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true
    setIsLoading(true)
    setError(null)

    try {
      const needed = QUEUE_SIZE - queue.length
      const promises = Array(Math.max(needed, 1)).fill(null).map(fetchOne)
      const results = await Promise.all(promises)
      const valid = results.filter(Boolean)
      
      if (valid.length === 0) {
        throw new Error('Could not fetch commanders')
      }
      
      setQueue(prev => [...prev, ...valid].slice(0, QUEUE_SIZE))
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
      isFetching.current = false
    }
  }, [queue.length, fetchOne])

  // Initial load
  useEffect(() => {
    if (queue.length === 0 && !isFetching.current) {
      fillQueue()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Refill when queue gets low
  useEffect(() => {
    if (queue.length > 0 && queue.length < QUEUE_SIZE && !isFetching.current) {
      fillQueue()
    }
  }, [queue.length, fillQueue])

  const nextCommander = useCallback(() => {
    setQueue(prev => prev.slice(1))
  }, [])

  const resetQueue = useCallback(() => {
    setQueue([])
    isFetching.current = false
    setTimeout(fillQueue, 0)
  }, [fillQueue])

  return {
    currentCommander: queue[0] || null,
    nextUpCommander: queue[1] || null, // For preloading
    nextCommander,
    resetQueue,
    isLoading: isLoading && queue.length === 0,
    error,
    retry: resetQueue,
  }
}
