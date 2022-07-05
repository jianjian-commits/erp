import {
  StockSheet,
  ListStockSheetRequest,
  ListStockLogRequest,
  ListCustomerTurnoverRequest,
} from 'gm_api/src/inventory'
import { ReceiptStatusAll } from '@/pages/sales_invoicing/interface'
import type { GetManySkuResponse_SkuInfo } from 'gm_api/src/merchandise'
import type { Customer, GroupUser } from 'gm_api/src/enterprise'
import type { MoreSelectDataItem } from '@gm-pc/react'

interface FtSheet
  extends Omit<
    ListStockSheetRequest,
    'paging' | 'begin_time' | 'end_time' | 'time_type'
  > {
  customer_q: string
  sku_q: string
  begin_time: Date
  end_time: Date
  time_type: number
  select_type: number
  warehouse_id?: string
}

interface FtLog
  extends Omit<
    ListStockLogRequest,
    'paging' | 'begin_time' | 'end_time' | 'operate_types' | 'operate_type'
  > {
  begin_time: Date
  end_time: Date
  operate_types: number
}

interface FtStock extends Omit<ListStockLogRequest, 'begin_time' | 'end_time'> {
  begin_time: Date
  end_time: Date
}

type FtTurn = Omit<ListCustomerTurnoverRequest, 'paging'>

interface SheetType {
  customer: MoreSelectDataItem<string> | undefined
  sku: MoreSelectDataItem<string> | undefined
  quantity: number | null
  group_user_id: string
  base_unit_name: string
  related_sheet_serial_no?: string
  max?: number
  warehouse_id?: string
}

interface StockSheetInfo extends Omit<StockSheet, 'driver_id'> {
  skuInfo?: GetManySkuResponse_SkuInfo
  customerInfo?: Customer
  groupUserInfo?: GroupUser
  quantity?: number | null
  base_unit_name?: string
  edit?: boolean
  driver_id?: string
  old_sheet_status: number // 存储一开始的状态
}

type StatusType = keyof ReceiptStatusAll<string>

export type {
  FtSheet,
  FtLog,
  FtStock,
  FtTurn,
  SheetType,
  StockSheetInfo,
  StatusType,
}
