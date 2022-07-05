import { makeAutoObservable } from 'mobx'
import {
  ListSku,
  ListSkuRequest,
  Sku_SkuType,
  FinanceCategory,
  GetFinanceCategoryTree,
  ListSkuRequest_RequestData,
  ExportSku,
  UpdateSkuV2,
  Sku_SupplierInputTaxMap,
} from 'gm_api/src/merchandise'

import { ListType, Filter, ValueType } from '../interface'

import _ from 'lodash'
import { LevelSelectDataItem } from '@gm-pc/react'
import { formatDataToTree } from '@/common/util'
import { SelectedOptions } from '@/common/components/category_filter_hoc/types'
import globalStore from '@/stores/global'

const unitList = _.cloneDeep(globalStore.unitList)

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter = {
    q: '',
    sku_type: Sku_SkuType.NOT_PACKAGE,
    request_data: ListSkuRequest_RequestData.CATEGORY,
  } as ListSkuRequest

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

  getList(params: ListSkuRequest) {
    return ListSku({
      ...this.filter,

      paging: { ...params.paging },
    }).then((json) => {
      const { sku_infos } = json.response
      this.list = _.map(sku_infos, (sku) => {
        const item = _.find(
          this.categories,
          (f) => f.finance_category_id === sku?.sku?.finance_category_id,
        )
        return {
          ...sku.sku,
          category1_name: sku?.category_infos?.length
            ? sku?.category_infos[0].category_name!
            : '',
          category2_name:
            (sku?.category_infos || []).length > 1
              ? sku?.category_infos![1]?.category_name!
              : '',
          is_editing: false,
          input_tax: sku?.sku?.input_tax,
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

  // 处理category
  dealCategory(category_ids: SelectedOptions) {
    const parmas: { category_ids?: string[] } = {}

    if (category_ids.category2_ids && category_ids.category2_ids.length) {
      parmas.category_ids = _.map(category_ids.category2_ids, (v) => v.value)
    } else {
      parmas.category_ids = _.map(category_ids.category1_ids, (v) => v.value)
    }
    return parmas
  }

  // 改变filter用来触发getList
  changeFilter(params: Filter) {
    this.filter = {
      ...this.filter,
      category_ids: params.category.category_ids,
      q: params.q,
    }
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
    return ExportSku({
      ...this.filter,
      supplier_id: this.supplier_id,
      need_fields: [
        'SkuName',
        'SkuCustomizeCode',
        'Category1Name',
        'Category2Name',
        'InputTax',
        'SupplierInputTax',
      ],
    })
  }

  clear() {
    this.filter = {} as ListSkuRequest
    this.list = [] as ListType[]
  }
}
export default new Store()
