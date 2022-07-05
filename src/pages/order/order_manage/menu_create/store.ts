import { Order, Status_Code } from 'gm_api/src/order'
import {
  BatchCreateOrderByMenu,
  BatchCreateOrderByMenuRequest_Type,
} from 'gm_api/src/orderlogic'
import { makeAutoObservable, computed } from 'mobx'
import _ from 'lodash'
import timezone from 'moment-timezone'
import {
  Customer,
  ListCustomer,
  QuotationCustomerRelation,
} from 'gm_api/src/enterprise'
import { getEffectiveCycle } from '@/common/service'
import { ServicePeriodInfoProps } from '@/common/components/quotation_detail/interface'
import { handleMealToOrder, getParams, getMenuOrderSummary } from './util'
import { Field, CustomerWithSelectDataItem, Summary } from './interface'
import {
  GetOrderSettings,
  OrderSettings_CombineRound,
} from 'gm_api/src/preference'
import { Filters_Bool } from 'gm_api/src/common'
import {
  GetManyMealCalendar,
  GetManyMealCalendarRequest,
  MealCalendar,
} from 'gm_api/src/merchandise'
import moment from 'moment'
import { isValid, toFixed } from '@/common/util'
import Big from 'big.js'

class Store {
  field: Field = {
    menu: undefined,
    customer: undefined,
    customers: [],
  }

  // 根据选择的不同菜谱展示，所以直接在这边请求
  customers: CustomerWithSelectDataItem[] = []

  menuCustomers: CustomerWithSelectDataItem[] = []

  quotationOfCustomers: QuotationCustomerRelation[] = []

  // 下单列表
  orders: Order[] = []

  orderSetting: { [k: string]: boolean } = {}

