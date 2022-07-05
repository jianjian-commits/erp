import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import {
  money,
  getSpecialTable,
  generateMultiData,
  groupByCategory,
} from './util'
import { Price } from '@gm-pc/react'
import {
  GetPurchaseOrderSharedDataResponse,
  PurchaseSheet,
  PurchaseSheet_SheetDetails_SheetDetail,
  PurchaseSheet_Status,
} from 'gm_api/src/purchase'

import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import { t } from 'gm-i18n'
import { parseSsu, toFixed, mapDetailsFromRawDetailId } from '@/common/util'

type Relation = Omit<GetPurchaseOrderSharedDataResponse, 'purchase_sheet'>

type CooperateModelMapType = {
  [key in Sku_SupplierCooperateModelType]: string
}

const CooperateModelMap: CooperateModelMapType = {
  [Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED]: t('-'),
  [Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS]: t('仅供货'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_SORTING]: t('代分拣'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY]: t('代配送'),
}

function generateTable(
  tasks: PurchaseSheet_SheetDetails_SheetDetail[],
  printDetails: PurchaseSheet_SheetDetails_SheetDetail[],
  relation: Relation,
  isDelivery: boolean,
) {
  return tasks.map((task, index) => {
    const skus = relation.skus || {}
    const ssuSnaps = relation.ssu_snaps || {}
    const sku = skus[task.sku_id] || {}
    const ssu =
      ssuSnaps[`${task?.sku_id}_${task?.unit_id}_${task?.ssu_revision}`] || {}
    const ssuParse = parseSsu(ssu)
    const categoryInfos = sku?.category_infos || []
    const category_name_1 = categoryInfos[0]?.category_name
    const category_name_2 = categoryInfos[1]?.category_name
    const pinlei_name = categoryInfos[2]?.category_name
    const unitValue = task?.purchase_value
    const outStockUnitValue = task?.out_stock_unit_value
    const isBaseFiled = unitValue?.input?.unit_id === ssu?.unit?.parent_id
    const no_tax_stdPrice = isBaseFiled
      ? unitValue?.input?.price
      : toFixed(
          Big(unitValue?.input?.price || 0).div(ssuParse.ssu_unit_rate || 1),
        )
    const no_tax_price = !isBaseFiled
      ? unitValue?.input?.price
      : toFixed(
          Big(unitValue?.input?.price || 0).times(ssuParse.ssu_unit_rate || 1),
        )
    const stdPrice = toFixed(Big(+task?.tax_price! || 0))
    const price = toFixed(
      Big(+task?.tax_price! ?? 0).times(ssuParse.ssu_unit_rate || 1),
    )
    const taskPrintDetail = mapDetailsFromRawDetailId(task, printDetails)

    const unitQuantity = +unitValue?.input?.quantity! || 0
    const unitQuantityBig = Big(unitQuantity)

    const outstockQuantity = outStockUnitValue?.calculate?.quantity || 0
    const outstockQuantityBig = Big(outstockQuantity)
    // 采购金额
    const purcasePrice = money(
      (isDelivery ? outstockQuantityBig : unitQuantityBig).times(
        Big(+task?.tax_price! || 0),
      ),
    )
    // 不含税采购金额
    const purchasePriceWithoutTax = money(
      (isDelivery ? outstockQuantityBig : unitQuantityBig).times(
        Big(+unitValue?.input?.price! || 0),
      ),
    )
    // 税额
    const taxPrice = Big(purcasePrice).minus(purchasePriceWithoutTax).toFixed(4)
    const ssuUnitRate = ssu.unit.rate
    return {
      序号: ++index,
      商品名称: sku.sku?.name,
      规格: `${ssu.unit.rate}${ssuParse.ssu_unit_parent_name}/${ssuParse.ssu_unit_name}`,
      一级分类: category_name_1,
      二级分类: category_name_2,
      品类: pinlei_name,
      采购备注: task.remark,
      规格名: ssu?.name,
      商品编码: sku?.sku?.customize_code,
      规格编码: ssu?.customize_code,
      规格描述: ssu?.description,
      供应商协作模式:
        CooperateModelMap[
          task?.supplier_cooperate_model_type ||
            Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED
        ],

      采购数量_计量单位: toFixed(
        unitQuantityBig.times(isBaseFiled ? 1 : ssuUnitRate),
      ),
      采购数量_包装单位: isBaseFiled
        ? toFixed(unitQuantityBig.div(ssuUnitRate))
        : unitQuantity
        ? toFixed(unitQuantity)
        : '-',
      // 预计到货数未发货显示'-'
      预计到货数_计量单位: isDelivery ? outstockQuantityBig.toFixed(4) : '-',
      预计到货数_包装单位: isDelivery
        ? outstockQuantityBig.div(ssu.unit.rate).toFixed(4)
        : '-',

      单价_计量单位: `${money(stdPrice || 0)}${Price.getUnit()}`,
      单价_包装单位: `${money(price || 0)}${Price.getUnit()}`,
      不含税单价_计量单位: `${money(no_tax_stdPrice || 0)}${Price.getUnit()}`,
      不含税单价_包装单位: `${money(no_tax_price || 0)}${Price.getUnit()}`,
      包装单位: '/' + ssuParse.ssu_unit_name,
      计量单位: '/' + ssuParse.ssu_unit_parent_name,

      采购金额: purcasePrice + Price.getUnit(),
      不含税采购金额: purchasePriceWithoutTax + Price.getUnit(),
      税额: taxPrice + Price.getUnit(),
      税率: task.input_tax + '%',
      __details: taskPrintDetail?.map((o) => {
        const ssu =
          ssuSnaps[`${o?.sku_id}_${o?.unit_id}_${o?.ssu_revision}`] || {}
        const isBaseFiled = unitValue?.input?.unit_id === ssu?.unit?.parent_id
        const {
          ssu_unit_name,
          ssu_unit_parent_name,
          ssu_unit_rate = 1,
        } = parseSsu(ssu)

        const customer = relation.customers[o.receive_customer_id || '']
        return {
          商户名: customer?.name || '-',
          商户ID: customer?.customer_id || '-',
          采购数量_计量单位: toFixed(
            unitQuantityBig.times(isBaseFiled ? 1 : ssu_unit_rate),
          ),
          采购数量_包装单位:
            toFixed(unitQuantityBig.div(isBaseFiled ? ssu_unit_rate : 1)) ||
            '-',
          包装单位: ssu_unit_name,
          计量单位: ssu_unit_parent_name,
          商品备注: o.remark,
        }
      }),
      _origin: {
        category_name_1: category_name_1,
      },
    }
  })
}

