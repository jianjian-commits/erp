import type { DragEvent } from 'react'

const prevEvent = (e: DragEvent<HTMLLIElement>) => {
  e.stopPropagation()
  e.preventDefault()
}

export default prevEvent
