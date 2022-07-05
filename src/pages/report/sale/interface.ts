import { PagingParams } from 'gm_api/src/common'
import { GetOrderMerchandiseSaleDataRequest } from 'gm_api/src/databi'
import { TableXProps } from '@gm-pc/table-x'
import { TableListProps as TempTableListProps } from '@/common/components'
import { BASE_SUMMARY } from './constants'
export type TableListProps = TableXProps

export type BaseTableListType = Pick<TempTableListProps, 'tableRef'>
export interface FilterProps {
  onExport: (...arg: any) => Promise<any>
}

export interface FormatQueryDataReturn<D, S> {
  data: D[]
  summaryData: S
  paging: PagingParams
}

export type BaseSummaryType = typeof BASE_SUMMARY

export type Category = {
  category: Pick<
    GetOrderMerchandiseSaleDataRequest,
    'category_ids' | 'category_type'
  >
}
