import { t } from 'gm-i18n'
import {
  Quotation_Status,
  Quotation_Type,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

/** 报价单类型 */
export const TYPE_RADIO_ENUM = [
  { label: t('普通报价单'), value: Quotation_Type.WITHOUT_TIME },
  { label: t('周期报价单'), value: Quotation_Type.PERIODIC },
]

/** 禁用启用状态 */
export const STATUS_RADIO_ENUM = [
  { label: t('启用'), value: Quotation_Status.STATUS_VALID },
  { label: t('禁用'), value: Quotation_Status.STATUS_WAIT_VALID },
]

/** 报价单类型筛选 */
export const QUOTATION_TYPE_OPTIONS = [
  {
    label: t('全部类型'),
    value: Quotation_Type.UNSPECIFIED,
  },
  { label: t('普通报价单'), value: Quotation_Type.WITHOUT_TIME },
  { label: t('周期报价单'), value: Quotation_Type.PERIODIC },
]

/** 禁用启用全部状态 */
export const STATUS_OPTIONS = [
  { value: 0, label: t('全部状态') },
  { value: Quotation_Status.STATUS_VALID, label: t('启用') },
  { value: Quotation_Status.STATUS_WAIT_VALID, label: t('禁用') },
  { value: Quotation_Status.STATUS_WAIT_AUDIT, label: t('待审核') },
]

/** 上架下架全部状态 */
export const SHELF_OPTIONS = [
  { value: 0, label: t('全部状态') },
  { value: 1, label: t('上架') },
  { value: 2, label: t('下架') },
]

export const IS_DEFAULT_ENUM = [
  { label: t('开启'), value: true },
  { label: t('关闭'), value: false },
]

export const QUOTATION_TYPE = [
  { label: t('普通报价单'), value: Quotation_Type.WITHOUT_TIME },
  { label: t('周期报价单'), value: Quotation_Type.PERIODIC },
]
/** 商品类型 */
export const SKU_TYPE_OPTIONS = [
  { label: t('普通商品'), value: Sku_SkuType.NOT_PACKAGE },
  { label: t('组合商品'), value: Sku_SkuType.COMBINE },
]

export const UNIT_ENUM = {
  /** 基本单位 */
  base_unit: 1,
  /** 基本单位的同系列单位 */
  same_base_unit: 2,
  /** 辅助单位 */
  assist_unit: 3,
  /** 辅助单位的同系列单位 */
  same_assist_unit: 4,
  /** 自定义单位 */
  custom_unit: 5,
}

const UNIT_ENUM_MEAN = {
  [UNIT_ENUM.base_unit]: '基本单位',
  [UNIT_ENUM.same_base_unit]: '基本单位的同系列单位',
  [UNIT_ENUM.assist_unit]: '辅助单位',
  [UNIT_ENUM.same_assist_unit]: '辅助单位的同系列单位',
  [UNIT_ENUM.custom_unit]: '自定义单位',
}

type ValueOf<T> = T[keyof T]

export type UNIT_ENUM_TYPE = ValueOf<typeof UNIT_ENUM>

/**
 * 获取单位类型释义
 */
export function getUnitEnumMean(value?: string | number): string | undefined {
  return _.get(UNIT_ENUM_MEAN, value || '')
}
