import _ from 'lodash'
import { useEffect } from 'react'
import { useLatest } from 'react-use'

function useKeybordEvent(fn: (event: KeyboardEvent) => void) {
  const handle = useLatest(fn)

  useEffect(() => {
    const handleListen = (e: KeyboardEvent) => {
      if (_.isFunction(handle.current)) {
        handle.current(e)
      }
    }
    window.addEventListener('keydown', handleListen)
    return () => {
      window.removeEventListener('keydown', handleListen)
    }
  }, [handle])
}

export default useKeybordEvent
