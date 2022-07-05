import { makeAutoObservable } from 'mobx'
import {
  ListSkuV2,
  ListSkuV2Request,
  Sku_SkuType,
  FinanceCategory,
  GetFinanceCategoryTree,
  ListSkuRequest_RequestData,
  ExportSkuV2,
  UpdateSkuV2,
  Sku_SupplierInputTaxMap,
} from 'gm_api/src/merchandise'

import { ListType, Filter, ValueType } from '../interface'

import _ from 'lodash'
import { LevelSelectDataItem } from '@gm-pc/react'
import { formatDataToTree, getCategoryName } from '@/common/util'
import { SelectedOptions } from '@/common/components/category_filter_hoc/types'
import globalStore from '@/stores/global'

const unitList = _.cloneDeep(globalStore.unitList)

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter = {
    filter_params: {
      q: '',
    },
    request_data: ListSkuRequest_RequestData.CATEGORY,
    // sku_type: Sku_SkuType.NOT_PACKAGE,
    // request_data: ListSkuRequest_RequestData.CATEGORY,
  } as ListSkuV2Request

  list: ListType[] = []
  supplier_id = ''
  categories: FinanceCategory[] = []
  supplier_taxs: Sku_SupplierInputTaxMap = {
    supplier_input_tax: {},
  }

  financeCategoryTree: LevelSelectDataItem<string>[] = []

  setSupplierId(supplier_id: string) {
    this.supplier_id = supplier_id
  }

  setSupplierTax(value: ValueType) {
    this.supplier_taxs.supplier_input_tax = {
      ...this.supplier_taxs.supplier_input_tax,
      ...value,
    }
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

  getList(params: ListSkuV2Request) {
    return ListSkuV2({
      ...this.filter,
      paging: { ...params.paging },
      sort_by: { field: 6, desc: true },
    }).then((json) => {
      const { skus, category_map } = json.response
      this.list = _.map(skus, (sku) => {
        return {
          ...sku,
          category_name: getCategoryName(category_map!, sku?.category_id!),
          is_editing: false,
          input_tax: sku?.input_tax,
        }
      }) as ListType[]
      return json.response
    })
  }

  updateSku(index: number) {
    this.supplier_taxs.supplier_input_tax = _.pickBy(
      this.supplier_taxs.supplier_input_tax,
      (item) => {
        return !!item
      },
    )
    const req = {
      ...this.list[index],
      supplier_input_taxs: this.supplier_taxs,
    }
    if (!req?.production_unit?.name) {
      const production = _.find(
        unitList,
        (item) => item.unit_id === '' + req.base_unit_id,
      )
      req.production_unit = production
    }
    UpdateSkuV2({ sku: req }).then((json) => {
      this.updateFilter()
      return json
    })
  }

  // // 处理category
  // dealCategory(category_ids: SelectedOptions) {
  //   const parmas: { category_ids?: string[] } = {}

  //   if (category_ids.category2_ids && category_ids.category2_ids.length) {
  //     parmas.category_ids = _.map(category_ids.category2_ids, (v) => v.value)
  //   } else {
  //     parmas.category_ids = _.map(category_ids.category1_ids, (v) => v.value)
  //   }
  //   return parmas
  // }

  // 改变filter用来触发getList
  changeFilter(params: Filter) {
    this.filter.filter_params = {
      ...this.filter.filter_params,
      category_id: params?.category_id!,
      q: params.q,
      sku_type: Sku_SkuType.NOT_PACKAGE,
    }
    this.filter = { ...this.filter }
  }

  updateFilter() {
    this.filter = { ...this.filter }
  }

  // 改变list
  changeList<T extends keyof ListType>(
    index: number,
    key: T,
    value: ListType[T],
  ) {
    this.list[index][key] = value
  }

  export() {
    return ExportSkuV2({
      list_sku_v2_request: {
        ...this.filter,
        paging: { limit: 999 },
      },
      supplier_id: this.supplier_id,
      need_fields: [
        'Name',
        'CustomizeCode',
        'CategoryName',
        'InputTax',
        'SupplierInputTax',
      ],
    })
  }

  clear() {
    this.filter = {} as ListSkuV2Request
    this.list = [] as ListType[]
  }
}
export default new Store()
