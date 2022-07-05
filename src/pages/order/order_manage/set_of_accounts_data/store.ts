import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { GetFakeOrderByCustomer } from 'gm_api/src/databi'
import { formatQueryData } from '@/pages/report/util'
import { ExportFakeOrderData } from 'gm_api/src/orderlogic'
import { DiyShowMapType } from '@gm-pc/table-x'
import { PagingParams } from 'gm_api/src/common'

const initFilter = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  dateType: 1,
  search_text: '',
}

type F = typeof initFilter

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter = { ...initFilter }

  list: any[] = []

  paging: PagingParams = { need_count: true, limit: 10 }

  summary = '0'

  setFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  initFilter() {
    this.filter = { ...initFilter }
  }

  fetchList(params: any) {
    const req = {
      ...this.getParams(),
      ...params,
    }
    return GetFakeOrderByCustomer(req).then((json) => {
      const formatData = formatQueryData(json)
      const { data, paging } = formatData
      this.summary = json.response.summary_data?.count || '0'
      this.list = data
      this.paging = paging
      return {
        data,
        paging,
      }
    })
  }

  // 导出
  exportList(diyShowMap: DiyShowMapType) {
    return ExportFakeOrderData({
      fields: diyShowMap,
      filter: {
        ...this.getParams(),
        paging: this.paging,
      },
    })
  }

  doRequest = (): void | null => {
    return null
  }

  setDoRequest(func: () => void): void {
    this.doRequest = func
  }

  getParams() {
    const { begin, end, dateType, search_text } = this.filter

    return {
      time_range: {
        begin_time: `${+begin}`,
        end_time: `${+end}`,
        time_field: dateType === 1 ? 'order_time' : 'receive_time',
      },
      need_summary_data: true,
      customer_name: search_text,
    }
  }
}

export default new Store()
export type { F }
