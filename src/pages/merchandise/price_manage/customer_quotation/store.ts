// 这个是报价单管理的store
import { makeAutoObservable } from 'mobx'
import { FilterOptions, QuotationProps } from './types'
import {
  DeleteQuotation,
  QuotationSortField,
  ListQuotationV2,
  Quotation_Type,
  UpdateQuotationV2,
  Quotation,
} from 'gm_api/src/merchandise'
import { PagingParams } from 'gm_api/src/common'
import { SortsType } from '@gm-pc/table-x'
import _ from 'lodash'

type FilterType = {
  /** query */
  quotation_q: string
  /** 报价单状态 */
  quotation_status: number
  /** 报价单类型 */
  quotation_type: Quotation_Type | ''
}

type DataType = FilterOptions & { sorts: SortsType } & { paging: PagingParams }

const SORT_ENUM = {
  inner_name: 'INNER_NAME',
  serial_no: 'QUOTATION_SERIAL_NO',
  sku_count: 'SKU_COUNT',
  customer_count: 'CUSTOMER_COUNT',
  status: 'STATUS',
} as any

class SaleStore {
  filter: FilterOptions = {
    quotation_q: '',
    quotation_status: 0,
    quotation_type: Quotation_Type.UNSPECIFIED,
  }

  loading = false

  list: QuotationProps[] = []

  isAll = false

  setIsAll(value: boolean) {
    this.isAll = value
  }

  selected: string[] = []

  setSelected(selected: string[]) {
    this.selected = selected
  }

  setFilter(filter: FilterType) {
    this.filter = filter
  }

  count = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clearStore() {
    this.filter = {
      quotation_q: '',
      quotation_status: 0,
      quotation_type: Quotation_Type.UNSPECIFIED,
    }
    this.list = []
    this.selected = []
    this.count = 0
  }

  get getFilter() {
    const { quotation_q, quotation_status, quotation_type } = this.filter

    return {
      quotation_q,
      quotation_status,
      parent_quotation_ids: ['0'],
      quotation_type:
        quotation_type === Quotation_Type.UNSPECIFIED
          ? undefined
          : quotation_type,
      quotation_types:
        quotation_type === Quotation_Type.UNSPECIFIED
          ? [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC]
          : undefined,
    }
  }

  /** 获取报价单列表 */
  getSaleList(params: DataType) {
    this.loading = true
    const { paging, sorts } = params
    const req: any = {
      filter_params: this.getFilter,
      sort_by: [{ field: Number(QuotationSortField.QUOTATION_ID), desc: true }],
      paging: { ...paging },
    }

    if (sorts && Object.keys(sorts).length > 0) {
      const key = Object.keys(sorts)[0]
      req.sort_by.unshift({
        field: Number(QuotationSortField[SORT_ENUM[key]]),
        desc: Object.values(sorts)[0] === 'desc',
      })
    }

    return ListQuotationV2(req)
      .then((json) => {
        const { quotations, paging } = json.response

        this.count = Number(paging?.count || 0)
        this.list = quotations || []
        this.isAll = false
        this.selected = []
        this.loading = false

        return {
          data: this.list,
          paging,
        }
      })
      .catch(() => {
        this.loading = false
      })
  }

  fetchList() {
    this.filter = { ...this.filter }
  }

  changeFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
    this.fetchList()
  }

  deleteQuotation(quotation_id: string) {
    return DeleteQuotation({ quotation_id })
  }

  /**
   * 启用禁用报价单
   */
  updateQuotation(quotation: Quotation) {
    return UpdateQuotationV2({
      quotation,
    })
  }
}

export default new SaleStore()
