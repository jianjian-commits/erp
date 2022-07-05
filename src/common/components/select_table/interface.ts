import React, { ReactNode, RefObject, Key } from 'react'
import { ColumnType } from 'antd/lib/table'
import { DateRangeShape } from './date_range_picker'
import { PagingParams } from 'gm_api/src/common'

export interface SelectTableContext {
  fetchList: (params?: any, isResetCurrent?: boolean) => void
}

export type Options = {
  label: ReactNode
  value: string | number
}

interface BasicUiFilter {
  name: string
  label?: ReactNode
  placeholder?: string
  width?: string | number
  options?: Options[]
  initialValue?: unknown
  [key: string]: any
}

/**
 * DateRangePick 组件必须要设置默认初始值，否则将无法渲染
 */
interface GmDateRangePickerFilterShape
  extends Omit<BasicUiFilter, 'initialValue'> {
  type: 'gmDateRangePicker'
  initialValue: DateRangeShape
}

interface NormalFilter extends BasicUiFilter {
  /** 输入框类型 */
  type: 'input' | 'select' | 'cascader' | 'categoryCascader'
}

export type UiFilter = NormalFilter | GmDateRangePickerFilterShape

export interface SelectTableProps<T, R> {
  rowKey: keyof T & string
  /** 用于selectBox的显示项，不传默认取rowKey */
  selectedKey?: keyof T
  /** 用于兼容selectBox的title */
  extraKey?: keyof T
  selectCountWarning?: string
  onSearch: (
    pagination: PagingParams,
    params?: R,
  ) => Promise<{
    list: T[]
    count: string | undefined
  }>

  onSelect?: (selectedRowKeys: Key[], selectedRows: T[]) => void
  /** 限制条数 */
  limitCount?: number
  /** 筛选框 */
  filter?: UiFilter[] | ((onFinish: () => void) => JSX.Element)
  /** 自定义筛选 与filter不能共存 */
  FilterComponent?: React.ForwardRefExoticComponent<any>
  /** 表格列，格式参考antd */
  columns: ColumnType<T>[]
  /** 禁用项 */
  disabledList?: Key[]
  /** 隐藏勾选所有 */
  hideSelectAll?: boolean
  /** 默认值 */
  defaultSelectedRows?: T[]
  /** 默认Key */
  defaultSelectedRowKeys?: Key[]
  tableRef?: RefObject<SelectTableRef<T>>
  [key: string]: any
}

export interface SelectTableRef<T> {
  selectedRowKeys: Key[]
  selectedRows: T[]
}
