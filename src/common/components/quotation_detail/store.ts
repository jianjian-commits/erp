import { t } from 'gm-i18n'
import { makeAutoObservable, reaction, toJS } from 'mobx'
import {
  GetQuotation,
  Quotation_Type,
  ListMenuDetail,
  ListMenuDetailRequest,
  BasicPrice,
  SetBasicPrice,
  Ssu_Type,
  Sku_SkuType,
  Ingredient as RawIngredient,
  BasicPriceItem,
} from 'gm_api/src/merchandise'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'
import { levelList } from '@/pages/customer/type'
import _, { flattenDeep } from 'lodash'
import moment from 'moment'
import { handleQuotationDetailList } from './util'
import {
  QuotationInfo,
  MenuPeriodGroupProps,
  FilterProps,
  MenuDetailItemProps,
  MenuDetailItemSsuProps,
  ServicePeriodInfoProps,
  MenuDetailItem,
  Ingredient,
} from './interface'
import { initMenu, createInitialData } from './init_data'
import Big from 'big.js'
import referenceMixin from '@/pages/order/order_manage/store/reference'

const initQuotation = {
  quotation_id: '',
  type: Quotation_Type.WITH_TIME,
  update_valid_time: {},
}

const initFilter = {
  quotation_id: '',
  menu_from_time: '',
  menu_to_time: '',
  valid_begin: '',
  valid_end: '',
  source: '',
}

// 比较恶心的就是联动三个层级的selected： 总、每日、具体到ssu
class QuotationDetailTable {
  quotation: QuotationInfo = { ...initQuotation }

  // 餐次list
  menuPeriodGroups: MenuPeriodGroupProps[] = []

  // 商品列表
  menuDetailList: MenuDetailItemProps[] = []

  // 全选
  selectedAll = false

  // 所选商品列表
  selectedCombineSsus = []

  reference = referenceMixin

  // 记录传入的参数
  filter: FilterProps = { ...initFilter }

  // 当前编辑中的每日菜谱
  editMenu: MenuDetailItemProps = { ...initMenu }

  unitMap: { [k: string]: any } = {}

  // 控制菜谱最大高度使用 CSS
  nameMap: { [key: string]: number } = {}

  // 商户信息
  CustomerGroups: levelList[] = []

  // 返回上级
  returnStep = false

  loading = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get ssu_infos() {
    const ssu_infos: MenuDetailItemSsuProps[] = []
    this.menuDetailList.forEach((menu, column) => {
      menu.details.service_period_infos.forEach((period, row) => {
        period.details.forEach((detail) => {
          if (detail.sku_id) ssu_infos.push(detail)
        })
      })
    })
    return ssu_infos
  }

  /** 汇总信息 */
  get summaryInfo() {
    const count = this.ssu_infos.length
    const total_cost = this.ssu_infos.reduce((pre, ssu, i) => {
      let price = '0'
      if (ssu.type === Ssu_Type.TYPE_COMMON) {
        price = this.reference.getUnitReferencePrice(ssu).val || '0'
      } else if (ssu.type === Ssu_Type.TYPE_COMBINE) {
        price =
          this.reference.calcCombinedSsuReferencePrice(ssu.ssu_ingredients!)
            .val || '0'
      }
      return Big(price).add(pre).toNumber()
    }, 0)
    const total_price = this.ssu_infos.reduce((pre, cur, i) => {
      return Big(pre)
        .add(isFinite(+cur.price!) ? +cur.price! : 0)
        .toNumber()
    }, 0)
    return {
      count,
      total_cost,
      total_price,
    }
  }

  // 所选ssu MenuDetailItemSsuProps[]
  get getSelectedCombineSsus() {
    const res: Array<
      MenuDetailItem & { menu_detail_id: string; menu_time: string }
    > = []
    _.forEach(this.menuDetailList, (md) => {
      _.forEach(md?.details?.service_period_infos, (spi) => {
        _.forEach(spi?.details, (ssu) => {
          if (ssu?.selected)
            res.push({
              ...ssu,
              menu_detail_id: md.menu_detail_id!,
              menu_time: moment(md.menu_time).format('x'),
            })
        })
      })
    })

    return res
  }

