import {
  ListProcessTaskOutputLogRequest,
  ProcessTaskOutputLog,
  TaskOutput,
} from 'gm_api/src/production'

export interface TableType {
  /* 成品名称 */
  sku_Name: string
  /** 成品类型 */
  skuType: string
  /** 商品分类 */
  categorys: string
  /** 产出数量(基本单位) */
  outputAmount: string
  /** 产出数量(包装单位) */
  pack_outputAmount: string
  /** 基本单位名称 */
  baseUnit?: string
  /** 包装单位名称 */
  Unit: string
  /** 生产入库单编号 */
  stockSheetSerialNo: string
}

export interface ListType {
  task_output_ids: string[]
  sku_id: string
  skuName?: string
  skuType?: string
  category?: string
  state?: string
  baseUnit?: string
  packUnit?: string
  base_unit_output_amount?: string
  output_amount?: string
  stock_in_amount?: string
  stock_sheet_serial_no?: string
  stock_sheet_id?: string
}

export interface ProduceInfo
  extends Omit<
    TaskOutput,
    'state' | 'task_output_id' | 'unit_id' | 'base_unit_id'
  > {
  key: string
  skuName: string
  skuType: string
  category: string
  state: string
  taskState: string
  baseUnit: string
  packUnit?: string
  base_unit_output_amount: string
  output_amount: string
  stock_in_amount: string
  stock_sheet_serial_no: string
  stock_sheet_id?: string
}
export interface ProduceRecondInfo extends ProcessTaskOutputLog {
  key: string
  sku_id: string
  process_task_id: string
  _base_unit_amount: string
  _amount: string
  isEditing: boolean
  is_combine: boolean
  skuName: string
  skuType: string
  category: string
  baseUnit: string
  packUnit?: string
  base_unit_amount: string
  amount?: string
  create_time: string
  processor_name: string
  delivery_time: string
  serial_no: string
  status: string
  process_task_output_log_id: string
}

export interface RecondDetails {
  process_task_output_log_id: ProcessTaskOutputLog // update取的数据
  data: ProduceRecondInfo // 列表渲染用到的数据
}

export type RecondListType = ListProcessTaskOutputLogRequest
export interface MoreSelectDataItem {
  label?: string
  value?: any
}
