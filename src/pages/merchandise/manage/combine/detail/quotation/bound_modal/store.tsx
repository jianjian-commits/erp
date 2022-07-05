// 单独仓库管理
import {
  BoundCombineChildrenType,
  BoundCombineDataType,
  BoundTableFormFieldsItem,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/combine/interface'
import globalStore, { UnitGlobal } from '@/stores/global'
import {
  BasicPrice,
  DeltaUpdateBasicPriceV2,
  ListBasicPriceV2,
  ListSkuForBindingQuotation,
  Quotation,
  Quotation_Type,
  Sku,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

import { makeAutoObservable } from 'mobx'
import { Key } from 'react'
import combineStore from '../../store'
import {
  getCombineUnitRate,
  getPriceUnitList,
  getSkuUnitList,
} from '@/pages/merchandise/manage/combine/util'
import { getChildEffectiveTime } from '@/pages/merchandise/manage/util'

class Store {
  /** 列表loading状态 */
  loading = false
  /** 商品 */
  skuMap: { [key: string]: Sku } = {}

  /** 组成商品报价单相关信息 */
  basicPrices: BasicPrice[] = []
  /** 关联组合商品勾选值 */
  selectedRows: Quotation[] = []
  selectedRowKeys: Key[] = []
  /** 关联组合商品第二步列表数据 */
  boundTableList: BoundCombineDataType[] = []
  /** 第二步表单数据 */
  boundFormFields: { [key: string]: BoundTableFormFieldsItem } = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 更新绑定组合商品弹窗数据 */
  async setBindSelected(quotation: Quotation[], keys: Key[]) {
    this.selectedRows = quotation
    this.selectedRowKeys = keys
    if (quotation.length) {
      const quotationIdList: string[] = []
      _.forEach(quotation, (quotationItem) => {
        const { quotation_id } = quotationItem
        quotationIdList.push(quotation_id)
      })

      const skuIdList: string[] = []
      if (combineStore.sku.ingredients?.ingredients) {
        _.forEach(
          combineStore.sku.ingredients.ingredients,
          (ingredientItem) => {
            if (ingredientItem.sku_id) {
              skuIdList.push(ingredientItem.sku_id)
            }
          },
        )
      }

      return await this.getSkuInfo(quotationIdList, skuIdList)
    }
  }

  /** 获取报价单中已有商品信息 */
  async getSkuInfo(quotationIds: string[], skuIds: string[]) {
    const { skus = [] } = await this.getSkuQuotationStatus(quotationIds, skuIds)

    this.skuMap = _.keyBy(skus, 'sku_id')

    return await ListBasicPriceV2({
      filter_params: {
        quotation_ids: quotationIds,
        sku_ids: [...skuIds],
      },
      paging: {
        offset: 0,
        limit: quotationIds.length * (skuIds.length + 1),
      },
    }).then((json) => {
      const { basic_prices = [], quotation_map = {} } = json.response
      return this.getBoundTableList(basic_prices)
    })
  }

  /** 获取组成商品在报价单中的绑定状态 */
  getSkuQuotationStatus(quotationIds: string[], skuIds: string[]) {
    return ListSkuForBindingQuotation({
      filter_params: {
        quotation_ids: quotationIds,
        sku_ids: [...skuIds, combineStore.skuId],
      },
      paging: {
        offset: 0,
        limit: quotationIds.length * (skuIds.length + 1),
      },
    }).then((json) => {
      return json.response
    })
  }

  /** 获取绑定报价单第二步列表数据 */
  getBoundTableList(basic_prices: BasicPrice[]) {
    this.boundTableList = []
    this.basicPrices = []
    this.boundFormFields = {}

    const errorList: { skuName: string; quotationName: string }[] = []

    _.forEach(this.selectedRows, (rowItem) => {
      const {
        inner_name = '',
        parent_child_inner_name = '',
        type,
        quotation_id,
      } = rowItem

      const quotationName =
        type === Quotation_Type.WITHOUT_TIME
          ? inner_name
          : `${parent_child_inner_name} ${getChildEffectiveTime(rowItem)}`

      let isAllSkuBound = true
      const items: BoundCombineChildrenType[] = []
      const combinSkus: string[] = []
      let totalPrice = 0

      if (combineStore.sku.ingredients?.ingredients) {
        _.forEach(
          combineStore.sku.ingredients.ingredients,
          (ingredientItem) => {
            const { sku_id, ratio, order_unit_id = '' } = ingredientItem

            if (sku_id && sku_id !== '0') {
              const ingredientSku = this.skuMap[sku_id]
              const { name } = ingredientSku

              // 获取单位
              const unitList = getSkuUnitList(ingredientSku)
              const unitItem = _.find(
                [...unitList, ...globalStore.unitList],
                (item) => {
                  return item.unit_id === order_unit_id
                },
              )

              const orderUnitName = unitItem?.text || ''

              // 是否绑定报价单，及价格信息
              let isBound = true
              let price = 0
              const basicPrices = _.find(basic_prices, (priceItem) => {
                return (
                  priceItem.quotation_id === quotation_id &&
                  priceItem.sku_id === ingredientItem.sku_id
                )
              })

              const priceUnitList = getPriceUnitList(
                ingredientSku,
                unitList,
                order_unit_id,
              )

              let priceUnitObj: UnitGlobal | undefined
              let orderUnitObj: UnitGlobal | undefined
              let feeUnitPrice = { unit_id: '' }

              if (basicPrices) {
                const {
                  items: { basic_price_items = [] },
                } = basicPrices

                /** 商品在报价单与组合商品中单位相同的 价格/单位 */
                const basicPrice = _.find(
                  basic_price_items,
                  (unitPriceItem) => {
                    return unitPriceItem.order_unit_id === order_unit_id
                  },
                )

                /** 报价单中同一商品已存在20个不同 价格/单位 */
                if (basic_price_items.length >= 20 && !basicPrice) {
                  isAllSkuBound = false
                  isBound = false
                  errorList.push({
                    skuName: name,
                    quotationName: quotationName,
                  })
                }

                if (basicPrice) {
                  const { fee_unit_price } = basicPrice
                  if (fee_unit_price) {
                    const { val, unit_id } = fee_unit_price
                    feeUnitPrice = _.cloneDeep(fee_unit_price)

                    _.forEach(priceUnitList, (unitItem) => {
                      if (unitItem.unit_id === order_unit_id) {
                        orderUnitObj = _.cloneDeep(unitItem)
                      }
                      if (unitItem.unit_id === unit_id) {
                        priceUnitObj = _.cloneDeep(unitItem)
                      }
                    })

                    const rate = getCombineUnitRate(
                      orderUnitObj as UnitGlobal,
                      priceUnitObj as UnitGlobal,
                      ingredientSku!,
                    )

                    const itemPrice =
                      Math.round(Number(val) * 100) *
                      Math.round(Number(ratio) * 10000) *
                      rate

                    totalPrice =
                      Math.round((totalPrice * 1000000 + itemPrice) / 10000) /
                      100
                    price = Number(val)
                  }
                } else {
                  const basicIndex = _.findIndex(
                    this.basicPrices,
                    (priceItem) => {
                      return priceItem.sku_id === sku_id
                    },
                  )
                  if (basicIndex === -1) {
                    this.basicPrices.push(basicPrices)
                  }

                  isAllSkuBound = false
                  isBound = false
                }
              } else {
                isAllSkuBound = false
                isBound = false
              }

              if (!isBound) {
                this.boundFormFields[`${sku_id}_${quotation_id}`] = {
                  price: undefined,
                  fee_unit_price: { unit_id: order_unit_id },
                }
              }

              // 获取组成商品名称列表
              combinSkus.push(name)

              // 组成商品列表
              items.push({
                fee_unit_price: feeUnitPrice,
                sku_id,
                quotation_id,
                order_unit_id,
                isBound,
                name,
                ratio,
                orderUnitName,
                priceUnitName: priceUnitObj?.text || '',
                price,
                priceUnitList,
              })
            }
          },
        )
      }
      this.boundTableList.push({
        ...combineStore.sku,
        isAllSkuBound,
        items,
        totalPrice,
        quotation_id,
        quotation: quotationName,
        combineSkus: '',
      })
    })

    return errorList
  }

  /** 更新组合商品单价 */
  setBoundListTotalPrice(value: { [key: string]: BoundTableFormFieldsItem }) {
    const key = _.keys(value)[0]
    const idList = key.split('_')
    const skuId = idList[0]
    const quotationId = idList[1]

    const newList = _.map(this.boundTableList, (tableItem) => {
      let newtotalPrice = 0
      if (tableItem.items.length) {
        _.map(tableItem.items, (childItem, index) => {
          const { sku_id, ratio, quotation_id, order_unit_id, priceUnitList } =
            childItem

          if (sku_id === skuId && quotation_id === quotationId) {
            const { price, fee_unit_price } = value[key]
            childItem.price = price
            childItem.fee_unit_price = fee_unit_price
            tableItem.items[index].price = price
            tableItem.items[index].fee_unit_price = fee_unit_price
          }

          let priceUnitObj: UnitGlobal | undefined
          let orderUnitObj: UnitGlobal | undefined

          _.forEach(priceUnitList, (unitItem) => {
            if (unitItem.unit_id === order_unit_id) {
              orderUnitObj = _.cloneDeep(unitItem)
            }
            if (unitItem.unit_id === childItem.fee_unit_price.unit_id) {
              priceUnitObj = _.cloneDeep(unitItem)
            }
          })

          if (priceUnitObj && orderUnitObj) {
            const ingredientSku = this.skuMap[sku_id]

            const rate = getCombineUnitRate(
              orderUnitObj as UnitGlobal,
              priceUnitObj as UnitGlobal,
              ingredientSku,
            )
            const itemPrice =
              Math.round(Number(childItem.price) * 100) *
              Math.round(Number(ratio) * 10000) *
              rate

            newtotalPrice =
              Math.round((newtotalPrice * 1000000 + itemPrice) / 10000) / 100
          }
        })
      }
      return { ...tableItem, totalPrice: newtotalPrice }
    })
    this.boundTableList = newList
  }

  /** 提交组合商品绑定报价单事件 */
  submitBoundQuotation() {
    const newBasicPrices: BasicPrice[] = []
    const combineBasicPrice: BasicPrice[] = []
    _.forEach(this.boundTableList, (combineItem) => {
      const { quotation_id } = combineItem
      _.forEach(combineItem.items, (skuItem) => {
        const { sku_id, order_unit_id, price, fee_unit_price, isBound } =
          skuItem
        if (!isBound) {
          const item = {
            on_shelf: true,
            order_unit_id,
            fee_unit_price: {
              ...fee_unit_price,
              val: price + '',
            },
            minimum_order_number: '1',
          }

          newBasicPrices.push({
            basic_price_id: '0',
            sku_id,
            quotation_id,
            items: {
              basic_price_items: [item],
            },
          })
        }
      })

      const { base_unit_id, totalPrice } = combineItem
      combineBasicPrice.push({
        basic_price_id: '0',
        sku_id: combineItem.sku_id,
        quotation_id: quotation_id,
        items: {
          basic_price_items: [
            {
              minimum_order_number: '1',
              on_shelf: true,
              order_unit_id: base_unit_id,
              fee_unit_price: {
                unit_id: base_unit_id,
                val: totalPrice + '',
              },
            },
          ],
        },
      })
    })
    return DeltaUpdateBasicPriceV2({
      basic_prices: combineBasicPrice,
      ingredient_basic_prices: newBasicPrices,
    })
  }

  clearStore() {
    this.skuMap = {}
    this.basicPrices = []
    this.selectedRows = []
    this.selectedRowKeys = []
    this.boundTableList = []
    this.boundFormFields = {}
  }
}

export default new Store()
