import { DefaultOptionType } from 'antd/lib/cascader'
import { ListProductionOrderResponse_ProductionOrders } from 'gm_api/src/production'
import _ from 'lodash'

export const getProductPlanTree = (
  productionOrders: ListProductionOrderResponse_ProductionOrders[],
): DefaultOptionType[] => {
  const data = _.map(
    productionOrders,
    ({ delivery_time, production_orders, title }) => ({
      value: delivery_time,
      label: title,
      children: _.map(production_orders, (v) => ({
        value: v.production_order_id,
        label: v.name,
      })),
    }),
  )
  return data
}
