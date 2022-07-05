import { Price } from '@gm-pc/react'
import { i18next } from 'gm-i18n'
import { TABLE_TYPE } from '../data_to_key/table_type'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { ListCustomizeType } from 'gm_api/src/order'

export type FieldItem = { key: string; value: string }
export type Fields = Record<string, FieldItem[]>

export interface AddFields {
  commonFields: Fields
  tableFields: Fields
}

/** 是否有套账权限 */
function hasAddOrderPermission() {
  return globalStore.hasPermission(
    Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
  )
}

/** 表格字段分组 */
export const tableFieldsGrouped = {
  [TABLE_TYPE.ORDERS]: [i18next.t('账单明细'), i18next.t('账单明细套账')],
  [TABLE_TYPE.ORDER_TYPE]: [
    i18next.t('订单类型汇总'),
    i18next.t('订单类型汇总套账'),
  ],
  [TABLE_TYPE.PRODUCT]: [i18next.t('商品汇总'), i18next.t('商品汇总套账')],
  [TABLE_TYPE.SKUS]: [i18next.t('订单明细'), i18next.t('订单明细套账')],
}

/** 获取基础字段 */
export function getCommonFields(): Fields {
  const result: Record<string, FieldItem[] | boolean> = {
    [i18next.t('基础')]: [
      { key: i18next.t('打印时间'), value: '{{打印时间}}' },
      { key: i18next.t('账单周期'), value: '{{账单周期}}' },
      { key: i18next.t('自定义'), value: '' },
    ],
    [i18next.t('客户')]: [
      { key: i18next.t('公司名'), value: '{{公司名}}' },
      { key: i18next.t('公司地址'), value: '{{公司地址}}' },
      { key: i18next.t('客户名'), value: '{{客户名}}' },
      { key: i18next.t('客户地址'), value: '{{客户地址}}' },
    ],
    [i18next.t('金额')]: [
      {
        key: i18next.t('下单金额'),
        value: `${Price.getCurrency()}{{下单金额}}`,
      },
      {
        key: i18next.t('出库金额'),
        value: `${Price.getCurrency()}{{出库金额}}`,
      },
      {
        key: i18next.t('应付金额'),
        value: `${Price.getCurrency()}{{应付金额}}`,
      },
      {
        key: i18next.t('已付金额'),
        value: `${Price.getCurrency()}{{已付金额}}`,
      },
      {
        key: i18next.t('未付金额'),
        value: `${Price.getCurrency()}{{未付金额}}`,
      },
      {
        key: i18next.t('售后金额'),
        value: `${Price.getCurrency()}{{售后金额}}`,
      },
      {
        key: i18next.t('未结金额'),
        value: `${Price.getCurrency()}{{未结金额}}`,
      },
    ],
    [i18next.t('套账金额')]: hasAddOrderPermission() && [
      { key: i18next.t('总加单金额'), value: '{{总加单金额}}' },
      { key: i18next.t('套账下单金额'), value: '{{套账下单金额}}' },
      { key: i18next.t('套账出库金额'), value: '{{套账出库金额}}' },
      { key: i18next.t('套账应付金额'), value: '{{套账应付金额}}' },
      { key: i18next.t('套账未付金额'), value: '{{套账未付金额}}' },
      { key: i18next.t('套账未结金额'), value: '{{套账未结金额}}' },
    ],
  }

  return _.pickBy(result, _.isArray)
}

