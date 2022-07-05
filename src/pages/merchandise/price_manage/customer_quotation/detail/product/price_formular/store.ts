import {
  ChildrenType,
  DataType,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import { PagingParams } from 'gm_api/src/common'
import {
  BasicPrice,
  BasicPriceItem,
  CalBasicPriceV2ByPricingFormula,
  DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo,
  ListBasicPriceV2,
  ListBasicPriceV2Request_RequestData,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import { makeAutoObservable } from 'mobx'
import { Key } from 'react'
import { FilterType } from '../store'
import baseStore from '../../store'
import { getUnitGroupList } from '@/pages/merchandise/util'
import { DataNode } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import _ from 'lodash'

export type TableList = Omit<BasicPrice, 'items' | 'type'> & DataType

export type FormularParams = Pick<
  BasicPriceItem,
  'pricing_type' | 'formula_text' | 'price_intervals'
>

const initPagination = { offset: 0, limit: 10, need_count: true }
const initPaing = { current: 1, pageSize: 10 }
const initFilter = { category_id: '00', on_shelf: 0, q: '' }

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 商品列表数据 */
  list: TableList[] = []

  /**
   * 手动改的价格
   */
  modifyList: Required<DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo>[] =
    []

  treeData: DataNode[] = []

  /** 筛选框的值 */
  filter: FilterType = initFilter

  /** 商品总数 */
  count = 0

  /** 列表loading状态 */
  loading = false

  /** 页码信息传参数用 */
  pagination: PagingParams = { ...initPagination }

  /** antd 表格分页信息 */
  paging = { ...initPaing }

  /** 展开的Id集合 */
  expandedRowKeys: readonly Key[] = []

  // 记录删除的行
  deleteRow: string[] = []

  /**
   * 删除的sku
   */
  deleteSku: string[] = []

  selected: ChildrenType[] = []

  setExpandedRowKeys(keys: readonly Key[]) {
    this.expandedRowKeys = keys
  }

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
  }

  setFilter(filter: FilterType) {
    this.filter = { ...this.filter, ...filter }
    this.fetchList(undefined, true)
  }

  setDeleteRow = (id: string | string[]) => {
    typeof id === 'string'
      ? this.deleteRow.push(id)
      : this.deleteRow.push(...id)
  }

  setSelected = (selected: ChildrenType[]) => (this.selected = selected)

  setModifyList = (
    param: Required<DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo>,
  ) => {
    const target = this.modifyList.find(
      (item) =>
        item.sku_id === param.sku_id &&
        item.order_unit_id === param.order_unit_id,
    )
    target ? (target.price = param.price) : this.modifyList.push(param)
  }

  get tableList(): TableList[] {
    const newList: TableList[] = []
    this.list.forEach((sku) => {
      // @ts-ignore
      const items = sku.items.filter(
        (item) => !this.deleteRow.includes(item.id),
      )
      if (items.length > 0) {
        newList.push({
          ...sku,
          items: items,
        })
      } else {
        !this.deleteSku.includes(sku.sku_id!) &&
          this.deleteSku.push(sku.sku_id!)
      }
    })
    return newList
  }

  get skuIds() {
    return _.uniq(this.selected.map((s) => s.parentId))
  }

  get realCount() {
    return this.count - this.deleteSku.length
  }

  /**
   * @description:
   * @param {string} skuId
   * @param {string} unitId
   * @param {string} val
   * @return {*}
   */
  getFeeUnitPrice = (skuId: string, unitId: string, val: string) => {
    const pre = _.find(
      _.find(this.tableList, (bp) => bp.sku_id === skuId)?.items,
      (bpi) => bpi.order_unit_id === unitId,
    )?.fee_unit_price.val
    if (!pre) return val
    return pre === val ? val : pre
  }

  init() {
    this.list = []
    this.deleteRow = []
    this.modifyList = []
    this.pagination = { ...initPagination }
    this.paging = { ...initPaing }
    this.filter = initFilter
  }

  /** 获取分类树的方法 */
  async getTreeData() {
    const { categoryMap, categoryTreeData } = await fetchTreeData()
    // this.treeDataMap = categoryMap
    this.treeData = categoryTreeData
  }

  /**
   * @description:
   * @param {FormularParams} formularParams
   * @param {boolean} isResetCurrent
   * @return {*}
   */
  async fetchList(formularParams?: FormularParams, isResetCurrent?: boolean) {
    const { category_id } = this.filter
    this.loading = true
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }
    const req = {
      filter_params: {
        ...this.filter,
        category_id: category_id === '00' ? undefined : category_id,
        quotation_id: baseStore.quotation_id,
        sku_type: Sku_SkuType.NOT_PACKAGE,
        ...(this.skuIds ? { skuIds: this.skuIds } : {}),
      },
      request_data: ListBasicPriceV2Request_RequestData.SKU,
      paging: this.pagination,
    }

    const originList = await ListBasicPriceV2(req)
      .then((json) => json.response)
      .finally(() => {
        this.loading = false
      })
    if (originList.basic_prices?.length) {
      const basic_prices = formularParams
        ? originList.basic_prices.map((bps) => ({
            ...bps,
            items: {
              basic_price_items: bps.items.basic_price_items.map((bp) => ({
                ...bp,
                ...formularParams,
              })),
            },
          }))
        : originList.basic_prices
      const basicPriceWithCalPrice = await CalBasicPriceV2ByPricingFormula({
        basic_prices: basic_prices,
      })
        .then((json) => json.response.basic_prices)
        .finally(() => {
          this.loading = false
        })

      const { sku_map = {}, paging } = originList
      this.list = basicPriceWithCalPrice!.reduce((pre, cur) => {
        const { sku_id = '', items } = cur
        const { name, repeated_field, customize_code } = sku_map[sku_id]
        // 将外层没选择的sku过滤掉
        const basic_price_items =
          this.skuIds.length > 0
            ? items?.basic_price_items?.filter(({ order_unit_id }) =>
                _.find(this.selected, {
                  parentId: sku_id,
                  order_unit_id: order_unit_id,
                }),
              )
            : items?.basic_price_items
        return [
          ...pre,
          {
            ...cur,
            id: sku_id,
            images: repeated_field?.images![0],
            name,
            customize_code,
            items:
              basic_price_items?.map((item) => ({
                ...item,
                id: item.order_unit_id + '/' + sku_id,
                parentId: sku_id,
                units: getUnitGroupList(sku_map[sku_id]),
                fee_unit_price: {
                  ...item.fee_unit_price,
                  val: this.getFeeUnitPrice(
                    sku_id,
                    item.order_unit_id,
                    item.fee_unit_price.val || '',
                  ),
                },
                // 根据公式计算前的价格
                fee_unit_price_origin: {
                  ...item.fee_unit_price,
                  val: _.find(
                    _.find(
                      originList.basic_prices,
                      (bp) => bp.sku_id === sku_id,
                    )?.items.basic_price_items,
                    (bpi) => bpi.order_unit_id === item.order_unit_id,
                  )?.fee_unit_price.val,
                },
              })) || [],
          },
        ]
      }, []) as unknown as TableList[]
      this.expandedRowKeys = this.list.map((item) => item.id)
      /** 后台业务上只有在第一页的时候，才会返回count */
      if (this.pagination.offset === 0) {
        this.count = Number(paging.count || '0')
      }
    } else {
      this.list = []
      this.expandedRowKeys = []
    }
  }
}

export default new Store()
