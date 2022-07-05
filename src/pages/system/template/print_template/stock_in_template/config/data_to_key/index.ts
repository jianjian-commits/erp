import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { generateMultiData, generateVerticalMultiData } from './util'

import {
  isStringValid,
  getEndlessPrice,
  getFormatTimeForTable,
  toFixedByType,
  toFixedSalesInvoicing,
  coverDigit2Uppercase,
} from '@/common/util'

import {
  RECEIPT_TYPE_NAME,
  STOCK_IN_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import {
  CostAllocation_MoneyType,
  GetStockSheetResponse,
  Shelf,
} from 'gm_api/src/inventory'
import {
  getCommonSheetData as UN_SAFE_getCommonSheetData,
  handlePayStatus,
} from '@/pages/sales_invoicing/util'
import { getCommonSheetData } from '../../util'
import { commonProductDetail } from '@/pages/sales_invoicing/sales_invoicing_type'

import { t } from 'gm-i18n'
import { TABLE_TYPE_ENUM } from './enum'
import { Price } from '@gm-pc/react'
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
      input_stock: { input },
      category_name_1,
      category_name_2,
      spu_name,
    } = detail
    return {
      // 基础
      序号: index + 1,
      批次号: detail.batch_serial_no,
      商品自定义编码: detail.sku_customized_code,
      商品名称: detail.sku_name,
      // 规格自定义编码: detail.ssu_customized_code ?? '', // 没有的话就是空吧
      // 规格名称: detail.ssu_name ?? detail.ssu_display_name, // 没有的话就是自己构建的，展示基本单位就好
      // 包装规格: detail.ssu_display_name,
      商品分类:
        category_name_1 +
        '/' +
        category_name_2 +
        `${spu_name ? '/' : ''}` +
        `${spu_name || ''}`,
      生产日期: getFormatTimeForTable('YYYY-MM-DD', detail.production_time),
      存放货位: detail.shelf_name || '未分配',
      生产计划: detail.production_task_serial_no ?? '',
      生产对象: detail.target_customer_name ?? '',
      操作人: detail.operator_name,
      自定义: '',

      // 单位
      基本单位: detail.sku_base_unit_name,
      // 包装单位: detail.ssu_unit_name,

      // 数量
      入库数_基本单位:
        toFixedSalesInvoicing(_.toNumber(input?.quantity)) +
        detail.sku_base_unit_name,
      // 入库数_包装单位: detail.ssu_quantity_show + detail.ssu_unit_name,

      // 金额
      入库单价_基本单位:
        getEndlessPrice(Big(+detail?.tax_input_price!)) +
        Price.getUnit() +
        '/' +
        detail.sku_base_unit_name,
      // 补差: detail.different_price_show + Price.getUnit(),
      入库金额: Big(+detail.tax_amount!).toFixed(2) + Price.getUnit(),
      不含税单价:
        getEndlessPrice(Big(+detail?.input_stock?.input?.price!)) +
        Price.getUnit() +
        '/' +
        detail.sku_base_unit_name,
      不含税金额: detail.amount_show + Price.getUnit(),
      税额:
        Big(+detail?.tax_amount!)
          .minus(+detail?.amount!)
          .toFixed(2) + Price.getUnit(),
      税率: detail.input_tax + '%',

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
    _.reduce(productDetails, (a, b) => +Big(a).plus(b.tax_amount!), 0),
    'dpInventoryAmount',
  )

  const sumQuantity = toFixedSalesInvoicing(
    _.reduce(productDetails, (a, b) => +Big(a).plus(0), 0),
  )

  const skuTotalObj = {
    _origin: {} as commonProductDetail,
    _special: {
      text: `${t('入库数小计')}：${sumQuantity}`,
    } as any,
  }
  const sumMoneyObj = {
    _origin: {} as commonProductDetail,
    _special: {
      text: `${t('入库金额小计')}：${sumMoney}`,
      upperCaseText: `${t('入库金额小计')}：${sumMoney}${t(
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

function generatePrice(data: {
  total_price: string
  discountPrice: string
  productMoney: string
}) {
  const { total_price, discountPrice, productMoney } = data
  return {
    折让金额_大写: coverDigit2Uppercase(parseFloat(discountPrice)),
    商品金额_大写: coverDigit2Uppercase(parseFloat(productMoney)),
    入库金额_大写: coverDigit2Uppercase(parseFloat(total_price)),
  }
}

function stockInDataKey(
  data: GetStockSheetResponse,
  relation: { shelfList: Shelf[] },
  type?: string,
) {
  // 拆分后的新结构兼容老的入库的旧结构
  const receiptDetail = type
    ? getCommonSheetData(data, type, {
        shelfList: relation.shelfList,
      })
    : UN_SAFE_getCommonSheetData(data, {
        shelfList: relation.shelfList,
      })

  const {
    sheet_type,
    submit_time,
    stock_sheet_serial_no,
    target_id,
    remark,
    sheet_status,
    create_time,
    creator_name,
    estimated_time,
    total_price,
    pay_status,
    tax_total_price,
    product_total_price,
    supplier_id,

    details,
    discountList,
  } = receiptDetail
  const supplier = data.additional.suppliers?.[supplier_id!] || {}

  let discountPrice: string | number = 0

  _.each(discountList, (item) => {
    if (+item.action === CostAllocation_MoneyType.MONEY_ADD) {
      discountPrice = +Big(discountPrice).plus(item.money || 0)
    } else if (+item.action === CostAllocation_MoneyType.MONEY_SUB) {
      discountPrice = +Big(discountPrice).minus(item.money || 0)
    }
  })
  discountPrice = toFixedByType(discountPrice, 'dpInventoryAmount')

  const productMoney = toFixedByType(
    Big(tax_total_price || 0).minus(discountPrice),
    'dpInventoryAmount',
  )
  const totalPrice = toFixedByType(
    tax_total_price ? +tax_total_price : 0,
    'dpInventoryAmount',
  )

  const common = {
    单据: RECEIPT_TYPE_NAME[sheet_type] ?? '_',
    入库时间: isStringValid(submit_time)
      ? getFormatTimeForTable(
          'YYYY-MM-DD HH:mm:ss',
          submit_time || in_stock_time,
        )
      : '',
    入库时间_日期: isStringValid(submit_time)
      ? getFormatTimeForTable('YYYY-MM-DD', submit_time)
      : '',
    入库时间_时间: isStringValid(submit_time)
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
    供应商名称: supplier.name
      ? supplier.name + '(' + supplier.customized_code + ')'
      : '',
    供应商编号: supplier.customized_code ?? '',
    单据备注: remark,
    单据状态: STOCK_IN_RECEIPT_STATUS_NAME[sheet_status],
    支付状态: handlePayStatus(pay_status!).name,

    当前时间: moment().format('YYYY-MM-DD HH:mm'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm'),
    打单人:
      globalStore.userInfo.group_user?.username ||
      globalStore.userInfo.group_user?.name ||
      '',
    建单人: creator_name ?? '',
    预计到货时间: isStringValid(estimated_time)
      ? getFormatTimeForTable('YYYY-MM-DD HH:mm', estimated_time)
      : '',
    预计到货时间_日期: isStringValid(estimated_time)
      ? getFormatTimeForTable('YYYY-MM-DD', estimated_time)
      : '',
    预计到货时间_时间: isStringValid(estimated_time)
      ? getFormatTimeForTable('HH:mm:ss', estimated_time)
      : '',
    折让金额: discountPrice,
    商品金额: productMoney,
    入库金额: totalPrice,
    不含税金额: Big(+total_price!).toFixed(2),
    税额: Big(+product_total_price!)
      .minus(+total_price!)
      .toFixed(2),

    ...generatePrice({ total_price: totalPrice, discountPrice, productMoney }),
  }

  // const normalTable = generateTable(details || [])
  /* ----------- 双栏 -------------- */
  // const normalTableMulti = generateMultiData(normalTable)

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

export default stockInDataKey
