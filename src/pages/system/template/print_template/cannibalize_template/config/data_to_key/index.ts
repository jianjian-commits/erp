import _ from 'lodash'
import Big from 'big.js'
import { generateMultiData, generateVerticalMultiData } from './util'

import {
  isStringValid,
  getFormatTimeForTable,
  toFixedByType,
  toFixedSalesInvoicing,
  coverDigit2Uppercase,
} from '@/common/util'

import {
  RECEIPT_TYPE_NAME,
  CANNIBALIZE_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import {
  CostAllocation_MoneyType,
  GetStockSheetResponse,
  Shelf,
} from 'gm_api/src/inventory'
import { getCommonSheetData } from '@/pages/sales_invoicing/util'
import { commonProductDetail } from '@/pages/sales_invoicing/sales_invoicing_type'

import { t } from 'gm-i18n'
import { TABLE_TYPE_ENUM } from './enum'

type GenerateType =
  | 'normal'
  | 'quantity'
  | 'money'
  | 'quantity_money'
  | 'multi'
  | 'multi_vertical'
  | 'multi_quantity'
  | 'multi_money'
  | 'multi_quantity_money'
  | 'multi_vertical_quantity'
  | 'multi_vertical_money'
  | 'multi_vertical_quantity_money'

/**
 * 表格基础数据
 * @param productDetails
 */
function generateNormalTable(productDetails: commonProductDetail[]) {
  return productDetails.map((detail, index) => {
    return {
      // 基础
      序号: index + 1,
      批次号: detail.additional_batches_items?.batch_serial_no,
      商品自定义编码: detail.sku_customized_code,
      商品名称: detail.sku_name,
      规格自定义编码: detail.ssu_customized_code ?? '', // 没有的话就是空吧
      规格名称: detail.ssu_name ?? detail.ssu_display_name, // 没有的话就是自己构建的，展示基本单位就好
      包装规格: detail.ssu_display_name,
      商品分类:
        detail.category_name_1 +
        '/' +
        detail.category_name_2 +
        `${detail.spu_name ? '/' : ''}` +
        `${detail.spu_name || ''}`,
      生产日期: getFormatTimeForTable('YYYY-MM-DD', detail.production_time),
      入库日期: getFormatTimeForTable(
        'YYYY-MM-DD',
        detail?.additional_batches_items?.in_stock_time!,
      ),

      // 添加存放货位:
      自定义: '',
      // 数量
      // TODO: 调拨基本单位待修改
      账面库存_基本单位:
        toFixedSalesInvoicing(detail?.transfer_base_unit || 0) +
        detail.sku_base_unit_name,
      // 账面库存_包装单位: detail?.transfer_sku_unit + detail.ssu_unit_name,
      移库数_基本单位:
        toFixedSalesInvoicing(detail.input_stock.input?.quantity) +
        detail.sku_base_unit_name,
      // 移库数_包装单位:
      //   detail.input_stock.input2?.quantity + detail.ssu_unit_name,
      移入货位: detail.trans_in_shelf_name || '未分配',
      现存货位: detail.trans_out_shelf_name,
      保质期: detail.sku_expiry_date ? detail.sku_expiry_date + '天' : '-',
      _origin: detail,
      供应商: detail?.additional_supplier?.name ?? '-',
    }
  })
}

/**
 * 根据表格基础数据构建对应表格类型数据
 * @param productDetails
 * @param type
 */
function generateTable(
  productDetails: commonProductDetail[],
  type: GenerateType,
) {
  const ordinary: any = generateNormalTable(productDetails)
  const multiData = generateMultiData(ordinary)
  const verticalMultiData = generateVerticalMultiData(ordinary)

  const sumMoney = toFixedByType(
    _.reduce(productDetails, (a, b) => +Big(a).plus(b.amount_show!), 0),
    'dpInventoryAmount',
  )

  const sumQuantity = toFixedSalesInvoicing(
    _.reduce(productDetails, (a, b) => +Big(a).plus(0), 0),
  )

  const skuTotalObj = {
    _origin: {} as commonProductDetail,
    _special: {
      text: `${t('移库数小计')}：${sumQuantity}`,
    } as any,
  }
  const sumMoneyObj = {
    _origin: {} as commonProductDetail,
    _special: {
      text: `${t('移库成本小计')}：${sumMoney}`,
      upperCaseText: `${t('移库成本小计')}：${sumMoney}${t(
        '大写',
      )}:${coverDigit2Uppercase(parseFloat(sumMoney))}`,
    } as any,
  }

  switch (type) {
    case TABLE_TYPE_ENUM.normal:
      return ordinary
    case TABLE_TYPE_ENUM.multi:
      return multiData
    case TABLE_TYPE_ENUM.multi_quantity:
      multiData.push({
        ...sumMoneyObj,
      })
      return multiData
    case TABLE_TYPE_ENUM.multi_money:
      multiData.push({
        ...skuTotalObj,
      })
      return multiData
    case TABLE_TYPE_ENUM.multi_quantity_money:
      multiData.push(
        {
          ...skuTotalObj,
        },
        {
          ...sumMoneyObj,
        },
      )
      return multiData
    case TABLE_TYPE_ENUM.multi_vertical:
      return verticalMultiData
    case TABLE_TYPE_ENUM.multi_vertical_quantity:
      verticalMultiData.push({
        ...sumMoneyObj,
      })
      return verticalMultiData
    case TABLE_TYPE_ENUM.multi_vertical_money:
      verticalMultiData.push({
        ...skuTotalObj,
      })
      return verticalMultiData
    case TABLE_TYPE_ENUM.multi_vertical_quantity_money:
      verticalMultiData.push(
        {
          ...skuTotalObj,
        },
        {
          ...sumMoneyObj,
        },
      )
      return verticalMultiData
    case TABLE_TYPE_ENUM.quantity:
      ordinary.push({
        ...skuTotalObj,
      })
      return ordinary
    case TABLE_TYPE_ENUM.money:
      ordinary.push({
        ...sumMoneyObj,
      })
      return ordinary
    case TABLE_TYPE_ENUM.quantity_money:
      ordinary.push(
        {
          ...skuTotalObj,
        },
        {
          ...sumMoneyObj,
        },
      )
      return ordinary
    default:
      return ordinary
  }
}

function generatePrice(data: { total_price: string }) {
  const { total_price } = data
  return {
    出库成本_大写: coverDigit2Uppercase(parseFloat(total_price)),
  }
}

function cannibalizeDataKey(
  data: GetStockSheetResponse,
  relation?: { shelfList?: Shelf[] },
) {
  const receiptDetail = getCommonSheetData(data, {
    shelfList: relation?.shelfList,
  })
  const {
    sheet_type,
    stock_sheet_serial_no,
    target_id,
    remark,
    sheet_status,
    create_time,
    creator_name,
    details,
    total_price,
    target_name,
    discountList,
  } = receiptDetail
  const customer = data.additional.customers![target_id!] || {
    name: target_name,
  }
  const supplier = data.additional.suppliers![target_id!] || {
    name: target_name,
  } // target_id可能是供应商也可能是商户

  const totalPrice = toFixedByType(
    total_price ? +total_price : 0,
    'dpInventoryAmount',
  )
  let discountPrice: string | number = 0
  _.each(discountList, (item) => {
    if (+item.action === CostAllocation_MoneyType.MONEY_ADD) {
      discountPrice = +Big(discountPrice).plus(item.money || 0)
    } else if (+item.action === CostAllocation_MoneyType.MONEY_SUB) {
      discountPrice = +Big(discountPrice).minus(item.money || 0)
    }
  })
  discountPrice = toFixedByType(discountPrice, 'dpInventoryAmount')

  const common = {
    单据: RECEIPT_TYPE_NAME[sheet_type] ?? '_',
    移库单号: stock_sheet_serial_no ?? '',
    单据状态: CANNIBALIZE_STATUS_NAME[sheet_status],
    建单时间: isStringValid(create_time)
      ? getFormatTimeForTable('YYYY-MM-DD HH:mm:ss', create_time)
      : '',
    建单时间_日期: isStringValid(create_time)
      ? getFormatTimeForTable('YYYY-MM-DD', create_time)
      : '',
    ...generatePrice({ total_price: totalPrice }),
    建单时间_时间: isStringValid(create_time)
      ? getFormatTimeForTable('HH:mm:ss', create_time)
      : '',
    建单人: creator_name ?? '',
    备注: remark ?? '-',
  }

  return {
    common,
    _table: {
      orders: generateTable(details || [], 'normal'), // 普通
      orders_multi: generateTable(details || [], 'multi'), // 双栏
      orders_multi_quantity: generateTable(details, 'multi_quantity'), // 双栏 + 入库数
      orders_multi_money: generateTable(details, 'multi_money'), // 双栏 + 入库金额
      orders_multi_quantity_money: generateTable(
        details,
        'multi_quantity_money',
      ), // 双栏 + 入库金额 + 入库数
      orders_multi_vertical: generateTable(details, 'multi_vertical'), // 双栏（纵向）
      orders_multi_quantity_vertical: generateTable(
        details,
        'multi_vertical_quantity',
      ), // 双栏（纵向） + 入库数
      orders_multi_money_vertical: generateTable(
        details,
        'multi_vertical_money',
      ), // 双栏（纵向） + 入库金额
      orders_multi_quantity_money_vertical: generateTable(
        details,
        'multi_vertical_quantity_money',
      ), // 双栏（纵向） + 入库金额 + 入库数
      orders_quantity: generateTable(details, 'quantity'),
      orders_money: generateTable(details, 'money'),
      orders_quantity_money: generateTable(details, 'quantity_money'),
    },
    _origin: data,
  }
}

export default cannibalizeDataKey
