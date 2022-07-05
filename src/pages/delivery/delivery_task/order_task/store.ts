import { t } from 'gm-i18n'
import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import { LocalStorage } from '@gm-common/tool'
import {
  UpdateOrder,
  Order,
  OrderRelationInfoResponse,
  GetOrderStatistics,
} from 'gm_api/src/order'
import {
  ListDistributionContractor,
  DistributionContractor,
  Role_Type,
  ListGroupUser,
} from 'gm_api/src/enterprise'
import { LevelSelectDataItem } from '@gm-pc/react'
import {
  BatchUpdateOrderDriver,
  ListOrderWithRelation,
  OrderRelationInfo,
} from 'gm_api/src/orderlogic'

import { handleDriverSelect } from '../../util'
import { getValueArr, strToArr } from '@/pages/customer/util'

const INITFILTER = {
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  time_type: 1,
  state: 0,
  is_print: '',
  driver: [],
  route: [],
  quotation_ids: [],
  label: '',
  city_id: '',
  district_id: '',
  street_id: '',
  serial_no: '',
  customer_text: '',
  menu_period_group_ids: [],
  sort_by: {},
}

type FilterType = {
  begin_time: Date
  end_time: Date
  time_type: number
  state: number
  is_print: string
  driver: Array<any>
  route: Array<any>
  quotation_ids: Array<any>
  label: string
  city_id: string
  district_id: string
  street_id: string
  serial_no: string
  customer_text: string
  menu_period_group_ids: Array<any>
  sort_by: any
}

class Store {
  filter: FilterType = {
    ...INITFILTER,
  }

  labelList = [
    {
      text: '全部',
      value: '1',
    },
    {
      text: '部队',
      value: '1',
    },
  ]

  driverList = [{ text: t('老王'), value: '1' }]

  routeList = [{ text: t('南山'), value: '1' }]

  orderCount = 0
  orderList: Order[] = []
  ssuCategoryNumMap: Record<string, string> = {}
  ssuCategoryCheckedNumMap: Record<string, string> = {}
  selectedRecord: string[] = []
  isSelectedAll = false
  loading = true

  // 承运商
  driver_select_list: LevelSelectDataItem<string>[] = []

  relation_info: OrderRelationInfo & OrderRelationInfoResponse = {}

  changeFilter = <T extends keyof FilterType>(key: T, value: FilterType[T]) => {
    this.filter[key] = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  handleChangeSelect(key: 'selectedRecord' | 'isSelectedAll', selected: any) {
    this[key] = selected
  }

  handleChangeOrder<T extends keyof Order>(
    index: number,
    key: T,
    value: Order[T],
  ) {
    this.orderList[index][key] = value
  }

  fetchListDistributionContractor = () => {
    const req = Object.assign({
      paging: { limit: 999 },
      need_group_users: true,
    })
    ListDistributionContractor(req).then((json) => {
      const distribution_contractors = json.response
        .distribution_contractors as DistributionContractor[]
      const drivers = json.response.group_users
      this.driver_select_list = handleDriverSelect(
        distribution_contractors,
        drivers!,
      )
      return null
    })
  }

  getParams() {
    let {
      begin_time,
      end_time,
      time_type,
      quotation_ids,
      driver,
      state,
      serial_no,
      customer_text,
      is_print,
    } = this.filter
    const params =
      time_type === 1
        ? {
            order_time_from_time: `${+begin_time}`,
            order_time_to_time: `${+end_time}`,
          }
        : {
            order_receive_from_time: `${+begin_time}`,
            order_receive_to_time: `${+end_time}`,
          }
    // is_print : 0 全部打印状态 1 已打印  2 未打印
    is_print = is_print ? (is_print === '1' ? '1' : '2') : (is_print = '0')
    params.is_print = is_print
    return {
      ...params,
      order_ids: this.isSelectedAll ? undefined : this.selectedRecord,
      quotation_ids: getValueArr(quotation_ids),
      driver_ids: getValueArr(driver),
      states: strToArr(state),
      serial_nos: serial_no ? [serial_no] : undefined,
      customer_search_text: customer_text,
      menu_period_group_ids: _.map(
        this.filter.menu_period_group_ids,
        ({ value }) => value,
      ),
    }
  }

  paramsInit() {
    this.selectedRecord = []
    this.isSelectedAll = false
  }

  fetchList(params?: any) {
    const req = {
      route_ids: getValueArr(this.filter.route),
      city_ids: strToArr(this.filter.city_id),
      district_ids: strToArr(this.filter.district_id),
      street_ids: strToArr(this.filter.street_id),
      sort_by: this.filter.sort_by,
      filter: Object.assign(
        {
          common_list_order: this.getParams(),
          relation_info: {
            need_customer_info: true,
            need_quotation_info: true,
            need_sku_info: false,
            need_driver_info: true,
            need_user_info: true,
          },
          only_order_data: true,
        },
        params,
      ),
      relation: {
        need_customer_route_info: true,
      },
    }
    const req2 = Object.assign(
      {
        common_list_order: this.getParams(),
        sort_by: this.filter.sort_by,
      },
      params,
    )
    GetOrderStatistics(req2).then((json) => {
      this.ssuCategoryNumMap = json.response?.ssu_category_num_map || {}
      this.ssuCategoryCheckedNumMap =
        json.response?.ssu_category_checked_num_map || {}
    })
    return ListOrderWithRelation(req).then((json) => {
      this.orderList = json.response.response?.orders || []
      this.orderCount = Number(json.response.response!.paging?.count || 0)
      LocalStorage.set('delivory_order_count', this.orderCount)
      this.relation_info = {
        ...json.response.relation,
        ...json.response.response?.relation_info,
      }
      this.loading = false
      return json.response.response
    })
  }

  fetchDriverList() {
    const req = {
      paging: { limit: 999 },
      role_types: [Role_Type.BUILT_IN_DRIVER],
      need_distribution_contractor: true,
    }
    return ListGroupUser(req).then((json) => {
      this.driverList = _.map(json.response.group_users, (item) => {
        return {
          text: item.name,
          value: item.group_user_id,
        }
      })

      return json.response
    })
  }

  batchUpdateOrderDriver(driver_id: string) {
    const req = { filter: this.getParams(), driver_id }
    return BatchUpdateOrderDriver(req)
  }

  updateOrder(index: number) {
    return UpdateOrder({ order: this.orderList[index] })
  }

  reset() {
    this.filter = { ...INITFILTER }
  }
}

export default new Store()
