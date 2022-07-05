import classNames from 'classnames'
import React, { useMemo, useRef } from 'react'
import { DraggableContext, DraggableContextShape } from './context'

export interface DraggableSortContextProps {
  className?: string
  style?: React.CSSProperties
  /** 被拖拽元素高亮 class */
  activeClassName?: string
  /** 排序结束后触发 */
  onSortEnd?: (oldIndex: number, newIndex: number) => void
}

const DraggableSortContext: React.FC<DraggableSortContextProps> = (props) => {
  const { className, style, activeClassName, children, onSortEnd } = props

  const parentNode = useRef<HTMLUListElement | null>(null)
  // 记录当前被拖拽元素的索引
  const dragIndex = useRef<number>()
  // 被拖拽的元素
  const dragNode = useRef<HTMLLIElement>()

  const contextState = useMemo<DraggableContextShape>(() => {
    return {
      activeClassName,
      parentNode,
      dragIndex,
      dragNode,
      setDragIndex(value) {
        dragIndex.current = value
      },
      setDragNode(node) {
        dragNode.current = node
      },
      onSortEnd(oldIndex, newIndex) {
        if (typeof onSortEnd === 'function') {
          onSortEnd(oldIndex, newIndex)
        }
      },
    }
  }, [activeClassName, onSortEnd])

  return (
    <DraggableContext.Provider value={contextState}>
      <ul
        className={classNames(
          'tw-list-none tw-select-none tw-p-0 tw-m-0',
          className,
        )}
        style={style}
        ref={parentNode}
      >
        {children}
      </ul>
    </DraggableContext.Provider>
  )
}

export default DraggableSortContext
