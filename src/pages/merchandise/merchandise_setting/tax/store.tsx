import { makeAutoObservable } from 'mobx'
import {
  ListSkuV2,
  ExportSkuV2,
  FinanceCategory,
  ListSkuV2Request_RequestData,
  GetFinanceCategoryTree,
  Sku,
  Sku_SkuType,
  BulkUpdateSkuByExcelV2,
} from 'gm_api/src/merchandise'
import { LevelSelectDataItem } from '@gm-pc/react'
import _ from 'lodash'
import { formatDataToTree } from '@/common/util'

interface Filter {
  category_id?: string
  q: string
}
const initFilter = {
  q: '',
  sku_type: Sku_SkuType.NOT_PACKAGE,
  // category_id: '',
}

class ListStore {
  filter: Filter = {
    ...initFilter,
  }

  catagoryMap = {}

  loading = false

  skuList: Sku[] = []

  financeCategoryTree: LevelSelectDataItem<string>[] = []

  categories: FinanceCategory[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getFinanceCategoryTree() {
    return GetFinanceCategoryTree().then((json) => {
      const categories = json.response.categories!
      this.categories = categories.slice()
      this.financeCategoryTree = formatDataToTree(
        categories!,
        'finance_category_id',
        'name',
      )
      return json.response
    })
  }

  getSkuList(params?: any) {
    this.loading = true
    return ListSkuV2({
      filter_params: this.filter,
      request_data: ListSkuV2Request_RequestData.FINANCE_CATEGORY,
      paging: { ...params.paging },
    })
      .then((json) => {
        const { skus = [], category_map = {}, paging } = json.response
        this.catagoryMap = category_map
        //
        this.skuList = skus
        return {
          data: this.skuList || [],
          paging,
        }
      })
      .finally(() => (this.loading = false))
  }

  setFilter(filter: Filter) {
    this.filter = filter
  }

  export() {
    return ExportSkuV2({
      list_sku_v2_request: {
        filter_params: {
          ...this.filter,
        },
        paging: {
          limit: 1000,
        },
      },
      need_fields: [
        'CustomizeCode',
        'Name',
        'CategoryName',
        'FinanceCategoryName',
        'Tax',
        'InputTax',
      ],
    })
  }

  batchUpdate(file_url: string) {
    return BulkUpdateSkuByExcelV2({ file_url: file_url })
  }
}

export default new ListStore()