  // 所选餐次 ServicePeriodInfoProps[]
  get getSelectedMeals() {
    const res: ServicePeriodInfoProps[] = []
    _.forEach(this.menuDetailList, (md) => {
      _.forEach(md?.details?.service_period_infos, (spi) => {
        if (_.find(spi?.details, (ssu) => ssu.selected)) {
          res.push({
            ...spi,
            ...md,
            menu_period_group_id: spi?.details[0]?.menu_period_group_id || '0',
            details: _.map(spi?.details, (d) => {
              if (d.selected) return d
            }).filter((_) => _),
          })
        }
      })
    })
    return res
  }

  setLoading(value: boolean) {
    this.loading = !!value
  }

  getQuotation(quotation_id: string) {
    return GetQuotation({ quotation_id }).then((json) => {
      const { quotation, menu_periods } = json.response
      const { avail_menu_period_groups } = quotation
      this.quotation = quotation

      this.menuPeriodGroups = _.map(
        menu_periods,
        (period): MenuPeriodGroupProps | undefined => {
          if (!avail_menu_period_groups) {
            return undefined
          }
          if (
            _.find(
              avail_menu_period_groups.menu_period_group_ids,
              (p) => period?.menu_period_group?.menu_period_group_id === p,
            )
          ) {
            // service_period 和 menu_period_group 都有name，取menu_period_group的name
            return {
              ...period.service_period,
              ...period.menu_period_group,
            }
          }
          return undefined
        },
      ).filter((item): item is MenuPeriodGroupProps => !_.isNil(item))

      return json
    })
  }

  init() {
    this.quotation = { ...initQuotation }
    this.menuDetailList = []
    this.menuPeriodGroups = []
    this.selectedAll = false
    this.filter = { ...initFilter }
    this.editMenu = { ...initMenu }
  }

  setFilter(
    source: string,
    quotation_id: string,
    menu_from_time: string,
    menu_to_time: string,
    valid_begin: string,
    valid_end: string,
  ) {
    this.filter = {
      source,
      quotation_id,
      menu_from_time,
      menu_to_time,
      valid_begin,
      valid_end,
    }
  }

  getList() {
    const { quotation_id, menu_from_time, menu_to_time } = this.filter
    const req: ListMenuDetailRequest = {
      quotation_id,
      menu_from_time: '' + moment(menu_from_time).startOf('day').format('x'),
      menu_to_time:
        '' + moment(menu_to_time).add('d', 1).startOf('day').format('x'),
    }
    return ListMenuDetail(req).then((json) => {
      const { menu_from_time, menu_to_time, valid_begin, valid_end } =
        this.filter
      const { menu_details, sku_map, ingredient_map, basic_prices } =
        json.response
      const list = handleQuotationDetailList({
        menu_from_time,
        menu_to_time,
        begin: valid_begin,
        end: valid_end,
        menuPeriodGroups: this.menuPeriodGroups,
        menu_details,
        sku_map,
        basic_prices,
        ingredient_map,
      })

      list.forEach((item) => {
        if (!item.create_time) return
        item.details.service_period_infos.forEach((menu) => {
          if (menu.details.length > (this.nameMap[menu.name] || 0)) {
            this.nameMap[menu.name] = menu.details.length
          }
        })
      })

      this.menuDetailList = list
      return json
    })
  }

  changeSelectedAll(isCancel: boolean) {
    const { source } = this.filter
    // isCancel 为 true 为取消勾选
    this.selectedAll = isCancel ? false : !this.selectedAll
    const list = this.menuDetailList

    list.forEach((item) => {
      // TODO: 关于勾选的问题，订单和菜谱的勾选并不一样，source用来区分商品和订单

      _.forEach(item?.details?.service_period_infos, (d) => {
        _.forEach(d?.details, (ssu) => {
          if (ssu?.sku_id && ssu?.unit_id) {
            if (ssu.ingredientsInfo?.length && source === 'vegetables') {
              ssu.selected = this.selectedAll
            }
            if (source === 'order') ssu.selected = this.selectedAll
          }

          // 订单的全选就是全选，菜谱的全选是选择有组合商品的
          if (source === 'order') item.selected = this.selectedAll
          if (ssu.ingredientsInfo?.length && source === 'vegetables')
            item.selected = this.selectedAll
        })
      })
    })

    this.menuDetailList = list
  }

