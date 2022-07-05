import _ from 'lodash'
import Big from 'big.js'
import globalStore from '@/stores/global'
import {
  Unit,
  GetManyReferencePrice,
  Sku_NotPackageSubSkuType,
  Sku_SkuType,
  ReferencePrice_Type,
  UnitValue,
  SsuInfo,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { GetManyReferencePrices } from 'gm_api/src/production'
import type { UnitGlobal } from '@/stores/global'
import { ProductionSettings_PackageMaterialCost } from 'gm_api/src/preference'
import moment from 'moment'

/** -----------------商品重构后新方法------------- */

/**
 * @description 获取子报价单生效时间
 * @params quotation
 * @returns time （yyyy-MM-DD～yyyy-MM-DD）
 */
const getChildEffectiveTime = (quotation: Quotation) => {
  const { start_time, end_time, type } = quotation
  if (type === Quotation_Type.PERIODIC) {
    return `${moment(Number(start_time)).format('yyyy-MM-DD')}~${moment(
      Number(end_time),
    ).format('yyyy-MM-DD')}`
  } else {
    return '-'
  }
}

/** -------------------重构前方法---------------- */

/**
 * 获取成本
 * @param ids
 * @param toMap 配合Promise.all 返回对象
 * @returns
 */
const fetchSkuMaterialCost = (
  ids: { sku_ids?: string[]; ssu_ids?: string[]; unit_id?: string },
  toMap?: boolean,
) => {
  if (ids?.sku_ids) {
    return GetManyReferencePrices({
      sku_ids: ids.sku_ids,
      unit_id: ids.unit_id,
    }).then((res) => {
      return toMap ? { materialCost: res.response } : res.response
    })
  }
  return GetManyReferencePrice({ ...ids, need_bom_ref: true }).then((res) => {
    return toMap ? { materialCost: res.response } : res.response
  })
}

/**
 * 若传Unit需要在外面自行map成select类型的数据，UnitGlobal已为select类型的数据
 * 不统一处理data,外部执行一次globalStore.getSameUnitArray()传入
 */
const addProductUnit = (
  base_unit_id: string,
  product_unit: Unit,
  data?: UnitGlobal[] | Unit[],
) => {
  const cloneDeepData = _.cloneDeep(data) ?? []
  const { unit_id, rate } = product_unit
  if (base_unit_id === unit_id) return cloneDeepData
  const productUnit = _.find(globalStore.unitList, {
    unit_id,
  })
  if (productUnit) {
    // 将比例转成生产的比例 初始比例1无用
    cloneDeepData.unshift(
      Object.assign(productUnit, { isProductUnit: true, rate }),
    )
  }
  return cloneDeepData
}

/**
 *  如果成本为包装单位需要转换成计量单位
 * @param material_cost 物料成本
 * @param ssuInfo 对应的SsuInfo数组
 * @returns
 */
const costUnitConversion = (
  material_cost: UnitValue | undefined,
  ssuInfo: SsuInfo[],
) => {
  if (!material_cost || material_cost.val === '0') return undefined
  const { unit_id: costUnitID, val } = material_cost
  const ssuData = _.find(ssuInfo, ({ ssu }) => costUnitID === ssu?.unit_id)
  // 包装转计量
  if (ssuData) {
    const { parent_id, rate } = ssuData.ssu?.unit as Unit
    return {
      ...material_cost,
      unit_id: parent_id!,
      val: Big(val as string)
        .div(rate)
        .toFixed(4),
    }
  }

  return {
    ...material_cost,
    val: Big(val!).toFixed(4),
  }
}

/**
 * 物料成本权限
 * @param not_package_sub_sku_type 商品类型
 * @param sku_type 包材
 * @returns
 */
const permissionsMaterialRateCost = (
  not_package_sub_sku_type?: Sku_NotPackageSubSkuType,
  sku_type?: Sku_SkuType,
) => {
  const { productionSetting, gmShopSetting } = globalStore
  // 开启成本价
  const isCostPriceType =
    gmShopSetting?.reference_price_type !==
    ReferencePrice_Type.REFERENCE_PRICE_UNSPECIFIED

  // 符合的商品类型
  const isSubSkuType = _.isUndefined(not_package_sub_sku_type)
    ? true
    : !productionSetting?.sku_filter_not_in_material_costs?.sku_filter_not_in_material_costs!.includes(
        not_package_sub_sku_type!,
      )
  // 符合的包材
  const isPack = _.isUndefined(sku_type)
    ? true
    : !(
        sku_type === Sku_SkuType.PACKAGE &&
        productionSetting.package_material_cost ===
          ProductionSettings_PackageMaterialCost.PACKAGEMATERIALCOST_UNAVAILABLE
      )

  return isCostPriceType && isPack && isSubSkuType
}

export {
  /** 商品重构后新方法 */
  getChildEffectiveTime,
  /** 重构前方法 */
  addProductUnit,
  fetchSkuMaterialCost,
  permissionsMaterialRateCost,
  costUnitConversion,
}
