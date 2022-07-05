import { Key } from 'react'
import { makeAutoObservable } from 'mobx'
import {
  ListBasicPriceV2,
  ListBasicPriceV2Request_RequestData,
  SetBasicPriceV2,
  DeleteManyBasicPriceV2,
  Sku_SkuType,
  ListBasicPriceV2Request,
  Sku,
  DeltaUpdateBasicPriceV2ByPricingFormulaResponse,
  DeltaUpdateBasicPriceV2ByPricingFormula,
  BatchPresetPricingFormula,
  GetSkuReferencePrices,
  Quotation_Type,
  ReferencePrice_ReferencePriceMap,
  GetSkuReferencePricesResponse_ReferencePrices,
  GetSkuReferencePricesRequest_Filter,
} from 'gm_api/src/merchandise'
import baseStore from '../store'
import { getUnitGroupList } from '@/pages/merchandise/util'
import {
  ChildrenType,
  DataType,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import { PagingParams } from 'gm_api/src/common'
import { fetchTreeData } from '@/common/service'
import { DataNode, DataNodeMap } from '@/common/interface'
import { PresetFormValues } from '@/pages/merchandise/components/formular_modal/formular_modal'
import _ from 'lodash'

export type FilterType = {
  q: string
  on_shelf?: number
  bp_on_shelf_type_list?: number[]
  category_id: string
}

class ListStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clearStore() {
    this.list = []
    this.filter = {
      category_id: '00',
      on_shelf: 0,
      q: '',
    }
    this.selected = []
    this.expandedRowKeys = []
    this.selectedRowKeys = []
    this.treeData = []
    this.treeDataMap = {}
    this.pagination = { offset: 0, limit: 10, need_count: true }
    this.paging = { current: 1, pageSize: 10 }
    this.skuMap = {}
  }

  /** 分类树的数据 */
  treeData: DataNode[] = []

  /** 分类树的Map */
  treeDataMap: DataNodeMap = {}

  /** 商品列表数据 */
  list: DataType[] = []

  /** 商品总数 */
  count = 0

  /** 列表loading状态 */
  loading = false

  /** 勾选值 */
  selectedRowKeys: Key[] = []

  /** 已选择的商品items，非商品 */
  selected: ChildrenType[] = []

  /** 最近报价|最近采购价|最近入库价 */
  priceOf: keyof GetSkuReferencePricesResponse_ReferencePrices =
    'quotation_reference_prices'

  /** 展开的Id集合 */
  expandedRowKeys: readonly Key[] = []

  /** 筛选框的值 */
  filter: FilterType = {
    category_id: '00',
    on_shelf: 0,
    q: '',
  }

  /** 页码信息传参数用 */
  pagination: PagingParams = { offset: 0, limit: 10, need_count: true }

  /** antd 表格分页信息 */
  paging = { current: 1, pageSize: 10 }

  /** 列表筛选数据，用于导出 */
  listPriceReqFilter: ListBasicPriceV2Request = { paging: { limit: 1000 } }

  /** 当前页商品Map */
  skuMap: { [key: string]: Sku } = {}

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setSelectedRowKeys(selectedRowKeys: Key[]) {
    this.selectedRowKeys = selectedRowKeys
  }

  setFilter(filter: FilterType) {
    this.filter = { ...this.filter, ...filter }
    return this.fetchList(undefined, true)
  }

  setCount(count: number) {
    this.count = count
  }

  setSelected(selected: ChildrenType[]) {
    this.selected = selected
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
  }

  setExpandedRowKeys(keys: readonly Key[]) {
    this.expandedRowKeys = keys
  }

  /** 获取分类树的方法 */
  async getTreeData() {
    const { categoryMap, categoryTreeData } = await fetchTreeData()
    this.treeDataMap = categoryMap
    this.treeData = categoryTreeData
  }

  /**
   * 获取报价单下商品列表
   * @param quotation_id 报价单Id
   * @param isResetCurrent 页码是否重置为1
   */
  async fetchList(quotation_id?: string, isResetCurrent?: boolean) {
    const { category_id } = this.filter
    this.loading = true
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }

    const filter = _.cloneDeep(this.filter)

    const { on_shelf } = filter
    if (on_shelf) {
      filter.bp_on_shelf_type_list = [on_shelf, 3]
      delete filter.on_shelf
    }

    const req = {
      filter_params: {
        ...filter,
        category_id: category_id === '00' ? undefined : category_id,
        quotation_id: quotation_id || baseStore.quotation_id,
        sku_type: Sku_SkuType.NOT_PACKAGE,
      },
      request_data: ListBasicPriceV2Request_RequestData.SKU,
      paging: this.pagination,
    }

    this.listPriceReqFilter = req

    const res = await ListBasicPriceV2(req)
    const { sku_map = {}, basic_prices = [], paging } = res.response

    this.skuMap = sku_map

    const list = basic_prices.map((item) => {
      const { sku_id = '', items } = item
      const { name, repeated_field, customize_code } = sku_map[sku_id]

      return {
        id: sku_id,
        images: repeated_field?.images![0],
        name,
        customize_code,
        items:
          items?.basic_price_items?.map((item) => ({
            ...item,
            id: item.order_unit_id + '/' + sku_id,
            parentId: sku_id,
            units: getUnitGroupList(sku_map[sku_id]),
          })) || [],
      }
    })

    this.list = list || []
    this.expandedRowKeys = list.map((item) => item.id)
    this.selected = []
    this.selectedRowKeys = []
    /** 后台业务上只有在第一页的时候，才会返回count */
    if (this.pagination.offset === 0) {
      this.count = Number(paging.count || '0')
    }
    this.loading = false
  }

  /**
   * 提交绑定商品条目 与 删除条目共用
   */
  onSubmit(data: ChildrenType[], sku_id: string) {
    const params = {
      basic_prices: [
        {
          quotation_id: baseStore.quotation_id,
          sku_id,
          items: {
            basic_price_items: data.map((m) => ({
              order_unit_id: Number(m.order_unit_id),
              minimum_order_number: String(m.minimum_order_number),
              fee_unit_price: {
                val: String(m.fee_unit_price.val || '0'),
                unit_id: m.fee_unit_price.unit_id,
              },
              on_shelf: m.on_shelf,
              pricing_formula: m.pricing_formula,
              pricing_type: m.pricing_type,
              formula_text: m.formula_text,
              price_intervals: m.price_intervals,
              current_price: m.current_price,
            })),
          },
        },
      ],
    }
    return SetBasicPriceV2(params as any)
  }

  /**
   * @description: 提交预设公式
   * @param {PresetFormValues} data
   * @return {*}
   */
  onPresetSubmit(
    isAll: boolean,
    data: PresetFormValues,
  ): Promise<DeltaUpdateBasicPriceV2ByPricingFormulaResponse> {
    const request = {
      pricing_formula: data.pricing_formula,
      price_intervals: data.rangePriceList
        ? {
            reference_price_type: data.rangePriceList[0].type,
            price_intervals: _.map(data.rangePriceList, (r) => ({
              begin: `${r.min}`,
              end: `${r.max}`,
              formula_text: r.formula,
            })),
          }
        : {},
      formula: data.formula_text,
      chosen_all: isAll,
      quotation_id: baseStore.quotation_id,
      pricing_type: data.pricing_type,
      ...(isAll
        ? {}
        : {
            basic_price_item_infos: _.map(
              this.selected,
              ({ order_unit_id, parentId }) => ({
                sku_id: parentId,
                order_unit_id,
                price: '',
              }),
            ),
          }),
    }
    return BatchPresetPricingFormula({ request }) as any
  }

  /**
   * 删除商品下所有条目
   */
  handleDeleteItems(sku_id: string) {
    return DeleteManyBasicPriceV2({
      basic_price_ids: [
        {
          quotation_id: baseStore.quotation_id,
          sku_id,
        },
      ],
    } as any)
  }
}

export default new ListStore()
