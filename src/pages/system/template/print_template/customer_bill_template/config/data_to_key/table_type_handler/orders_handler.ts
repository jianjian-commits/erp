import _ from 'lodash'
import moment from 'moment'
import { TableDataFetcherResult } from '../../../interface'
import {
  BillOrder_Type,
  map_BillOrder_PayAndAfterState,
  map_BillOrder_Type,
} from 'gm_api/src/finance'

type DataShape = NonNullable<TableDataFetcherResult['orders']>

/**
 * 展平嵌套数据
 *
 * 原数据中 relation_bill_orders 为销售订单的售后订单，将其展平后用于表格数据展示
 */
const flatList = (data?: DataShape) => {
  const result: DataShape = []
  if (Array.isArray(data)) {
    const stack: DataShape = _.slice(data)
    while (stack.length > 0) {
      const node = stack.shift()
      const children = node?.relation_bill_orders || []
      result.push(node!)
      if (!_.isEmpty(children)) {
        stack.unshift(...children)
      }
    }
  }
  return result
}

/**
 * 表格类型为“账单明细”数据处理
 */
function ordersHandler(data?: DataShape) {
  const flatData = flatList(data)
  return _.map(flatData, (item) => {
    const isAfterSaleOrder = item.type === BillOrder_Type.TYPE_AFTER_ORDER
    return {
      订单号: isAfterSaleOrder ? item.after_sale_no : item.order_no,
      下单时间: moment(Number(item.order_time)).format('YYYY-MM-DD HH:mm:ss'),
      收货时间: moment(Number(item.receive_time)).format('YYYY-MM-DD HH:mm:ss'),
      业务类型: _.get(map_BillOrder_Type, item.type || '', '-'),
      订单类型: item.customize_type_name,
      支付状态: _.get(
        map_BillOrder_PayAndAfterState,
        item.pay_after_state || '',
        '-',
      ),
      下单金额: item.order_price,
      出库金额: item.outstock_price,
      应付金额: isAfterSaleOrder ? '' : item.outstock_price,
      已付金额: isAfterSaleOrder ? '' : item.paid_amount,
      未付金额: isAfterSaleOrder ? '' : item.non_pay_amount,
      售后金额: isAfterSaleOrder ? item.order_after_sale_price : '',
      账单总加单金额: item.total_add_order_price,
      账单套账下单金额: item.fake_order_price,
      账单套账出库金额: item.fake_outstock_price,
      账单套账应付金额: item.fake_outstock_price,
      账单套账未付金额: item.fake_non_pay_price,
    }
  })
}

export default ordersHandler
