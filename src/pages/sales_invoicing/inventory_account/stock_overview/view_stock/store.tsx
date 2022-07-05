import { makeAutoObservable } from 'mobx'
import { ExportBatchListStock, ListBatch, Batch } from 'gm_api/src/inventory'
import { PagingResult } from 'gm_api/src/common'

import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { getBatchAdditional } from '@/pages/sales_invoicing/util'

interface FtType {
  q?: string
  with_additional?: boolean
  category_id?: string | undefined
  warehouse_id?: string
  batch_type?: string
  remaining?: string
  batch_level?: string
  expire_type?: string
}

class Store {
  filter: FtType = {
    category_id: undefined,
    warehouse_id: 0,
    q: '',
    with_additional: true,
    batch_type: '1',
    remaining: '1',
    batch_level: '1',
    expire_type: '0',
  }

  list: Batch[] = []

  paging: PagingResult = { count: '0' }

  handleChangeFilter = <T extends keyof FtType>(key: T, value: FtType[T]) => {
    this.filter[key] = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const { category_id, ...ant } = this.filter

    return {
      category_id: category_id,
      ...ant,
    }
  }

  fetchList(req: TableRequestParams) {
    const data = Object.assign(this.getSearchData(), { paging: req.paging })
    return ListBatch(data).then((json) => {
      const { batches, additional, paging } = json.response
      this.list = getBatchAdditional(batches, additional!)
      this.paging = paging!
      return json.response
    })
  }

  export() {
    return ExportBatchListStock({
      list_batch_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
    })
  }
}

export default new Store()
export type { FtType }