function purchaseBill(data: PurchaseSheet, relation: Relation) {
  const groupUsersMap = relation.group_users || {}
  const suppliersMap = relation.suppliers || {}
  const purchaser = groupUsersMap[data.purchaser_id!]
  const creator = groupUsersMap[data.creator_id!]
  const supplier = suppliersMap[data.supplier_id!] || {}
  const station = relation.stations[data.station_id!] || {}
  // 是否已发货
  const isDelivery = data.status === PurchaseSheet_Status.COMMIT
  const common = {
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),

    采购员: purchaser?.name || '',
    采购单位: station.name || '',

    创建人: creator?.name || '',
    供应商: supplier?.name || '',
    供应商编号: supplier?.customized_code,

    采购金额: toFixed(Big(data?.tax_amount || 0)),
    不含税采购金额: toFixed(Big(data?.amount || 0)),
    税额: toFixed(Big(Math.abs(+data?.tax_amount! - +data?.amount!) || 0)),

    任务数: data?.details?.details?.length || '0',
    采购员电话: purchaser?.phone || '-',
    供应商电话: supplier?.phone || '-',
    采购单据号: data?.serial_no || '-',
    单据备注: data?.remark || '-',
    预计到货时间: Number(data.outstock_time)
      ? moment(+data.outstock_time!).format('YYYY-MM-DD HH:mm')
      : '',
    预计到货时间_日期: Number(data.outstock_time)
      ? moment(+data.outstock_time!).format('YYYY-MM-DD')
      : '',
    预计到货时间_时间: Number(data.outstock_time)
      ? moment(+data.outstock_time!).format('HH:mm')
      : '',
  }

  const printRawDetails = data?.raw_details?.details?.length
    ? data?.raw_details?.details
    : data?.details?.details || []
  const printDetails = data?.details?.details || []

  const normalTable = generateTable(
    printRawDetails,
    printDetails,
    relation,
    isDelivery,
  )
  /* ----------- 双栏 -------------- */
  const normalTableMulti = generateMultiData(normalTable)

  // 按一级分类分组
  const groupByCategory1 = _.groupBy(
    normalTable,
    (v) => v._origin.category_name_1,
  )
  const [kCategory, kCategoryMulti] = groupByCategory(groupByCategory1)

  return {
    common,
    _table: {
      purchase_no_detail: normalTable, // 无明细
      purchase_no_detail_multi: normalTableMulti, // 双栏

      purchase_no_detail_category: kCategory, // 分类
      purchase_no_detail_category_multi: kCategoryMulti, // 双栏

      purchase_last_col: normalTable, // 明细:单列-总表最后一列
      purchase_last_col_multi: normalTableMulti, // 双栏

      purchase_last_col_category: kCategory, // 明细:单列-总表最后一列
      purchase_last_col_category_multi: kCategoryMulti, // 双栏

      purchase_one_row: normalTable.reduce(
        (arr, task) => [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ],
        [] as any[],
      ), // 明细: 当行-总表下方一行
      purchase_one_row_multi: normalTableMulti.reduce(
        (arr, task) => [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ],
        [],
      ),

      purchase_one_row_category: kCategory.reduce(
        (arr, task) => [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ],
        [],
      ), // 明细: 当行-总表下方一行
      purchase_one_row_category_multi: kCategoryMulti.reduce(
        (arr, task) => [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ],
        [],
      ),

      purchase_flex_2: getSpecialTable(normalTable, 2, 'flex'), // 明细: 两栏-总表下方一行两栏
      purchase_flex_2_multi: getSpecialTable(normalTableMulti, 2, 'flex'), // 明细: 两栏-总表下方一行两栏

      purchase_flex_2_category: getSpecialTable(kCategory, 2, 'flex'), // 明细: 两栏-总表下方一行两栏
      purchase_flex_2_category_multi: getSpecialTable(
        kCategoryMulti,
        2,
        'flex',
      ), // 明细: 两栏-总表下方一行两栏

      purchase_flex_4: getSpecialTable(normalTable, 4, 'flex'), // 明细: 四栏-总表下方一行四栏
      purchase_flex_4_multi: getSpecialTable(normalTableMulti, 4, 'flex'), // 明细: 四栏-总表下方一行四栏

      purchase_flex_4_category: getSpecialTable(kCategory, 4, 'flex'), // 明细: 四栏-总表下方一行四栏
      purchase_flex_4_category_multi: getSpecialTable(
        kCategoryMulti,
        4,
        'flex',
      ), // 明细: 四栏-总表下方一行四栏
    },
  }
}

export default purchaseBill
