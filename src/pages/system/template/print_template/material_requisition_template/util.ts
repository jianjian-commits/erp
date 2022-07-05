import { PrintMaterialOrderSheet } from '@/pages/system/template/print_template/material_requisition_template/interface'
import {
  MaterialOrderDetail,
  MaterialOrderDetail_MaterialDetail,
  PrintMaterialOrderResponse,
} from 'gm_api/src/production'
import _ from 'lodash'

export const handleMaterialOrderDetail = (
  data: PrintMaterialOrderResponse,
  noneMaterial?: boolean,
): PrintMaterialOrderSheet[] => {
  return _.map(data?.sheets, ({ material_order_details, ...other }) => {
    return {
      ...other,
      material_order_details: _.map(
        material_order_details,
        (materialDetailData) => {
          const haveInfoData = handleDetail(materialDetailData, data)
          const { sku_details, ...materialDetailOther } = haveInfoData
          // 当模板里没有菜品明细时或者菜品明细只有一条的时候，material_order_details每条为MaterialOrDetailPrint
          // 有模板字段且有多条菜品明细时，material_details长度变成MaterialOrDetailPrint[]
          const skuOrderDetail =
            noneMaterial || sku_details!.length <= 1
              ? haveInfoData
              : _.map(sku_details, (v) => {
                  return {
                    ...materialDetailOther,
                    sku_details: [v],
                  }
                })

          return skuOrderDetail
        },
      ),
    }
  })
}

/** 处理需要的信息 */
const handleDetail = (
  data: MaterialOrderDetail,
  info: PrintMaterialOrderResponse,
) => {
  const { sku_id, sku_details, material_details } = data
  const { skus } = info
  const skuInfo = skus?.sku_map?.[sku_id!]
  const materialDetails = (details?: MaterialOrderDetail_MaterialDetail[]) => {
    return _.map(details, (v) => ({
      ...v,
      skuInfo: skus?.sku_map?.[v.sku_id!],
    }))
  }

  return {
    ...data,
    skuInfo: skuInfo,
    categoryInfo: skus?.category_map?.[skuInfo?.category_id!],
    sku_details: materialDetails(sku_details),
    material_details: materialDetails(material_details),
  }
}
