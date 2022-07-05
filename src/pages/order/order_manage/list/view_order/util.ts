import { Order } from 'gm_api/src/order'
import { OrderInfoViewOrder } from './interface'

export const getDetails = (orders: Order[]) => {
  return orders.reduce((sum, v) => {
    return [
      ...sum,
      ...(v.order_details?.order_details || []).map((v) => v.order_detail_id),
    ]
  }, [] as string[])
}

type DetailCount =
  | 'catagorySum'
  | 'orderQuantity'
  | 'processNum'
  | 'notProcessNum'

export const getDetailsCount = (
  orders: OrderInfoViewOrder[],
  type: DetailCount,
) => {
  return orders.reduce((sum, v) => sum + +v[type]!, 0)
}
