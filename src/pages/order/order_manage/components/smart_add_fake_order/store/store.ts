import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import type { MerchandiseShape } from './types'
import { isZero, formatePrice } from '../utils'
import {
  ADD_ORDER_VALUE_FIELD,
  AddOrderValueFieldType,
} from '../select-fake-order-field/constants'
import store, { initSsu } from '../../detail/store'
import { DetailListItem } from '@/pages/order/order_manage/components/interface'
import { getFeePriceByUnit } from '@/pages/order/order_manage/components/detail/util'
import globalStore from '@/stores/global'
import { toFixedOrder } from '@/common/util'
import { isCombineSku, transformOutStock } from '@/pages/order/util'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

class SmartAddFakeOrderStore {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  /** 目标加单总金额 */
  targetAmount = ''

  /** 修改目标加单总金额 */
  setTargetAmount(value: string) {
    this.targetAmount = value
  }

  /** 加单字段 */
  field: AddOrderValueFieldType = ADD_ORDER_VALUE_FIELD.VALUE1

  /** 修改加单字段 */
  setField(value: AddOrderValueFieldType) {
    this.field = value
  }

  /** 已选择的商品列表 */
  list: MerchandiseShape[] = []

  /**
   * 修改商品列表
   *
   * 智能加单计算方式：
   * 1. 使用加单总金额除以商品数量得出平均金额
   *    若无法除尽，则四舍五入，并把差值并入最后一项再进行计算
   * 2. 使用平均金额除以单价得出对应加单数
   */
  setList(value: MerchandiseShape[]) {
    if (value.length === 0) {
      return
    }
    // 未填写加单总金额
    if (isZero(this.targetAmount)) {
      this.list = _.map(value, (item) => ({ ...item, count: '0', amount: '0' }))
      return
    }
    // 目标金额根据商品数量等分
    const equalAmount = Big(this.targetAmount).div(value.length).toFixed(2)
    // 已从目标金额中分出的金额（除了最后一项的加单金额总和）
    let usedAmount = Big(0)
    const calced = _.map(value, (item, index): MerchandiseShape => {
      const isLast = index === value.length - 1
      let targetAmount = equalAmount
      if (isLast) {
        // 差值。由于四舍五入，实际计算金额与目标金额始终有差距，则将最后一项
        // 的金额尽可能补齐差值，让实际计算金额趋于目标金额
        targetAmount = Big(this.targetAmount).minus(usedAmount).toFixed(2)
      }
      const count = isZero(item.price)
        ? '0'
        : Big(targetAmount).div(item.price).round(1, Big.roundDown).toString()
      const amount = Big(count).times(item.price).toFixed(2)
      usedAmount = usedAmount.plus(Big(count).times(item.price))
      return {
        ...item,
        count,
        amount,
      }
    })
    this.list = calced
  }

  /** 修改加单数 */
  setCount(index: number, value: string) {
    const target = { ...this.list[index] }
    target.count = value
    target.amount = Big(target.price).times(formatePrice(value)).toFixed(2)
    this.list[index] = target
  }

  /** 修改加单金额 */
  setAmount(index: number, value: string) {
    const target = { ...this.list[index] }
    target.amount = value
    target.count = isZero(value) ? '0' : Big(value).div(target.price).toFixed(2)
    this.list[index] = target
  }

  /** 实时计算加单总金额 */
  get totalAmount() {
    return _.reduce(
      this.list,
      (res, item) => {
        return res.plus(Big(formatePrice(item.amount)))
        // return res.plus(Big(item.count).times(item.price))
      },
      Big(0),
    ).toFixed(2)
  }

  /** 商品下拉框中，曾经被选择的商品 */
  skuMap = new Map<string, DetailListItem>()

  /** 保存 sku */
  insetSku(skuId: string, sku: DetailListItem) {
    this.skuMap.set(skuId, sku)
  }

