// 单独仓库管理
import {
  BoundCombineChildrenType,
  BoundCombineDataType,
  FilterParams,
  BatchParmas,
} from './interface'
import {
  BasicPrice,
  Ingredient,
  ListBasicPriceV2,
  Sku,
  Sku_DispatchType,
  Sku_SkuType,
  BulkUpdateBasicPriceV2,
  BulkUpdateBasicPriceV2Request,
  DeleteManyBasicPriceV2,
  SetBasicPriceV2,
  ListBasicPriceV2Request,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { Key } from 'react'
import quotationStore from '@/pages/merchandise/price_manage/customer_quotation/detail/store'
import { getSkuUnitList } from '@/pages/merchandise/manage/combine/util'
import { PagingParams } from 'gm_api/src/common'
import globalStore, { UnitGlobal } from '@/stores/global'

const initCombineData = {
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
  /** -------组合商品列表------ */
  /** 列表loading状态 */
  loading = false
  /** 页码信息传参数用 */
  pagination: PagingParams = { offset: 0, limit: 10, need_count: true }
  /** antd 表格分页信息 */
  paging = { current: 1, pageSize: 10 }
  /** 筛选 */
  filter: FilterParams = { q: '', on_shelf: undefined }
  /** 组合商品列表 */
  combineSkuList: BoundCombineDataType[] = []
  /** 组合商品总条数 */
  combineTotal = 0
  /** 已选择的组合商品key */
  combineListSelectedRowKeys: Key[] = []
  /** 已选择的组合商品 */
  combineListSelectedRows: BoundCombineDataType[] = []

  /** 需要用到quotation_id */
  quotation_id = ''

  /** 列表筛选数据，用于导出 */
  listPriceReqFilter: ListBasicPriceV2Request = { paging: { limit: 1000 } }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setQuotaionId(quotation_id: string) {
    this.quotation_id = quotation_id
  }

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setCombineListSelectedRowKeys(selectedRowKeys: Key[]) {
    this.combineListSelectedRowKeys = selectedRowKeys
  }

  setFilter(filter: FilterParams) {
    this.filter = { ...this.filter, ...filter }
    this.getCombineSkuList(true)
  }

  setCount(count: number) {
    this.combineTotal = count
  }

  setCombineListSelectedRows(selected: BoundCombineDataType[]) {
    this.combineListSelectedRows = selected
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
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
      const { sku_id, ratio, order_unit_id, on_shelf } = ingredientItem
      const { on_sale } = sku_map[sku_id!]
      isAllOnSale = isAllOnSale && !!on_sale
      isAllOnShelf = isAllOnShelf && !!on_shelf
      let item: BoundCombineChildrenType = {
        fee_unit_price: { unit_id: '' },
        sku_id: sku_id || '',
        name: '',
        isBound: true,
        orderUnitName: '',
        priceUnitName: '',
        order_unit_id: '',
        ratio,
        price: 0,
        on_sale,
      }
      if (sku_id) {
        // 报价信息
        const ingredientPrice =
          ingredient_basic_price[`${sku_id}-${quotationStore.quotation_id}`]
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
    })
    return {
      skuNames,
      isAllSkuBound,
      isAllOnSale,
      isAllOnShelf,
      ingredientItems,
    }
  }

  /** 获取组合商品列表 */
  async getCombineSkuList(isResetCurrent?: boolean) {
    this.loading = true
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }
    const req = {
      filter_params: {
        ...this.filter,
        quotation_id: this.quotation_id,
        sku_type: Sku_SkuType.COMBINE,
      },
      // request_data: ListBasicPriceV2Request_RequestData.SKU,
      paging: this.pagination,
    }

    this.listPriceReqFilter = req

    ListBasicPriceV2(req as any)
      .then((res) => {
        const {
          sku_map = {},
          basic_prices = [],
          ingredient_basic_price = {},
          paging,
        } = res.response
        const combineList: BoundCombineDataType[] = []
        _.forEach(basic_prices, (combinePriceItem) => {
          const {
            ingredients,
            on_shelf,
            items: { basic_price_items },
          } = combinePriceItem
          let combineListItem: BoundCombineDataType =
            _.cloneDeep(initCombineData)

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
              combineItem: basic_price_items, // combineItems是组合商品自己的fee_unit_type那些东西
            }
          }

          const combineSku = sku_map[combinePriceItem.sku_id!]
          if (combineSku) {
            combineListItem = {
              ...combineListItem,
              ...combineSku,
              on_shelf,
            }
          }
          combineList.push(combineListItem)
        })
        this.combineSkuList = combineList

        if (this.pagination.offset === 0) {
          this.setCount(Number(paging.count) || 0)
        }
        this.loading = false
      })
      .catch(() => {
        this.loading = false
      })
  }

  /** 批量接口 */
  onBatchUpdate(batchParams: BatchParmas) {
    const params: BulkUpdateBasicPriceV2Request = {}
    if (batchParams.isAll) {
      params.filter_params = {
        ...this.filter,
        quotation_id: this.quotation_id,
        sku_type: Sku_SkuType.COMBINE,
      }
    } else {
      params.basic_price_id = _.map(this.combineListSelectedRows, (item) => ({
        quotation_id: this.quotation_id,
        sku_id: item?.sku_id,
        unit_id: item?.base_unit_id,
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
        quotation_id: this.quotation_id,
        sku_id: record.sku_id,
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
        quotation_id: this.quotation_id,
        sku_id: record?.sku_id!,
        basic_price_id: record?.basic_price_id!,
        on_shelf: !record.on_shelf,
        items: {
          basic_price_items: record.combineItem!,
        },
      },
    ]

    return SetBasicPriceV2({ basic_prices })
  }

  clearStore() {
    this.loading = false
    this.pagination = { offset: 0, limit: 10, need_count: true }
    this.paging = { current: 1, pageSize: 10 }
    this.filter = { q: '', on_shelf: undefined }
    this.combineSkuList = []
    // this.combineTotal = 0
    this.combineListSelectedRowKeys = []
    this.combineListSelectedRows = []
    this.quotation_id = ''
  }
}

export default new Store()
