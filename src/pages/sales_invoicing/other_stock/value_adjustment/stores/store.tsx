import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { ListAdjustSheet } from 'gm_api/src/inventory'
import { AdjustSheet } from 'gm_api/src/inventory/types'

import _ from 'lodash'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'

interface FilterType {
  begin_time: Date
  end_time: Date
  q: string
  adjust_sheet_status: number
  creator_ids?: any
}

class Store {
  filter: FilterType = {
    begin_time: moment().startOf('day').add(-29, 'days').toDate(),
    end_time: moment().endOf('day').toDate(),
    q: '',
    adjust_sheet_status: 0,
    creator_ids: undefined,
  }

  active_tab = 'all'

  list: AdjustSheet[] = []

  changeTab = (value: string) => {
    this.active_tab = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const { begin_time, end_time, creator_ids, ...other } = this.filter
    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })
    return {
      begin_time: +begin_time,
      end_time: +end_time,
      creator_ids: creatorIds,
      ...other,
    }
  }

  changeFilter = <T extends keyof FilterType>(key: T, value: FilterType[T]) => {
    this.filter[key] = value
  }

  fetchSheetList(params: TableRequestParams) {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())
    return ListAdjustSheet(req).then((json) => {
      this.list = json.response.adjust_sheets
      return json.response
    })
  }
}

export default new Store()
export type { FilterType }
