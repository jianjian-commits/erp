import { makeAutoObservable, toJS } from 'mobx'
import _, { join } from 'lodash'
import moment from 'moment'
import { GetManyCustomer, Customer, GetCustomer } from 'gm_api/src/enterprise'
import { Query, PresetType } from 'gm_api/src/databi'
import { ListMenuPeriodGroup, MenuPeriod } from 'gm_api/src/eshop'
import { getModelValuesKV } from '@/common/util'
export interface FilterOptions {
  selected_school: levelList[]
  begin: Date
  end: Date
}

export interface levelList {
  value: string
  text: string
  children?: levelList[]
}

export interface ListOption extends Customer {
  customer_id_l1: string
  order_id_count: string
  sale_price_sum: string
}

class Store {
  filter: FilterOptions = {
    selected_school: [],
    begin: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate(),
  }

  meals_settlement_list: ListOption[] = []

  print_data_: any[] = []

  // 餐次key : 餐次name
  meal_time_map: { [key: string]: string } = {}

  // 学校key: 学name
  school_map: { [key: string]: string } = {}

  selected: string[] = []

  setSelected(selected: string[]) {
    this.selected = selected
  }

  reSetSelected() {
    this.selected = []
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  // 对账单列表
  fetchSettlementList() {
    const { begin, end, selected_school } = this.filter
    const school_ids = _.map(selected_school, (it) => it.value)

    let ids = ''
    _.map(school_ids, (item) => {
      ids = ids + item + ','
    })

    const send_school_ids = ids.substr(0, ids.length - 1)

    return Query({
      time_ranges: [
        {
          begin_time: `${+begin}`,
          end_time: `${+end}`,
        },
      ],
      preset_type: PresetType.PRESET_TYPE_ORDER_ORDER_ESHOP_RANK,
      // preset_type: 20483001, // 要换成枚举
      expr: {
        filter_string: school_ids.length
          ? `customer_id_l1 IN (${send_school_ids})`
          : '',
      },
    }).then((json) => {
      const _list = getModelValuesKV(json?.response?.data?.[0]?.model_values)

      // 学校ID集
      const customer_ids: string[] = _.map(_list, (m) => m.customer_id_l1)

      // 根据学校id, 批量获得学校信息
      if (json?.response?.data![0]?.model_values?.length) {
        GetManyCustomer({ customer_ids }).then((json) => {
          const { customers } = json.response
          this.meals_settlement_list = _.map(_list, (it) => {
            return {
              ...it,
              ...customers![it?.customer_id_l1!],
            }
          })
          return json.response
        })
      } else {
        // 如果json?.response?.data![0]?.model_values?.length === 0,列表置空
        this.meals_settlement_list = []
      }

      return json.response
    })
  }

  // 打印
  fetchPrinter(filter_data: string) {
    const { begin_time, end_time, selected } = JSON.parse(filter_data)
    let ids = ''
    _.map(selected, (item) => {
      ids = ids + item + ','
    })

    const send_school_ids = ids.substr(0, ids.length - 1)

    return Query({
      time_ranges: [
        {
          begin_time,
          end_time,
        },
      ],
      preset_type: PresetType.PRESET_TYPE_ORDER_ORDER_ESHOP_CUSTOMER_TREND,
      // preset_type: 20483002, // 要换成枚举
      expr: {
        filter_string: selected.length
          ? `customer_id_l1 IN (${send_school_ids})`
          : '',
        // group_by_fields: [
        //   { name: 'receive_time', expr: 'toYYYYMMDD' },
        //   { name: 'service_period_id' },
        // ],
      },
    }).then((json) => {
      const { data } = json.response
      const good_data: any[] = []

      // data只有一个item
      _.forEach(data!, (item) => {
        const model_values = item?.model_values // 数组，包含所有所选学校的的所有餐次
        const table = getModelValuesKV(model_values)

        // 根据学校ID分组
        const school_grouped = _.groupBy(table, 'customer_id_l1')
        if (school_grouped) {
          _.map(Object.keys(school_grouped!), (v) => {
            const base_table = school_grouped![v] // 取到学校下面的数组
            let meal_count = 0 // 用餐人数合计
            let money_sum = 0 // 金额合计
            _.forEach(base_table, (it) => {
              meal_count = meal_count + Number(it?.order_id_count!)
              money_sum = money_sum + Number(it?.sale_price_sum!)
            })

            // 汇总表数据，相同餐次的数据合并
            const meal_grouped = _.groupBy(base_table, 'service_period_id')
            const sum_table = _.map(meal_grouped, (arr, key) => {
              // 合并用餐人次和金额
              let number = 0
              let money = 0
              _.map(arr, (f) => {
                number = number + Number(f?.order_id_count!)
                money = money + Number(f?.sale_price_sum!)
              })
              return {
                key,
                number,
                money,
              }
            })
            good_data.push({
              school_name: v, // 学校ID
              sum_table,
              table: base_table,
              meal_count: meal_count,
              money_sum: money_sum,
            })
          })
        }
      })

      this.print_data_ = good_data

      const customer_ids = _.map(good_data, (it) => it?.school_name!) // 学校ID集合

      console.warn('jj', good_data, customer_ids)
      // 根据学校id, 批量获得学校信息
      if (json?.response?.data![0]?.model_values?.length) {
        GetManyCustomer({ customer_ids }).then((json) => {
          const { customers } = json.response
          const school_map_: { [key: string]: string } = {}
          _.map(Object.values(customers), (it) => {
            school_map_[it?.customer_id!] = it?.name!
          })
          this.school_map = school_map_
          return json.response
        })
      }

      return json.response
    })
  }

  // 餐次列表
  fetchMealTimes() {
    return ListMenuPeriodGroup({ paging: { limit: 999 } }).then((json) => {
      const { menu_period } = json.response
      const meal_name_map: { [key: string]: string } = {}
      if (menu_period) {
        _.map(menu_period, (item) => {
          meal_name_map[item?.service_period?.service_period_id!] =
            item?.service_period?.name
        })
      }
      this.meal_time_map = meal_name_map

      return json.response
    })
  }
}

export default new Store()
