import _ from 'lodash'
import moment from 'moment'
import { TableDataFetcherResult } from '../../../interface'

/**
 * 表格类型为“订单类型”数据处理
 */
function orderTypeHandler(data: TableDataFetcherResult['orderType']) {
  const result = _.map(data, (item) => {
    const orderType: Record<string, string> = {}

    _.forOwn(item.relation_customize_type || {}, (billOrder, id) => {
      orderType[`订单类型_${id}_下单金额`] = billOrder.order_price || ''
      orderType[`订单类型_${id}_出库金额`] = billOrder.outstock_price || ''
      orderType[`订单类型_${id}_总加单金额`] =
        billOrder.total_add_order_price || ''
    })

    return {
      下单日期_按天: moment.unix(Number(item.order_time)).format('YYYY-MM-DD'),
      ...orderType,
      下单金额: item.order_price,
      出库金额: item.outstock_price,
      套账下单金额: item.fake_order_price,
      套账出库金额: item.fake_outstock_price,
    }
  })
  return result
}

export default orderTypeHandler
