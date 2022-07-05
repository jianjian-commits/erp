import { makeAutoObservable, toJS } from 'mobx'
import moment from 'moment'
import timezone from 'moment-timezone'
import _ from 'lodash'
import { SummaryProps, menuPeriodOptions, effectCycleProps } from './interface'
import {
  GetMenu,
  // ListMenuDetail,
  // ListMenuDetailRequest,
  ListEshopMenuPeriodGroup,
  MenuPeriodGroup_Type,
  UpdateMenuDetail,
  CreateMenuDetail,
  CreateProductOrder,
  GetMenuDetailSku,
  ListEshopMenuDetail,
  ListEshopMenuDetailRequest,
  ListMenuDetailSku,
  CreateMenuDetailSku,
  UpdateMenuDetailSku,
  DeleteMenuDetailSku,
  Menu_MenuPeriodInfo_MenuPeriod,
  MenuPeriodGroup,
} from 'gm_api/src/merchandise'
import { GetPackBom } from 'gm_api/src/production'
import { handleMenuList, canSelected } from './util'
import { getMondayAndSunday, getEffectiveCycle } from '@/common/service'
import { initBomItem, initSsu } from './init_data'

const today = new Date()
const { monday, sunday } = getMondayAndSunday(today)
const initFilter = {
  menu_id: '',
  meal_date_start: monday,
  meal_date_end: sunday,
  paging: { limit: 999 },
}

const initSummary = {
  count: 0,
  total_price: '',
}

const initEffetcCycle = {
  begin: today,
  end: today,
}

class MenuDetailStore {
  filter: ListEshopMenuDetailRequest = { ...initFilter }

  summary: SummaryProps = { ...initSummary }

  menuList: Menu_MenuPeriodInfo_MenuPeriod[] = []

  // 餐次列表
  menuPeriodGroup: MenuPeriodGroup[] = []

  // 是否展开所有
  expandAll = false

  // 是否选择所有
  selectedAll = false

  // 菜谱生效时间
  effectCycle: effectCycleProps = initEffetcCycle

  editMenu = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get getFilter() {
    const { meal_date_start, meal_date_end, paging } = this.filter
    return {
      meal_date_start: '' + moment(meal_date_start).startOf('day').format('x'),
      meal_date_end:
        '' + moment(meal_date_end).add('d', 1).startOf('day').format('x'),
      paging,
    }
  }

  get selectedMenuIds() {
    return _.map(this.menuList, (menu) => {
      if (menu?.selected) return menu.menu_detail_id
    }).filter((_) => _)
  }

  changeFilter<T extends keyof ListEshopMenuDetailRequest>(
    name: T,
    value: ListEshopMenuDetailRequest[T],
  ) {
    this.filter[name] = value
  }

  // 进来第一次判断有没有餐次来设置菜品
  fetchListMenuPeriodGroup() {
    return ListEshopMenuPeriodGroup({
      paging: { limit: 999 },
      type: MenuPeriodGroup_Type.ESHOP,
    }).then((json) => {
      this.menuPeriodGroup = json.response.menu_period_groups!

      return json
    })
  }

  /***
   * @description 进来获取菜谱餐次
   */
  fetchMenu(menu_id: string) {
    return GetMenu({ menu_id }).then((json) => {
      this.menuList = json.response.menu.menu_period_info?.menu_periods || []
      const { meal_date_start, meal_date_end } = this.filter
      const replace_time = {
        start_time: meal_date_start,
        end_time: meal_date_end,
      }
      // 计算生效周期
      const { begin, end } = getEffectiveCycle(replace_time)
      this.effectCycle = { begin, end }
      this.filter.meal_date_start = begin
      this.filter.meal_date_end = end

      return json
    })
  }

