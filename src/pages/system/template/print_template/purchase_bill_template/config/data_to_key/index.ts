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
  PurchaseSheet,
  PurchaseSheet_SheetDetails_SheetDetail,
  PurchaseSheet_Status,
} from 'gm_api/src/purchase'
import {
  GroupUser,
  Supplier,
  CustomerUser,
  Customer,
} from 'gm_api/src/enterprise'
import {
  GetManySkuResponse_SkuInfo,
  Sku,
  Category,
  // Ssu,
  Sku_SupplierCooperateModelType,
} from 'gm_api/src/merchandise'
import { t } from 'gm-i18n'
// parseSsu,
import { toFixed, mapDetailsFromRawDetailId } from '@/common/util'
import globalStore from '@/stores/global'
import { getCategoryName } from '@/common/util/sku'

interface Relation {
  customers: { [key: string]: Customer }
  skus: { [key: string]: GetManySkuResponse_SkuInfo }
  customer_users: { [key: string]: CustomerUser }
  suppliers: { [key: string]: Supplier }
  group_users: { [key: string]: GroupUser }
  // ssu_snaps: { [key: string]: Ssu }
  sku_snap_map?: { [key: string]: Sku }
  category_map?: { [key: string]: Category }
}

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
  status: PurchaseSheet_Status,
) {
  return tasks.map((task, index) => {
    const skus = relation?.sku_snap_map || {}
    const sku = skus[`${task.sku_id}_${task.sku_revision}`]
    // 分类
    const categoryInfos =
      getCategoryName(relation?.category_map! || [], sku?.category_id || '1') ||
      '未知'
    // 分类第一个
    const category_name_1 = categoryInfos.split('/')[0]
    // 采购单价,数量
    const unitValue = task?.purchase_value
    // 出库数，单价
    const outStockUnitValue = task?.out_stock_unit_value
    // details的明细
    const taskPrintDetail = mapDetailsFromRawDetailId(task, printDetails)
    // 状态
    const isCommitted = status === (PurchaseSheet_Status.COMMIT as number)
    // 计划数
    // const planUnitValue = task?.plan_value

    // 采购单价单价
    const price = toFixed(Big(+task?.tax_price! ?? 0))
    // 不含税采购单价
    const no_tax_price = unitValue?.input?.price
    // details 明细

    // 已提交时 采购金额 = 预计到货数 * 采购单价
    // 未提交时 采购金额 = 采购数量 * 采购单价
    // 采购金额
    const purchase_money = isCommitted
      ? money(
          Big(outStockUnitValue?.calculate?.quantity || 0).times(
            Big(+task?.tax_price! || 0),
          ),
        )
      : money(
          Big(unitValue?.input?.quantity || 0).times(
            Big(+task?.tax_price! || 0),
          ),
        )
    // 不含税采购金额
    const no_tax_purchase_money = isCommitted
      ? money(
          Big(outStockUnitValue?.calculate?.quantity || 0).times(
            Big(+unitValue?.input?.price! || 0),
          ),
        )
      : money(
          Big(unitValue?.input?.quantity || 0).times(
            Big(+unitValue?.input?.price! || 0),
          ),
        )

    const levelName =
      _.find(
        sku?.sku_level?.sku_level!,
        (i) => i.level_id === task.sku_level_filed_id,
      )?.name || '-'

    return {
      序号: ++index,
      商品名称: sku?.name,
      分类: categoryInfos,
      采购备注: task.remark,
      商品编码: sku?.customize_code,
      商品等级: levelName,

      供应商协作模式:
        CooperateModelMap[
          task?.supplier_cooperate_model_type ||
            Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED
        ],

      采购数量_采购单位: toFixed(Big(+unitValue?.input?.quantity! || 0)),
      预计到货数_采购单位: toFixed(
        Big(outStockUnitValue?.calculate?.quantity || 0),
      ),
      单价_采购单位: `${money(price || 0)}${Price.getUnit()}`,
      不含税单价_采购单位: `${money(no_tax_price || 0)}${Price.getUnit()}`,
      采购单位:
        '/' +
          (globalStore.getUnitName(sku?.purchase_unit_id!) ||
            globalStore.getPurchaseUnitName(
              sku?.units?.units,
              sku?.purchase_unit_id!,
            )) || '-',

      采购金额: toFixed(+purchase_money, 2) + Price.getUnit(),
      不含税采购金额: no_tax_purchase_money + Price.getUnit(),
      税额:
        Big(purchase_money).minus(no_tax_purchase_money).toFixed(4) +
        Price.getUnit(),
      税率: task.input_tax + '%',
      __details: taskPrintDetail?.map((o) => {
        const customers = relation.customers[o.receive_customer_id || '']
        return {
          商户名: customers?.name || '-',
          商户编码: customers?.customized_code || '-',

          采购数量_采购单位:
            toFixed(Big(+o?.purchase_value?.input?.quantity! || 0)) || '-',
          采购单位:
            globalStore.getUnitName(o?.purchase_value?.input?.unit_id!) ||
            globalStore.getPurchaseUnitName(
              sku.units?.units,
              o?.purchase_value?.input?.unit_id!,
            ) ||
            '',
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
  const common = {
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),

    采购员: purchaser?.name || '',
    采购单位: globalStore.stationInfo.name || '',

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
    预计到货时间: Number(data.receive_time)
      ? moment(+data.receive_time!).format('YYYY-MM-DD HH:mm')
      : '',
    预计到货时间_日期: Number(data.receive_time)
      ? moment(+data.receive_time!).format('YYYY-MM-DD')
      : '',
    预计到货时间_时间: Number(data.receive_time)
      ? moment(+data.receive_time!).format('HH:mm')
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
    data.status,
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
