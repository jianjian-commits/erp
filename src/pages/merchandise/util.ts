import _ from 'lodash'
import globalStore from '@/stores/global'
import { UNIT_ENUM } from './price_manage/customer_quotation/constants'
import { UnitOptions } from '@/pages/merchandise/price_manage/customer_quotation/data'
import { DataNode } from '@/common/interface'
import { ReactNode } from 'react'
import { Sku } from 'gm_api/src/merchandise'
import { t } from 'gm-i18n'

/**
 * @description scrollIntoView的封装
 * @param id 元素Id
 */
export const handleScrollIntoView = (id: string) => {
  if (!id) return
  const target = document.getElementById(id)
  target &&
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
}

/**
 * 前端生成随机Id
 */
export const getRandomId = (): string => {
  return Math.random().toString(36)
}

/**
 * 根据单位ID获取单位
 */
export const getUnitItem = (id: string) => {
  if (typeof id !== 'string') return
  if (id === '0') return
  return _.find(globalStore.unitList, (unitItem) => unitItem.value === id)
}

/**
 * 根据SKU 获取所有单位组的逻辑
 */
export const getUnitGroupList = (sku: Sku) => {
  const {
    base_unit_id,
    second_base_unit_id = '',
    units,
    second_base_unit_ratio = '',
  } = sku

  // 自定义单位
  const customuUnits =
    units?.units?.map((unit) => ({
      label:
        unit.name + `(${unit.rate}${getUnitItem(unit.parent_id)?.name || '-'})`,
      name: unit.name,
      value: unit.unit_id,
      unit: UNIT_ENUM.custom_unit,
    })) || []
  /** 基本单位 */
  const base_unit_list = getUnitItemAndSameUnitList(base_unit_id, 'base_unit')

  /** 辅助单位 */
  const assist_unit_list = getUnitItemAndSameUnitList(
    second_base_unit_id,
    'assist_unit',
  ).map((item) => {
    if (item.value === second_base_unit_id) {
      return {
        ...item,
        name: item.label,
        label:
          item.label +
          `(${second_base_unit_ratio}${
            getUnitItem(base_unit_id)?.name || '-'
          })`,
      }
    }
    return item
  })
  // 获取单位集合
  const unitList = [
    ...customuUnits,
    ...base_unit_list,
    ...assist_unit_list,
  ].filter(Boolean) as UnitOptions[]

  return unitList
}

/** 价格校验 */
export const priceValidator = (event: any, value: any) => {
  const reg = /^(\d+)(.\d{0,2})?$/

  if (!reg.test(value) || Number(value) <= 0) {
    return Promise.reject(
      new Error(t('商品单价必须为大于0，小数点后至多两位的数值')),
    )
  } else {
    return Promise.resolve(new Error())
  }
}

