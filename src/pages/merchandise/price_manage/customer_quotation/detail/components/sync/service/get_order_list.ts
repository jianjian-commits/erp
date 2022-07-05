import {
  ListOrder,
  ListOrderByQuotationIds,
  ListOrderRequest_PagingField,
  Order_State,
  Status,
} from 'gm_api/src/order'
import { App_Type, PagingParams } from 'gm_api/src/common'
import _ from 'lodash'
import moment from 'moment'
import { Price } from '@gm-pc/react'
import { Quotation_Type } from 'gm_api/src/merchandise'

export interface QueryOrderListParams {
  /**
   * 客户 id
   */
  customerIdList?: string[]
  /**
   * 搜索对应报价单
   */
  quotationId: string
  /**
   * 开始时间
   */
  beginTime: string
  /**
   * 结束时间
   */
  endTime: string
  /**
   * 分页
   */
  paging: PagingParams
  /** 订单状态 */
  status?: Order_State[]
}

export interface OrderShape {
  orderId: string
  /**
   * 下单时间
   */
  orderTime: string
  /**
   * 订单金额
   */
  price?: string
  /**
   * 商户 id
   */
  customerId?: string
  /**
   * 商户名称
   */
  customerName?: string
  /**
   * 报价单类型
   */
  quotationType?: Quotation_Type
  /**
   * 订单序号
   */
  serialNo?: string
  /**
   * 订单状态
   */
  status: Order_State
  /**
   * 下单客户端
   */
  appType?: App_Type
}

export default async function getOrderList(params: QueryOrderListParams) {
  const { customerIdList, quotationId, beginTime, endTime, paging, status } =
    params
  const { response } = await ListOrderByQuotationIds({
    quotation_ids: [quotationId],
    list_order_request: {
      paging,
      relation_info: {
        need_customer_info: true,
      },
      sort_by: [
        {
          field: ListOrderRequest_PagingField.ORDER_TIME,
          desc: true,
        },
      ],
      only_order_data: true,
      common_list_order: {
        receive_customer_ids: customerIdList,
        order_time_from_time: beginTime,
        order_time_to_time: endTime,
        states: status,
      },
    },
  })
  const {
    orders,
    relation_info,
    paging: remotePagin,
  } = response.list_order_response || {}

  const orderList = _.map(orders, (item): OrderShape => {
    const {
      order_time,
      order_price,
      receive_customer_id,
      quotation_type,
      serial_no,
      status,
      app_type,
    } = item

    return {
      orderId: item.order_id,
      orderTime: order_time
        ? moment(Number(order_time)).format('YYYY-MM-DD HH:mm')
        : '-',
      price: order_price ? `${order_price}${Price.getUnit()}` : '-',
      customerId: receive_customer_id,
      customerName: _.get(
        relation_info?.customers,
        `${receive_customer_id}.name`,
        '',
      ) as string,
      appType: app_type,
      quotationType: quotation_type,
      serialNo: serial_no,
      status: _.toFinite(status) as Order_State,
    }
  })
  return { list: orderList, count: remotePagin?.count }
}