  /**
   *  @description ListEshopMenuDetail 获取菜谱的商品总数
   */
  fetchList(menu_id: string) {
    const { meal_date_start, meal_date_end } = this.filter
    return ListEshopMenuDetail({ ...this.getFilter, menu_id }).then((json) => {
      console.log(json, 'json')
      // 列出所选餐次数
      // const avail_menu_period_groups = json.response.menu_details
      // const avail_menu_period_groups = json.response.menu_details
      //   .avail_menu_period_groups || ['1', '2']
      // this.menuPeriodGroup = _.filter(
      //   this.menuPeriodGroup,
      //   ({ menu_period_group_id }) =>
      //     _.includes(avail_menu_period_groups, menu_period_group_id),
      // )

      // 入口 需要list整理的地方
      const { list, count, total_price } = handleMenuList({
        ...json.response.menu_details,
        menuPeriodGroup: this.menuPeriodGroup,
        meal_date_start,
        meal_date_end,
        begin: this.effectCycle.begin,
        end: this.effectCycle.end,
      })
      console.log('list', toJS(list))
      this.menuList = list
      this.summary = {
        count,
        total_price,
      }

      return json
    })
  }

  clear() {
    this.filter = { ...initFilter }
    this.summary = { ...initSummary }
    this.menuList = []
    this.editMenu = {}
    this.expandAll = false
    this.selectedAll = false
    this.menuPeriodGroup = []
    this.effectCycle = { ...initEffetcCycle }
  }

  changeSelectedAll() {
    this.selectedAll = !this.selectedAll

    const list = this.menuList
    _.forEach(list, (l) => {
      if (canSelected(l)) {
        Object.assign(l, { selected: this.selectedAll })
      }
    })
    this.menuList = list
  }

  checkMenu(dayIndex: number) {
    this.menuList[dayIndex].selected = !this.menuList[dayIndex]?.selected

    if (this.selectedAll) {
      this.selectedAll = false
    } else if (
      this.selectedMenuIds?.length ===
      _.filter(this.menuList, (l) => canSelected(l))?.length
    ) {
      this.selectedAll = true
    }
  }

  changeExpand() {
    this.expandAll = !this.expandAll
  }

  packageMenuDetailData(menu_id: string, dayIndex?: number) {
    const menuDetail =
      dayIndex === undefined
        ? _.cloneDeep(this.editMenu)
        : _.cloneDeep(this.menuList[dayIndex])
    // const menuDetail =
    //   dayIndex === undefined ? this.editMenu : this.menuList[dayIndex]

    menuDetail.details.service_period_infos = _.filter(
      menuDetail?.details?.service_period_infos,
      (spi) => {
        spi.details = _.map(spi.details, (detail) => {
          if (!detail?.sku_id || _.isNil(detail?.base_price?.price)) {
            return null
          } else {
            detail.base_price.price = detail?.base_price?.price + ''
            if (detail.bom_id && detail.bom_id !== '0') {
              detail.bom.processes.processes[0].inputs = _.map(
                detail?.bom?.processes?.processes[0]?.inputs,
                (input) => {
                  input.material.quantity = input?.material?.quantity + ''
                  if (
                    input?.material?.sku_id &&
                    !_.isNil(input?.material?.quantity) &&
                    input?.material?.quantity !== ''
                  ) {
                    return input
                  }
                },
              ).filter((_) => _)
              return detail
            } else {
              return _.omit(detail, ['bom_id', 'bom'])
            }
          }
        }).filter((_) => _)
        return spi.details.length
      },
    )

    return {
      ...menuDetail,
      menu_id,
      menu_time: moment(menuDetail?.menu_time).startOf('day').format('x'),
    }
  }

  // 粗暴检查数据完整性
  checkMenuDetail() {
    let msg = ''
    const list = _.cloneDeep(this.editMenu?.details?.service_period_infos)
    _.forEach(list, (spi) => {
      _.forEach(spi.details, (detail) => {
        if (
          detail?.sku_id &&
          (_.isNil(detail?.base_price?.price) ||
            detail?.base_price?.price === '')
        ) {
          msg = `${spi?.name}中的${detail?.name}没有填写完整，请校验`
        } else if (detail.bom_id && detail.bom_id !== '0') {
          _.forEach(detail?.bom?.processes?.processes[0]?.inputs, (input) => {
            if (
              input?.material?.sku_id &&
              (_.isNil(input?.material?.quantity) ||
                input?.material?.quantity === '')
            ) {
              msg = `${spi?.name}中的${detail?.name}中的${input?.material?.name}没有填写完整，请校验`
            }
          })
        }
      })
    })
    return msg
  }

  createMenuDetail(menu_id: string) {
    return CreateMenuDetail({
      menu_detail: this.packageMenuDetailData(menu_id),
    })
  }

