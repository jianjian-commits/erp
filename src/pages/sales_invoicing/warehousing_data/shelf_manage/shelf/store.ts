import { formatDataToTree } from '@/common/util'
import { ComShelf } from '@/pages/sales_invoicing/interface'
import {
  CreateShelf,
  DeleteShelf,
  ListBatch,
  ListShelf,
  Shelf,
  UpdateShelf,
  Status_Code,
  ListBatchRequest,
  ListBatchResponse,
  ExportShelfStock,
  ListShelfRequest,
} from 'gm_api/src/inventory'
import { makeAutoObservable } from 'mobx'
import { t } from 'gm-i18n'
import { TreeListItem } from '@gm-pc/react'
import { getSkuFromBatch } from '../util'
import { ComCategory, SkuForShow } from '../interface'
import { getDisabledShelfData } from '@/pages/sales_invoicing/util'
import { GetCategoryTree, ListSkuV2, Sku } from 'gm_api/src/merchandise'
import {
  Categories,
  MapItem,
} from '@/pages/merchandise/manage/merchandise_list/create/data'
import _ from 'lodash'
import { PagingRes } from '@gm-common/hooks/src/types'
import { Data } from '@/pages/sales_invoicing/warehousing_data/supplier_manage/stores/list_store'

interface Filter extends ListShelfRequest {
  warehouse_id?: string | undefined
}
interface ShelfEditState {
  name: string
  is_leaf?: boolean
  is_kid?: boolean
  warehouse_id?: string
}

export const initNewState = {
  name: '',
  is_leaf: false,
  is_kid: false, // 当前标记为最小层级时，不可新建子级，因此默认为false
  warehouse_id: '',
}
class Store {
  shelfTree: ComShelf[] = []
  categoryTree: ComCategory[] = []
  categoryList: Categories[] = []
  selectedShelf: TreeListItem & { shelf_id: string; is_leaf: boolean } = {
    value: '',
    text: '',
    shelf_id: '',
    is_leaf: false,
  }

  shelfFilter: Filter = {
    warehouse_id: undefined,
  }

  runOnChangeActiveShelf: Function | null = null
  runOnChangeActiveCategory: Function | null = null

  selectedShelfAllChild: string[] | null = null

  selectedCategory: TreeListItem & { category_id: string } = {
    value: '',
    text: '',
    category_id: '',
  }

  filter = {
    q: '',
  }

  count = 0

  skuList: Sku[] = []

  skuListForShelf: SkuForShow[] = []
  shelfList: ComShelf[] = []
  listBatchResponseBySkuID: ListBatchResponse | null = null

  shelfNewState: ShelfEditState = initNewState

  isAdd = false

  init() {
    this.shelfTree = []
    this.categoryTree = []
    this.categoryList = []
    this.selectedShelf = {
      value: '',
      text: '',
      shelf_id: '',
      is_leaf: false,
    }

    this.selectedShelfAllChild = null

    this.selectedCategory = {
      value: '',
      text: '',
      category_id: '',
    }

    this.filter = {
      q: '',
    }

    this.skuList = []

    this.skuListForShelf = []
    this.shelfList = []
    this.listBatchResponseBySkuID = null

    this.isAdd = false
    this.runOnChangeActiveCategory = null
    this.runOnChangeActiveShelf = null
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  toggle(v: boolean) {
    this.isAdd = v
    this.filter.q = ''
    this.skuList = []

    if (!v) {
      setTimeout(() => {
        if (this.runOnChangeActiveShelf) {
          this.runOnChangeActiveShelf()
        }
      }, 100)
    }
    // this.fetchSkuList()
  }

  getAllChild(selected: TreeListItem & Shelf) {
    if (selected?.is_leaf) return [selected.shelf_id]

    if (
      selected.shelf_id === '' ||
      selected.shelf_id === '0' ||
      (selected.shelf_id as any) === 0
    )
      return ['0']

    if (selected.children) {
      if (selected.children.length === 0) return []
      return selected.children.map((it) =>
        this.getAllChild(it as any).flat(),
      ) as string[]
    }

    return [selected.shelf_id]
  }

  changeActiveShelf(
    selected: TreeListItem & { shelf_id: string; is_leaf: boolean },
  ) {
    // if (this.isAdd && !selected.is_leaf) return false

    this.selectedShelf = selected

    this.selectedShelfAllChild = this.getAllChild(selected as any).flat()
    if (this.isAdd) {
      this.toggle(false)
    }

    if (this.runOnChangeActiveShelf && !this.isAdd) {
      this.runOnChangeActiveShelf()
    }
  }

  changeActiveCategory(selected: TreeListItem & { category_id: string }) {
    this.selectedCategory = selected

    if (this.runOnChangeActiveCategory) this.runOnChangeActiveCategory()
  }

  async fetchShelf() {
    const { warehouse_id } = this.shelfFilter
    const req = {
      warehouse_id,
    }
    return ListShelf(req).then((json) => {
      this.shelfList = formatDataToTree(
        getDisabledShelfData(
          _.filter(json.response.shelves, (item) => {
            return item.delete_time === '0'
          }), // 去掉删除
        ),
        'shelf_id',
        'name',
      )
      this.shelfTree = formatDataToTree(
        json.response.shelves,
        'shelf_id',
        'name',
      )

      this.shelfList.unshift({
        text: t('未分配'),
        value: '0',
        parent_id: '0',
        shelf_id: '0',
      })
      this.shelfTree.unshift({
        text: t('未分配'),
        value: '0',
        parent_id: '0',
        shelf_id: '0',
      })

      return json
    })
  }

  changeFilter(name: string, value: any) {
    this.filter[name] = value
  }

  changeShelfFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.shelfFilter[key] = value
  }

