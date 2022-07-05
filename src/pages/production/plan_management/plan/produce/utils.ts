import {
  PackType,
  toSkuType,
} from '@/pages/production/plan_management/plan/produce/enum'
import {
  GetManySkuResponse_SkuInfo,
  GetManySkuV2Response,
  Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
export const getPackUnit = (
  skus: GetManySkuV2Response,
  sku_id: string,
  unit_id: string,
) => {
  const sku = skus.sku_map?.[sku_id]!
  const Unit =
    sku.units?.units?.filter((unit) => unit.unit_id === unit_id) || []
  return Unit[0]?.name
}

export const getSkuType = (sku_type: Sku_NotPackageSubSkuType | PackType) => {
  const not_package_sub_sku_type = toSkuType[sku_type as PackType]
    ? 0
    : sku_type
  const package_sub_sku_type = toSkuType[sku_type as PackType]
    ? toSkuType[sku_type as PackType]
    : 0
  return { not_package_sub_sku_type, package_sub_sku_type }
}

export const getRecondPackUnit = (
  skus: { [key: string]: GetManySkuResponse_SkuInfo },
  sku_id: string,
  unit_id: string,
) => {
  const sku = skus[sku_id].sku
  const units = sku?.units?.units || []
  return _.filter(units, (unit) => unit.unit_id === unit_id)[0].name || ''
}

export const list_TaskOutput_State = [
  { value: 1, text: '未提交', laber: '未提交' },
  { value: 2, text: '已提交', laber: '已提交' },
]
