import _ from 'lodash'
import Big from 'big.js'
import {
  MaterialOrDetailPrint,
  materialOrderDetailsType,
  PrintMaterialOrderSheet,
} from '@/pages/system/template/print_template/material_requisition_template/interface'
import { getBaseUnitName } from '@/pages/order/util'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import moment from 'moment'
import { toFixed } from '@/common/util'

/**
 * @param tableData [[{},{}],{}]
 */
function generateNormalTable(tableData: materialOrderDetailsType[]) {
  return _.map(tableData, (data, i) => {
    if (_.isArray(data)) {
      return _.map(data, (item, j) => {
        return tableItem(item, +i, j)
      })
    } else {
      return tableItem(data, +i)
    }
  })
}

/**
 * 表格基础数据
 * @param productDetails
 */
function tableItem(item: MaterialOrDetailPrint, index: number, j?: number) {
  const {
    skuInfo,
    categoryInfo,
    plan_amount,
    unit_id,
    material_details,
    sku_details,
  } = item
  const unitName = getBaseUnitName(unit_id!)
  const materialDetailsData = _.map(
    material_details,
    ({ skuInfo, quantity, unit_id }) =>
      skuInfo?.name + ' ' + toFixed(+quantity!, 4) + getBaseUnitName(unit_id!),
  )
  return {
    // 基础
    序号: index + 1,
    index: j,
    物料分类: categoryInfo?.name,
    物料名称: skuInfo?.name,
    物料类型: map_Sku_NotPackageSubSkuType[skuInfo?.not_package_sub_sku_type!],
    需求数_基本单位: toFixed(+plan_amount!, 4) + unitName,
    需求数_生产单位:
      Big(plan_amount!)
        .times(skuInfo?.production_unit?.rate || 1)
        .toFixed(4) + (skuInfo?.production_unit?.name! || unitName),

    菜品明细:
      sku_details[0]?.skuInfo?.name! +
      '  ' +
      toFixed(+sku_details[0]?.quantity!, 4) +
      unitName,
    原料明细: materialDetailsData.length ? materialDetailsData.join(',') : '-',
    车间或小组名称: '-',
    仓库名称: '-',
  }
}

function materialRequisitionDataKey(materialSheet: PrintMaterialOrderSheet) {
  const { material_order, material_order_details } = materialSheet

  const common = {
    交期时间: moment(+material_order?.delivery_time!).format(
      'YYYY-MM-DD HH:mm:ss',
    ),
    物料数量: material_order_details.length,
    打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    barcode: material_order?.serial_no,
    备注: '备注',
    领料单: material_order?.title,
  }

  return {
    common,
    // 表格数据整理
    _table: {
      orders: generateNormalTable(material_order_details || []), // 普通
      '1': generateNormalTable(material_order_details || []), // 普通
    },
    _origin: materialSheet,
  }
}

export default materialRequisitionDataKey