  changeMenuSelected(dayIndex: number, selected: boolean) {
    // todo minyi 如果没有ssu的话，勾选没有意义，不能勾选上
    this.menuDetailList[dayIndex].selected = selected

    // 联动selectedAll 和 当天每个ssu的selected
    const list = this.menuDetailList
    _.forEach(
      this.menuDetailList[dayIndex]?.details?.service_period_infos,
      (d) => {
        _.forEach(d?.details, (ssu) => {
          if (ssu?.sku_id && ssu?.unit_id) {
            Object.assign(ssu, { selected: selected })
          }
        })
      },
    )
    this.menuDetailList = list
  }

  changeSsuSelected(
    mealIndex: number,
    dayIndex: number,
    ssuIndex: number,
    selected: boolean,
  ) {
    this.menuDetailList[dayIndex].details.service_period_infos[
      mealIndex
    ].details[ssuIndex].selected = selected

    // 联动selectAll和对应当天的menu selected
    const list = this.menuDetailList
    // 找到一个为false
    if (
      _.find(
        this.menuDetailList[dayIndex]?.details?.service_period_infos[mealIndex]
          ?.details,
        (ssu) => !ssu?.selected,
      )
    ) {
      Object.assign(list[dayIndex]?.details?.service_period_infos[mealIndex], {
        selected: false,
      })
    }
    this.menuDetailList = list
    if (_.find(this.menuDetailList, (md) => !md?.selected)) {
      this.selectedAll = false
    }
  }

  // getUnitRateGroup(units: GetUnitRateGroupRequest_UnitIdGroup[]) {
  //   const unitMap: { [k: string]: any } = {}
  //   const _units = _.uniqBy(units, (u) => `${u.unit_id_1}_${u.unit_id_2}`)

  //   return GetUnitRateGroup({ unit_id_groups: _units }).then((json) => {
  //     _.forEach(json.response.unit_rate_groups, (unit) => {
  //       if (!this.unitMap[unit?.unit_id_1 + '_' + unit?.unit_id_2]) {
  //         unitMap[unit?.unit_id_1 + '_' + unit?.unit_id_2] = unit
  //       }
  //     })
  //     this.unitMap = { ...this.unitMap, ...unitMap }
  //     return unitMap
  //   })
  // }

  async setEditMenu(dayIndex: number) {
    this.editMenu = _.cloneDeep(this.menuDetailList[dayIndex])
    // const periods = this.editMenu?.details?.service_period_infos || []

    // 在这里请求一次，初始化unitMap
    // let list: unknown[] = []
    // _.each(periods, (p) => {
    //   _.each(p?.details || [], (d) => {
    //     const units = _.map(d?.ssu_ingredients?.ssu_ratios || [], (ssu) => ({
    //       unit_id_1: ssu?.unit?.parent_id,
    //       unit_id_2: ssu?.use_unit_id!,
    //     }))
    //     list = list.concat(units)
    //   })
    // })

    // if (list.length) {
    //   // await this.getUnitRateGroup(list)
    // }
    return Promise.resolve(null)
  }

  /**
   * 数据提交前校验
   */
  checkMenuDetail(): string | void {
    // 餐次列表
    const periodList = this.editMenu.details.service_period_infos
    let errorTips: string | undefined
    const isZero = (val: string | number) => Big(0).eq(val || 0)

    const validator = (
      value: MenuDetailItem | Ingredient,
      isCombine = false,
    ) => {
      // 校验单位、价格（价格可以为 0）
      const isValid = !!value.fee_unit_id && !!value.price

      // 校验配比（配比不能为 0）
      const isValidRatio = isCombine
        ? !isZero((value as Ingredient).ratio)
        : true

      if (!isValid || !isValidRatio) {
        if (isCombine) {
          errorTips = t(
            '存在组合商品中原料价格/单位/配比未填写，请重新修改后保存',
          )
        } else {
          errorTips = t('存在商品价格/单位未填写，请重新修改后保存')
        }
      }
      return isValid
    }

    _.some(periodList, (period) => {
      return _.some(period.details, (sku) => {
        if (!sku.sku_id) {
          return false
        }
        if (sku.sku_type === Sku_SkuType.COMBINE) {
          return _.some(sku.ingredientsInfo, (item) => {
            return !validator(item, true)
          })
        }
        return !validator(sku)
      })
    })
    return errorTips
  }

  getMenuDetail() {
    return {
      is_holiday: this.editMenu.is_holiday,
      menu_time:
        '' + moment(this.editMenu.menu_time).startOf('day').format('x'),
      quotation_id: this.filter.quotation_id,
      menu_detail_id: this.editMenu.menu_detail_id || '0',
      state: this.editMenu.state,
    }
  }

