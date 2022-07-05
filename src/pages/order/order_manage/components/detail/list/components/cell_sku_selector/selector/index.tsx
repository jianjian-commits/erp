import React, { ReactNode, useCallback, useMemo } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import {
  Flex,
  TableSelectColumn,
  MoreSelectDataItem,
  MoreSelectGroupDataItem,
  MoreSelectProps,
} from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import './style.less'

export type SelectorValue<T extends string | number = string> =
  MoreSelectDataItem<T>
export type SelectorColumn<T> = Omit<TableSelectColumn<T>, 'width'> & {
  width?: number | string
}
export type SelectorData<T extends string | number = string> =
  MoreSelectGroupDataItem<T>[]

interface SelectorProps<T extends string | number = string>
  extends Omit<
    MoreSelectProps<T>,
    'data' | 'renderListFilter' | 'renderListItem'
  > {
  selected?: SelectorValue<T>
  data: SelectorData<T>
  columns: SelectorColumn<T>[]
  renderTitle?(): ReactNode
  onSelect(selected?: SelectorValue<T>): void
}

// function filter<T extends string | number = string>(
//   list: SelectorData<T>,
//   value: string,
// ) {
//   const result: SelectorData<T> = []
//   list.forEach((item) => {
//     const list = item.children.filter((child) => child.text.includes(value))
//     result.push({ ...item, children: list })
//   })
//   return result
// }
function filter<T extends string | number = string>(
  val: NonNullable<MoreSelectProps<T>['data']>,
) {
  return val
}

function getColumnKey<T>(column?: SelectorColumn<T>) {
  if (_.isNil(column)) {
    return null
  }
  if (_.isString(column.accessor)) {
    return column.accessor
  } else if (_.isFunction(column.accessor) && !_.isNil(column.id)) {
    return column.id
  } else if (_.isNil(column.id)) {
    return column.id
  }
  return null
}

function Selector<T extends string | number = string>(props: SelectorProps<T>) {
  const { data, columns, className, popupClassName, ...rest } = props

  const header = useMemo(() => {
    return (
      <Flex alignCenter className='gm-order-goods-selector-head'>
        {_.map(columns, (column, i) => (
          <div
            key={`${i}_${getColumnKey(column)}`}
            className={classNames('gm-flex-flex', {
              'gm-flex-none': column.width,
            })}
            style={{
              width: column.width,
            }}
          >
            {column.Header}
          </div>
        ))}
      </Flex>
    )
  }, [columns])

  const newData = useMemo<SelectorData<T>>(() => {
    return _.map(data, (item) => ({
      label: (
        <>
          {item.label}
          {_.isEmpty(item.children) ? null : header}
        </>
      ),
      children: item.children,
    }))
  }, [data, header])

  const renderListItem = useCallback(
    (item: SelectorValue<T>, index: number) => {
      return (
        <Flex
          key={item.value}
          alignCenter
          className='gm-order-goods-selector-list-item'
        >
          {_.map(columns, (column, i) => {
            let content = null
            if (column.Cell) {
              content = column.Cell({
                original: item,
                index,
              })
            } else if (_.isFunction(column.accessor)) {
              content = column.accessor(item)
            } else if (_.isString(column.accessor)) {
              content = _.get(item, column.accessor)
            }

            if (content === null || content === undefined) {
              content = <div className='gm-text-desc'>-</div>
            }
            return (
              <div
                key={`${i}_${getColumnKey(column)}`}
                className={classNames('gm-flex-flex tw-px-2 tw-py-1', {
                  'gm-flex-none': column.width,
                })}
                style={{
                  width: `${column.width}px`,
                }}
              >
                {content}
              </div>
            )
          })}
        </Flex>
      )
    },
    [columns],
  )

  return (
    <KCMoreSelect
      {...rest}
      isGroupList
      data={newData}
      listHeight='250px'
      className={classNames('gm-order-goods-selector', className)}
      popupClassName={classNames('gm-order-goods-popup', popupClassName)}
      renderListFilter={filter}
      renderListItem={renderListItem}
    />
  )
}

export default Selector
