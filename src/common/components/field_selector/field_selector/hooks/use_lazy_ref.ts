import { MutableRefObject, useRef } from 'react'

function useLazyRef<T>(fn: () => T) {
  const isMounted = useRef(false)
  const value = useRef<T>()

  if (!isMounted.current) {
    isMounted.current = true
    value.current = fn()
  }

  return value as MutableRefObject<T>
}

export default useLazyRef
