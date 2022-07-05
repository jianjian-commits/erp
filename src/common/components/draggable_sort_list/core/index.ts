import DraggableSortContext, {
  DraggableSortContextProps,
} from './draggable_sort_context'
import Item, { DraggableSortProps } from './draggable_sort'

type DraggableSortFC = typeof Item

interface DraggableSortComponent extends DraggableSortFC {
  Context: typeof DraggableSortContext
}

const DraggableSort = Item as DraggableSortComponent

DraggableSort.Context = DraggableSortContext

export type { DraggableSortContextProps, DraggableSortProps }
export default DraggableSort
