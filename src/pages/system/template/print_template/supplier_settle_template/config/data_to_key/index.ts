import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import {
  coverDigit2Uppercase,
  getEnumText,
  getFormatTimeForTable,
  toFixedByType,
} from '@/common/util'
import {
  DISCOUNT_ACTION_ENUM,
  DISCOUNT_REASON_ENUM,
  SUPPLIER_CREDIT_TYPE,
} from '@/pages/financial_manage/supplier_settlement/supplier_settlement/enum'

import { GetSettleSheetDetailResponse, SettleSheet } from 'gm_api/src/finance'

import { Price } from '@gm-pc/react'
import { RECEIPT_TYPE, RECEIPT_TYPE_NAME } from '@/pages/sales_invoicing/enum'

type GenerateType = 'ordinary' | 'delta'

const getTableData = (
  data: GetSettleSheetDetailResponse,
  type: GenerateType,
) => {
  let result = null
  if (type === 'ordinary') {
    // 按submit_time 排序
    const sheets = data.stock_sheets!.sort((a, b) => {
      return moment(a.submit_time).isAfter(moment(b.submit_time)) ? 1 : -1
    })

    result = _.map(sheets, (item, index) => {
      const isPurchaseIn = item.sheet_type === RECEIPT_TYPE.purchaseIn
      const total_money2 = isPurchaseIn
        ? item.total_price
        : +item.total_price! * -1
      const settle_money2 = isPurchaseIn
        ? item.total_price
        : +item.total_price! * -1
      return {
        序号: index + 1,
        单据类型: RECEIPT_TYPE_NAME[item.sheet_type],
        单据编号: item.stock_sheet_serial_no,
        入库_退货金额:
          toFixedByType(+(item.tax_total_price ?? 0), 'dpInventoryAmount') +
          Price.getUnit(),
        入库时间: getFormatTimeForTable('YYYY-MM-DD', item.submit_time),
        商品总金额:
          toFixedByType(+(item.product_total_price ?? 0), 'dpInventoryAmount') +
          Price.getUnit(),
        不含税商品总金额:
          toFixedByType(+(item.total_price ?? 0), 'dpInventoryAmount') +
          Price.getUnit(),
        税额:
          toFixedByType(
            +(
              Big(item.product_total_price || 0).minus(item.total_price || 0) ??
              0
            ),
            'dpInventoryAmount',
          ) + Price.getUnit(),
        自定义: '',
        _origin: {
          ...item,
          total_money2: total_money2,
          settle_money2: settle_money2,
        },
      }
    })
  } else if (type === 'delta') {
    result = _.map(
      data.settle_sheet?.amount_discounts?.amount_discounts,
      (item, index) => {
        return {
          序号: index + 1,
          折让原因: getEnumText(DISCOUNT_REASON_ENUM, item.discount_reason!),
          折让类型: getEnumText(DISCOUNT_ACTION_ENUM, item.discount_type),
          折让金额:
            toFixedByType(+(item.discount_amount ?? 0), 'dpSupplierSettle') +
            Price.getUnit(),
          备注: item.remark ?? '-',
          _origin: item,
        }
      },
    )
  }

  return result
}

const generateUpperPrice = (data: SettleSheet) => {
  return {
    单据总金额_大写: coverDigit2Uppercase(
      +toFixedByType(+(data.total_price ?? 0), 'dpSupplierSettle'),
    ),
    折让金额_大写: coverDigit2Uppercase(
      +toFixedByType(+(data.delta_amount ?? 0), 'dpSupplierSettle'),
    ),
    应付金额_大写: coverDigit2Uppercase(
      +toFixedByType(+(data.should_amount ?? 0), 'dpSupplierSettle'),
    ),
    已付金额_大写: coverDigit2Uppercase(
      +toFixedByType(+(data.actual_amount ?? 0), 'dpSupplierSettle'),
    ),
  }
}

const formatData = (data: GetSettleSheetDetailResponse) => {
  const { settle_sheet, supplier, relation_group_users } = data
  return {
    common: {
      单据日期: getFormatTimeForTable(
        'YYYY-MM-DD HH:mm:ss',
        settle_sheet?.create_time,
      ),
      单据日期_日期: getFormatTimeForTable(
        'YYYY-MM-DD',
        settle_sheet?.create_time,
      ),
      单据日期_时间: getFormatTimeForTable(
        'HH:mm:ss',
        settle_sheet?.create_time,
      ),

      结款日期: getFormatTimeForTable(
        'YYYY-MM-DD HH:mm:ss',
        settle_sheet?.settle_time,
      ),
      结款日期_日期: getFormatTimeForTable(
        'YYYY-MM-DD',
        settle_sheet?.settle_time,
      ),
      结款日期_时间: getFormatTimeForTable(
        'HH:mm:ss',
        settle_sheet?.settle_time,
      ),
      当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
      当前时间_日期: moment().format('YYYY-MM-DD'),
      当前时间_时间: moment().format('HH:mm:ss'),
      单据编号: settle_sheet?.settle_sheet_serial_no,
      付款单摘要: settle_sheet?.abstract,
      制单人: relation_group_users![settle_sheet?.creator_id!].username,
      往来单位: supplier?.name,
      供应商编号: supplier?.customized_code,
      供应商营业执照号:
        supplier?.attrs?.china_vat_invoice?.business_license_number ?? '-',
      联系电话: supplier?.phone ?? '-',
      开户银行: supplier?.attrs?.china_vat_invoice?.bank_name ?? '-',
      银行账号: supplier?.attrs?.china_vat_invoice?.bank_account ?? '-',
      结款方式: supplier?.credit_type
        ? getEnumText(SUPPLIER_CREDIT_TYPE, supplier?.credit_type!) ?? '-'
        : '-',
      开户名: supplier?.attrs?.china_vat_invoice?.bank_card_owner_name ?? '-',
      单据总金额: toFixedByType(
        +(settle_sheet!.total_price ?? 0),
        'dpSupplierSettle',
      ),
      折让金额: toFixedByType(
        +(settle_sheet!.delta_amount ?? 0),
        'dpSupplierSettle',
      ),
      已付金额: toFixedByType(
        +(settle_sheet!.actual_amount ?? 0),
        'dpSupplierSettle',
      ),
      应付金额: toFixedByType(
        +(settle_sheet?.should_amount ?? 0),
        'dpSupplierSettle',
      ),
      商品总金额: toFixedByType(
        +(settle_sheet?.product_total_price ?? 0),
        'dpSupplierSettle',
      ),
      不含税商品总金额: toFixedByType(
        +(settle_sheet?.no_tax_total_price ?? 0),
        'dpSupplierSettle',
      ),
      税额: toFixedByType(
        +(+settle_sheet?.tax_price! ?? 0),
        'dpSupplierSettle',
      ),
      ...generateUpperPrice(settle_sheet!),
    },
    _table: {
      ordinary: getTableData(data, 'ordinary'),
      delta: getTableData(data, 'delta'),
    },
    _origin: data,
  }
}

export default formatData