  updateMenuDetail(menu_id: string) {
    return UpdateMenuDetail({
      menu_detail: this.packageMenuDetailData(menu_id),
    })
  }

  addMealItem(mealIndex: number) {
    const length =
      this.editMenu?.details?.service_period_infos[mealIndex]?.details.length
    this.editMenu?.details?.service_period_infos[mealIndex]?.details.splice(
      length + 1,
      0,
      { ...initSsu },
    )
  }

  deleteMealItem(mealIndex: number, ssuIndex: number) {
    this.editMenu?.details?.service_period_infos[mealIndex]?.details.splice(
      ssuIndex,
      1,
    )
    // 联动修改其他ssu的ssuIndex
    _.forEach(
      this.editMenu?.details?.service_period_infos[mealIndex]?.details,
      (detail, index) => {
        _.forEach(detail?.bom?.processes?.processes[0]?.inputs, (input) => {
          Object.assign(input.material, { ssuIndex: index })
        })
      },
    )
  }

  changeMealItemPrice(mealIndex: number, ssuIndex: number, obj: any) {
    Object.assign(
      this.editMenu?.details?.service_period_infos[mealIndex]?.details[ssuIndex]
        ?.base_price,
      { ...obj },
    )
  }

  changeMealItemName(mealIndex: number, ssuIndex: number, obj: any) {
    Object.assign(
      this.editMenu.details?.service_period_infos[mealIndex]?.details[ssuIndex],
      { ...obj },
    )
    if (obj.sku_id && obj.unit_id) {
      GetPackBom({
        sku_id: obj.sku_id,
        unit_id: obj.unit_id,
      }).then((json) => {
        if (json.response.bom) {
          const { bom } = json.response
          bom.processes.processes[0].inputs = _.map(
            bom?.processes?.processes[0]?.inputs,
            (input) => {
              // 仅展示非包材商品
              return {
                ...input,
                material: {
                  ...json.response.skus[input.material.sku_id],
                  ...input.material,
                  ssuIndex,
                },
              }
            },
          ).filter((_) => _)
          Object.assign(
            this.editMenu.details?.service_period_infos[mealIndex]?.details[
              ssuIndex
            ],
            { bom: bom, bom_id: bom?.bom_id, bom_revision: bom.revision },
          )
        }
      })
    }
  }

  addMealBomItem(mealIndex: number, ssuIndex: number) {
    const length =
      this.editMenu.details?.service_period_infos[mealIndex]?.details[ssuIndex]
        ?.bom?.processes?.processes[0]?.inputs.length
    this.editMenu.details?.service_period_infos[mealIndex]?.details[
      ssuIndex
    ]?.bom?.processes?.processes[0]?.inputs.splice(length + 1, 0, {
      ...initBomItem(ssuIndex),
    })
  }

  deleteMealBom(mealIndex: number, ssuIndex: number, bomIndex: number) {
    this.editMenu.details?.service_period_infos[mealIndex]?.details[
      ssuIndex
    ]?.bom?.processes?.processes[0]?.inputs.splice(bomIndex, 1)
  }

  changeMealBomItem(
    mealIndex: number,
    ssuIndex: number,
    bomIndex: number,
    obj: any,
  ) {
    Object.assign(
      this.editMenu.details?.service_period_infos[mealIndex]?.details[ssuIndex]
        ?.bom?.processes?.processes[0]?.inputs[bomIndex]?.material,
      { ...obj },
    )
  }

  createOrder(id: string) {
    return CreateProductOrder({
      menu_detail_ids: [id],
      time_zone: timezone.tz.guess(),
    })
  }

  batchCreateOrder() {
    return CreateProductOrder({
      menu_detail_ids: this.selectedMenuIds,
      time_zone: timezone.tz.guess(),
    })
  }

  setHoliday(menu_id: string, dayIndex: number, bool: boolean) {
    return UpdateMenuDetail({
      menu_detail: {
        ...this.packageMenuDetailData(menu_id, dayIndex),
        is_holiday: bool,
      },
    })
  }

  setEditMenu(dayIndex: number) {
    this.editMenu = _.cloneDeep(this.menuList[dayIndex])
    return Promise.resolve(null)
  }

  clearEditMenu() {
    this.editMenu = {}
  }
}

export default new MenuDetailStore()
