import { makeAutoObservable } from 'mobx'
import {
  GetMenu,
  ListEshopMenuDetail,
  DeleteMenuDetailSku,
  MenuDetail,
  BatchSaveEshopMenuDetail,
} from 'gm_api/src/merchandise'
import { BatchCreateEducationOrder } from 'gm_api/src/eshop'
import { ListHoliday, Holiday } from 'gm_api/src/preference'
import moment from 'moment'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { initFilter, initSummary, initSku } from './init_data'

interface FilerType {
  meal_date_start: Date
  meal_date_end: Date
}

interface SummaryType {
  count: string
  total_price: string
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter: FilerType = { ...initFilter }

  // 餐次列表
  menuPeriodGroup: any[] = []

  // 总数、总售价
  summary: SummaryType = { ...initSummary }

  // 菜谱详情
  menu_details: MenuDetail[] = []

  // 节假日列表
  holidays: Holiday[] = []

  menu = {}

  menuName = ''

  selectedAll = false

  menuList: any[] = []

  editMenu = {}

  // 被删除的商品
  delMeals: string[] = []

  // 记录日期check
  checkDateArr: boolean[] = []

  // 记录餐次check
  checkPeriodArr: boolean[] = []

  initData() {
    this.menuPeriodGroup = []
    // 按产品的要求重新进到页面时筛选项filter沿用上次的选项，故销毁页面时filter不做初始化
    // this.filter = { ...initFilter }
    this.summary = { ...initSummary }
    this.menu_details = []
    this.holidays = []
    this.menuName = ''
    this.editMenu = {}
    this.delMeals = []
    this.menu = {}
    this.checkDateArr = []
    this.checkPeriodArr = []
    this.selectedAll = false
  }

  /**
   * @description 获取字符串类型的时间参数
   * @returns {meal_date_start: string, meal_date_end: string}
   */
  getDateParams() {
    const { meal_date_start, meal_date_end } = this.filter
    return {
      meal_date_start: moment(meal_date_start).valueOf().toString(),
      meal_date_end: moment(meal_date_end).valueOf().toString(),
    }
  }

  changeFilter<T extends keyof FilerType>(name: T, value: FilerType[T]) {
    this.filter[name] = value
  }

  /**
   * @description 获取节假日列表
   */
  fetchHolidayList() {
    const { meal_date_start, meal_date_end } = this.filter
    const req = {
      date_start: moment(meal_date_start).format('YYYYMMDD'),
      date_end: moment(meal_date_end).format('YYYYMMDD'),
    }
    return ListHoliday(req).then((res) => {
      this.holidays = res.response.holidays
      return res.response
    })
  }

  setCountAndPrice(details: MenuDetail[]) {
    const count = details
      .reduce((pre, cur) => pre.plus(cur.sku_count || 0), Big(0))
      .toString()
    const total_price = details
      .reduce((pre, cur) => pre.plus(cur.price || 0), Big(0))
      .toString()
    this.summary = { count, total_price }
  }

  /**
   *  @description ListEshopMenuDetail 获取菜谱的数据
   */
  fetchList(menu_id: string) {
    const req = {
      menu_id,
      ...this.getDateParams(),
      paging: { limit: 999 },
    }
    return ListEshopMenuDetail(req).then((res) => {
      const details = res.response.menu_details || []
      this.menu_details = details
      this.setCountAndPrice(details)
      return res.response
    })
  }

  /**
   * @description 从menu中获取餐次、菜谱等信息
   * @param menu_id
   */
  getMenu(menu_id: string) {
    return GetMenu({ menu_id }).then((res) => {
      const menu = res.response.menu
      this.menuPeriodGroup =
        menu.menu_period_info?.menu_periods?.map((e) => {
          return { ...e.menu_period_group, price: e.meal_label }
        }) || []
      this.menu = menu
      this.menuName = menu.outer_name || ''
      return res.response
    })
  }

  // 初始化checkbox
  initCheckArr(date: number, period: number) {
    this.selectedAll = false
    this.checkDateArr = new Array(date).fill(false)
    this.checkPeriodArr = new Array(period).fill(false)
  }

  setDateChecked(index: number) {
    const checked = this.checkDateArr[index]
    this.checkDateArr[index] = !checked
  }

  setPeriodChecked(index: number) {
    const checked = this.checkPeriodArr[index]
    this.checkPeriodArr[index] = !checked
  }

  setAllChecked() {
    this.selectedAll = !this.selectedAll
    this.checkDateArr = this.checkDateArr.map((_, index) => {
      if (this.menuList[index].disabled) return false
      return this.selectedAll
    })
    this.checkPeriodArr = this.checkPeriodArr.map(() => this.selectedAll)
  }

  collectMenuDetailIds() {
    const menu_detail_ids = []
    for (let i = 0; i < this.checkDateArr.length; i++) {
      const dateData = this.menuList[i]
      if (dateData.disabled || !this.checkDateArr[i]) continue
      for (let j = 0; j < this.checkPeriodArr.length; j++) {
        const periodData = dateData.periodInfos[j]
        if (
          !this.checkPeriodArr[j] ||
          !periodData.sku_count ||
          periodData.sku_count === '0'
        )
          continue
        menu_detail_ids.push(periodData.menu_detail_id)
      }
    }
    return menu_detail_ids
  }

