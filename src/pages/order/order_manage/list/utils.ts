import { GetManyCustomerRoute, Route } from 'gm_api/src/delivery'
import _ from 'lodash'

/**
 * 获取线路信息
 *
 * 返回值为 object
 * customerId 为 key
 * route      为 value
 */
export async function getCustomerRoute(
  customerIds: string[],
): Promise<Record<string, Route>> {
  if (_.isEmpty(customerIds)) {
    return {}
  }
  try {
    const { response } = await GetManyCustomerRoute({
      customer_ids: customerIds,
    })
    const result: Record<string, Route> = {}
    _.forOwn(response.customer_routes || {}, (routeId, customerId) => {
      const route = response.routes?.[routeId]
      if (route) {
        result[customerId] = route
      }
    })
    return result
  } catch (error) {
    return Promise.reject(error)
  }
}
