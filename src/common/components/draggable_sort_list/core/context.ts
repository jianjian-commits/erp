import _ from 'lodash'
import { createContext, MutableRefObject, useContext } from 'react'

export interface DraggableContextShape {
  parentNode: MutableRefObject<HTMLUListElement | null>
  /** 被拖拽的元素 */
  dragNode: MutableRefObject<HTMLLIElement | undefined>
  /** 记录当前被拖拽元素的索引 */
  dragIndex: MutableRefObject<number | undefined>
  /** 被拖拽元素高亮 class */
  activeClassName?: string

  setDragNode: (node: HTMLLIElement) => void
  setDragIndex: (value?: number) => void

  /** 排序结束后触发 */
  onSortEnd: (oldIndex: number, newIndex: number) => void
}

export const DraggableContext = createContext<
  DraggableContextShape | undefined
>(undefined)

export function useDraggableContext() {
  const ctx = useContext(DraggableContext)
  if (_.isNil(ctx)) {
    throw new Error(
      `useDraggableContext must be inserted into <DraggableSortContext />`,
    )
  }
  return ctx
}
