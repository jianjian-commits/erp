/* eslint-disable no-unmodified-loop-condition */
import { makeAutoObservable } from 'mobx'
import {
  CreatePurchaseTask,
  PurchaseTask_Status,
  PurchaseTask_RequestSource,
  PurchaseTask_Type,
} from 'gm_api/src/purchase'

import type { MoreSelectDataItem } from '@gm-pc/react'
import type { PurchaseTask as Task } from 'gm_api/src/purchase'
import type { Sku, Sku_SkuLevel } from 'gm_api/src/merchandise'
import _ from 'lodash'
import moment from 'moment'

// 计算初始时间
const initDate = () => {
  const today = moment()
  const zoneToday = moment().startOf('hours')

  // 比对时间
  while (zoneToday < today) {
    zoneToday.add(30, 'minutes')
  }
  return zoneToday.toDate()
}

interface SkuLevelData extends Sku_SkuLevel {
  text: string
  value: string
}
interface Spec extends Partial<Sku> {
  sku_id: string
  unit_id: string
  name: string
  category_name: string
  current_inventory?: number // 账目库存
  plan_purchase_amount?: number | null // 采购量(基本单位)
  supplier?: MoreSelectDataItem<string>
  purchaser?: MoreSelectDataItem<string>
  sku_level_filed_id?: string
  sku_level_data: SkuLevelData[]
  purchase_unit_name: string
  _i: number
}

interface SpecDetail {
  delivery_time: Date | null // 计划交期
  info: string // 采购波次
  list: Spec[]
}

const initSpec: Spec = {
  current_inventory: undefined,
  plan_purchase_amount: undefined,
  supplier: undefined,
  purchaser: undefined,
  sku_level_filed_id: undefined,
  sku_level_data: [],
  category_name: '',
  sku_id: '',
  unit_id: '',
  name: '',
  purchase_unit_name: '', // 采购单位
  spu_id: '',
  base_unit_id: '',
  _i: 0,
}
const initSpecDetail = {
  delivery_time: initDate(),
  info: '',
  list: [{ ...initSpec, _i: 0 }],
}
class Store {
  specDetail: SpecDetail = { ...initSpecDetail }

  selected: string[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init() {
    this.specDetail = { ...initSpecDetail }
  }

  updateSpec<T extends keyof SpecDetail>(key: T, value: SpecDetail[T]) {
    this.specDetail[key] = value
  }

  updateListItem(index: number, item = initSpec) {
    // TODO 批量操作
    // Object.assign(this.specDetail.list[index], { ...item })
    this.specDetail.list[index] = { ...item, _i: index }
  }

  updateListColumn<T extends keyof Spec>(
    index: number | number[],
    key: T,
    value: Spec[T],
  ) {
    if (Array.isArray(index)) {
      index.forEach((i) => {
        this.specDetail.list[i][key] = value
      })
    } else {
      this.specDetail.list[index][key] = value
    }
  }

  async createSpecs() {
    const list = this.specDetail.list.filter(
      (v) => v.sku_id && v.purchase_unit_id,
    )
    const purchaseTasks = _.map(list, (v) => {
      const baseUnit = {
        unit_id: v.purchase_unit_id!,
        quantity: `${v.plan_purchase_amount!}`,
        price: '',
      }
      const item: Partial<Task> = {
        request_details: {
          request_details: [
            {
              sku_revision: v.revision!,
              unit_id: v.purchase_unit_id!,
              request_source: PurchaseTask_RequestSource.MANUAL as number,
              sheet_value: {
                input: baseUnit,
                calculate: baseUnit,
              },
            },
          ],
        },
        sku_id: v.sku_id,
        request_source: PurchaseTask_RequestSource.MANUAL as number,
        purchase_time: `${+new Date(this.specDetail.delivery_time!)}`,
        status: PurchaseTask_Status.PREPARE as number,
        type: PurchaseTask_Type.COMMON as number,
      }
      if (v.supplier) item.supplier_id = v.supplier.value
      if (v.purchaser) item.purchaser_id = v.purchaser.value
      if (v.sku_level_filed_id) item.sku_level_filed_id = v.sku_level_filed_id
      return item
    })
    return CreatePurchaseTask({
      purchase_tasks: purchaseTasks,
      batch: {
        name: this.specDetail.info,
        last_submit_time: `${+new Date()}`,
        last_purchase_time: `${+new Date(this.specDetail.delivery_time!)}`,
      },
    })
  }

  addRow(index = this.specDetail.list.length) {
    let list = this.specDetail.list.slice()
    list.splice(index + 1, 0, { ...initSpec })
    list = list.map((v, i) => ({ ...v, _i: i }))
    this.specDetail.list = list
  }

  deleteRow(index: number) {
    let list = this.specDetail.list.slice()
    list.splice(index, 1)
    list = list.map((v, i) => ({ ...v, _i: i }))
    this.specDetail.list = list
  }

  setSelected(selected: string[]) {
    this.selected = selected
  }
}

export default new Store()
export type { Spec }
