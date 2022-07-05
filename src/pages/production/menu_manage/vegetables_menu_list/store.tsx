import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  ListQuotationV2,
  Quotation,
  DeleteQuotation,
  Quotation_Type,
  Quotation_Status,
  FilterParams,
  QuotationSortField,
} from 'gm_api/src/merchandise'
import { SortsType } from '@gm-pc/table-x'
import { PagingParams } from 'gm_api/src/common'

type DataType = FilterParams & { sorts: SortsType } & { paging: PagingParams }

const SORT_ENUM = {
  inner_name: 'INNER_NAME',
  serial_no: 'QUOTATION_SERIAL_NO',
  sku_count: 'SKU_COUNT',
  customer_count: 'CUSTOMER_COUNT',
  status: 'STATUS',
} as any

const initFilter = {
  quotation_q: '',
  quotation_type: Quotation_Type.WITH_TIME,
  quotation_status: Quotation_Status.STATUS_UNSPECIFIED,
}

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

class Store {
  filter: FilterParams = _.cloneDeep(initFilter)

  loading = false

  quotation_list: Quotation[] = []
  /** 菜谱总数 */
  count = 0
  /** 分页数据 */
  paging = _.cloneDeep(initPaging)
  /** 勾选列表 */
  selected: string[] = []
  /** 是否勾选所有页 */
  isAllSelected = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clearStore() {
    this.filter = _.cloneDeep(initFilter)
    this.quotation_list = []
    this.loading = false
  }

  get getFilter() {
    const newFilter = {
      ..._.cloneDeep(this.filter),
      quotation_type: Quotation_Type.WITH_TIME,
    }
    if (!this.filter.quotation_status) {
      delete newFilter.quotation_status
    }

    return newFilter
  }

  /** 更新筛选数据 */
  setFilter(value: FilterParams) {
    this.filter = { ...this.filter, ...value }
  }

  /** 设置是否为勾选所有页 */
  setIsAllSelected(isAll: boolean) {
    this.isAllSelected = isAll
  }

  /** 设置勾选列表 */
  setSelected(list: string[]) {
    this.selected = list
  }

  fetchQuotation(params: DataType) {
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
    return ListQuotationV2(req).then((json) => {
      const { quotations } = json.response
      this.quotation_list = quotations || []
      return json.response
    })
  }

  deleteQuotation(quotation_id: string) {
    return DeleteQuotation({ quotation_id })
  }
}

export default new Store()
