import { PagingParams } from 'gm_api/src/common'
import {
  DeleteCustomerSettleSheet,
  GetCustomerSettleSheet,
  ListSettleSheet,
  SettleSheetDetail,
} from 'gm_api/src/finance'
import { makeAutoObservable } from 'mobx'
import { initFilter } from './constant'
import { DetailHeader, DetailHeaderInfo, F, List } from './interface'

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter: F = initFilter

  initFilter() {
    this.filter = initFilter
  }

  updateFilter<K extends keyof F>(field: K, newValue: F[K]) {
    this.filter[field] = newValue
  }

  loading = false

  setLoading(bool: boolean) {
    this.loading = bool
  }

  // ----------------------分页相关--------------------------------------
  count = 0

  pagination: PagingParams = { offset: 0, limit: 10, need_count: true }

  paging = { current: 1, pageSize: 10 }

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
  }

  // ---------------------结款凭证---------------------------------------

  dataSource: List[] = []

  fetchList(isResetCurrent?: boolean) {
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }
    ListSettleSheet({
      begin_time: `${+this.filter.begin}`,
      end_time: `${+this.filter.end}`,
      time_type: 3,
      account_type: 2,
      target_ids: this.filter.target_ids.map((item) => item.value),
      settle_status: this.filter.settle_status,
      customize_settle_voucher: this.filter.customize_settle_voucher,
      paging: this.pagination,
    }).then((res) => {
      const { settle_sheets, relation_customer_info } = res.response
      this.dataSource = settle_sheets.map((item) => ({
        settle_sheet_id: item.settle_sheet_id,
        customize_settle_voucher: item.customize_settle_voucher,
        settle_time: item.settle_time,
        target_id: item.target_id,
        target_name: relation_customer_info?.[item.target_id!].name,
        total_price: item.total_price,
        settle_status: item.settle_status,
      }))
      if (this.pagination.offset === 0) {
        this.count = Number(res.response.paging.count || '0')
      }
    })
  }

  deleteCustomerSettleSheet(settle_sheet_id: string) {
    return DeleteCustomerSettleSheet({ settle_sheet_id })
  }

  // ----------------------凭证详情--------------------------------------

  dataSourceDetail: SettleSheetDetail[] = []

  dataSourceDetailHeaderInfo: DetailHeaderInfo = {} as any

  dataSourceHeader: DetailHeader = {} as any

  fetchCustomerSettleSheet(settle_sheet_id: string) {
    GetCustomerSettleSheet({ settle_sheet_id }).then((res) => {
      const {
        settle_sheet,
        total_outstock_price,
        total_paid_price,
        total_after_sale_price,
        group_user_info,
        customer_info,
      } = res.response
      this.dataSourceDetail = settle_sheet?.settle_sheet_details!
      this.dataSourceDetailHeaderInfo = {
        total_outstock_price: total_outstock_price!,
        total_paid_price: total_paid_price!,
        total_after_sale_price: total_after_sale_price!,
        total_price: settle_sheet?.total_price!,
        unPay_price: `${+total_outstock_price! - +total_paid_price!}`,
        needPay_price: `${
          +total_outstock_price! - +total_paid_price! - +total_after_sale_price!
        }`,
      }
      this.dataSourceHeader = {
        settle_sheet_id: settle_sheet?.settle_sheet_id!,
        target_id: settle_sheet?.target_id!,
        target_name: customer_info?.[settle_sheet?.target_id!].name!,
        pay_type: settle_sheet?.pay_type!,
        settle_time: settle_sheet?.settle_time!,
        customize_settle_voucher: settle_sheet?.customize_settle_voucher!,
        create_time: settle_sheet?.create_time!,
        creator_id: settle_sheet?.creator_id!,
        creator_name: group_user_info?.[settle_sheet?.creator_id!]?.name!,
        settle_status: settle_sheet?.settle_status!,
      }
    })
    this.loading = false
  }

  initDetail() {
    this.dataSourceDetail = []
    this.dataSourceDetailHeaderInfo = {} as any
    this.dataSourceHeader = {} as any
  }
}

export default new Store()
