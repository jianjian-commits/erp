/*
 * @Autor: xujiahao
 * @Date: 2021-05-14 10:36:20
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-12-10 17:40:01
 * @FilePath: /gm_static_x_erp/src/pages/system/template/print_template/purchase_task_template/interface.ts
 */
import {
  PurchaseTask,
  PurchaseTask_RequestDetails_RequestDetail,
  PurchaseTask_PurchaseDetails_PurchaseDetail,
} from 'gm_api/src/purchase'
import { UnitValueSet } from 'gm_api/src/merchandise'

export interface PurchaseTaskForPrintDetail {
  sku_id: string
  request_value: UnitValueSet
  plan_value: UnitValueSet
  purchase_value: UnitValueSet
  batch_id: string
  remark: string
  batch_name: string
  request_details: PurchaseTask_RequestDetails_RequestDetail[]
  purchase_details: PurchaseTask_PurchaseDetails_PurchaseDetail[]
  sku_level_filed_id: string
}

export interface PurchaseTaskForPrint extends PurchaseTask {
  _detailsForPrint: PurchaseTaskForPrintDetail[]
}
