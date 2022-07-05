import { ReactNode, RefObject, Key } from 'react'
import { ColumnType } from 'antd/lib/table'

import { PagingParams } from 'gm_api/src/common'

export interface SelectTableContext {
  fetchList: (params?: any, isResetCurrent?: boolean) => void
}

export type Options = {
  label: ReactNode
  value: string | number
}

export interface UiFilter {
  name: string
  label?: ReactNode
  placeholder?: string
  /** 输入框类型 */
  type: 'input' | 'select' | 'cascader' | 'categoryCascader'
  width?: string | number
  options?: Options[]
  [key: string]: any
}

export interface SelectTableProps<T, R> {
  rowKey: keyof T & string
  /** 用于selectBox的显示项，不传默认取rowKey */
  selectedKey?: keyof T
  /** 用于兼容selectBox的title */
  extraKey?: keyof T
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
  filter?: UiFilter[]
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
