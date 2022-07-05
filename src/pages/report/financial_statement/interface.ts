import {
  GetFinanceShouldReceiveDataRequest,
  GetFinanceShouldPayDataRequest,
  ListReportFormRequest,
} from 'gm_api/src/databi'

import {
  TableListProps as TempTableListProps,
  TableListRef,
} from '@/common/components'

import { SortsType } from '@gm-pc/table-x'

interface PropsType {
  tableRef: TableListRef
  id?: string
  columns: Array<any>
  summaryInfo: { label: string; content: string }[]
  filter: SaleFilter
  service: (
    params: GetFinanceShouldReceiveDataRequest & { sorts: SortsType },
  ) => Promise<any>
}

type CustomerSaleFilter = Partial<
  Pick<
    GetFinanceShouldReceiveDataRequest,
    'time_range' | 'customer_name' | 'need_summary_data'
  >
>

type SupplierSaleFilter = Partial<
  Pick<
    GetFinanceShouldPayDataRequest,
    'time_range' | 'supplier_name' | 'need_summary_data'
  >
>

type SupplierSaleLiteFilter = Partial<
  Pick<ListReportFormRequest, 'create_time' | 'end_time' | 'q' | 'account_type'>
>

type SaleFilter = CustomerSaleFilter &
  SupplierSaleFilter &
  SupplierSaleLiteFilter

export type BaseTableListType = Pick<TempTableListProps, 'tableRef'>

export type {
  CustomerSaleFilter,
  SupplierSaleFilter,
  SupplierSaleLiteFilter,
  TableListRef,
  PropsType,
  SaleFilter,
}
