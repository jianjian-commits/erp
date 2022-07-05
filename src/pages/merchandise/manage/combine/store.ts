import { makeAutoObservable } from 'mobx'
import {
  ListSkuV2,
  ListSkuV2Request,
  Sku,
  SkuSortField,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

/** 初始化筛选数据 */
const initFilter = {
  q: '',
  on_sale: undefined,
}

class CombineStore {
  /** 筛选数据 */
  filter = _.cloneDeep(initFilter)
  /** 组合商品列表 */
  list: Sku[] = []
  /** 组合商品总数 */
  count = 0
  /** 报价单总数 */
  quotationCount = 0
  /** 分页数据 */
  paging = _.cloneDeep(initPaging)
  /** 勾选列表 */
  selected: string[] = []
  /** 是否勾选所有页 */
  isAllSelected = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 设置是否为勾选所有页 */
  setIsAllSelected(isAll: boolean) {
    this.isAllSelected = isAll
  }

  /** 设置勾选列表 */
  setSelected(list: string[]) {
    this.selected = list
  }

  /** 更新筛选数据 */
  setFilter(value?: any) {
    this.filter = value || _.cloneDeep(initFilter)
  }

  /** 获取组合商品列表 */
  getCombineList(params?: any) {
    if (params?.paging) {
      this.paging = params.paging
    }
    const req: ListSkuV2Request = {
      filter_params: { ...this.filter, sku_type: Sku_SkuType.COMBINE },
      paging: this.paging,
      sort_by: { field: Number(SkuSortField.SKU_ID), desc: true },
    }
    return ListSkuV2(req).then((json) => {
      this.list = json.response.skus || []
      // 重置勾选数据
      this.selected = []
      this.isAllSelected = false

      if (this.paging.offset === 0) {
        // 接口仅在列表数据第一页返回当前筛选条件下数据数量
        this.count = Number(json.response.paging.count) || 0
      }
      return json.response
    })
  }

  /** 清空数据 */
  clearStore() {
    this.filter = _.cloneDeep(initFilter)
    this.list = []
    this.count = 0
    this.paging = _.cloneDeep(initPaging)
    this.selected = []
    this.isAllSelected = false
  }
}
export default new CombineStore()
