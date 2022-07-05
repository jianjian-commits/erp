import { QueryData, ModelValue } from 'gm_api/src/analytics'
import { Moment } from 'moment'
import Big from 'big.js'
import { toFixed } from '@/common/util'

const getKvByQueryData = (queryData: QueryData): Required<ModelValue>['kv'] => {
  return queryData?.model_values?.[0]?.kv || {}
}
const getKvByIndex = (list: QueryData[] = [], index: number) => {
  return getKvByQueryData(list[index])
}
const findIndexbyDate = (list: QueryData[] = [], date: Moment) => {
  return list.findIndex(
    (item) => getKvByQueryData(item).order_time === date.format('YYYYMMDD'),
  )
}
const getValue = (list: QueryData[] = [], index: number, key: string) => {
  if (index === -1) return 0
  return toFixed(Big(getKvByIndex(list, index)[key] || 0))
}

const getCustomerPrice = (list: QueryData[] = [], index: number) => {
  const kv = getKvByIndex(list, index)
  const sale_price_sum = kv.sale_price_sum

  const customer = kv.receive_customer_id
  return sale_price_sum && customer
    ? toFixed(Big(sale_price_sum).div(customer))
    : '0'
}

export {
  getKvByQueryData,
  getKvByIndex,
  findIndexbyDate,
  getValue,
  getCustomerPrice,
}
