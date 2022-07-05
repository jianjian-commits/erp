import { action, computed, makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { MoreSelectDataItem, Tip } from '@gm-pc/react'
import {
  ListCustomer,
  Customer_Type,
  QuotationCustomerRelation,
  GetCustomer,
  GetCustomerResponse,
  UpdateCustomer,
} from 'gm_api/src/enterprise'
import {
  GetManyMealCalendar,
  GetManyMealCalendarRequest,
  CreateOrUpdateMealCalendar,
  GetQuotation,
  MealCalendar,
  MealCalendar_MealCalendarDatas,
} from 'gm_api/src/merchandise'
import { Filters_Bool } from 'gm_api/src/common'

import type { DefaultMealCount } from '../../type'
class MenuCalendarStore {
  customerId = ''

  resetMonth: number[] = []

  onReset = false

  curDate: moment.Moment = moment()

  CustomerData: MoreSelectDataItem[] = []

  CustomerInfo: GetCustomerResponse = {} as GetCustomerResponse

  QuotationRelations: QuotationCustomerRelation[] = []

  defaultMealCount: DefaultMealCount[] = []

  meal_calendars: MealCalendar[] = []

  constructor() {
    makeAutoObservable(this)
    this.init()
  }

  init = () => {
    this.customerId = ''
    this.defaultMealCount = []
    this.meal_calendars = []
    this.resetMonth = []
    this.onReset = false
  }

  @computed
  get effectedStatus() {
    return this.CustomerInfo?.customer?.attrs?.dining_calendar
  }

  @action
  setEffectedStatus(status: boolean) {
    if (this.CustomerInfo?.customer?.attrs)
      this.CustomerInfo.customer.attrs.dining_calendar = status
  }

  @computed
  get quotation_id() {
    return (
      this.QuotationRelations.find(
        (item) =>
          item.quotation_type === 2 && item.customer_id === this.customerId,
      )?.['quotation_id'] || ''
    )
  }

  @action
  fetchCustomers = (q?: string) => {
    return ListCustomer({
      paging: { limit: 999 },
      level: 2,
      need_service_periods: true,
      q: q || '',
      is_frozen: Filters_Bool.ALL,
      is_in_whitelist: Filters_Bool.ALL,
      type: Customer_Type.TYPE_SOCIAL,
      need_quotations: true,
      need_parent_customers: true,
    }).then((json) => {
      const { customers, quotation_relations } = json.response
      this.QuotationRelations = _.filter(
        quotation_relations,
        (item) => item.quotation_type === 2,
      )
      this.CustomerData = _.map(customers, (item) => ({
        text: t(item.name),
        value: item.customer_id,
      }))
    })
  }

  @action
  setCustomerId = (id: string) => {
    this.customerId = id
  }

  @action
  setCurDate = (date: moment.Moment) => {
    this.curDate = date
  }

  @action
  changeMealCount = (
    mealCalendatData: MealCalendar_MealCalendarDatas,
    date: moment.Moment,
  ) => {
    const target = this.meal_calendars.find(
      (item) => item.meal_time === `${date.valueOf()}`,
    )

    this.meal_calendars = [
      ...this.meal_calendars.filter(
        (item) => item.meal_time !== `${date.valueOf()}`,
      ),
      {
        ...(target || {}),
        // quotation_id: this.quotation_id,
        customer_id: this.customerId,
        meal_time: `${date.valueOf()}`,
        meal_calendar_datas: {
          meal_calendar_datas: {
            ...target?.meal_calendar_datas?.meal_calendar_datas,
            ...mealCalendatData,
          },
        },
      },
    ]
  }

  @action
  GetManyMealCalendar = async () => {
    const quotation_id = this.quotation_id
    // 获取这个菜谱下的餐次信息
    this.defaultMealCount = await Promise.all([
      GetQuotation({ quotation_id }).then((json) => {
        return json.response.menu_periods?.map(({ menu_period_group }) => ({
          name: menu_period_group.name,
          id: menu_period_group.menu_period_group_id,
        }))
      }),
      GetCustomer({ customer_id: this.customerId }).then((json) => {
        this.CustomerInfo = json.response
        const { default_dining_count, dining_calendar } =
          json.response.customer.attrs!
        return default_dining_count?.dinning_count_map
      }),
    ])
      .then(([res1, res2]) => {
        return (
          res1?.map((item) => ({
            ...item,
            count: res2?.[item.id] || 0,
          })) || []
        )
      })
      .catch(() => {
        return []
      })

    const params: GetManyMealCalendarRequest = {
      customer_id: this.customerId,
      meal_from_time: `${this.curDate.startOf('month').valueOf()}`,
      meal_end_time: `${this.curDate.endOf('month').valueOf()}`,
    }
    return this.onReset || this.resetMonth.includes(this.curDate.valueOf())
      ? null
      : GetManyMealCalendar(params).then((json) => {
          const { meal_calendars } = json.response
          _.forEach(meal_calendars, (item) => {
            if (
              !_.map(this.meal_calendars, (item) => item.meal_time).includes(
                item.meal_time,
              )
            ) {
              this.meal_calendars.push(item)
            } else {
              _.forEach(this.meal_calendars, (item2, index, origin) => {
                if (item2.meal_time === item.meal_time) {
                  origin[index] = { ...item, ...item2 }
                }
              })
            }
          })
          return meal_calendars
        })
  }

  @action
  CreateOrUpdateMealCalendar = async () => {
    await Promise.all([
      CreateOrUpdateMealCalendar({
        meal_calendars: this.meal_calendars as MealCalendar[],
      }),
      UpdateCustomer(this.CustomerInfo),
    ])
    Tip.success(t('操作成功'))
    this.meal_calendars = []
    this.onReset = false
    this.resetMonth = []
    this.GetManyMealCalendar()
    return null
  }

  @action
  changeEffectedStatus = (status: boolean) => {
    this.setEffectedStatus(status)
  }

  resetFunc = (mealCaledar: MealCalendar) => {
    _.forEach(
      mealCaledar.meal_calendar_datas?.meal_calendar_datas,
      (value, key, map) => {
        if ([0, 6].includes(moment(+mealCaledar.meal_time!).day())) {
          map[key] = '0'
        } else {
          const defaultCount = this.defaultMealCount
            .find((mealCaledar) => mealCaledar.id === key)
            ?.count.toString()
          if (defaultCount) {
            map[key] = defaultCount
          }
        }
      },
    )
  }

  @action
  resetMealCalendar = (type: 'CUR' | 'ALL') => {
    if (type === 'CUR') {
      _.forEach(this.meal_calendars, (item) => {
        // 重置当月数据
        if (moment(+item.meal_time!).month() === this.curDate.month()) {
          this.resetFunc(item as MealCalendar)
        }
      })
      this.resetMonth.push(this.curDate.valueOf())
    } else {
      _.forEach(this.meal_calendars, (item) => {
        this.resetFunc(item as MealCalendar)
      })
      this.onReset = true
    }
  }
}

export default new MenuCalendarStore()
