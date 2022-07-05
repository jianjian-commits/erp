import moment from 'moment'
import { TABLE_TYPE } from './table_type'
import tableTypeHandler from './table_type_handler'
import { RawData } from '../../interface'

/**
 * @param billingDate 账单周期
 */
const formatData = (data: RawData, billingDate?: string) => {
  const { common, tableData } = data
  return {
    common: {
      打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),
      账单周期: billingDate,
      公司名: common.company_name,
      公司地址: common.company_addr,
      客户名: common.customer_name,
      客户地址: common.customer_addr,
      下单金额: common.order_price,
      出库金额: common.outstock_price,
      应付金额: common.outstock_price,
      已付金额: common.paid_amount,
      未付金额: common.non_pay_amount,
      售后金额: common.order_after_sale_price,
      未结金额: common.non_settlement_amount,
      总加单金额: common.total_add_order_price,
      套账下单金额: common.fake_order_price,
      套账出库金额: common.fake_outstock_price,
      套账应付金额: common.fake_outstock_price,
      套账未付金额: common.fake_non_pay_price,
      套账未结金额: common.fake_non_settlement_price,
    },
    _table: {
      [TABLE_TYPE.ORDERS]: tableTypeHandler[TABLE_TYPE.ORDERS](
        tableData.orders,
      ),
      [TABLE_TYPE.SKUS]: tableTypeHandler[TABLE_TYPE.SKUS](tableData.skus),
      [TABLE_TYPE.PRODUCT]: tableTypeHandler[TABLE_TYPE.PRODUCT](
        tableData.product,
      ),
      [TABLE_TYPE.ORDER_TYPE]: tableTypeHandler[TABLE_TYPE.ORDER_TYPE](
        tableData.orderType,
      ),
    },
    _origin: data,
  }
}

export default formatData
