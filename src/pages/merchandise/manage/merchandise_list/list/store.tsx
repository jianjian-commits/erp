/**
 * @description 商品列表-列表
 */
import { makeAutoObservable } from 'mobx'
import {
  ListSkuV2,
  ListSkuV2Request,
  Sku,
  SkuSortField,
  Sku_NotPackageSubSkuType,
  Sku_SkuType,
  ListSkuV2Request_RequestData,
} from 'gm_api/src/merchandise'
import { Filters_Bool } from 'gm_api/src/common'
import { fetchTreeData } from '@/common/service'
import { DataNode } from '@/common/interface'
import _ from 'lodash'

export const initFilter = {
  /** 商品分类 */
  category_ids: ['00'],
  /** 销售状态 */
  on_sale: Filters_Bool.ALL,
  /** 商品类型 */
  not_package_sub_sku_type: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
  q: '',
}

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

/** 列表可排序项枚举 */
const SORT_ENUM: any = {
  name: 'SKU_NAME',
  customize_code: 'CUSTOMIZED_CODE',
  not_package_sub_sku_type: 'SKU_TYPE',
  category_id: 'CATEGORY',
}
class ListStore {
  filter = initFilter
  list: Sku[] = []
  count = 0
  paging = initPaging
  /** 商品分类map */
  categoryMap: { [key: string]: DataNode } = {}
  /** 商品分类树 */
  categoryTreeData: DataNode[] = []
  /** 勾选列表 */
  selected: string[] = []
  /** 是否勾选所有页 */
  isAllSelected = false
  /** 数据加载状态 */
  dataloading = false
  /** 列表筛选数据，用于导出 */
  listSkuReqFilter: ListSkuV2Request = { paging: { limit: 1000 } }

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

  /** 获取商品列表数据 */
  async getList(params?: any) {
    if (this.dataloading) return

    this.dataloading = true
    if (JSON.stringify(this.categoryMap) === '{}') {
      this.getCategoryMap()
    }

    const { sorts, paging } = params || {}
    if (paging) {
      this.paging = paging
    }

    // 筛选数据处理
    const { category_ids, not_package_sub_sku_type, on_sale, q } = this.filter
    // 商品分类为全部分类则不需要传此项，选择具体分类传分类叶子结点
    const categories: { [key: string]: string } = {}
    const length = category_ids.length
    if (category_ids[0] && category_ids[0] !== '00') {
      categories.category_id = category_ids[length - 1]
    }
    const reqFilter = {
      ...categories,
      not_package_sub_sku_type,
      on_sale,
      q,
    }

    const req: ListSkuV2Request = {
      filter_params: { ...reqFilter, sku_type: Sku_SkuType.NOT_PACKAGE },
      paging: this.paging,
      request_data: ListSkuV2Request_RequestData.NEED_MIN_MAX_PRICE,
    }

    // 列表排序
    if (sorts && Object.keys(sorts).length > 0) {
      const key = Object.keys(sorts)[0]
      req.sort_by = {
        field: Number(SkuSortField[SORT_ENUM[key]]),
        desc: Object.values(sorts)[0] === 'desc',
      }
    } else {
      req.sort_by = {
        field: Number(SkuSortField.SKU_ID),
        desc: true,
      }
    }

    this.listSkuReqFilter = req

    return ListSkuV2(req).then((json) => {
      this.list = json.response.skus || []

      // 重置勾选数据
      this.selected = []
      this.isAllSelected = false

      if (this.paging.offset === 0) {
        // 接口仅在列表数据第一页返回当前筛选条件下数据数量
        this.count = Number(json.response.paging.count) || 0
      }

      this.dataloading = false
      return json.response
    })
  }

  /** 获取商品分类数据 */
  async getCategoryMap() {
    const { categoryMap, categoryTreeData } = await fetchTreeData()
    this.categoryMap = await categoryMap
    this.categoryTreeData = await categoryTreeData
  }

  /** 更新筛选数据 */
  setFilter(values?: any) {
    console.log(values)
    this.filter = values || _.cloneDeep(initFilter)
  }

  /** 清空数据 */
  clearStore() {
    this.filter = initFilter
    this.list = []
    this.count = 0
    this.paging = initPaging
    this.categoryMap = {}
    this.categoryTreeData = []
    this.selected = []
    this.isAllSelected = false
    this.dataloading = false
    this.listSkuReqFilter = { paging: { limit: 1000 } }
  }
}

export default new ListStore()
