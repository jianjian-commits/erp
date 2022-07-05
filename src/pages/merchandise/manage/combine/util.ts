import globalStore, { UnitGlobal } from '@/stores/global'
import { Sku, Unit_Type } from 'gm_api/src/merchandise'
import _ from 'lodash'

/** 获取下单单位 */
export const getSkuUnitList = (sku: Sku) => {
  const { base_unit_id, second_base_unit_id, second_base_unit_ratio, units } =
    sku

  const { getUnit } = globalStore

  // 获取可选下单单位
  let unitList = []
  const baseUnit = getUnit(base_unit_id)
  const secondBaseUnit = getUnit(second_base_unit_id || '') || {}

  unitList = _.filter(globalStore.unitList, (unitItem) => {
    if (unitItem.type === Unit_Type.COUNT) {
      return baseUnit.unit_id === unitItem.unit_id
    } else {
      return (
        baseUnit.type === unitItem.type ||
        (secondBaseUnit.type === unitItem.type &&
          secondBaseUnit.unit_id !== unitItem.unit_id)
      )
    }
  })

  if (second_base_unit_id && second_base_unit_id !== '0') {
    const secondBaseUnit = getUnit(second_base_unit_id)
    unitList.push({
      ..._.cloneDeep(secondBaseUnit),
      text: `${secondBaseUnit.text}（${second_base_unit_ratio}${baseUnit.text}）`,
    })
  }

  if (units?.units) {
    _.forEach(units.units, (unitItem) => {
      const { name, rate, parent_id } = unitItem
      const parentUnit = getUnit(parent_id)
      unitList.push({
        ...unitItem,
        text: `${name}（${rate}${parentUnit.text}）`,
      })
    })
  }
  return unitList
}

/** 获取商品单价单位列表 */
export const getPriceUnitList = (
  sku: Sku,
  unitList: UnitGlobal[],
  unitId: string,
) => {
  const { base_unit_id, second_base_unit_id = '' } = sku
  const list = _.filter(unitList, (unitItem) => {
    return (
      unitItem.unit_id === base_unit_id ||
      unitItem.unit_id === second_base_unit_id ||
      unitItem.unit_id === unitId
    )
  })

  return list
}

/**
 * @description 获取单位换算比
 * @param orderUnitObj 下单单位/组合商品商品数量单位
 * @param priceUnitObj 商品单价单位
 * @param sku 商品信息
 */

/** 获取组组成商品价格 */
export const getCombineUnitRate = (
  orderUnitObj: UnitGlobal,
  priceUnitObj: UnitGlobal,
  sku: Sku,
) => {
  const { base_unit_id, second_base_unit_id = '', second_base_unit_ratio } = sku
  if (orderUnitObj.unit_id !== priceUnitObj.unit_id) {
    // 下单单位与商品单价单位不为同一单位
    const baseUnitObj = globalStore.getUnit(base_unit_id)
    const secondUnitObj = globalStore.getUnit(second_base_unit_id)
    if (
      orderUnitObj.type &&
      (orderUnitObj.type === baseUnitObj.type ||
        orderUnitObj.type === secondUnitObj.type)
    ) {
      // 下单单位为非自定义单位
      if (orderUnitObj.type === priceUnitObj.type) {
        // 下单单位与商品单价单位为同系单位
        return getUnitRate(priceUnitObj.unit_id, orderUnitObj.unit_id)
      } else if (
        orderUnitObj.type === baseUnitObj.type &&
        priceUnitObj.unit_id === second_base_unit_id
      ) {
        // 下单单位为基本单位同系单位，商品单价单位为辅助单位
        return (
          getUnitRate(base_unit_id, orderUnitObj.unit_id) /
          Number(second_base_unit_ratio)
        )
      } else if (
        orderUnitObj.type === secondUnitObj.type &&
        priceUnitObj.unit_id === base_unit_id
      ) {
        // 下单单位为辅助单位同系单位，商品单价单位为基本单位
        return (
          Number(second_base_unit_ratio) *
          getUnitRate(second_base_unit_id, orderUnitObj.unit_id)
        )
      }
    } else {
      // 下单单位为自定义单位
      const orderParentObj = globalStore.getUnit(orderUnitObj.parent_id)
      if (priceUnitObj.unit_id === base_unit_id) {
        // 商品单价为基本单位
        if (orderParentObj.type === baseUnitObj.type) {
          // 自定义单位的基础单位为基本单位同系单位
          return (
            Number(orderUnitObj.rate) *
            getUnitRate(priceUnitObj.unit_id, orderUnitObj.parent_id)
          )
        } else if (orderParentObj.type === secondUnitObj.type) {
          // 自定义单位的基础单位为辅助单位同系单位
          return (
            Number(orderUnitObj.rate) *
            getUnitRate(second_base_unit_id, orderUnitObj.parent_id) *
            Number(second_base_unit_ratio)
          )
        }
      } else if (priceUnitObj.unit_id === second_base_unit_id) {
        // 商品单价为辅助单位
        if (orderParentObj.type === baseUnitObj.type) {
          // 自定义单位的基础单位为基本单位同系单位
          return (
            (Number(orderUnitObj.rate) *
              getUnitRate(base_unit_id, orderParentObj.unit_id)) /
            Number(second_base_unit_ratio)
          )
        } else if (orderParentObj.type === secondUnitObj.type) {
          // 自定义单位的基础单位为辅助单位同系单位
          return (
            Number(orderUnitObj.rate) *
            getUnitRate(priceUnitObj.unit_id, orderUnitObj.parent_id)
          )
        }
      }
    }
  }
  return 1
}

export const getUnitRate = (unitId: string, getUnitId: string) => {
  if (unitId === getUnitId) {
    return 1
  } else {
    const unitObj = globalStore.getUnit(unitId)
    const getUnitObj = globalStore.getUnit(getUnitId)

    if (unitObj && getUnitObj) {
      if (unitObj.parent_id === '0') {
        return Number(getUnitObj.rate)
      } else if (getUnitObj.parent_id === '0') {
        return 1 / Number(unitObj.rate)
      } else {
        return Number(getUnitObj.rate) / Number(unitObj.rate)
      }
    }
    return 1
  }
}
