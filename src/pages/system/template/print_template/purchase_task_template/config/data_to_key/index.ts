import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { getSpecialTable, generateMultiData, groupByCategory } from './util'
import { Sku, Category } from 'gm_api/src/merchandise'
import { SkuStock } from 'gm_api/src/inventory'
import { Supplier, GroupUser, Customer } from 'gm_api/src/enterprise'
import { toFixed } from '@/common/util'
import globalStore from '@/stores/global'
import {
  PurchaseTaskForPrint,
  PurchaseTaskForPrintDetail,
} from '../../interface'

import { getCategoryName } from '@/common/util/sku'

interface Relation {
  customers: { [key: string]: Customer }
  sku_map: { [key: string]: Sku }
  purchase_unit_rate_map: { [key: string]: string }
  sku_stocks: { [key: string]: SkuStock }
  suppliers: { [key: string]: Supplier }
  group_users: { [key: string]: GroupUser }
  categorys?: { [key: string]: Category }
}

function generateTable(
  tasks: PurchaseTaskForPrintDetail[],
  relation: Relation,
) {
  return tasks.map((task, index) => {
    const stockMap = relation.sku_stocks || {}
    const stock = stockMap[task.sku_id] || {}
    const baseUnit = stock.available_stock?.base_unit
    const stockAmount = baseUnit?.quantity || '0'
    const rate = relation.purchase_unit_rate_map?.[task?.sku_id] || '1'
    const skus = relation.sku_map || {}
    const sku = skus[task.sku_id]
    const categoryInfos =
      getCategoryName(relation?.categorys! || [], sku?.category_id || '1') ||
      '未知'
    const unit_name =
      globalStore.getUnitName(sku?.purchase_unit_id!) ||
      globalStore.getPurchaseUnitName(
        sku.units?.units,
        sku?.purchase_unit_id!,
      ) ||
      ''
    const category_name_1 = categoryInfos.split('/')[0]

    let suggestPurchase = ''
    const num = toFixed(
      Big(task?.request_value?.calculate?.quantity || 0)
        .div(+rate)
        .minus(Big(stockAmount)),
    )
    suggestPurchase = +num > 0 ? num + unit_name : '库存充足'

    // 商品等级
    // console.log(sku, 'sku')
    // console.log(task, '123')
    const levelName =
      _.find(
        sku?.sku_level?.sku_level!,
        (i) => i.level_id === task.sku_level_filed_id,
      )?.name || '-'
    return {
      序号: ++index,

      商品名称: sku?.name || '',

      分类: categoryInfos,
      商品编码: sku?.customize_code,
      计划波次: task?.batch_name || '-',
      商品等级: levelName || '-',
      备注: task?.remark || '-',
      参考成本: '',
      商品备注: '',
      库存: toFixed(Big(stockAmount)),
      建议采购: suggestPurchase,

      基本单位: globalStore.getUnitName(sku?.base_unit_id!),
      采购单位: unit_name,

      计划采购_采购单位: task?.plan_value?.calculate?.quantity
        ? toFixed(Big(task?.plan_value?.calculate?.quantity).div(+rate))
        : '-',

      需求数_采购单位: task?.request_value?.calculate?.quantity
        ? toFixed(Big(task?.request_value?.calculate?.quantity).div(+rate))
        : '-',

      已采购_采购单位: task?.purchase_value?.calculate?.quantity
        ? toFixed(Big(task?.purchase_value?.calculate?.quantity).div(+rate))
        : '-',

      实采: '',
      __details:
        task.request_details.length > 0 &&
        _.map(task.request_details, (item) => {
          // const unit_name =
          // globalStore.getUnitName(item.sku?.purchase_unit_id!) ||
          // globalStore.getPurchaseUnitName(
          //   sku.units?.units,
          //   sku?.purchase_unit_id!,
          // ) ||
          // ''

          return {
            商户名:
              relation?.customers?.[item?.customer_id as string]?.name || '',
            商户编码:
              relation?.customers?.[item?.customer_id as string]
                ?.customized_code || '',
            采购数量_采购单位: item.val?.calculate?.quantity
              ? toFixed(Big(item?.val?.calculate?.quantity).div(+rate))
              : '-',
            采购单位: unit_name,
            商品备注: item?.remark || '-',
          }
        }),
      _origin: {
        category_name_1,
      },
    }
  })
}

function purchaseTask(data: PurchaseTaskForPrint, relation: Relation) {
  const groupUsersMap = relation.group_users || {}
  const suppliersMap = relation.suppliers || {}
  const purchaser = groupUsersMap[data.purchaser_id!]
  const supplier = suppliersMap[data.supplier_id!] || {}
  const common = {
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),

    采购员: purchaser?.name || '-',
    采购单位: globalStore.stationInfo.name || '-',

    供应商: supplier?.name || '-',
    供应商编号: supplier?.customized_code || '-',
    // 采购金额: '',

    任务数: data?._detailsForPrint?.length || '0',
    采购员电话: purchaser?.phone || '-',
    供应商电话: supplier?.phone || '-',
    采购单据号: '',
    单据备注: purchaser?.remark || '-',
  }

  const normalTable = generateTable(data?._detailsForPrint || [], relation)
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
      purchase_no_detail_category: kCategory, // 分类
      purchase_no_detail_category_multi: kCategoryMulti, // 双栏

      purchase_no_detail: normalTable, // 无明细
      purchase_no_detail_multi: normalTableMulti, // 双栏

      purchase_last_col: normalTable, // 明细:单列-总表最后一列
      purchase_last_col_multi: normalTableMulti, // 双栏

      purchase_last_col_category: kCategory, // 明细:单列-总表最后一列  分类
      purchase_last_col_category_multi: kCategoryMulti, // 双栏

      purchase_one_row: normalTable.reduce(
        (arr: any[], task: any) => [
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
        [] as any[],
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

export default purchaseTask
