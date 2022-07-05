import { DetailListItem } from '@/pages/order/order_manage/components/interface'
import _ from 'lodash'
import {
  AddOrderValueFieldType,
  ADD_ORDER_VALUE_FIELD,
} from '../select-fake-order-field/constants'

interface FakeFields {
  /** 加单数 */
  count: string
  /** 加单金额 */
  amount: string
}
type HandleFn = (data: DetailListItem) => FakeFields

const handler: Record<AddOrderValueFieldType, HandleFn> = {
  [ADD_ORDER_VALUE_FIELD.VALUE1]: (data) => {
    return {
      amount: data.add_order_price1 || '0',
      count: data.add_order_value1?.quantity?.val || '0',
    }
  },
  [ADD_ORDER_VALUE_FIELD.VALUE2]: (data) => {
    return {
      amount: data.add_order_price2 || '0',
      count: data.add_order_value2?.quantity?.val || '0',
    }
  },
  [ADD_ORDER_VALUE_FIELD.VALUE3]: (data) => {
    return {
      amount: data.add_order_price3 || '0',
      count: data.add_order_value3?.quantity?.val || '0',
    }
  },
  [ADD_ORDER_VALUE_FIELD.VALUE4]: (data) => {
    return {
      amount: data.add_order_price4 || '0',
      count: data.add_order_value4?.quantity?.val || '0',
    }
  },
}

/**
 * 通过 key 获取加单数和加单金额
 */
function getFakeFields(data: DetailListItem, value?: string): FakeFields {
  const fn = _.get(handler, value || '')
  if (typeof fn === 'function') {
    return fn(data)
  }
  return { count: '0', amount: '0' }
}

export default getFakeFields
