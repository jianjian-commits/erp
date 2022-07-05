import _ from 'lodash'
import moment from 'moment'
import { createInitialData, initEditStatus } from './init_data'
import {
  MenuDetail_State,
  MenuDetail,
  Sku,
  BasicPrice,
} from 'gm_api/src/merchandise'
import {
  MenuDetailItemProps,
  MenuPeriodGroupProps,
  MenuDetailItem,
} from './interface'
import formatIngedient from './utils/format_ingedient'
import { getUnitGroupList } from '@/pages/merchandise/util'

export const colorList = [
  '#FEC771',
  '#42B883',
  '#EE7057',
  '#56a3f2',
  '#cca05a',
  '#30855e',
  '#ba5845',
  '#4582bf',
  '#997843',
  '#1d5239',
  '#874032',
  '#325f8c',
]

// 判断当前时间，菜谱状态
// done-已完成、in-生效中、future-未生效
export const getStatus = (date: Date, begin: string, end: string) => {
  let menu_status = 'in'
  if (moment(date).isBefore(begin)) menu_status = 'done'
  else if (moment(date).isAfter(end)) menu_status = 'future'
  return menu_status
}

interface FormateMenuDetailList {
  menu_from_time: string
  menu_to_time: string
  begin: string
  end: string
  menuPeriodGroups: MenuPeriodGroupProps[]
  menu_details: MenuDetail[]
  sku_map?: Record<string, Sku>
  ingredient_map?: Record<string, Sku>
  basic_prices?: BasicPrice[]
}

export const handleQuotationDetailList = (params: FormateMenuDetailList) => {
  const {
    menu_from_time,
    menu_to_time,
    begin,
    end,
    menuPeriodGroups,
    menu_details,
    sku_map = {},
    ingredient_map,
    basic_prices,
  } = params

  const span = moment(menu_to_time).diff(menu_from_time, 'day') + 1
  const list: MenuDetailItemProps[] = []

  // 直接先加上basic的配比
  for (let i = 0; i < span; i++) {
    const date = moment(menu_from_time).add(i, 'd').startOf('day').format('x')
    const menu_time = moment(menu_from_time).add(i, 'd').format('YYYY-MM-DD')
    const item = _.find(menu_details, (md) => md.menu_time === date)

    const menu_status = getStatus(
      moment(menu_from_time).add(i, 'd').toDate(),
      begin,
      end,
    )
    if (item) {
      list.push({
        ...item,
        menu_time,
        menu_status,
        selected: false,
        details: {
          service_period_infos: _.map(menuPeriodGroups, (menu) => {
            const list: MenuDetailItem[] = []
            _.forEach(basic_prices, (val: BasicPrice) => {
              if (
                val.menu_detail_id !== item.menu_detail_id ||
                menu.menu_period_group_id !== val.menu_period_group_id
              ) {
                return
              }
              const sku = sku_map[val.sku_id || '']
              const { fee_unit_price, order_unit_id } =
                val.items.basic_price_items![0]
              const units = getUnitGroupList(sku).map((item) => ({
                ...item,
                text: item.label,
              }))
              const unit = _.find(
                units,
                (item) => `${item.value}` === `${fee_unit_price.unit_id}`,
              )
              if (sku) {
                list.push({
                  rawBasicPrice: Object.freeze(val),
                  selected: false,
                  sku_id: sku.sku_id,
                  sku_type: sku.sku_type,
                  name: sku.name,
                  unit_id: order_unit_id,
                  fee_unit_id: fee_unit_price.unit_id,
                  ingredientsInfo: formatIngedient({
                    skuIndex: list.length,
                    basicPrice: val.ingredient_items?.basic_price_items,
                    ratioList: val.ingredients?.ingredients,
                    skuMap: ingredient_map,
                  }),
                  unit,
                  units,
                  price: fee_unit_price.val,
                  ingredient: sku.ingredients?.ingredients,
                  remark: val.remark,
                  value: sku.sku_id,
                  text: sku.name,
                  menu_period_group_id: val.menu_period_group_id,
                })
              }
            })
            return {
              ...menu,
              details: _.isEmpty(list) ? [createInitialData()] : list,
            }
          }),
        },
      })
    } else {
      list.push({
        selected: false,
        menu_time,
        menu_status,
        state: MenuDetail_State.STATE_PREPARE,
        is_holiday: false,
        details: {
          service_period_infos: _.map(menuPeriodGroups, (mp) => {
            return {
              ...mp,
              details: [createInitialData()],
            }
          }),
        },
      })
    }
  }
  return list
}

export const getSsusExpanded = (list) => {
  const map = {}
  _.forEach(list, (item, i) => {
    map[i] = item?.ingredientsInfo && item?.ingredientsInfo?.length > 0
  })
  return map
}

// todo 编辑权限
export const getTableChildEditStatus = () => {
  return initEditStatus
}
