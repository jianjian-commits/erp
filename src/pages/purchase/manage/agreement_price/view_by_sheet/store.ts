import { makeAutoObservable } from 'mobx'
import {
  Quotation_Status,
  ListQuotationV2,
  UpdateQuotationBasicPrice,
  ExportQuotation,
  ImportQuotation,
  ListQuotationV2Request,
  Quotation_Type,
  ListQuotationV2Response,
} from 'gm_api/src/merchandise'
import type { Quotation } from 'gm_api/src/merchandise'
import type { Supplier, GroupUser } from 'gm_api/src/enterprise'
import _ from 'lodash'
import moment from 'moment'

export interface FilterOptions {
  start_time?: string
  end_time?: string
  quotation_q?: string
  quotation_type?: Quotation_Type
  quotation_status?: Quotation_Status
  supplier?: any
  supplier_ids?: string[]
}

const initFilter: FilterOptions = {
  start_time: moment().startOf('day').add(-6, 'days').valueOf().toString(),
  end_time: moment().endOf('day').valueOf().toString(),
  quotation_q: '',
  supplier: [],
  supplier_ids: [],
  quotation_type: 3, // 采购协议价固定类型为3
  quotation_status: 2, // 单据状态搜索
}

class Store {
  filter = { ...initFilter }
  list: any = []
  quotations: Quotation[] = []
  editStatus = Quotation_Status.STATUS_VALID
  editStartTime = moment().startOf('day').valueOf().toString()
  editEndTime = moment().endOf('day').valueOf().toString()
  priceImportUploadUrl = ''
  importSupplier: any = []

  constructor() {
    makeAutoObservable(this)
  }

  resetData() {
    this.filter = { ...initFilter }
  }

  updateImportSupplier(supplier: any) {
    this.importSupplier = supplier
  }

  updateFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  setPriceImportUploadUrl(url: string): void {
    this.priceImportUploadUrl = url
  }

  deleteQuotation(index: number) {
    const quotation = this.quotations[index] || {}
    const time = new Date()
    quotation.delete_time = String(moment(time).valueOf())
    return UpdateQuotationBasicPrice({ quotation }).then((res) => {
      return res.response
    })
  }

  editMsg(index: number) {
    this.list.forEach((item: any, i: number) => {
      if (i === index) {
        item.isEditing = true
      } else {
        item.isEditing = false
      }
    })
    const msg = this.list[index]
    if (msg.status === Quotation_Status.STATUS_VALID) {
      this.editStatus = msg.status
    } else if (msg.status === Quotation_Status.STATUS_WAIT_VALID) {
      this.editStartTime = msg.start_time
      this.editEndTime = msg.end_time
    }
  }

  closeEditMsg(index: number) {
    const msg = this.list[index]
    msg.isEditing = false
    this.editStatus = Quotation_Status.STATUS_VALID
    this.editStartTime = moment().startOf('day').valueOf().toString()
    this.editEndTime = moment().endOf('day').valueOf().toString()
  }

  updateEditMsg(index: number) {
    // const msg = this.list[index]
    const quotation = this.quotations[index] || {}
    if (quotation.status === Quotation_Status.STATUS_VALID) {
      quotation.status = this.editStatus
    } else if (quotation.status === Quotation_Status.STATUS_WAIT_VALID) {
      quotation.start_time = this.editStartTime
      quotation.end_time = this.editEndTime
    }
    return UpdateQuotationBasicPrice({ quotation: quotation }).then((res) => {
      return res.response
    })
  }

  updateEditStatus(status: Quotation_Status) {
    this.editStatus = status
  }

  updateEditTime(type: 'startTime' | 'endTime', time: string) {
    if (type === 'startTime') {
      this.editStartTime = time
    } else if (type === 'endTime') {
      this.editEndTime = time
    }
  }

  sortDataFromSupplier(
    supplier_id: string,
    supplier_relation: { [key: string]: Supplier },
  ) {
    const supplier = supplier_relation[supplier_id]
    const supplier_name = supplier?.name || ''
    const supplier_code = supplier?.customized_code || ''
    return { supplier_name, supplier_code }
  }

  sortDataFromGroupUser(
    creator_id: string,
    group_user_relation: { [key: string]: GroupUser },
  ) {
    const groupUser = group_user_relation[creator_id]
    const operator = groupUser?.name || ''
    return { operator }
  }

  sortDataFromQuotationAndGroupUser(
    quotation: Quotation,
    group_user_relation: { [key: string]: GroupUser },
  ) {
    const creator_id = quotation.creator_id || ''
    return {
      ..._.pick(quotation, [
        'create_time',
        'quotation_id',
        'serial_no',
        'supplier_id',
        'start_time',
        'end_time',
        'status',
        'remark',
      ]),
      ...this.sortDataFromGroupUser(creator_id, group_user_relation),
    }
  }

  sortListData(res: ListQuotationV2Response) {
    const { quotations = [] } = res
    this.quotations = quotations
    const supplier_relation = res.supplier_relation || {}
    const group_user_relation = res.group_users || {}
    return _.map(quotations, (quotation) => {
      const supplier_id = quotation.supplier_id || ''
      return {
        ...this.sortDataFromQuotationAndGroupUser(
          quotation,
          group_user_relation,
        ),
        ...this.sortDataFromSupplier(supplier_id, supplier_relation),
        isEditing: false,
      }
    })
  }

  sortListParams() {
    const { quotation_status, quotation_type, supplier } = this.filter
    const params: Omit<ListQuotationV2Request, 'paging'> = {
      filter_params: {
        ..._.pick(this.filter, ['start_time', 'end_time', 'quotation_q']),
        quotation_status,
        quotation_type,
        supplier_ids: supplier && supplier.map((e: any) => e.supplier_id),
      },
    }

    return params
  }

  fetchPriceList(params: ListQuotationV2Request) {
    const req = {
      ...params,
      ...this.sortListParams(),
      sort_by: [{ field: 1, desc: true }],
    }

    return ListQuotationV2(req).then((json) => {
      this.list = this.sortListData(json.response)
      return json.response
    })
  }

  exportQuotation(quotation_id: string) {
    return ExportQuotation({ quotation_id }).then((res) => {
      return res.response
    })
  }

  sendPriceImportCreate() {
    // const supplier: any = this.importSupplier[0]
    return ImportQuotation({
      // supplier_id: this.importSupplier?.supplier_id,
      file_url: this.priceImportUploadUrl,
    }).then(() => this.setPriceImportUploadUrl(''))
  }
}

export default new Store()
