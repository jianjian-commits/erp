import { createContext, useContext } from 'react'
import { StepProps } from '../types'

export interface DispatcherShape {
  add: (key: StepProps['stepKey'], value: StepProps) => void
}

export interface StateShape {
  activeKey?: StepProps['stepKey']
}

export const StepsStateContext = createContext<StateShape | null>(null)
export const StepsDispatcherContext = createContext<DispatcherShape | null>(
  null,
)

export function useStepsStateContext() {
  const ctx = useContext(StepsStateContext)
  if (ctx === null) {
    throw new Error(`useStepsStateContext must be inseted into <Steps />`)
  }
  return ctx
}

export function useStepsDispatcherContext() {
  const ctx = useContext(StepsDispatcherContext)
  if (ctx === null) {
    throw new Error(`useStepsDispatcherContext must be inseted into <Steps />`)
  }
  return ctx
}

export function useStepsContext() {
  return [useStepsStateContext(), useStepsDispatcherContext()] as const
}