  // 获取当前日期的节假日信息
  getHolidayMsg(menu_time: string) {
    const holiday = _.find(
      this.holidays,
      (day) => moment(day.date).format('YYYY-MM-DD') === menu_time,
    )
    const isHoliday = _.get(holiday, 'holiday', '10') !== '10'
    const holidayName = isHoliday ? _.get(holiday, 'holiday_cn', '') : ''
    return { isHoliday, holidayName }
  }

  generateMenuList(menu_id: string) {
    const { meal_date_start, meal_date_end } = this.filter
    const span = moment(meal_date_end).diff(meal_date_start, 'day') + 1
    this.initCheckArr(span, this.menuPeriodGroup.length)
    const list = []
    for (let i = 0; i < span; i++) {
      const date = moment(meal_date_start).add(i, 'd').valueOf().toString()
      const menu_time = moment(meal_date_start).add(i, 'd').format('YYYY-MM-DD')
      const items = _.filter(this.menu_details, (md) => md.meal_date === date)
      const periodInfos = _.map(this.menuPeriodGroup, (mp) => {
        const item = _.find(
          items,
          (item) => item.menu_period_group_id === mp.menu_period_group_id,
        )
        const detail_skus = _.get(item, 'detail_skus', [{ ...initSku }])
        return {
          generate_order: false,
          ..._.pick(mp, ['name', 'menu_period_group_id', 'price']),
          menu_id,
          meal_date: moment(menu_time).valueOf(),
          detail_skus,
          // 上面的数据是为了保证item为空时，新建餐次的必填数据依然有
          ...item,
        }
      })
      const overdue = moment(menu_time).isBefore(
        moment(new Date()).add(-1, 'days'),
      )
      const noGoods = periodInfos.every(
        (info) => !info.sku_count || info.sku_count === '0',
      )
      list.push({
        disabled: overdue || noGoods, // 已过期或者没有商品的餐次不能被勾选
        menu_time,
        ...this.getHolidayMsg(menu_time),
        periodInfos,
      })
    }
    this.menuList = list
  }

  setEditMenu(dayIndex: number) {
    this.editMenu = _.cloneDeep(this.menuList[dayIndex])
    return Promise.resolve(null)
  }

  changeMealItemName(mealIndex: number, skuIndex: number, obj: any) {
    Object.assign(this.editMenu.periodInfos[mealIndex]?.detail_skus[skuIndex], {
      ...obj,
    })
  }

  setDelMeals(meals: any[]) {
    this.delMeals = meals
  }

  addMealItem(mealIndex: number) {
    const detail_skus = _.get(
      this.editMenu,
      `periodInfos[${mealIndex}].detail_skus`,
    )
    if (detail_skus) {
      detail_skus.push({ ...initSku })
    }
  }

  deleteMealItem(mealIndex: number, skuIndex: number) {
    const detail_skus = _.get(
      this.editMenu,
      `periodInfos[${mealIndex}].detail_skus`,
    )
    if (detail_skus) {
      const delMeal = detail_skus.splice(skuIndex, 1)[0]
      // 被删除的sku中如果有menu_detail_sku_id字段，那么说明是之前就存在的商品
      // 需要将这些商品存起来，然后调用删除的接口
      if (delMeal.menu_detail_sku_id) {
        this.delMeals.push(delMeal.menu_detail_sku_id)
      }
    }
  }

  // verifyDetailSku(msg: any) {
  //   if (!msg.count || !msg.unit_id) {
  //     Tip.danger(t('请填写完整的商品信息'))
  //     throw Error
  //   }
  // }

  collectMenuDetails() {
    const menu_details: any[] = []
    const infos = _.get(this.editMenu, 'periodInfos', [])
    infos.forEach((info: any) => {
      const detail_skus = _.get(info, 'detail_skus', [])
        .filter((e: any) => e.sku_id)
        .map((e: any) => {
          return {
            ..._.omit(e, ['sku']),
            menu_id: info.menu_id,
            count: String(e.count),
          }
        })

      if (detail_skus.length > 0) {
        const data = {
          ..._.omit(info, ['name']),
          detail_skus,
        }
        menu_details.push(data)
      }
    })
    return menu_details
  }

  handleCreateOrEditMenu() {
    const menu_details = this.collectMenuDetails()
    return BatchSaveEshopMenuDetail({ menu_details }).then((res) => {
      return res.response
    })
  }

  handleDeleteMenuSku() {
    return DeleteMenuDetailSku({ menu_detail_sku_ids: this.delMeals }).then(
      (res) => {
        return res.response
      },
    )
  }

  /**
   * @description 生成订单
   * @param menu_detail_ids 用户勾选的menu_detail_id集合
   */
  createOrder(menu_detail_ids: string[]) {
    return BatchCreateEducationOrder({
      menu_detail_ids,
    }).then((res) => {
      return res.response
    })
  }
}

export default new Store()
