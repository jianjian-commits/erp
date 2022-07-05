import { t } from 'gm-i18n'
import _ from 'lodash'
export interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}

export enum menuStatusEnum {
  All = 0, // 全部
  TRUE = 1, // 激活
  FALSE = 2, // 未激活
}

export const menuStatusMap = [
  {
    label: t('全部状态'),
    value: menuStatusEnum.All,
  },
  {
    label: t('启用'),
    value: menuStatusEnum.TRUE,
  },
  {
    label: t('禁用'),
    value: menuStatusEnum.FALSE,
  },
]

// function parseSelectData(
//   m: {
//     label: string
//     value: menuStatusEnum
//   }[],
// ) {
//   return _.map(m, (text, value) => {
//     return {
//       value: +value,
//       text: text,
//     }
//   }).filter((v) => v.text)
// }

export const menuStatus = menuStatusMap

export const deleteTipsList = [
  {
    value: '1',
    text: t('仅删除菜谱，不会删除商品库已有商品'),
  },
  {
    value: '2',
    text: t(
      '删除后将解除绑定此菜谱的用户，用户将无法进行学生餐/职工餐订单的下单操作',
    ),
  },
  {
    value: '3',
    text: t('删除后菜谱相关数据无法恢复，请谨慎操作'),
  },
]
