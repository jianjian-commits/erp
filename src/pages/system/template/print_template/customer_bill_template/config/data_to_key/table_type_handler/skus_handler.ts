import { map_BillOrder_Type } from 'gm_api/src/finance'
import _ from 'lodash'
import moment from 'moment'
import { TableDataFetcherResult } from '../../../interface'

/**
 * 表格类型为“订单明细”数据处理
 */
function skusTypeHandler(data: TableDataFetcherResult['skus']) {
  const result = _.map(data, (item) => {
    return {
      订单号: item.order_no,
      下单时间: moment(Number(item.order_time)).format('YYYY-MM-DD HH:mm:ss'),
      收货时间: moment(Number(item.receive_time)).format('YYYY-MM-DD HH:mm:ss'),
      业务类型: _.get(map_BillOrder_Type, item.type || '', '-'),
      订单类型: item.customize_type_name,
      商品名: item.sku_name,
      商品分类: item.category_name,
      下单单位: item.unit_name,
      下单数: item.unit_quantity,
      出库数: item.unit_outstock_quantity,
      商品单价: item.product_avg,
      定价单位: item.unit_measuring_name,
      下单金额: item.order_price,
      出库金额: item.outstock_price,
      加单数1: item.add_order_value1,
      加单数2: item.add_order_value2,
      加单数3: item.add_order_value3,
      加单数4: item.add_order_value4,
      总加单数: item.total_add_order_value,
      加单金额1: item.add_order_price1,
      加单金额2: item.add_order_price2,
      加单金额3: item.add_order_price3,
      加单金额4: item.add_order_price4,
      总加单金额: item.total_add_order_price,
      套账下单数: item.fake_order_quantity,
      套账出库数: item.fake_outstock_quantity,
      套账下单金额: item.fake_order_price,
      套账出库金额: item.fake_outstock_price,
    }
  })

  return result
}

export default skusTypeHandler
