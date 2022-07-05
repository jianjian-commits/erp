import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  Filter,
  OrderSortingInfo,
  TotalInfo,
  WeightInfo,
  CategorySortingInfo,
  SsuSortingInfo,
} from './interface'
import { GetSortingInfo } from 'gm_api/src/sorting'
import {
  getCategoryInfo,
  getOrderSortingInfo,
  getOrderSortingInfo2,
  getSsuInfo,
} from './utils/tools'
import { ListServicePeriod, ServicePeriod } from 'gm_api/src/enterprise'
import { MoreSelectDataItem } from '@gm-pc/react'

const date = moment().startOf('day').toDate()
const initFilter = {
  receive_date: date,
  service_period_id: '',
}

export const initTotalInfo = {
  total_count: 0, // 总分拣任务数
  weight_count: 0, // 已称重任务数
  out_stock_count: 0, // 缺货任务数
  unweight_count: 0, // 未称重任务数
}

export const initWeightInfo = {
  weight_task_count: 0, // 记重任务数
  unweight_task_count: 0, // 不记重任务数
  ssu_count: 0, // 商品种类数
  customer_count: 0, // 商户数
}

export const initOrderSortingInfo: OrderSortingInfo = {
  total: 0,
  finished: 0,
  orders: [],
}

class Schedule {
  filter: Filter = { ...initFilter }

  /** 总体进度 */
  totalInfo: TotalInfo = initTotalInfo

  /** 分拣进度 */
  weightInfo: WeightInfo = initWeightInfo

  /** 订单分拣进度 */
  orderSortingInfo: OrderSortingInfo = initOrderSortingInfo

  /** 分类进度 */
  categorySortingInfo: CategorySortingInfo[] = []

  /** 商品分类进度 */
  ssuSortingInfo: SsuSortingInfo[] = []

  // 是否投屏
  isFullScreen: boolean = false

  /** 运营时间列表 */
  listServicePeriod: MoreSelectDataItem<string>[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init() {
    this.isFullScreen = false
  }

  fetchDate() {
    return GetSortingInfo({
      service_period_id: this.filter.service_period_id,
      receive_date: this.filter.service_period_id
        ? +this.filter.receive_date + ''
        : '',
    }).then((res) => {
      this.totalInfo = res.response.total_sorting_info!

      this.weightInfo = _.pick(
        res.response,
        'weight_task_count',
        'unweight_task_count',
        'ssu_count',
        'customer_count',
      )

      /** 订单分拣进度 */
      this.orderSortingInfo = {
        ...getOrderSortingInfo(res.response.order_sorting_info!),
        orders: getOrderSortingInfo2(
          res.response.order_customer_info!,
          res.response.customer_info!,
          res.response.order_sorting_info!,
        ),
      }

      /** 分类进度 */
      this.categorySortingInfo = getCategoryInfo(
        res.response.category_info!,
        res.response.category_sorting_info!,
      )

      /** 商品分拣进度 */
      this.ssuSortingInfo = getSsuInfo(
        res.response.ssu_info!,
        res.response.ssu_sorting_info!,
      )

      return res
    })
  }

  fetchServicePeriod() {
    const req = { paging: { limit: 999 } }
    ListServicePeriod(req).then((json) => {
      const service_period = _.map(
        json.response.service_periods,
        (item: ServicePeriod) => {
          return {
            value: item.service_period_id || '',
            text: item.name || '',
          }
        },
      )
      this.listServicePeriod = service_period
      return json.response
    })
  }

  setFilter<T extends keyof Filter>(field: T, value: Filter[T]) {
    this.filter[field] = value
  }

  setFullScreen(value: boolean) {
    this.isFullScreen = value
  }
}

export default new Schedule()
