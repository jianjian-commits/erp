import { createContext, useContext } from 'react'
import type { SmartAddFakeOrderStoreType } from './store'

export const StoreContext = createContext<SmartAddFakeOrderStoreType | null>(
  null,
)

export function useStoreContext() {
  const ctx = useContext(StoreContext)
  if (ctx === null) {
    throw new Error('[SmartAddFakeOrder] StoreContext is not initialized.')
  }
  return ctx
}
