import { makeAutoObservable } from 'mobx'
import {
  GetQuotation,
  Quotation,
  Quotation_Type,
  ListMenuDetailRequest,
  ExportMenuDetail,
} from 'gm_api/src/merchandise'
import moment from 'moment'
import { getMondayAndSunday, getEffectiveCycle } from '@/common/service'

const today = new Date()
const { monday, sunday } = getMondayAndSunday(today)

interface QuotationInfo extends Quotation {
  valid_start?: string
  valid_end?: string
}

const initQuotation = {
  quotation_id: '',
  type: Quotation_Type.WITH_TIME,
  update_valid_time: {},
}

const initFilter = {
  quotation_id: '',
  menu_from_time: monday,
  menu_to_time: sunday,
}

class VegetablesMenuDetailStore {
  quotation: QuotationInfo = { ...initQuotation }

  filter: ListMenuDetailRequest = { ...initFilter }

  // 填组件的坑,增加searchNum的值触发fetchList
  searchNum: number = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get getSearchData() {
    const { quotation_id, menu_from_time, menu_to_time } = this.filter
    return {
      quotation_id,
      menu_from_time: moment(menu_from_time).format('x'),
      menu_to_time: moment(menu_to_time).format('x'),
    }
  }

  getQuotation(quotation_id: string) {
    return GetQuotation({ quotation_id }).then((json) => {
      const { end, begin } = getEffectiveCycle(
        json.response.quotation.update_valid_time,
      )
      this.quotation = {
        ...json.response.quotation,
        valid_end: end,
        valid_start: begin,
      }
      return json
    })
    // this.quotation = {
    //   quotation_id: '335064373913452599',
    //   revision: '335064373913452599',
    //   create_time: '1609243529839',
    //   update_time: '1609243529839',
    //   delete_time: '0',
    //   group_id: '326828001767456792',
    //   station_id: '326828001817788442',
    //   inner_name: '111',
    //   outer_name: '111',
    //   description: '-',
    //   is_active: true,
    //   is_default: true,
    //   type: 2,
    //   // 可见餐次
    //   avail_menu_period_groups: {
    //     menu_period_group_ids: ['329975988232388684', '329975988232388694'],
    //   },
    //   update_valid_time: {
    //     cycle_type: 2,
    //     start_day: '1',
    //     start_time: '0',
    //   },
    //   ssu_count: '225',
    //   customer_type: 2,
    // }
  }

  init() {
    this.quotation = { ...initQuotation }
    this.filter = { ...initFilter }
  }

  changeFilter<T extends keyof ListMenuDetailRequest>(
    name: T,
    value: ListMenuDetailRequest[T],
  ) {
    this.filter[name] = value
  }

  fetchList() {
    this.searchNum = this.searchNum + 1
  }

  export() {
    return ExportMenuDetail({ list_menu_detail_request: this.getSearchData })
  }
}

export default new VegetablesMenuDetailStore()