  getBasicPrices() {
    const list: BasicPrice[] = []
    const menuDetail = this.getMenuDetail()
    const createIngredientData = (sku: MenuDetailItem) => {
      if (sku.sku_type !== Sku_SkuType.COMBINE) {
        return undefined
      }
      return {
        // 原料配比信息
        ingredients: {
          ingredients: _.map(
            sku.ingredientsInfo,
            (ingredient): RawIngredient => {
              return {
                ratio: `${ingredient.ratio}`,
                order_unit_id: ingredient.fee_unit_id,
                sku_id: ingredient.sku_id,
              }
            },
          ),
        },
        // 原料价格信息
        ingredient_items: {
          basic_price_items: _.map(
            sku.ingredientsInfo,
            (ingredient): BasicPriceItem => {
              return {
                fee_unit_price: {
                  unit_id: ingredient.fee_unit_id!,
                  val: `${ingredient.price}`,
                },
                order_unit_id: ingredient.fee_unit_id!,
              }
            },
          ),
        },
      }
    }
    _.forEach(this.editMenu.details.service_period_infos, (spi) => {
      _.forEach(spi.details, (item) => {
        if (item.sku_id && item.fee_unit_id) {
          let result: BasicPrice = { ...item.rawBasicPrice }
          // 更新时 - 数据处理
          if (item.rawBasicPrice) {
            const { ingredient_items, ingredients } =
              createIngredientData(item) || {}
            result.sku_id = item.sku_id
            result.sku_type = item.sku_type
            result.remark = item.remark
            result.items.basic_price_items![0].fee_unit_price = {
              unit_id: item.fee_unit_id,
              val: `${item.price}`,
            }
            result.items.basic_price_items![0].order_unit_id = item.fee_unit_id
            _.forEach(
              ingredient_items?.basic_price_items,
              (ingredient, index) => {
                result.ingredient_items!.basic_price_items![
                  index
                ].fee_unit_price = ingredient.fee_unit_price
                result.ingredient_items!.basic_price_items![
                  index
                ].order_unit_id = ingredient.order_unit_id
              },
            )
            _.forEach(ingredients?.ingredients, (ingredient, index) => {
              result.ingredients!.ingredients![
                index
              ].ratio = `${ingredient.ratio}`
              result.ingredients!.ingredients![index].order_unit_id =
                ingredient.order_unit_id
            })
          } else {
            // 新增时 - 数据处理
            result = {
              quotation_id: this.filter.quotation_id,
              sku_id: item.sku_id,
              basic_price_id: '0',
              menu_period_group_id: spi.menu_period_group_id,
              type: Quotation_Type.WITH_TIME,
              sku_type: item.sku_type,
              menu_time: menuDetail.menu_time,
              menu_detail_id: menuDetail.menu_detail_id,
              min_price: '0',
              max_price: '0',
              remark: item.remark,
              ...createIngredientData(item),
              items: {
                basic_price_items: [
                  {
                    fee_unit_price: {
                      unit_id: item.fee_unit_id,
                      val: `${item.price}`,
                    },
                    order_unit_id: item.fee_unit_id,
                    on_shelf: true,
                  },
                ],
              },
            }
          }
          list.push(result)
        }
      })
    })
    return list
  }

  save() {
    return SetBasicPrice({
      basic_prices: this.getBasicPrices(),
      menu_detail: this.getMenuDetail(),
    })
  }

  fetchCustomer() {
    return ListCustomer({
      paging: { limit: 999 },
      level: 1,
      need_child_customers: true,
      type: Customer_Type.TYPE_SOCIAL,
    }).then((json) => {
      const { customers, child_customers, child_customer_relation } =
        json.response

      this.CustomerGroups = _.map(customers, (_company) => {
        return {
          ..._company,
          text: _company?.name,
          value: _company?.customer_id,
          children: _.map(
            child_customer_relation![_company?.customer_id]?.values,
            (customer_id) => {
              const _customer = child_customers[customer_id]
              return {
                ..._customer,
                value: _customer?.customer_id,
                text: _customer?.name,
              }
            },
          ),
        }
      })
      return json
    })
  }

  clearEditMenu() {
    this.editMenu = { ...initMenu }
  }