/** 获取表格字段 */
export function getTableFields(): Fields {
  const ishasAddOrderPermission = hasAddOrderPermission()

  const result: Record<string, FieldItem[] | boolean> = {
    [i18next.t('账单明细')]: [
      { key: i18next.t('订单号'), value: '{{列.订单号}}' },
      { key: i18next.t('下单时间'), value: '{{列.下单时间}}' },
      { key: i18next.t('收货时间'), value: '{{列.收货时间}}' },
      { key: i18next.t('业务类型'), value: '{{列.业务类型}}' },
      { key: i18next.t('订单类型'), value: '{{列.订单类型}}' },
      { key: i18next.t('支付状态'), value: '{{列.支付状态}}' },
      { key: i18next.t('下单金额'), value: '{{列.下单金额}}' },
      { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
      { key: i18next.t('应付金额'), value: '{{列.应付金额}}' },
      { key: i18next.t('已付金额'), value: '{{列.已付金额}}' },
      { key: i18next.t('未付金额'), value: '{{列.未付金额}}' },
      { key: i18next.t('售后金额'), value: '{{列.售后金额}}' },
    ],
    [i18next.t('账单明细套账')]: ishasAddOrderPermission && [
      { key: i18next.t('总加单金额'), value: '{{列.账单总加单金额}}' },
      { key: i18next.t('套账下单金额'), value: '{{列.账单套账下单金额}}' },
      { key: i18next.t('套账出库金额'), value: '{{列.账单套账出库金额}}' },
      { key: i18next.t('套账应付金额'), value: '{{列.账单套账应付金额}}' },
      { key: i18next.t('套账未付金额'), value: '{{列.账单套账未付金额}}' },
    ],
    [i18next.t('订单明细')]: [
      { key: i18next.t('订单号'), value: '{{列.订单号}}' },
      { key: i18next.t('下单时间'), value: '{{列.下单时间}}' },
      { key: i18next.t('收货时间'), value: '{{列.收货时间}}' },
      { key: i18next.t('业务类型'), value: '{{列.业务类型}}' },
      { key: i18next.t('订单类型'), value: '{{列.订单类型}}' },
      { key: i18next.t('商品名'), value: '{{列.商品名}}' },
      { key: i18next.t('商品分类'), value: '{{列.商品分类}}' },
      { key: i18next.t('下单单位'), value: '{{列.下单单位}}' },
      { key: i18next.t('下单数'), value: '{{列.下单数}}' },
      { key: i18next.t('出库数'), value: '{{列.出库数}}' },
      { key: i18next.t('商品单价'), value: '{{列.商品单价}}' },
      { key: i18next.t('定价单位'), value: '{{列.定价单位}}' },
      { key: i18next.t('下单金额'), value: '{{列.下单金额}}' },
      { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
    ],
    [i18next.t('订单明细套账')]: ishasAddOrderPermission && [
      { key: i18next.t('加单数1'), value: '{{列.加单数1}}' },
      { key: i18next.t('加单金额1'), value: '{{列.加单金额1}}' },
      { key: i18next.t('加单数2'), value: '{{列.加单数2}}' },
      { key: i18next.t('加单金额2'), value: '{{列.加单金额2}}' },
      { key: i18next.t('加单数3'), value: '{{列.加单数3}}' },
      { key: i18next.t('加单金额3'), value: '{{列.加单金额3}}' },
      { key: i18next.t('加单数4'), value: '{{列.加单数4}}' },
      { key: i18next.t('加单金额4'), value: '{{列.加单金额4}}' },
      { key: i18next.t('总加单数'), value: '{{列.总加单数}}' },
      { key: i18next.t('总加单金额'), value: '{{列.总加单金额}}' },
      { key: i18next.t('套账下单数'), value: '{{列.套账下单数}}' },
      { key: i18next.t('套账出库数'), value: '{{列.套账出库数}}' },
      { key: i18next.t('套账下单金额'), value: '{{列.套账下单金额}}' },
      { key: i18next.t('套账出库金额'), value: '{{列.套账出库金额}}' },
    ],
    [i18next.t('商品汇总')]: [
      { key: i18next.t('商品名'), value: '{{列.商品名}}' },
      { key: i18next.t('商品分类'), value: '{{列.商品分类}}' },
      { key: i18next.t('下单单位'), value: '{{列.下单单位}}' },
      { key: i18next.t('下单数'), value: '{{列.下单数}}' },
      { key: i18next.t('出库数'), value: '{{列.出库数}}' },
      { key: i18next.t('商品单价（均值）'), value: '{{列.商品单价_均值}}' },
      { key: i18next.t('下单金额'), value: '{{列.下单金额}}' },
      { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
    ],
    [i18next.t('商品汇总套账')]: ishasAddOrderPermission && [
      { key: i18next.t('加单数1'), value: '{{列.加单数1}}' },
      { key: i18next.t('加单数2'), value: '{{列.加单数2}}' },
      { key: i18next.t('加单数3'), value: '{{列.加单数3}}' },
      { key: i18next.t('加单数4'), value: '{{列.加单数4}}' },
      { key: i18next.t('总加单数'), value: '{{列.总加单数}}' },
      { key: i18next.t('加单金额1'), value: '{{列.加单金额1}}' },
      { key: i18next.t('加单金额2'), value: '{{列.加单金额2}}' },
      { key: i18next.t('加单金额3'), value: '{{列.加单金额3}}' },
      { key: i18next.t('加单金额4'), value: '{{列.加单金额4}}' },
      { key: i18next.t('总加单金额'), value: '{{列.总加单金额}}' },
      { key: i18next.t('套账下单数'), value: '{{列.套账下单数}}' },
      { key: i18next.t('套账出库数'), value: '{{列.套账出库数}}' },
      { key: i18next.t('套账下单金额'), value: '{{列.套账下单金额}}' },
      { key: i18next.t('套账出库金额'), value: '{{列.套账出库金额}}' },
    ],
  }
  return _.pickBy(result, _.isArray)
}

/**
 * 获取表格字段(用户自定义订单类型)
 *
 * 用户自定义订单类型需要通过接口获取
 */
export async function getTableFieldsOfOrderType(): Promise<Fields> {
  try {
    const ishasAddOrderPermission = hasAddOrderPermission()
    const { response } = await ListCustomizeType()
    // 下单金额
    const orderAmountFields: FieldItem[] = []
    // 出库金额
    const outstockAmountFields: FieldItem[] = []
    // 总加单金额
    const totalAddAmountFields: FieldItem[] = []

    _.forEach(response.customize_types, (item) => {
      if (item.delete_time !== '0') {
        return
      }
      orderAmountFields.push({
        key: i18next.t(`${item.name}（下单金额）`),
        value: `{{列.订单类型_${item.customize_type_id}_下单金额}}`,
      })
      outstockAmountFields.push({
        key: i18next.t(`${item.name}（出库金额）`),
        value: `{{列.订单类型_${item.customize_type_id}_出库金额}}`,
      })
      totalAddAmountFields.push({
        key: i18next.t(`${item.name}（总加单金额）`),
        value: `{{列.订单类型_${item.customize_type_id}_总加单金额}}`,
      })
    })

    const result: Record<string, FieldItem[] | boolean> = {
      [i18next.t('订单类型汇总')]: [
        { key: i18next.t('下单日期（按天）'), value: '{{列.下单日期_按天}}' },
        // 下单金额是动态的（用户自定义订单类型）
        ...orderAmountFields,
        // 出库金额是动态的（用户自定义订单类型）
        ...outstockAmountFields,
        { key: i18next.t('下单金额'), value: '{{列.下单金额}}' },
        { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
      ],
      [i18next.t('订单类型汇总套账')]: ishasAddOrderPermission && [
        // 总加单金额是动态的（用户自定义订单类型）
        ...totalAddAmountFields,
        { key: i18next.t('套账下单金额'), value: '{{列.套账下单金额}}' },
        { key: i18next.t('套账出库金额'), value: '{{列.套账出库金额}}' },
      ],
    }
    return _.pickBy(result, _.isArray)
  } catch (error) {
    console.error(error)
    return Promise.resolve({})
  }
}
