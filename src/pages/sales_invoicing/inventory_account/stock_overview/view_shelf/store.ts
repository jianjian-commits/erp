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
  GetShelfStock,
} from 'gm_api/src/inventory'
import type { GetShelfStockRequest } from 'gm_api/src/inventory'
import { makeAutoObservable } from 'mobx'
import { t } from 'gm-i18n'
import { TreeListItem } from '@gm-pc/react'

import { getDisabledShelfData } from '@/pages/sales_invoicing/util'
import lodash from 'lodash'
import { SkuForShow } from '@/pages/sales_invoicing/warehousing_data/shelf_manage/interface'
import { getSkuFromBatchV2 } from '@/pages/sales_invoicing/warehousing_data/shelf_manage/util'

type Filter = Omit<ListShelfRequest, 'warehouse_id'> & {
  warehouse_id: number | string
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
  selectedShelf: TreeListItem & { shelf_id: string } = {
    value: '',
    text: '',
    shelf_id: '',
  }

  filter: Filter = {
    warehouse_id: 0,
  }

  skuListForShelf: SkuForShow[] = []
  shelfList: ComShelf[] = []
  listBatchResponseBySkuID: ListBatchResponse | null = null

  // shelfEditState: ShelfEditState = initNewState
  shelfNewState: ShelfEditState = initNewState

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeActiveShelf(selected: TreeListItem & { shelf_id: string }) {
    this.selectedShelf = selected
  }

  changeFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  async fetchShelf() {
    const { warehouse_id } = this.filter
    return ListShelf({
      warehouse_id: warehouse_id ? (warehouse_id as string) : undefined,
    }).then((json) => {
      this.shelfList = formatDataToTree(
        getDisabledShelfData(
          lodash.filter(json.response.shelves, (item) => {
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
    return GetShelfStock({
      shelf_id,
      with_additional: true,
    } as GetShelfStockRequest).then((json) => {
      this.skuListForShelf = getSkuFromBatchV2(json.response)
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
    return ExportShelfStock()
  }

  initState() {
    this.shelfNewState = initNewState
  }

  // setEditState(state: ShelfEditState) {
  //   this.shelfEditState = state
  // }

  setNewState(state: ShelfEditState) {
    this.shelfNewState = state
  }
}

export default new Store()
