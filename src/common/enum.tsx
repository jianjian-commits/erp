/*
 * @Description: 公共常量
 */
import React from 'react'
import { t } from 'gm-i18n'
import { TimeType } from 'gm_api/src/aftersale'
import { GetOrderMerchandiseSaleDataRequest_Type } from 'gm_api/src/databi'
import { Normalizes } from './interface'
import { Column, TableXUtil } from '@gm-pc/table-x'
import { Observer } from 'mobx-react'

const { TABLE_X } = TableXUtil

export const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE_AFTER_SALE,
    name: t('按建单时间'),
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_PLACE_ORDER,
    name: t('按下单时间'),
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_RECEIVE_GOODS,
    name: t('按收货时间'),
    expand: false,
  },
]

export const Placeholders = {
  MERCHANDISE_NAME_CODE: t('输入商品名或编码搜索'),
  MERCHANDISE_NAME: t('输入商品名搜索'),
  CUSTOMER_NAME: t('输入商户名搜索'),
  CUSTOMER_NAME_CODE: t('输入商户编码或商户名搜索'),
}

const getCategoryIds = (originIds?: { value: string }[]): string[] => {
  const newIds = originIds?.map((item) => item.value) || []
  return newIds
}
export const NORMALIZES: Normalizes = {
  time_range({ dateType, begin, end }) {
    return {
      begin_time: `${+begin}`,
      end_time: `${+end}`,
      time_field: `${
        dateType === TimeType.TIME_TYPE_RECEIVE_GOODS ? 'receive' : 'order'
      }_time`,
    }
  },
  category: (category_ids) => {
    if (category_ids.length) {
      return {
        category_ids: [category_ids[category_ids.length - 1]],
        category_type: category_ids.length,
      }
    } else {
      return {
        category_ids: [],
        category_type: GetOrderMerchandiseSaleDataRequest_Type.TYPE_CATEGORY1,
      }
    }
  },
}

export enum WeekEnum {
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
}

type CommonComlumKey = 'INDEX' | 'SKU_BASE_UNIT_NAME'
const TEMP_COMMON_COLUMNS: Record<CommonComlumKey, Column> = {
  INDEX: {
    Header: t('序号'),
    diyEnable: false,
    accessor: (_, index) => index + 1,
    fixed: 'left',
    width: TABLE_X.WIDTH_NO,
  },
  SKU_BASE_UNIT_NAME: {
    Header: t('基本单位'),
    diyEnable: false,
    minWidth: 100,
    isKeyboard: false,
    accessor: (original) => {
      return (
        <Observer>
          {() => {
            return original.sku_base_unit_name || '-'
          }}
        </Observer>
      )
    },
  },
}
export const COMMON_COLUMNS: Record<
  CommonComlumKey | 'SKU_BASE_UNIT_NAME_NO_MINWIDTH',
  Column
> = {
  ...TEMP_COMMON_COLUMNS,
  SKU_BASE_UNIT_NAME_NO_MINWIDTH: {
    ...TEMP_COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
    minWidth: undefined,
  },
}

export const SUCCESS_TIP = t('保存成功')
export const FAIL_TIP = t('保存失败')
