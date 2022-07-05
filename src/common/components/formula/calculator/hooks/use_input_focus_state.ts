import { useMemo, useRef } from 'react'

export default function useInputFocusState() {
  const isFocus = useRef(false)
  return useMemo(() => {
    return {
      isFocus,
      onFocus: () => {
        isFocus.current = true
      },
      onBlur: () => {
        isFocus.current = false
      },
    }
  }, [])
}
