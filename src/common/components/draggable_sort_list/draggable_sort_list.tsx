import _ from 'lodash'
import React, { ReactElement, ReactNode } from 'react'
import DraggableSort from './core'
import arrayMove from './utils/array_move'
import RemoveBtn from './remove_btn'
import classNames from 'classnames'

interface SelectedListProps<T, K extends keyof T> {
  /** 唯一值，同时也是 React 需要的 key */
  fieldKey: K
  /** label 字段 */
  labelKey: keyof T
  /** 数据 */
  list?: T[]
  className?: string
  style?: React.CSSProperties
  /** 为列表每一项设置 class */
  itemClassName?: string
  /**
   * 被拖拽元素高亮 class，默认为蓝色背景、蓝色文字
   */
  activeClassName?: string
  /** 点击删除时触发 */
  onRemove?: (key: T[K], index: number) => void
  /** 拖拽后的排序结果 */
  onSortEnd?: (list: T[]) => void
}

/**
 * 可拖动排序列表
 */
function DraggableSortList<T, K extends keyof T>(
  props: SelectedListProps<T, K>,
): ReactElement {
  const {
    className,
    style,
    itemClassName,
    fieldKey,
    labelKey,
    list,
    activeClassName = 'tw-text-blue-500 tw-bg-blue-100',
    onRemove,
    onSortEnd,
  } = props

  return (
    <DraggableSort.Context
      className={className}
      style={style}
      activeClassName={activeClassName}
      onSortEnd={(oldIndex, newIndex) => {
        onSortEnd && onSortEnd(arrayMove(oldIndex, newIndex, list))
      }}
    >
      {_.map(list, (item, index) => {
        const key = item[fieldKey]
        const label = item[labelKey] as ReactNode
        return (
          <DraggableSort
            key={`${key}_${label}`}
            index={index}
            className={classNames(
              'tw-leading-none tw-flex tw-items-center',
              itemClassName,
            )}
          >
            {label}
            <RemoveBtn
              className='tw-ml-auto'
              onClick={() => {
                onRemove && onRemove(key, index)
              }}
            />
          </DraggableSort>
        )
      })}
    </DraggableSort.Context>
  )
}

export default DraggableSortList