export const getValidator = (
  rule: Array<
    | 'required'
    | 'int'
    | 'num'
    | 'positive'
    | 'fixed2'
    | 'phone'
    | 'trim'
    | 'nonNegative'
  >,
  name = '',
) => {
  const rules = {
    /** 必填 */
    required: (val: string) => (val ? undefined : `${name}不能为空`),
    /** 整数 */
    int(val: string) {
      if (!val) return undefined
      return /^[0-9]*$/.test(val) ? undefined : `${name}必须为数字`
    },
    /** 数字 */
    num(val: string) {
      if (!val) return undefined
      return /^-?\d+(\.|\.\d+)?$/.test(val) ? undefined : `${name}格式有误`
    },
    /** 正数 */
    positive(val: string) {
      if (!val) return undefined
      return !rules.num(val) && parseFloat(val) > 0
        ? undefined
        : `${name}必须大于0`
    },
    /** 非负数 */
    nonNegative(val: string) {
      if (!val) return undefined
      return !rules.num(val) && parseFloat(val) >= 0
        ? undefined
        : `${name}必须大于等于0`
    },
    /** 小数时，仅保留两位小数 */
    fixed2(val = '') {
      if (!val) return undefined
      if (val.indexOf('.') === 0) {
        return undefined
      }
      return /^(([0-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/.test(val)
        ? undefined
        : `${name}小数位为1-2位`
    },
    /** 手机格式 */
    phone(val = '') {
      if (!val) return undefined
      if (val.length > 11) return `${name}不能超过11位`
      return /\d{3}-\d{8}|\d{4}-\d{7}|^\d{11}$/.test(val)
        ? undefined
        : `${name}格式有误`
    },
    /** 都是空格将不能通过 */
    trim(val = '') {
      if (!val) return undefined
      return val.trim() ? undefined : `${name}不能为空格`
    },
  }

  return (_: any, value: string) => {
    const errors = rule.map((r) => rules[r](value)).filter(Boolean) as string[]
    if (errors.length > 0) {
      return Promise.reject(errors[0])
    } else {
      return Promise.resolve()
    }
  }
}

/**
 * 获取基本单位/辅助单位的 同系列单位及当前单位
 */
export const getUnitItemAndSameUnitList = (
  id: string,
  type: 'base_unit' | 'assist_unit',
) => {
  let unitList = []
  const sameType: 'same_base_unit' | 'same_assist_unit' = `same_${type}`
  if (typeof id !== 'string' || id === '0') return []
  const unitItem = _.find(
    globalStore.unitList,
    (unitItem) => unitItem.value === id,
  )

  if (!unitItem) return []
  const { parent_id, unit_id } = unitItem
  if (parent_id === '0') {
    unitList =
      _.filter(
        globalStore.unitList,
        (unitItem) =>
          unitItem.parent_id === unit_id || unitItem.unit_id === unit_id,
      ) || []
  } else {
    unitList = _.filter(
      globalStore.unitList,
      (unitItem) =>
        unitItem.parent_id === parent_id || unitItem.unit_id === parent_id,
    )
  }

  return unitList.map((item) => ({
    label: item.name,
    value: item.value,
    unit: item.value === id ? UNIT_ENUM[type] : UNIT_ENUM[sameType],
  }))
}

/**
 * 编辑/新建商品条目时，商品定价单位的业务逻辑,过滤掉不能用的单位
 * @param units 单位List
 * @param currentUnit 当前已选择的下单单位
 */
export const getFilterPriceUnits = (
  units: UnitOptions[],
  currentUnit: UnitOptions | undefined,
) => {
  return units.filter((f) => {
    /** 定价单位最多只有3个，当前下单单位+基本单位+辅助单位 */
    // 基本单位必选择
    if (f.unit === UNIT_ENUM.base_unit || f.unit === UNIT_ENUM.assist_unit) {
      return true
    }
    if (
      currentUnit?.unit === UNIT_ENUM.custom_unit ||
      currentUnit?.unit === UNIT_ENUM.same_base_unit ||
      currentUnit?.unit === UNIT_ENUM.same_assist_unit
    ) {
      // 返回当前自定义单位 + 基本单位 + 辅助单位
      if (currentUnit.value === f.value) return true
    }
    return false
  })
}

/**
 * 获取最小起订数单位的逻辑
 * @param units 单位组
 * @param id 当前已选的下单单位Id
 */
export const getMinOrderNumberUnit = (
  units: UnitOptions[],
  id: string | undefined,
) => {
  const unit = units.find((f) => f.value === id)
  if (!unit) return '-'
  if (
    unit.unit === UNIT_ENUM.custom_unit ||
    unit.unit === UNIT_ENUM.assist_unit
  )
    return unit.name
  return unit.label
}

/**
 * 获取分类名称的方法
 * @param categoryMap 分类map
 * @param categoryId 分类Id
 * @param separator 分割符号
 * @returns string
 */
export function getCategoryNames(
  categoryMap: Record<string, DataNode>,
  categoryId: string,
  separator = '/',
) {
  let lastCategory = categoryMap[categoryId]

  if (!lastCategory) return '-'
  const cagetoryNameArr: ReactNode[] = [lastCategory.title]

  while (Number(lastCategory?.parentId)) {
    lastCategory = categoryMap[lastCategory?.parentId]
    cagetoryNameArr.unshift(lastCategory?.title || '-')
  }

  return cagetoryNameArr.join(separator)
}
