// 单独仓库管理
import {
  BoundCombineChildrenType,
  BoundCombineDataType,
  BoundTableFormFieldsItem,
} from '../interface'
import globalStore, { UnitGlobal } from '@/stores/global'
import {
  BasicPrice,
  DeltaUpdateBasicPriceV2,
  Ingredient,
  ListBasicPriceV2,
  ListSkuForBindingQuotation,
  Sku,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

import { makeAutoObservable } from 'mobx'
import { Key } from 'react'
import quotationStore from '@/pages/merchandise/price_manage/customer_quotation/detail/store'
import {
  getCombineUnitRate,
  getPriceUnitList,
  getSkuUnitList,
} from '@/pages/merchandise/manage/combine/util'

class Store {
  /** --------- 关联组合商品弹窗 ------- */
  /** 组成商品 */
  skuMap: { [key: string]: Sku } = {}
  /** 已绑定报价单的组成商品 */
  boundSkuIds: string[] = []
  /** 组成商品报价单相关信息 */
  basicPrices: BasicPrice[] = []
  /** 关联组合商品勾选值 */
  selectedRows: Sku[] = []
  selectedRowKeys: Key[] = []
  /** 关联组合商品第二步列表数据 */
  boundTableList: BoundCombineDataType[] = []
  /** 第二步表单数据 */
  boundFormFields: { [key: string]: BoundTableFormFieldsItem } = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 获取子商品信息 */
  getIngredientInfo(
    ingredients: Ingredient[],
    ingredient_basic_price: { [key: string]: BasicPrice },
    sku_map: { [key: string]: Sku },
  ) {
    let isAllSkuBound = true
    let isAllOnSale = true
    let isAllOnShelf = true
    const skuNames: string[] = []
    const ingredientItems: BoundCombineChildrenType[] = []
    _.forEach(ingredients, (ingredientItem) => {
      const { sku_id, ratio, order_unit_id, on_sale, on_shelf } = ingredientItem
      isAllOnSale = isAllOnSale && !!on_sale
      isAllOnShelf = isAllOnShelf && !!on_shelf
      let item = {
        fee_unit_price: {
          unit_id: '',
        },
        sku_id: sku_id || '',
        name: '',
        isBound: true,
        unitName: '',
        ratio,
        price: 0,
      }
      if (sku_id) {
        // 报价信息
        const ingredientPrice =
          ingredient_basic_price[`${sku_id}-${quotationStore.quotation_id}`]
        if (!ingredientPrice) {
          item.isBound = false
        } else {
          const ingredientBasicPrice =
            ingredientPrice.items?.basic_price_items || []
          item = {
            ...item,
            ...ingredientBasicPrice[0],
            price: Number(ingredientBasicPrice[0].fee_unit_price?.val) || 0,
          }
        }
        isAllSkuBound = isAllSkuBound && item.isBound

        // 商品信息
        const ingredientSku = sku_map[sku_id]
        if (ingredientSku) {
          /** 获取单位 */
          const unitList = getSkuUnitList(ingredientSku)
          const unitObj = _.find(unitList, (unitItem) => {
            return unitItem.unit_id === order_unit_id
          })

          const { name } = ingredientSku
          skuNames.push(name)
          item = {
            ...item,
            name,
            unitName: unitObj?.text || '',
          }
        }
        ingredientItems.push(item)
      }
    })
    return {
      skuNames,
      isAllSkuBound,
      isAllOnSale,
      isAllOnShelf,
      ingredientItems,
    }
  }

  /** 更新绑定组合商品弹窗数据 */
  async setBindSelected(sku: Sku[], keys: Key[]) {
    this.selectedRows = sku
    this.selectedRowKeys = keys
    if (sku.length) {
      const idList: string[] = []
      _.forEach(sku, (skuItem) => {
        const { ingredients } = skuItem
        if (ingredients?.ingredients?.length) {
          _.forEach(ingredients.ingredients, (ingredientItem) => {
            idList.push(ingredientItem.sku_id!)
          })
        }
      })
      return await this.getSkuInfo(idList)
    }
  }

  /** 获取报价单中已有商品信息 */
  async getSkuInfo(ids: string[]) {
    const { bound_sku_ids = [], skus = [] } = await this.getSkuQuotationStatus(
      ids,
    )
    this.boundSkuIds = bound_sku_ids
    return await ListBasicPriceV2({
      filter_params: {
        sku_ids: ids,
        quotation_id: quotationStore.quotation_id,
      },
      paging: {
        offset: 0,
        limit: ids.length,
      },
    }).then((json) => {
      const { sku_map = {}, basic_prices = [] } = json.response
      const newSkuMap: { [key: string]: Sku } = _.cloneDeep(sku_map)
      _.forEach(skus, (skuItem) => {
        const { sku_id } = skuItem
        if (!bound_sku_ids.includes(sku_id)) {
          newSkuMap[sku_id] = skuItem
        }
      })

      this.skuMap = newSkuMap
      return this.getBoundTableList(basic_prices || [])
    })
  }

  /** 获取组成商品在报价单中的绑定状态 */
  getSkuQuotationStatus(ids: string[]) {
    return ListSkuForBindingQuotation({
      filter_params: {
        sku_ids: ids,
        quotation_id: quotationStore.quotation_id,
      },
      paging: {
        offset: 0,
        limit: ids.length,
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
      let isAllSkuBound = true
      const items: BoundCombineChildrenType[] = []
      const combinSkus: string[] = []
      let totalPrice = 0

      if (rowItem.ingredients?.ingredients) {
        _.forEach(rowItem.ingredients.ingredients, (ingredientItem) => {
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

            /** 报价单中同一商品所有 价格/单位 */
            const basicPrices = _.find(basic_prices, (priceItem) => {
              return priceItem.sku_id === sku_id
            })

            const priceUnitList = getPriceUnitList(
              ingredientSku,
              unitList,
              order_unit_id,
            )

            let priceUnitObj: UnitGlobal | undefined
            let orderUnitObj: UnitGlobal | undefined
            let feeUnitPrice = { unit_id: '' }

            // 已绑定报价单，获取价格信息
            if (basicPrices) {
              const {
                items: { basic_price_items = [] },
              } = basicPrices

              /** 商品在报价单与组合商品中单位相同的 价格/单位 */
              const basicPrice = _.find(basic_price_items, (unitPriceItem) => {
                return unitPriceItem.order_unit_id === order_unit_id
              })

              /** 报价单中同一商品已存在20个不同 价格/单位 */
              if (basic_price_items.length >= 20 && !basicPrice) {
                isAllSkuBound = false
                isBound = false
                errorList.push({
                  skuName: name,
                  quotationName: quotationStore.quotation.inner_name || '',
                })
              }

              /** 价格信息 */
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
                    Math.round((totalPrice * 1000000 + itemPrice) / 10000) / 100
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
              this.boundFormFields[`${sku_id}_${order_unit_id}`] = {
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
              order_unit_id,
              quotation_id: quotationStore.quotation_id,
              isBound,
              name,
              ratio,
              orderUnitName,
              priceUnitName: priceUnitObj?.text || '',
              price,
              priceUnitList,
            })
          }
        })
      }

      this.boundTableList.push({
        ...rowItem,
        isAllSkuBound,
        items,
        totalPrice,
        combineSkus: combinSkus.join('、'),
      })
    })

    return errorList
  }

  /** 更新组合商品单价 */
  setBoundListTotalPrice(value: { [key: string]: BoundTableFormFieldsItem }) {
    const key = _.keys(value)[0]
    const idList = key.split('_')
    const skuId = idList[0]
    const unitId = idList[1]

    const newList = _.map(this.boundTableList, (tableItem) => {
      let newtotalPrice = 0
      if (tableItem.items.length) {
        _.map(tableItem.items, (childItem, index) => {
          const { sku_id, order_unit_id, ratio, priceUnitList } = childItem

          if (sku_id === skuId && order_unit_id === unitId) {
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
      _.forEach(combineItem.items, (skuItem) => {
        const { sku_id, order_unit_id, price, isBound, fee_unit_price } =
          skuItem
        if (!isBound) {
          /** 报价单中同一商品所有 价格/单位 */
          const item = {
            on_shelf: true,
            order_unit_id,
            fee_unit_price: {
              ...fee_unit_price,
              val: price + '',
            },
            minimum_order_number: '1',
          }
          const basicPriceIndex = _.findIndex(newBasicPrices, (priceItem) => {
            return priceItem.sku_id === sku_id
          })

          if (basicPriceIndex >= 0) {
            const itemIndex = _.findIndex(
              newBasicPrices[basicPriceIndex].items.basic_price_items,
              (childItem) => {
                return childItem.order_unit_id === item.order_unit_id
              },
            )
            if (itemIndex < 0) {
              newBasicPrices[basicPriceIndex].items.basic_price_items.push(item)
            }
          } else {
            newBasicPrices.push({
              basic_price_id: '0',
              sku_id,
              quotation_id: quotationStore.quotation_id,
              items: {
                basic_price_items: [item],
              },
            })
          }
        }
      })

      const { base_unit_id, totalPrice } = combineItem
      combineBasicPrice.push({
        basic_price_id: '0',
        sku_id: combineItem.sku_id,
        quotation_id: quotationStore.quotation_id,
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
    this.boundSkuIds = []
    this.basicPrices = []
    this.selectedRows = []
    this.selectedRowKeys = []
    this.boundTableList = []
    this.boundFormFields = {}
  }
}

export default new Store()
