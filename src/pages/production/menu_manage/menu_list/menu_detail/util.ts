import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { initSsu, initBom } from './init_data'
import { MenuDetail_State } from 'gm_api/src/merchandise'
import { MenuDetailProps } from './interface'
import { toFixed } from '@/common/util'

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

export const getSsusExpanded = (list) => {
  const map = {}
  _.forEach(list, (item, i) => {
    map[i] =
      item?.bom?.processes?.processes &&
      item?.bom?.processes?.processes[0]?.inputs?.length > 0
  })
  return map
}

export const getHeight = (index: number) => {
  return index === 0 ? 7 * 40 + 25 + 'px' : 7 * 40 + 20 + 'px'
}

export const getContentHeight = (index: number) => {
  return index === 0 ? 7 * 40 - 20 + 'px' : 7 * 40 - 40 + 'px'
}

// 判断当前时间，菜谱状态
// done-已完成、in-生效中、future-未生效
export const getStatus = (date: Date, begin: Date, end: Date) => {
  let menu_status = 'in'
  if (moment(date).isBefore(begin)) menu_status = 'done'
  else if (moment(date).isAfter(end)) menu_status = 'future'
  return menu_status
}

export const handleMenuList = ({
  meal_date_start,
  meal_date_end,
  menuPeriodGroup,
  menu_details,
  // relation_info,
  begin,
  end,
}) => {
  let count = 0
  let total_price: number | string = 0
  const span = moment(meal_date_end).diff(meal_date_start, 'day') + 1
  const list = []
  for (let i = 0; i < span; i++) {
    const date = moment(meal_date_end).add(i, 'd').startOf('day').format('x')
    const menu_time = moment(meal_date_start).add(i, 'd').format('YYYY-MM-DD')
    const item = _.find(menu_details, (md) => md.meal_date === date)
    const menu_status = getStatus(
      moment(meal_date_start).add(i, 'd').toDate(),
      begin,
      end,
    )
    // console.log('menu_status', menu_status)
    list.push(
      item
        ? {
            ...item,
            menu_time,
            menu_status,
            selected: false,
            details: {
              ...item.details,
              service_period_infos: _.map(menuPeriodGroup, (mp) => {
                const mpItem = _.find(
                  item?.details?.service_period_infos,
                  (spi) => spi.menu_period_group_id === mp.menu_period_group_id,
                )
                if (mpItem) {
                  return {
                    ...mp,
                    details: _.map(mpItem?.details, (d, index) => {
                      count += 1
                      total_price = toFixed(
                        Big(total_price).plus(d?.base_price?.price),
                      )
                      const { ssu_map } = relation_info?.skus[d.sku_id]
                      const ssu = ssu_map[d.unit_id]
                      return {
                        ...d,
                        ...ssu.ssu,
                        bom: d?.bom_id
                          ? {
                              ...d?.bom,
                              processes: {
                                ...d?.bom?.processes,
                                processes: [
                                  {
                                    ...d?.bom?.processes?.processes[0],
                                    inputs: _.map(
                                      d?.bom?.processes?.processes[0]?.inputs,
                                      (input) => {
                                        return {
                                          ...input,
                                          material: {
                                            ...input.material,
                                            ssuIndex: index,
                                            name: relation_info?.skus[
                                              input.material.sku_id
                                            ]?.sku?.name,
                                          },
                                        }
                                      },
                                    ),
                                  },
                                ],
                              },
                            }
                          : { ...initBom },
                      }
                    }),
                  }
                } else {
                  return {
                    ...mp,
                    details: [{ ...initSsu }],
                  }
                }
              }),
            },
          }
        : {
            selected: false,
            menu_time,
            menu_status,
            state: MenuDetail_State.STATE_PREPARE,
            is_holiday: false,
            details: {
              service_period_infos: _.map(menuPeriodGroup, (mp) => {
                return {
                  ...mp,
                  details: [{ ...initSsu }],
                }
              }),
            },
          },
    )
  }
  return { list, count, total_price }
}

/** 子母表是否可以增删改
 * @param {string} state1: done-已完成、in-生效中、future-未生效
 * @param {string} state2: MenuDetail_State.STATE_PREPARE未进入生产、MenuDetail_State.STATE_FINISHED-已进入生产
 */
export const getTableChildEditStatus = (state1: string, state2: string) => {
  if (
    (state1 === 'done' || state1 === 'in') &&
    +state2 === MenuDetail_State.STATE_FINISHED
  ) {
    return {
      canEditBom: false,
      canDeleteBom: false,
      canAddBom: false,
      canEditSsu: false,
      canDeleteSsu: false,
      canAddSsu: false,
      canSave: false,
    }
  } else if (
    (state1 === 'done' || state1 === 'in') &&
    +state2 === MenuDetail_State.STATE_PREPARE
  ) {
    return {
      canEditBom: true,
      canDeleteBom: true,
      canAddBom: true,
      canEditSsu: false,
      canDeleteSsu: false,
      canAddSsu: false,
      canSave: true,
    }
  } else {
    return {
      canEditBom: true,
      canDeleteBom: true,
      canAddBom: true,
      canEditSsu: true,
      canDeleteSsu: true,
      canAddSsu: true,
      canSave: true,
    }
  }
}

// 可勾选
export const canSelected = (menu: MenuDetailProps) => {
  return (
    menu?.menu_detail_id &&
    menu?.state === MenuDetail_State.STATE_PREPARE &&
    (menu?.menu_status === 'in' || menu?.menu_status === 'done')
  )
}