  /**
   * 修改 sku 中单位、价格相关数据
   * 此处与下单页选择商品、选择单位组件逻辑一致
   */
  private _updateSku(sku: DetailListItem, unitId: string) {
    const {
      sku_id,
      prices,
      isUsingSecondUnitOutStock,
      second_base_unit_id,
      base_unit_id,
      tax,
    } = sku

    let updates: Record<string, unknown> = {}
    let basicData: Record<string, unknown> = {}

    // 处理税率，需要根据客户的开票情况处理税率默认值
    // 因为发票信息是挂在 level 为1 的customer 上，因此如果当前选择 customer level 为2，需要通过parent_id 查找
    // 直接在前面选择商户的时候处理
    const isOpenInvoice =
      +(
        store.order.customer?.settlement?.china_vat_invoice?.invoice_type || 0
      ) & ChinaVatInvoice_InvoiceType.VAT_SPECIAL
    const detail_random_id = isCombineSku(sku || {})
      ? _.uniqueId(`${Date.now()}`)
      : _.uniqueId(`10${Date.now()}`)
    basicData = {
      isNewItem: true,
      quotationName: store.order.customer?.quotation?.outer_name || '-',
      tax: isOpenInvoice ? sku?.tax : '0',
      detail_random_id,
    }

    const unit = _.find(
      sku?.units,
      (unit) => unit.unit_id === unitId || unit.value === unitId,
    )
    const sameGroupWithSecondUnit = globalStore.isSameUnitGroup(
      unitId,
      second_base_unit_id!,
    )
    // 最小下单数
    const minimum_order_number = prices?.find(
      (item) => item.order_unit_id === unitId,
    )?.minimum_order_number
    // 初始化出库单位
    if (isUsingSecondUnitOutStock) {
      if (sameGroupWithSecondUnit) {
        updates = {
          std_unit_id: base_unit_id,
          std_unit_id_second: unitId,
          std_quantity: minimum_order_number
            ? toFixedOrder(
                transformOutStock(
                  +minimum_order_number,
                  unitId,
                  sku,
                  'FROM_SECONDUNIT',
                ),
              )
            : '',
          std_quantity_second: minimum_order_number,
        }
      } else {
        updates = {
          std_unit_id: unitId,
          std_unit_id_second: second_base_unit_id,
          std_quantity: minimum_order_number || '',
          std_quantity_second: minimum_order_number
            ? toFixedOrder(
                transformOutStock(
                  +minimum_order_number,
                  unitId,
                  sku,
                  'TO_SECONDUNIT',
                ),
              )
            : '',
        }
      }
    } else {
      updates = {
        std_unit_id: unitId,
        std_quantity: minimum_order_number || '',
      }
    }
    const { price, fee_unit_id, no_tax_price } = getFeePriceByUnit(
      unitId,
      prices!,
      sku?.units!,
      tax!,
    )
    Object.assign(updates, {
      unit_id: unitId,
      // 用来展示下单单位名称
      unit,
      minimum_order_number,
      price,
      no_tax_price,
      fee_unit_id,
      quantity: minimum_order_number,
    })
    const result = {
      ..._.omit(sku, ['std_unit_id', 'std_unit_id_second']),
      ...basicData,
      ...updates,
    }
    this.skuMap.set(sku_id!, result)
    return result
  }

  /** 选择下单单位后，获取单价 */
  getPriceByUnitId(skuId: string, unitId: string) {
    const sku = this.skuMap.get(skuId)
    if (!sku) {
      return '0'
    }
    const { price } = this._updateSku(sku, unitId)
    return price
  }

  submit() {
    _.forEach(this.list, (item) => {
      const { rawIndex, commodityCode, isNewItem, canChooseUnit } = item
      if (isNewItem || canChooseUnit) {
        const sku = this.skuMap.get(item.skuId!)
        if (sku) {
          const rawData = sku[this.field]
          const result = {
            ...sku,
            [this.field]: {
              ...rawData,
              quantity: {
                ...rawData?.quantity,
                val: item.count,
                unit_id: item.unitId,
              },
            },
          }
          // 进入下单页时，默认会创建一条空数据
          // 此时点击智能加单，应把空数据替换
          if (rawIndex >= 0) {
            store.updateRow(rawIndex, result)
          } else {
            store.addRow(store.list.length, { ...initSsu, ...result })
          }
        }
      } else {
        const target = store.list[rawIndex]
        if (
          target.customize_code === commodityCode &&
          target.unit_id === item.unitId
        ) {
          const rawData = target[this.field]
          const result = {
            ...rawData,
            quantity: {
              ...rawData?.quantity,
              val: item.count,
              unit_id: item.unitId,
            },
          }
          store.updateRowItem(rawIndex, this.field, result)
        }
      }
    })
  }

  /** 重置 store 数据 */
  init() {
    this.targetAmount = ''
    this.field = ADD_ORDER_VALUE_FIELD.VALUE1
    this.list = []
    this.skuMap = new Map()
  }
}

export type SmartAddFakeOrderStoreType = SmartAddFakeOrderStore
export default new SmartAddFakeOrderStore()