  formatTreeData(data: Categories[]): Categories[] {
    const result: Categories[] = []
    const map: MapItem = {}
    if (!Array.isArray(data)) {
      return result
    }
    data.forEach((item) => {
      map[item?.category_id || item?.spu_id || ''] = item
    })
    data.forEach((item) => {
      item.text = item.name || ''
      item.value = item?.category_id || item?.spu_id || ''
      const parent = map[item.parent_id || '']
      if (parent) {
        if (!parent?.children) {
          parent.children = []
        }
        if (!parent?.level) {
          parent.level = 1
        }
        item.level = parent.level + 1
        // eslint-disable-next-line no-unused-expressions
        parent?.children.push(item)
      } else {
        result.push(item)
      }
    })
    return result
  }

  async fetchCategory() {
    return GetCategoryTree().then((json) => {
      const data = [
        ...json.response?.categories!,
        // 类目展示不需要最内层商品
        // ...json.response?.spus!.map((it) => ({
        //   ...it,
        //   // category_id: it.spu_id,
        // })),
      ]
      this.categoryList = data
      this.categoryTree = formatDataToTree(data, 'category_id', 'name')
    })
  }

  getFilter(args = {}) {
    return {
      paging: args?.paging ?? {
        limit: 999,
      },
      filter_params: {
        ...(this.isAdd
          ? {
              category_id:
                this.selectedCategory.value.toString() === ''
                  ? void 0
                  : this.selectedCategory.value.toString(),
              // [this.selectedCategory.spu_id ? 'spu_ids' : 'category_ids']:
              //   this.selectedCategory.value.toString() === ''
              //     ? void 0
              //     : [this.selectedCategory.value.toString()],
            }
          : { shelf_ids: this.selectedShelfAllChild ?? [] }),
        q: this.filter.q,
        sku_types: [1, 2],
      },
    }
  }

  async fetchSkuList(args: any = {}) {
    const param = this.getFilter(args)
    // console.log('params', param)
    return ListSkuV2(param).then((json) => {
      const { skus } = json.response
      const list = skus

      this.skuList = list ?? []

      const paging = json.response.paging as PagingRes
      this.count = +(json.response.paging?.count ?? 0)

      return new Data(paging)
    })
  }

  createShelf(shelf: Omit<Shelf, 'shelf_id'>) {
    return CreateShelf({ shelf: shelf })
  }

  updateShelf(shelf: Shelf) {
    return UpdateShelf({ shelf: shelf, shelf_id: shelf.shelf_id }, [
      Status_Code.DUPLICATE_SHELF_NAME,
    ])
  }

  deleteShelf(shelf_id: string) {
    return DeleteShelf({ shelf_id })
  }

  async fetchBatch(shelf_id: string) {
    const { warehouse_id } = this.shelfFilter
    return ListBatch({
      shelf_ids: [shelf_id],
      batch_level: 2,
      remaining: 1,
      paging: { limit: 999 },
      with_additional: true,
      warehouse_id: warehouse_id,
    }).then((json) => {
      this.skuListForShelf = getSkuFromBatch(json.response)
      return json
    })
  }

  async getAllBatchBySkuId(params: ListBatchRequest & { sku_id: string }) {
    return ListBatch({
      with_additional: true,
      remaining: 1,
      batch_level: 2,
      shelf_ids: [this.selectedShelf.shelf_id],
      ...params,
    }).then((json) => {
      this.listBatchResponseBySkuID = json.response
      return json.response
    })
  }

  export() {
    return ExportShelfStock({
      shelf_only: true,
    })
  }

  initState() {
    this.shelfNewState = initNewState
  }

  setNewState(state: ShelfEditState) {
    this.shelfNewState = state
  }
}

export default new Store()