  changeMealSsu(mealIndex: number, ssuIndex: number, obj: any) {
    const result = _.slice(
      this.editMenu?.details?.service_period_infos[mealIndex]?.details,
    )
    Object.assign(result[ssuIndex], obj)
    this.editMenu.details.service_period_infos[mealIndex].details = result
  }

  addMealSsu(mealIndex: number) {
    const length =
      this.editMenu.details.service_period_infos[mealIndex].details.length
    this.editMenu.details.service_period_infos[mealIndex].details.splice(
      length + 1,
      0,
      createInitialData(),
    )
  }

  deleteMealSsu(mealIndex: number, ssuIndex: number) {
    this.editMenu.details.service_period_infos[mealIndex].details.splice(
      ssuIndex,
      1,
    )
    // 联动修改其他ssu的ssuIndex
    _.forEach(
      this.editMenu?.details?.service_period_infos[mealIndex]?.details,
      (detail, index) => {
        _.forEach(detail?.ingredientsInfo, (ssu) => {
          Object.assign(ssu, { ssuIndex: index })
        })
      },
    )
  }

  changeMealSsuName(mealIndex: number, ssuIndex: number, obj: any) {
    const result = _.slice(
      this.editMenu?.details?.service_period_infos[mealIndex]?.details,
    )
    Object.assign(result[ssuIndex], obj)
    this.editMenu.details.service_period_infos[mealIndex].details = result
  }

  // 只用于配比的修改
  changeMealChildItem(
    mealIndex: number,
    ssuIndex: number,
    childIndex: number,
    obj: any,
  ) {
    Object.assign(
      this.editMenu?.details?.service_period_infos[mealIndex]?.details[ssuIndex]
        ?.ingredientsInfo?.[childIndex],
      obj,
    )
    // 触发计算总价格
    this.changeSsuPrice(mealIndex, ssuIndex)
  }

  getMinHeight = (name: string): number => {
    const maxLength = this.nameMap[name]
    if (typeof maxLength !== 'number') return 181
    if (maxLength >= 10) return 362
    if (maxLength > 5) return 181 + (maxLength - 5) * 36
    return 181
  }

  // 联动修改ssu的价格 -- 转成计价单位计算
  changeSsuPrice = (mealIndex: number, ssuIndex: number) => {
    const target =
      this.editMenu?.details?.service_period_infos[mealIndex]?.details[ssuIndex]
        .ingredientsInfo
    let amount = Big(0)
    _.forEach(target, (item) => {
      amount = amount.plus(Big(item.ratio || 0).times(item.price || 0))
    })

    this.changeMealSsu(mealIndex, ssuIndex, { price: amount.toString() })

    //   let total = '0'
    //   const list =
    //     this.editMenu?.details?.service_period_infos[mealIndex]?.details[ssuIndex]
    //       ?.ssu_ingredients?.ssu_ratios || []
    //   const _ssu =
    //     this.editMenu?.details?.service_period_infos[mealIndex]?.details[ssuIndex]
    //   // 选择的单位与本身ssu基本单位之间的转换关系
    //   if (needUnits) {
    //     const units = _.map(list, (ssu) => ({
    //       unit_id_1: ssu?.unit?.parent_id,
    //       unit_id_2: ssu?.use_unit_id!,
    //     }))
    //     await this.getUnitRateGroup(units)
    //   }
    //   _.forEach(list, (ssu) => {
    //     // 单价不需要改, 数量转成计价单位
    //     const ratioRate =
    //       this.unitMap[ssu?.unit?.parent_id + '_' + ssu?.use_unit_id]?.rate || 1
    //     const priceRatio =
    //       ssu.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
    //         ? Big(ssu.ratio || 0)
    //             .div(ratioRate)
    //             .div(ssu?.unit?.rate || 1)
    //         : Big(ssu.ratio || 0).div(ratioRate)
    //     const newPrice = Big(ssu?.default_price || 0).times(priceRatio || 0)
    //     total = Big(total).add(newPrice).toFixed(2)
    //   })
    //   if (_ssu?.price) _ssu.price = total
  }
}

const store = new QuotationDetailTable()
export default store

// reaction(
//   () => store.ssu_infos,
//   () => {
//     const children = flattenDeep(
//       store.ssu_infos
//         .map((info) =>
//           info.ssu_ingredients?.ssu_ratios?.filter((item) => !!item),
//         )
//         .filter((item) => !!item),
//     ) as any
//     store.reference.fetchReferencePrices([...store.ssu_infos, ...children])
//   },
// )
