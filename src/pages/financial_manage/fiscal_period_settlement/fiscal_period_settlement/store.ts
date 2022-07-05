import { makeAutoObservable } from 'mobx'
import {
  CreateFiscalPeriod,
  DeleteFiscalPeriod,
  DeleteFiscalPeriodRequest,
  FiscalPeriod,
  ListFiscalPeriod,
  ListFiscalPeriodRequest,
  ReqCreateFiscalPeriod,
} from 'gm_api/src/finance'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import moment, { Moment } from 'moment'

import _ from 'lodash'
import { ListGroupUser, GroupUser } from 'gm_api/src/enterprise'

export interface FilterOptions
  extends Omit<Partial<ListFiscalPeriodRequest>, 'paging'> {
  name?: string
}

interface SettleOptions extends Omit<ReqCreateFiscalPeriod, 'end_time'> {
  creator_id?: string
  serial_no?: string
  begin_time?: string
  end_time?: Moment | null
  name: string
  remark?: string
}

class Store {
  filter: FilterOptions = {
    name: '',
  }

  list: FiscalPeriod[] = []

  fiscal_list: SettleOptions = {
    creator_id: '',
    serial_no: '',
    begin_time: '',
    end_time: moment(),
    name: '',
    remark: '',
  }

  fiscal_period_ids: DeleteFiscalPeriodRequest = {
    fiscal_period_id: '',
  }

  fiscal_period_id = ''

  summary = {
    orderCount: 0,
  }

  groupUsers: Record<string, GroupUser> = {}

  handleChange: ((date: Date | null) => void) | undefined

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof SettleOptions>(key: T, value: SettleOptions[T]) {
    this.fiscal_list[key] = value
  }

  handlepdateName<T extends keyof FilterOptions>(
    name: T,
    value: FilterOptions[T],
  ) {
    this.filter[name] = value
  }

  fetchListGroupUser() {
    const req = { paging: { limit: 999 } }
    ListGroupUser(req).then((json) => {
      const { group_users } = json.response
      group_users.forEach((item) => {
        this.groupUsers[item.group_user_id] = item
      })
      return json.response
    })
  }

  getSearchData() {
    const { name, ...rest } = this.filter
    return {
      ...rest,
      name,
    }
  }

  /** 查询列表数据 */
  getSearchList(data: Partial<TableRequestParams>) {
    const req = Object.assign(this.getSearchData(), { paging: data?.paging })
    return ListFiscalPeriod(req as ListFiscalPeriodRequest).then((json) => {
      this.list = json.response.fiscal_periods
      this.fiscal_list.begin_time = this.list?.[0]?.end_time
      this.summary = {
        orderCount: +(json.response.paging?.count || 0),
      }
      return json.response
    })
  }

  /** 反结转 */
  handleUnSettle() {
    return DeleteFiscalPeriod().then((json) => {
      return json.response
    })
  }

  getSettleData() {
    const { begin_time, end_time, name, remark } = this.fiscal_list
    const req = {
      begin_time,
      end_time: moment(end_time).add(24, 'hour').startOf('day').format('x'),
      name,
      remark,
    }

    const res = this.fiscal_list.begin_time ? req : _.omit(req, 'begin_time')
    return res
  }

  /** 结转 */
  handleSubmit() {
    return CreateFiscalPeriod({ fiscal_period: this.getSettleData() }).then(
      (json) => {
        return json.response
      },
    )
  }

  init() {
    const { begin_time } = this.fiscal_list
    return (this.fiscal_list = {
      begin_time,
      end_time: moment(),
      name: '',
      remark: '',
    })
  }
}

export default new Store()
