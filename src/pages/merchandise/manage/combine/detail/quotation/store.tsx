import { getSkuUnitList } from '@/pages/merchandise/manage/combine/util'
import {
  BoundCombineChildrenType,
  BoundCombineDataType,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/combine/interface'
import { BatchParmas } from '../interface'
import { PagingParams } from 'gm_api/src/common'
import {
  BasicPrice,
  FilterParams,
  Ingredient,
  ListBasicPriceV2,
  ListBasicPriceV2Request,
  Sku,
  Sku_DispatchType,
  Sku_SkuType,
  BulkUpdateBasicPriceV2,
  BulkUpdateBasicPriceV2Request,
  DeleteManyBasicPriceV2,
  SetBasicPriceV2,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { Key } from 'react'
import combineStore from '../store'
import globalStore, { UnitGlobal } from '@/stores/global'
import { getChildEffectiveTime } from '@/pages/merchandise/manage/util'
import { catchUnitsFromBasicPriceV2 } from '@/common/util'

const initPagination: PagingParams = { offset: 0, limit: 10, need_count: true }

const initQuotationData = {
  basic_price_id: '',
  combineSkus: '',
  isAllSkuBound: true,
  isAllOnSale: true,
  isAllOnShelf: true,
  totalPrice: 0,
  on_shelf: false,
  quotation: '',
  items: [],
  sku_id: '',
  base_unit_id: '',
  name: '',
  customize_code: '',
  sku_type: Sku_SkuType.COMBINE,
  dispatch_type: Sku_DispatchType.ORDER,
  loss_ratio: '',
  combineItem: [],
}

class Store {
  /** -------报价单列表------ */
  /** 列表loading状态 */
  quotationLoading = false
  /** 页码信息传参数用 */
  pagination: PagingParams = _.cloneDeep(initPagination)
  /** antd 表格分页信息 */
  paging = { current: 1, pageSize: 10 }
  /** 筛选 */
  filter: FilterParams = { q: undefined, on_shelf: 0 }
  /** 组合商品列表 */
  quotationList: BoundCombineDataType[] = []
  /** 组合商品总条数 */
  quotationTotal = 0
  /** 已选择的组合商品key */
  quotationListSelectedRowKeys: Key[] = []
  /** 已选择的组合商品 */
  quotationListSelectedRows: BoundCombineDataType[] = []

  /** 需要用到的sku_id */
  skuId = ''

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setSkuId(sku_id: string) {
    this.skuId = sku_id
  }

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setQuotationListSelectedRowKeys(selectedRowKeys: Key[]) {
    this.quotationListSelectedRowKeys = selectedRowKeys
  }

  setFilter(filter: FilterParams) {
    this.filter = { ...this.filter, ...filter }
    this.getQuotationList(true)
  }

  setQuotationTotal(count: number) {
    this.quotationTotal = count
  }

  setQuotationListSelectedRows(selected: BoundCombineDataType[]) {
    this.quotationListSelectedRows = selected
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
  }

  /** 获取子商品信息 */
  getIngredientInfo(
    ingredients: Ingredient[],
    ingredient_basic_price: { [key: string]: BasicPrice },
    sku_map: { [key: string]: Sku },
    quotationId: string,
  ) {
    let isAllSkuBound = true
    let isAllOnSale = true
    let isAllOnShelf = true
    const skuNames: string[] = []
    const ingredientItems: BoundCombineChildrenType[] = []
    _.forEach(ingredients, (ingredientItem) => {
      const { sku_id, ratio, order_unit_id, on_shelf } = ingredientItem

      const isInCombine = _.find(
        sku_map[this.skuId].ingredients?.ingredients,
        (ingredientItem) => {
          return (
            ingredientItem.sku_id === sku_id &&
            ingredientItem.order_unit_id === order_unit_id
          )
        },
      )
      if (isInCombine) {
        const { on_sale } = sku_map[sku_id!]
        isAllOnSale = isAllOnSale && !!on_sale
        isAllOnShelf = isAllOnShelf && !!on_shelf

        let item: BoundCombineChildrenType = {
          fee_unit_price: { unit_id: '' },
          order_unit_id: '',
          sku_id: sku_id || '',
          name: '',
          isBound: true,
          orderUnitName: '',
          priceUnitName: '',
          ratio,
          price: 0,
          quotation_id: '',
          on_sale,
        }
        if (sku_id) {
          // 报价信息
          const ingredientPrice =
            ingredient_basic_price[`${sku_id}-${quotationId}`]

          if (ingredientPrice) {
            const priceItem = _.find(
              ingredientPrice.items?.basic_price_items,
              (item) => item.order_unit_id === order_unit_id,
            )

            if (priceItem) {
              item = {
                ...item,
                ...priceItem,
                price: Number(priceItem.fee_unit_price?.val) || 0,
              }
            } else {
              item.isBound = false
            }
          } else {
            item.isBound = false
          }

          isAllSkuBound = isAllSkuBound && item.isBound

          // 商品信息
          const ingredientSku = sku_map[sku_id]
          if (ingredientSku) {
            /** 获取单位 */
            const unitList = getSkuUnitList(ingredientSku)
            let orderUnitObj: UnitGlobal | undefined
            let priceUnitObj: UnitGlobal | undefined

            _.forEach(unitList, (unitItem) => {
              if (unitItem.unit_id === order_unit_id) {
                orderUnitObj = unitItem
              }
              if (unitItem.unit_id === item.fee_unit_price.unit_id) {
                priceUnitObj = unitItem
              }
            })

            const { name } = ingredientSku
            skuNames.push(name)
            item = {
              ...item,
              name,
              orderUnitName: orderUnitObj?.text || '',
              priceUnitName: priceUnitObj?.text || '',
            }
          }

          ingredientItems.push(item)
        }
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

  /** 获取报价单列表 */
  async getQuotationList(isResetCurrent?: boolean) {
    this.quotationLoading = true
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }
    const req: ListBasicPriceV2Request = {
      filter_params: {
        ...this.filter,
        sku_id: combineStore.skuId,
        periodic_time: `${Date.now()}`,
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
      },
      // request_data: ListBasicPriceV2Request_RequestData.SKU,
      paging: this.pagination,
    }
    ListBasicPriceV2(req)
      .then((res) => {
        const {
          sku_map = {},
          basic_prices = [],
          ingredient_basic_price = {},
          quotation_map = {},
          paging,
        } = res.response
        const list: BoundCombineDataType[] = []
        _.forEach(basic_prices, (combinePriceItem) => {
          const {
            ingredients,
            quotation_id,
            on_shelf,
            items: { basic_price_items },
          } = combinePriceItem
          let combineListItem: BoundCombineDataType =
            _.cloneDeep(initQuotationData)

          if (ingredients?.ingredients) {
            /** 子商品 */
            const {
              ingredientItems,
              skuNames,
              isAllSkuBound,
              isAllOnSale,
              isAllOnShelf,
            } = this.getIngredientInfo(
              ingredients?.ingredients,
              ingredient_basic_price,
              sku_map,
              quotation_id || '',
            )

            combineListItem = {
              ...combineListItem,
              items: ingredientItems,
              combineSkus: skuNames.join('、'),
              isAllSkuBound,
              isAllOnSale,
              isAllOnShelf,
              basic_price_id: combinePriceItem.basic_price_id,
            }
          }

          if (basic_price_items) {
            const {
              fee_unit_price: { val },
            } = basic_price_items[0]
            combineListItem = {
              ...combineListItem,
              totalPrice: Number(val),
              combineItem: basic_price_items,
            }
          }

          const combineSku = sku_map[combinePriceItem.sku_id!]
          const {
            type = Quotation_Type.WITHOUT_TIME,
            inner_name = '',
            parent_child_inner_name = '',
          } = quotation_map[quotation_id || '']
          const quotation =
            type === Quotation_Type.WITHOUT_TIME
              ? inner_name
              : `${parent_child_inner_name} ${getChildEffectiveTime(
                  quotation_map[quotation_id || ''],
                )}`
          if (combineSku) {
            combineListItem = {
              ...combineListItem,
              ...combineSku,
              on_shelf,
              quotation_id,
              quotation,
            }
          }

          list.push(combineListItem)
        })
        this.quotationList = list

        if (this.pagination.offset === 0) {
          this.setQuotationTotal(Number(paging.count) || 0)
        }

        this.quotationLoading = false
      })
      .catch(() => {
        this.quotationLoading = false
      })
  }

  /** 批量接口 */
  onBatchUpdate(batchParams: BatchParmas) {
    const params: BulkUpdateBasicPriceV2Request = {}
    if (batchParams.isAll) {
      params.filter_params = {
        ...this.filter,
        sku_id: this.skuId,
        sku_type: Sku_SkuType.COMBINE,
      }
    } else {
      params.basic_price_id = _.map(this.quotationListSelectedRows, (item) => ({
        quotation_id: item?.quotation_id!,
        sku_id: item?.sku_id!,
        unit_id: item?.base_unit_id!,
      }))
    }
    params.on_shelf = batchParams.on_shelf || undefined
    params.delete = batchParams.delete || undefined
    return BulkUpdateBasicPriceV2(params)
  }

  /** 单个组合删除商品 */
  deleteMerchandise(record: BoundCombineDataType) {
    const basic_price_ids = [
      {
        quotation_id: record.quotation_id!,
        sku_id: this.skuId,
      },
    ]
    return DeleteManyBasicPriceV2({ basic_price_ids })
  }

  /** 单个上下架组合商品 */
  ChangeStatus(record: BoundCombineDataType) {
    _.forEach(record?.combineItem, (item) => {
      item.on_shelf = !record.on_shelf
      const fee_unit_price = _.omit(item.fee_unit_price, 'price', 'quantity')
      item.fee_unit_price = fee_unit_price
    })
    const basic_prices = [
      {
        quotation_id: record.quotation_id!,
        sku_id: record.sku_id!,
        basic_price_id: record.basic_price_id!,
        on_shelf: !record.on_shelf,
        items: {
          basic_price_items: record.combineItem!,
        },
      },
    ]

    return SetBasicPriceV2({ basic_prices })
  }

  clearStore() {
    this.quotationLoading = false
    this.pagination = _.cloneDeep(initPagination)
    this.paging = { current: 1, pageSize: 10 }
    this.filter = { q: undefined, on_shelf: 0 }
    this.quotationList = []
    this.quotationListSelectedRowKeys = []
    this.quotationListSelectedRows = []
  }
}
export default new Store()