  summary: Summary[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  GetMenu() {
    const { begin, end } = getEffectiveCycle(
      this.field.menu?.original.update_valid_time!,
    )
    Object.assign(this.field.menu?.original!, {
      valid_start: begin,
      valid_end: end,
    })
  }

  fetchCustomers() {
    ListCustomer({
      is_bill_target: Filters_Bool.FALSE,
      is_ship_target: Filters_Bool.FALSE,
      is_frozen: Filters_Bool.FALSE,
      paging: { limit: 999 },
      type: 2,
      level: 2,
      bind_quotation_with_time: Filters_Bool.TRUE,
      need_quotations: true,
    }).then((json) => {
      const { customers, quotation_relations } = json.response
      this.customers = _.map(customers || [], (c) => ({
        ...c,
        value: c.customer_id,
        text: c.name,
        original: { ...c },
      }))
      this.quotationOfCustomers = quotation_relations || []
      return json
    })
  }

  @computed
  get summaryList() {
    return getMenuOrderSummary(this.orders)
  }

  updateField<T extends keyof Field>(key: T, value: Field[T]) {
    this.field[key] = value

    // 菜谱生效时间，拉取菜谱生效周期的每日餐次
    if (key === 'menu') {
      this.GetMenu()
      this.menuCustomers = _.filter(
        this.customers,
        (c) =>
          _.findIndex(
            this.quotationOfCustomers,
            (qc) =>
              qc.customer_id === c.customer_id &&
              qc.quotation_id === this.field.menu?.value,
          ) !== -1,
      )
      this.field.customers = []
    }
  }

  async setSelected(val: (ServicePeriodInfoProps & { menu_time: string })[]) {
    // 若是没有选择客户，默认给商户下所有绑定该菜谱客户下单
    let customers = (this.field.customers || []).slice()
    if (!customers.length) {
      customers = _.filter(
        this.customers,
        (c) =>
          _.findIndex(
            this.quotationOfCustomers,
            (qc) =>
              qc.customer_id === c.customer_id &&
              qc.quotation_id === this.field.menu?.value,
          ) !== -1,
      )
    }

    const startTimeStamp =
      val.length > 1
        ? _.reduce(val, (pre: any, cur: any) =>
            moment(pre.menu_time).valueOf() < moment(cur.menu_time).valueOf()
              ? moment(pre.menu_time).valueOf()
              : moment(cur.menu_time).valueOf(),
          )
        : moment(val[0].menu_time).valueOf()

    const endTimeStamp =
      val.length > 1
        ? _.reduce(val, (pre: any, cur: any) =>
            moment(pre.menu_time).valueOf() > moment(cur.menu_time).valueOf()
              ? moment(pre.menu_time).valueOf()
              : moment(cur.menu_time).valueOf(),
          )
        : moment(val[0].menu_time).valueOf()
    const mealCalendar: MealCalendar[][] = await Promise.all(
      _.map(customers, (customer) =>
        this.GetManyMealCalendar(
          startTimeStamp as number,
          endTimeStamp as number,
          customer.customer_id,
        ),
      ),
    )

    const orders = handleMealToOrder(val, customers) as (Order & {
      menu_time: string
      customer: Customer
      total_price: string
    })[]

    this.orders = _.map(orders, (item) => {
      const target = _.find(mealCalendar, (item2) => {
        return _.find(
          item2,
          (item3) => item3.customer_id === item.customer.customer_id,
        )
      })
      // 获取就餐日历人数
      const countInCalendar = _.find(
        target as MealCalendar[],
        (item2) => +item2.meal_time! === moment(item.menu_time).valueOf(),
      )?.meal_calendar_datas?.meal_calendar_datas?.[
        item.menu_period_group_id as string
      ]

      // 如果日历生效
      if (item?.customer?.attrs?.dining_calendar) {
        // 周末的比较特殊,开启日历时，日历默认人数是0
        if ([0, 6].includes(moment(item.menu_time).day())) {
          // 没有设置日历人数，或者设置成了0,
          if (!countInCalendar || countInCalendar === '0') {
            return {
              ...item,
              dining_count: '0',
              total_price: '0',
            }
          } else {
            return {
              ...item,
              dining_count: countInCalendar,
              total_price: isValid(countInCalendar)
                ? toFixed(
                    Big(countInCalendar)
                      // .div(Big(item.dining_count!))
                      .times(item.price),
                  )
                : '-',
            }
          }
        } else {
          // 工作日
          // 日历人数和默认人数不同时，以日历为准
          if (countInCalendar && countInCalendar !== item.dining_count)
            return {
              ...item,
              dining_count: countInCalendar,
              total_price: isValid(countInCalendar)
                ? toFixed(
                    Big(countInCalendar)
                      // .div(Big(item.dining_count!))
                      .times(item.price),
                  )
                : '-',
            }
        }
      }

      return item
    })

    return Promise.resolve(null)
  }

  /**
   * @description: 获取就餐日历人数
   * @param {number} startTimeStamp
   * @param {number} endTimeStamp
   * @return {*}
   */
  GetManyMealCalendar = (
    startTimeStamp: number,
    endTimeStamp: number,
    customerId: string,
  ) => {
    const params: GetManyMealCalendarRequest = {
      customer_id: customerId,
      meal_from_time: `${startTimeStamp}`,
      meal_end_time: `${endTimeStamp}`,
    }
    return GetManyMealCalendar(params).then((json) => {
      const { meal_calendars } = json.response
      return meal_calendars
    })
  }

  changeOrderItem(index: number, obj: any) {
    this.orders[index] = { ...this.orders[index], ...obj }
  }

  deleteOrderItem(index: number) {
    this.orders.splice(index, 1)
  }

  batchCreateOrder(type: BatchCreateOrderByMenuRequest_Type) {
    return BatchCreateOrderByMenu(
      {
        orders: getParams(this.orders),
        time_zone: timezone.tz.guess(),
        type,
      },
      [Status_Code.CODE_HAS_REPEAT_ORDER],
    )
  }

  // 暂时在这里拉一次订单取整规则设置
  /** 获取订单取整设置 */
  fetchOrderSetting(): Promise<unknown> {
    return GetOrderSettings().then((res) => {
      const { combine_round_method } = res.response.order_settings
      const method = 1 << 3
      const when = 1 << 5
      const close =
        (combine_round_method! &
          OrderSettings_CombineRound.COMBINEROUND_CLOSE) ===
        1
      const combine_method = combine_round_method! & (method - 1)
      const combine_method_when = combine_round_method! & (when - method)

      this.orderSetting = {
        COMBINEROUND_CLOSE: close,
        COMBINEROUND_UP: close
          ? false
          : combine_method === OrderSettings_CombineRound.COMBINEROUND_UP,
        COMBINEROUND_MID: close
          ? false
          : combine_method === OrderSettings_CombineRound.COMBINEROUND_MID,
        COMBINEROUND_WHEN_BEFORE: close
          ? false
          : combine_method_when ===
            OrderSettings_CombineRound.COMBINEROUND_WHEN_BEFORE,
        COMBINEROUND_WHEN_AFTER: close
          ? false
          : combine_method_when ===
            OrderSettings_CombineRound.COMBINEROUND_WHEN_AFTER,
      }
      return null
    })
  }

  init() {
    this.field = {
      menu: undefined,
      customer: undefined,
      customers: [],
    }
    this.menuCustomers = []
    this.orders = []
    this.summary = []
  }
}

export default new Store()
