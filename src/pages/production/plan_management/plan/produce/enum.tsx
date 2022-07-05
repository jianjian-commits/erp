import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'

export enum PackType {
  TURNOVER = 1000,
  ONE_TIME = 1001,
}

export const toSkuType: Record<PackType, number> = {
  [PackType.TURNOVER]: 1,
  [PackType.ONE_TIME]: 2,
}

export const skuTypeList = [
  {
    value: PackType.TURNOVER,
    text: '包材-周转物',
    label: '包材-周转物',
  },
  {
    value: PackType.ONE_TIME,
    text: '包材-耗材',
    label: '包材-耗材',
  },
  ...list_Sku_NotPackageSubSkuType,
]
