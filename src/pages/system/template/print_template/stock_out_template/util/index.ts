import _ from 'lodash'
import globalStore from '@/stores/global'
import { RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'

import {
  SalesInvoicingSheet,
  ObjectOfKey,
} from '@/pages/sales_invoicing/interface'
import { Shelf } from 'gm_api/src/inventory'
import { getUnNillText, toFixedSalesInvoicing } from '@/common/util'

/**
 * 根据货位id获取货位选择数组
 * @param {Shelf[]} data 平铺的object，内自带parent_id
 * @param {string} shelfId 货位id
 */
export const getShelfSelected = (data: Shelf[], shelfId?: string) => {
  const result: string[] = []
  let levelShelfId = shelfId
  const idMap: ObjectOfKey<any> = {}

  _.each(data, (item) => {
    idMap[item.shelf_id] = {
      ...item,
      value: item.shelf_id,
      text: item.name,
      parent_id: item.parent_id,
    }
  })

  // 存在货位不填的情况，因此需要对货位未选择做校验
  if (levelShelfId && idMap[levelShelfId]) {
    result.unshift(levelShelfId)
    while (
      idMap[levelShelfId!]?.parent_id &&
      idMap[levelShelfId!]?.parent_id !== '0'
    ) {
      result.unshift(idMap[levelShelfId!].parent_id!)
      levelShelfId = idMap[levelShelfId!].parent_id
    }
  }
  return result
}

/** 获取单据类型 */
export const getOrderType = (type: string) => {
  let sheet_type = 0
  switch (type) {
    case 'sale_out':
      sheet_type = RECEIPT_TYPE.saleOut
      break
    default:
      sheet_type = RECEIPT_TYPE.purchaseIn
  }

  return sheet_type
}

// 根据id获取货位名
export const getSelectedShelfName = (data: Shelf[], selected?: string[]) => {
  let resultName = ''

  _.each(selected, (selectedValue) => {
    const target = _.find(data, (item) => selectedValue === item.shelf_id)
    resultName += '/' + target?.name
  })
  return resultName.replace('/', '')
}

/**
 * @param data
 * @param additional
 * @todo 后续有需要的字段再单独加，目前只处理要用的字段
 */
export function getCommonSheetData(
  data: any,
  type: string,
  extraAdditional?: { shelfList?: Shelf[] },
): SalesInvoicingSheet.CommonReceiptDetail {
  const { stock_sheet, additional } = data
  const shelfList = extraAdditional?.shelfList
  const { category_map, sku_map, group_users, customers } = additional
  const { creator_id } = stock_sheet
  const orderTypeStr = `${type}_stock_sheet_serial_no`
  let tmpRes = {}

  if (type === 'sale_out') {
    tmpRes = {
      tax_total_price: stock_sheet?.amount,
    }
  }

  const result = {
    ...stock_sheet,

    sheet_type: getOrderType(type),
    submit_time: stock_sheet?.out_stock_time,
    stock_sheet_serial_no: stock_sheet?.[orderTypeStr],
    creator_name: getUnNillText(group_users?.[creator_id]?.name),
    total_price: stock_sheet?.amount,
    tax_total_price: stock_sheet?.amount_tax_discount,
    product_total_price: stock_sheet?.amount_tax,

    // 一些单据的独有值
    ...tmpRes,

    originalStockSheet: _.cloneDeep(stock_sheet),
  }

  const details: SalesInvoicingSheet.commonProductDetail[] = []
  const isNeedShelf = _.isArray(shelfList) // 传了shelfList就是需要货位

  _.each(stock_sheet?.details, (detail) => {
    const {
      sku_id,
      input_stock: { input },
    } = detail
    const sku = sku_map?.[sku_id]
    const shelfSelected = isNeedShelf
      ? getShelfSelected(shelfList!, detail.shelf_id)
      : undefined
    const targetShelf = isNeedShelf
      ? _.find(shelfList, (item) => item.shelf_id === detail.shelf_id)
      : undefined

    const detailItem = {
      ..._.omit(detail, ['create_batches', 'update_batches']),

      amount: +detail.amount,
      // amount_show: +detail.amount, // 销售出库用到
      batch_serial_no: detail?.batch_serial_no,
      // sku
      sku_id: sku!.sku_id,
      sku_customized_code: sku?.customize_code,
      sku_name: sku!.name,
      sku_base_unit_id: sku?.base_unit_id!,
      sku_base_unit_name: globalStore.getUnitName(sku?.base_unit_id!),
      sku_type: sku?.sku_type!,
      // 分类
      category_id_1: sku?.category1_id || '',
      category_id_2: sku?.category2_id || '',
      category_id_3: sku?.category3_id || '',
      category_name_1: category_map?.[sku?.category1_id]?.category_name || '',
      category_name_2: category_map?.[sku?.category2_id]?.category_name || '',
      category_name_3: category_map?.[sku?.category3_id]?.category_name || '',
      spu_name: category_map![sku?.category_id]?.category_name!,

      // 货位相关
      shelf_name: isNeedShelf
        ? getSelectedShelfName(shelfList, shelfSelected)
        : '',
      shelf_selected: targetShelf?.delete_time !== '0' ? [] : shelfSelected,
      shelf: targetShelf,

      // 生产对象
      target_customer_id: detail.target_customer_id,
      target_customer_name:
        detail.target_customer_id && detail.target_customer_id !== '0'
          ? customers![detail.target_customer_id].name
          : '',

      // 操作人
      operator_name:
        detail.creator_id && detail.creator_id !== '0'
          ? group_users![detail.creator_id!].username!
          : '-',
      // 入库数-基本单位
      ssu_base_quantity_show: toFixedSalesInvoicing(input?.quantity),
      amount_show: toFixedSalesInvoicing(detail?.tax_amount || 0),
      // 保质期
      sku_expiry_date: sku?.expiry_date,
    }
    details.push(detailItem)
  })

  result.details = details
  result.discountList = _.map(data.stock_sheet?.discounts?.details, (item) => {
    return {
      ...item,
      money: +item.money,
      action: '' + item.money_type,
      reason: '' + item.reason,
      remark: _.isNil(item.remark) ? '' : item.remark.toString(),
      operator_name:
        item.creator_id && item.creator_id !== '0'
          ? group_users![item.creator_id!].username
          : '-',
    }
  })

  return result
}
