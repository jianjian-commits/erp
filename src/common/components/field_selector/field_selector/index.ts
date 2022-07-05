import RawFieldSelector, { FieldSelectorProps } from './field_selector'
import useFieldState from './hooks/use_field_state'
type FieldSelectorType = typeof RawFieldSelector

interface FieldSelectorComponent extends FieldSelectorType {
  useFieldState: typeof useFieldState
}

const FieldSelector = RawFieldSelector as FieldSelectorComponent

FieldSelector.useFieldState = useFieldState

export type { DataShape } from './hooks/use_fetcher'
export type { SelectedFields } from './interface'
export type { FieldSelectorProps }
export { FieldSelector, useFieldState }
