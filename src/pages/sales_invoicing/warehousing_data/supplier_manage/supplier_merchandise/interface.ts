import { PagingResult } from 'gm_api/src/common'
import { TableListProps as TempTableListProps } from '@/common/components'
import { Sku, ListSkuRequest } from 'gm_api/src/merchandise'

export type BaseTableListType = Pick<TempTableListProps, 'tableRef'>

interface FilterProps {
  onExport: (...arg: any) => Promise<any> | any
}

interface FilterComProps {
  onSearch?: () => Promise<any>
  paging?: PagingResult
}
interface FilterOptions {
  category_ids: any
  q: string
}
interface Parmas {
  paging: {
    offset: number
    limit: number
    need_count: boolean
    has_more: boolean
    /** 注意，为了性能考虑，count 只有 offset = 0 need_count = true 时才返回 */
    count?: number
  }
}
interface ListType extends Sku {
  customize_code: string
  category1_name: string
  category2_name: string
  input_tax: string
  is_editing: boolean
}

type Category = {
  category_ids: string[]
}
interface Filter extends ListSkuRequest {
  category: Category
}
interface ValueType {
  [key: string]: string
}

export type {
  FilterComProps,
  FilterOptions,
  Parmas,
  ListType,
  FilterProps,
  Filter,
  ValueType,
}
