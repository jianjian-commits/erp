import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  AfterSaleOrderDetail_TaskStatus,
  AfterSaleOrderDetail_TaskMethod,
} from 'gm_api/src/aftersale'
import { ReceiptStatusAll, ObjectOfKey } from './interface'

export const MERCHANTS_LABEL = [{ value: 0, text: t('全部') }]

export const RECEIPT_TABS: ReceiptStatusAll<string> = {
  TASK_STATUS_UNSPECIFIED: t('全部'),
  TASK_STATUS_UNDONE: t('未完成'),
  TASK_STATUS_DONE: t('已完成'),
}

export const RECEIPT_STATUS: ReceiptStatusAll<number> = {
  TASK_STATUS_UNSPECIFIED:
    AfterSaleOrderDetail_TaskStatus.TASK_STATUS_UNSPECIFIED, // 全部
  TASK_STATUS_UNDONE: AfterSaleOrderDetail_TaskStatus.TASK_STATUS_UNDONE, // 未完成
  TASK_STATUS_DONE: AfterSaleOrderDetail_TaskStatus.TASK_STATUS_DONE, // 已完成
}

export const dealWayMap: ObjectOfKey<string> = {
  [AfterSaleOrderDetail_TaskMethod.TASK_METHOD_PICK_UP]: t('取货'),
  [AfterSaleOrderDetail_TaskMethod.TASK_METHOD_GIVE_UP_PICKUP]: t('放弃取货'),
}

export const taskStatusMap: ObjectOfKey<string> = {
  [AfterSaleOrderDetail_TaskStatus.TASK_STATUS_UNDONE]: t('未完成'),
  [AfterSaleOrderDetail_TaskStatus.TASK_STATUS_DONE]: t('已完成'),
}

function parseSelectData(m: { [key: number]: string }) {
  return _.map(m, (text, value) => {
    return {
      value: +value,
      text: text,
    }
  }).filter((v) => v.text)
}

export const dealWay = parseSelectData(dealWayMap)
export const taskStatus = parseSelectData(taskStatusMap)
