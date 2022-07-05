import { BillOrderInfo, BillOrderProductInfo } from 'gm_api/src/finance'

/**
 * 表格 fetcher 返回数据
 */
export interface TableDataFetcherResult {
  orders?: BillOrderInfo[]
  skus?: BillOrderProductInfo[]
  product?: BillOrderProductInfo[]
  orderType?: BillOrderInfo[]
}

export interface RawData {
  /**
   * 通用数据（客户名、打印时间等信息）
   */
  common: BillOrderInfo
  /**
   * 表格数据
   */
  tableData: TableDataFetcherResult
}
