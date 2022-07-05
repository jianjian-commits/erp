import React, { useMemo } from 'react'
import classNames from 'classnames'
import { useDraggableContext } from './context'
import prevEvent from '../utils/prev_event'
import _ from 'lodash'

export interface DraggableSortProps {
  index: number
  className?: string
  style?: React.CSSProperties
}

const DraggableSort: React.FC<DraggableSortProps> = (props) => {
  const { className, style, children, index } = props

  const {
    activeClassName,
    parentNode,
    dragIndex,
    dragNode,
    setDragIndex,
    setDragNode,
    onSortEnd,
  } = useDraggableContext()

  const activeClass = useMemo(() => {
    if (!activeClassName) return
    return _.split(activeClassName, ' ')
  }, [activeClassName])

  const addActive = (el: HTMLLIElement) => {
    if (!_.isNil(activeClass)) {
      el.classList.add(...activeClass)
    }
  }
  const removeActive = (el: HTMLLIElement) => {
    if (!_.isNil(activeClass)) {
      el.classList.remove(...activeClass)
    }
  }

  /** 还原 DOM 顺序 */
  const reductionDOM = (element: HTMLLIElement, targetIndex: number) => {
    const parent = parentNode.current
    if (parent) {
      const targetDOM = parentNode.current?.children[targetIndex] || null
      parent.insertBefore(element, targetDOM)
    }
  }

  const onDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    setDragNode(e.currentTarget)
    setDragIndex(Number(e.currentTarget.dataset.index))
    addActive(e.currentTarget)
  }

  const onDragEnter = (e: React.DragEvent<HTMLLIElement>) => {
    prevEvent(e)
    const hoverNode = e.currentTarget
    const parentList = parentNode.current

    if (!parentList || !dragNode.current || hoverNode === dragNode.current) {
      return
    }
    const isNext = hoverNode === dragNode.current.nextSibling
    // 插入到此节点之前
    // 如果 targetNode 为 null，则会添加到列表的末尾。
    const targetNode = isNext ? hoverNode.nextSibling : hoverNode

    parentList.insertBefore(dragNode.current, targetNode)
  }

  const onDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    prevEvent(e)
    const dragDom = dragNode.current
    const parentList = parentNode.current
    const fromIndex = dragIndex.current
    if (dragDom && parentList && !_.isNil(fromIndex)) {
      removeActive(e.currentTarget)
      let targetIndex: number
      // 在已排序列表中查找 DOM 节点索引位置
      for (let i = 0; i < parentList.childNodes.length; i += 1) {
        const item = parentList.childNodes[i]
        if (item === dragDom) {
          targetIndex = i
        }
      }
      // 重新渲染前，要还原顺序
      reductionDOM(dragDom, fromIndex)
      // 重新排序，重新渲染列表
      onSortEnd(fromIndex, targetIndex!)
    }
  }

  return (
    <li
      className={classNames('tw-cursor-pointer', className)}
      style={style}
      data-index={index}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragLeave={prevEvent}
      onDragOver={prevEvent}
      onDragEnd={onDragEnd}
      draggable
    >
      {children}
    </li>
  )
}

export default DraggableSort
