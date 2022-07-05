import { Key, ReactNode } from 'react'
import { DataNode } from '@/common/interface'
import { CustomUnitItem } from '@/pages/merchandise/manage/merchandise_list/create/type'
import globalStore, { UnitGlobal } from '@/stores/global'
import { Unit } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { t } from 'gm-i18n'

export const formatCustomUnits = (unitList: Unit[]) => {
  const newMultiFormList: CustomUnitItem[] = []
  const newUnitList: UnitGlobal[] = []
  const newCustomFormValue: { [key: string]: string } = {}
  _.forEach(unitList, (unitItem, index) => {
    const { unit_id, name, rate, parent_id } = unitItem
    const parentUnit = globalStore.getUnit(parent_id)
    newMultiFormList.push({
      parent_id,
      custom_unit: name as string,
      rate: Number(rate),
    })
    newUnitList.push({
      ...unitItem,
      text: `${name}（${rate}${parentUnit.name}）`,
      value: unit_id,
    })
    newCustomFormValue[
      `custom_unit_${index + 1}`
    ] = `${name}（${rate}${parentUnit.name}）`
  })

  return { newMultiFormList, newUnitList, newCustomFormValue }
}

export const getCustomUnits = (values: CustomUnitItem[]) => {
  const unitsObj: { [key: string]: string } = {}
  const unitsList: UnitGlobal[] = []
  values.forEach((valueItem, index) => {
    const { custom_unit, rate, parent_id } = valueItem
    const baseItem = globalStore.getUnit(parent_id)
    const listItem = {
      text: custom_unit,
      value: index.toString(),
      parent_id: parent_id,
      rate: rate.toString(),
      unit_id: index.toString(),
      name: custom_unit,
    }
    const objValue = `${custom_unit}（${rate}${baseItem.name}）`
    unitsList.push(listItem)
    unitsObj[`custom_unit_${index + 1}`] = objValue
  })
  return { unitsObj, unitsList }
}

export const getCascaderValue = (
  parentValues: { texts: string[]; values: string[] },
  id: string,
  list: any[],
) => {
  // debugger
  for (let i = 0; i < list.length; i++) {
    const { value, text, children } = list[i]
    const newValues = {
      texts: [...parentValues.texts, text],
      values: [...parentValues.values, value],
    }
    if (value === id) {
      return newValues
    } else if (children?.length) {
      const obj: any = getCascaderValue(newValues, id, children)
      if (obj?.texts) {
        return obj
      }
    }
  }
  return {}
}

/**
 * @description 通过叶子结点获取根节点数组
 * @param texts 展示文本，叶子结点文本数组，[ids[1], ..., ids[ids.length - 1]]
 * @param ids 叶子结点数组
 * @param map 数据对象
 */
export const getCategoryValue = (
  texts: ReactNode[],
  ids: Key[],
  map: { [key: string]: DataNode },
): { texts: ReactNode[]; ids: Key[] } => {
  if (ids[0]) {
    const node = map[ids[0]]
    if (node) {
      const newTexts = [node.title || node.name, ...texts]
      const parentId = node.parentId || node.parent_id
      if (parentId === '0') {
        return { texts: newTexts, ids }
      } else {
        return getCategoryValue(newTexts, [parentId, ...ids], map)
      }
    }
  }
  return { texts, ids }
}

/**
 * @description 判断文本是否为大于0的两位浮点数或整数，主要用于单位换算值输入判断
 * @param rateNumber 所需判断字符串
 * @returns callback
 */
export const isNumberValid = (rateNumber: string) => {
  const reg = /^(\d+)(.\d{0,2})?$/

  if (!reg.test(rateNumber) || Number(rateNumber) <= 0) {
    return Promise.reject(
      new Error(t('换算值必须为大于0，小数点后至多两位的数值')),
    )
  } else {
    return Promise.resolve(new Error())
  }
}
