import { makeAutoObservable } from 'mobx'
import {
  DeleteSkuV2,
  ListSkuV2,
  ListSkuV2Request,
  Sku,
  SkuSortField,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import { DataNode, DataNodeMap } from '@/common/interface'
import { fetchTreeData } from '@/common/service'

/** 包材页面filter属性 */
interface WrapperFilterProp {
  category_id?: string
  q?: string
  sku_type: Sku_SkuType.PACKAGE
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

class WrapperListStore {
  filter: WrapperFilterProp = {
    sku_type: Sku_SkuType.PACKAGE,
  }

  loading = false

  list: Sku[] = []

  paging = initPaging

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clearStore() {
    this.filter = {
      sku_type: Sku_SkuType.PACKAGE,
    }
    this.list = []
    this.treeDataMap = {}
    this.treeData = []
  }

  /** 分类树的数据 */
  treeData: DataNode[] = []

  /** 分类树的Map */
  treeDataMap: DataNodeMap = {}

  /** 商品包材获取列表 */
  getList(params?: any) {
    this.loading = true
    const { sorts, paging } = params || {}

    if (paging) {
      this.paging = paging
    }

    const req: ListSkuV2Request = {
      filter_params: this.getFilter,
      paging: paging,
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

    return ListSkuV2(req)
      .then((json) => {
        const { skus, paging } = json.response
        this.list = skus || []
        return { data: this.list, paging }
      })
      .finally(() => (this.loading = false))
  }

  fetchList() {
    this.filter = { ...this.filter }
  }

  get getFilter() {
    const { category_id, q, sku_type } = this.filter
    return {
      category_id,
      q,
      sku_type,
    }
  }

  // 设置filter
  setFilter(filter: WrapperFilterProp) {
    this.filter = filter
  }

  /** 删除商品 */
  deleteSku(sku_id: string) {
    return DeleteSkuV2({ sku_id })
  }

  /** 获取分类树的方法 */
  async getTreeData() {
    const { categoryMap, categoryTreeData } = await fetchTreeData()
    this.treeDataMap = categoryMap
    this.treeData = categoryTreeData
  }
}

export default new WrapperListStore()
