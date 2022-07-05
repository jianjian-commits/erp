import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Price } from '@gm-pc/react'
import {
  CostAllocation_MoneyType,
  GetStockSheetResponse,
  Shelf,
} from 'gm_api/src/inventory'

import {
  isStringValid,
  getEndlessPrice,
  getFormatTimeForTable,
  toFixedByType,
  toFixedSalesInvoicing,
  coverDigit2Uppercase,
} from '@/common/util'
import {
  getCommonSheetData as UN_SAFE_getCommonSheetData,
  handlePayStatus,
} from '@/pages/sales_invoicing/util'
import { getCommonSheetData } from '../../util'
import { generateMultiData, generateVerticalMultiData } from './util'

import {
  RECEIPT_TYPE_NAME,
  STOCK_OUT_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import { commonProductDetail } from '@/pages/sales_invoicing/sales_invoicing_type'
import { TABLE_TYPE_ENUM } from './enum'

import globalStore from '@/stores/global'

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
    const {
      sku_customized_code,
      sku_name,
      ssu_customized_code,
      ssu_name,
      ssu_display_name,
      category_name_1,
      category_name_2,
      category_name_3,
      production_task_serial_no,
      operator_name,
      sku_base_unit_name,
      ssu_unit_name,
      base_quantity_show,
      ssu_quantity_show,
      amount,
      related_order_price,
      input_stock: { input },
    } = detail

    const combine_category_name = [
      category_name_1,
      category_name_2,
      category_name_3,
    ]
      .filter(Boolean)
      .join('/')

    return {
      // 基础
      序号: index + 1,
      商品自定义编码: sku_customized_code,
      商品名称: sku_name,
      规格自定义编码: ssu_customized_code ?? '', // 没有的话就是空吧
      规格名称: ssu_name ?? ssu_display_name, // 没有的话就是自己构建的，展示基本单位就好
      包装规格: ssu_display_name,
      商品分类: combine_category_name,

      生产计划: production_task_serial_no ?? '',
      操作人: operator_name,
      自定义: '',

      // 单位
      基本单位: sku_base_unit_name,
      包装单位: ssu_unit_name,

      // 数量
      出库数_基本单位:
        toFixedSalesInvoicing(_.toNumber(input?.quantity)) + sku_base_unit_name,
      // 出库数_包装单位: ssu_quantity_show + ssu_unit_name,

      // 金额
      出库单价_基本单位:
        getEndlessPrice(Big(+detail?.input_stock.input?.price!)) +
        Price.getUnit() +
        '/' +
        sku_base_unit_name,
      出库成本: toFixedByType(amount, 'dpInventoryAmount') + Price.getUnit(),
      配送单价: related_order_price
        ? `${toFixedByType(
            Number(related_order_price),
            'dpInventoryAmount',
          )}${Price.getUnit()}/${sku_base_unit_name}`
        : '-',
      _origin: detail,
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
    _.reduce(productDetails, (a, b) => +Big(a).plus(b.amount!), 0),
    'dpInventoryAmount',
  )

  const sumQuantity = toFixedSalesInvoicing(
    _.reduce(productDetails, (a, b) => +Big(a).plus(0), 0),
  )

  const skuTotalObj = {
    _origin: {} as commonProductDetail,
    _special: {
      text: `${t('出库数小计')}：${sumQuantity}`,
    } as any,
  }
  const sumMoneyObj = {
    _origin: {} as commonProductDetail,
    _special: {
      text: `${t('出库成本小计')}：${sumMoney}`,
      upperCaseText: `${t('出库成本小计')}：${sumMoney}${t(
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

function stockOutDataKey(
  data: GetStockSheetResponse,
  relation?: { shelfList?: Shelf[] },
  type?: string,
) {
  // 拆分后的新结构兼容老的入库的旧结构
  const receiptDetail = type
    ? getCommonSheetData(data, type, {
        shelfList: relation!.shelfList,
      })
    : UN_SAFE_getCommonSheetData(data, {
        shelfList: relation!.shelfList,
      })

  const {
    sheet_type,
    submit_time,
    stock_sheet_serial_no,
    remark,
    sheet_status,
    create_time,
    creator_name,
    estimated_time,
    details,
    total_price,
    tax_total_price,
    discountList,
    pay_status,
    customer_id,
    customer_name,
  } = receiptDetail

  const customer = data.additional.customers![customer_id!] || {
    name: customer_name,
  }

  const supplier = data.additional?.suppliers?.customer_id

  const totalPrice = toFixedByType(
    total_price ? +total_price : 0,
    'dpInventoryAmount',
  )

  const taxTotalPrice = toFixedByType(
    tax_total_price ? +tax_total_price : 0,
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
    出库时间: isStringValid(submit_time)
      ? getFormatTimeForTable('YYYY-MM-DD HH:mm:ss', submit_time)
      : '',
    出库时间_日期: isStringValid(submit_time)
      ? getFormatTimeForTable('YYYY-MM-DD', submit_time)
      : '',
    出库时间_时间: isStringValid(submit_time)
      ? getFormatTimeForTable('HH:mm:ss', submit_time)
      : '',
    单据编号: stock_sheet_serial_no ?? '',
    建单时间: isStringValid(create_time)
      ? getFormatTimeForTable('YYYY-MM-DD HH:mm:ss', create_time)
      : '',
    建单时间_日期: isStringValid(create_time)
      ? getFormatTimeForTable('YYYY-MM-DD', create_time)
      : '',
    建单时间_时间: isStringValid(create_time)
      ? getFormatTimeForTable('HH:mm:ss', create_time)
      : '',
    商户名称: customer.name
      ? customer.name + '(' + customer.customized_code + ')'
      : '',
    供应商名称: !_.isEmpty(supplier)
      ? supplier?.name + '(' + supplier?.customized_code + ')'
      : '-',
    供应商编号: supplier?.customized_code ?? '-',
    单据备注: remark,
    出库单状态: STOCK_OUT_RECEIPT_STATUS_NAME[sheet_status],
    支付状态: handlePayStatus(pay_status!).name,

    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),
    打单人:
      globalStore.userInfo.group_user?.username ||
      globalStore.userInfo.group_user?.name ||
      '',
    建单人: creator_name ?? '',

    收货时间: isStringValid(estimated_time)
      ? getFormatTimeForTable('YYYY-MM-DD HH:mm', estimated_time)
      : '',
    收货时间_日期: isStringValid(estimated_time)
      ? getFormatTimeForTable('YYYY-MM-DD', estimated_time)
      : '',
    收货时间_时间: isStringValid(estimated_time)
      ? getFormatTimeForTable('HH:mm', estimated_time)
      : '',
    成本金额: totalPrice,
    折让金额: discountPrice,
    单据金额: taxTotalPrice,

    ...generatePrice({ total_price: totalPrice }),
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

export default stockOutDataKey
