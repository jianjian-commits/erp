import {
  PurchaseTask,
  PurchaseTask_RequestDetails_RequestDetail,
} from 'gm_api/src/purchase'
import { UnitValueSet } from 'gm_api/src/merchandise'

export interface PurchaseTaskForPrintDetail {
  sku_id: string
  request_value: UnitValueSet
  plan_value: UnitValueSet
  purchase_value: UnitValueSet
  batch_id: string
  request_details: PurchaseTask_RequestDetails_RequestDetail[]
}

export interface PurchaseTaskForPrint extends PurchaseTask {
  _detailsForPrint: PurchaseTaskForPrintDetail[]
}
