import { Key } from 'react'
import { makeAutoObservable } from 'mobx'
import {
  ListCustomer,
  Customer,
  ListServicePeriod,
  ListCustomerLabel,
} from 'gm_api/src/enterprise'
import { t } from 'gm-i18n'
import { PagingParams } from 'gm_api/src/common'
import { Options } from '../../data'

export type FilterType = {
  q: string
  customer_label_ids: string[]
}

export interface CustomerItem extends Customer {
  /** 销售经理 */
  sales_group_user: string
  /** 开户经理 */
  create_group_user: string
  /** 客户标签 */
  customer_label: string

  service_period_id: string[]
  customer_label_id: string[]
  menu_id: string
}

class ListStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clearStore() {
    this.list = []
    this.filter = {
      customer_label_ids: [],
      q: '',
    }
    this.customerLabelList = []
    this.disabledList = []
    this.selectedRowKeys = []
    this.paging = { current: 1, pageSize: 10 }
    this.quotationId = ''
  }

  loading = false

  /** 报价单id */
  quotationId = ''

  customerLabelList: Options[] = []

  listServicePeriod: {
    value: number | string
    text: string
  }[] = [{ value: '', text: t('全部') }]

  /** 商品列表 */
  list: CustomerItem[] = []

  /** 禁用项 */
  disabledList: string[] = []

  /** 已选择项 */
  selectedRowKeys: Key[] = []

  filter: FilterType = {
    customer_label_ids: [],
    q: '',
  }

  count = 0

  /** 传参数用的页码信息 */
  pagination: PagingParams = {
    limit: 10,
    need_count: true,
    offset: 0,
  }

  /** antd 表格分页信息 */
  paging = { current: 1, pageSize: 10 }

  setQuotationId(id: string) {
    this.quotationId = id
  }

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setCount(count: number) {
    this.count = count
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
  }

  setSelectedRowKeys(selectedRowKeys: Key[]) {
    this.selectedRowKeys = selectedRowKeys
  }

  setFilter(filter: FilterType) {
    this.filter = { ...filter }
    this.fetchList(true)
  }

  fetchServicePeriod() {
    const req = {
      paging: {
        offset: 0,
        limit: 999,
      },
    }
    ListServicePeriod(req as any).then((json) => {
      this.listServicePeriod = json.response.service_periods.map((item) => ({
        value: item.service_period_id,
        text: item.name || '',
      }))
    })
  }

  /**
   *  获取客户列表
   * @param isResetCurrent 是否重置为第一页
   */
  fetchList(isResetCurrent?: boolean) {
    this.loading = true
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }

    const params = {
      ...this.filter,
      quotation_ids: [this.quotationId],
      paging: this.pagination,
      need_customer_label: true,
      need_group_users: true,
      need_quotations: true,
      need_service_periods: true,
      level: 2,
    }
    return ListCustomer(params)
      .then((res) => {
        const {
          customers,
          quotation_relations,
          customer_label_relation = {},
          service_period_relation = {},
          group_users = {},
          customer_labels = {},
          paging,
        } = res.response
        this.disabledList =
          (quotation_relations
            ?.filter((f) => f.quotation_id === this.quotationId)
            .map((m) => m.customer_id) as string[]) || []
        this.selectedRowKeys = []
        this.list = customers.map((item) => {
          const { sales_group_user_id, create_group_user_id } = item
          const service_period_id =
            service_period_relation[item.customer_id]?.values || []
          const customer_label_id =
            customer_label_relation![item.customer_id]?.values || []

          const menu_id =
            quotation_relations?.find((f) => f.customer_id === item.customer_id)
              ?.quotation_id || ''
          return {
            ...item,
            service_period_id,
            customer_label_id,
            menu_id,
            sales_group_user:
              group_users[sales_group_user_id || '']?.name || t('无'),
            create_group_user:
              group_users[create_group_user_id || '']?.name || t('无'),
            customer_label:
              customer_labels[customer_label_id[0] || '']?.name || t('无'),
          }
        })
        if (this.pagination.offset === 0) {
          this.count = Number(paging.count || '0')
        }
        return {
          list: this.list,
          count: paging.count || '0',
        }
      })
      .finally(() => (this.loading = false))
  }

  /** 获取标签 */
  fetchCustomerLabelList() {
    return ListCustomerLabel({ paging: { limit: 999 } }).then((json) => {
      const { customer_labels } = json.response
      this.customerLabelList = customer_labels.map((item) => ({
        label: item.name,
        value: item.customer_label_id,
      }))
      return json
    })
  }
}

export default new ListStore()
