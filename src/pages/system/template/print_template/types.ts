import { handleOrderPrinterData } from '@/pages/system/template/print_template/delivery_template/util'
import { handleOrderPrinterData as handleOrderPrinterDataAccount } from '@/pages/system/template/print_template/account_template/util'
import { PrintingTemplateRelation } from 'gm_api/src/preference'
import { childType } from '@/pages/delivery/components/order_print_modal_new/enum'

export interface PrintOrderListData {
  common: object
  _origin: object
  _counter: object
  _table: object
}
export interface PrintOrderListType {
  config: Record<string, string | number | object>
  data: PrintOrderListData
}

export interface PrintDataType<T> {
  dataList: T
}

export interface PrintTemplateRelationType {
  [key: string]: PrintingTemplateRelation
}

type ArrayObjectType<T> = T extends Array<infer U> ? U : never

export type PrintOrderDataType = ArrayObjectType<
  ReturnType<typeof handleOrderPrinterData>
> &
  ArrayObjectType<ReturnType<typeof handleOrderPrinterDataAccount>>

export type GroupType = {
  [key in childType]: keyof ArrayObjectType<PrintOrderDataType['details']>
}
