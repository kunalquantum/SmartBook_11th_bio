import { useEffect, useRef } from 'react'

/**
 * useInterval — declarative setInterval hook
 * @param {Function} callback  - function to call on each tick
 * @param {number|null} delay  - ms between ticks; pass null to pause
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
