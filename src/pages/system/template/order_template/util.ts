import _ from 'lodash'
import {
  OrderImportTemplete_SystemKey,
  map_OrderImportTemplete_SystemKey,
  OrderImportTemplete_Type,
} from 'gm_api/src/orderlogic'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

interface SelectItem {
  value: number
  text: string
}
// 商户名
export const CUSTOMERNAME = OrderImportTemplete_SystemKey.SYSTEMKEY_CUSTOMERNAME
// 商户编码
export const CUSTOMER_CUSTOMIZE_CODE =
  OrderImportTemplete_SystemKey.SYSTEMKEY_CUSTOMER_CUSTOMIZE_CODE

// 订单分批号
export const ORDERNO = OrderImportTemplete_SystemKey.SYSTEMKEY_ORDERNO
// 商品价格
export const UNITPRICE = OrderImportTemplete_SystemKey.SYSTEMKEY_UNITPRICE
// 商品备注
export const SSU_REMARK = OrderImportTemplete_SystemKey.SYSTEMKEY_SSU_REMARK
// 商品规格编码
export const SSU_CUSTOMIZE_CODE =
  OrderImportTemplete_SystemKey.SYSTEMKEY_SSU_CUSTOMIZE_CODE
// 下单数
export const QUANTITY = OrderImportTemplete_SystemKey.SYSTEMKEY_QUANTITY
// 下单单位
export const ORDERUNIT = OrderImportTemplete_SystemKey.SYSTEMKEY_UNIT
// 套账字段 - 加单数 1
export const FAKE_ADD_ORDER_VALUE_1 =
  OrderImportTemplete_SystemKey.SYSTEMKEY_ADD_QUANTITY1
// 套账字段 - 加单数 2
export const FAKE_ADD_ORDER_VALUE_2 =
  OrderImportTemplete_SystemKey.SYSTEMKEY_ADD_QUANTITY2
// 套账字段 - 加单数 3
export const FAKE_ADD_ORDER_VALUE_3 =
  OrderImportTemplete_SystemKey.SYSTEMKEY_ADD_QUANTITY3
// 套账字段 - 加单数 4
export const FAKE_ADD_ORDER_VALUE_4 =
  OrderImportTemplete_SystemKey.SYSTEMKEY_ADD_QUANTITY4
// 商品名
export const SSU_NAME = OrderImportTemplete_SystemKey.SYSTEMKEY_SSU_NAME

const keyMap: { [key: number]: string } = {
  [CUSTOMERNAME]: map_OrderImportTemplete_SystemKey[CUSTOMERNAME],
  [SSU_NAME]: map_OrderImportTemplete_SystemKey[SSU_NAME],
  [QUANTITY]: map_OrderImportTemplete_SystemKey[QUANTITY],
  [SSU_CUSTOMIZE_CODE]: map_OrderImportTemplete_SystemKey[SSU_CUSTOMIZE_CODE],
  [SSU_REMARK]: map_OrderImportTemplete_SystemKey[SSU_REMARK],
  [UNITPRICE]: map_OrderImportTemplete_SystemKey[UNITPRICE],
  [CUSTOMER_CUSTOMIZE_CODE]:
    map_OrderImportTemplete_SystemKey[CUSTOMER_CUSTOMIZE_CODE],
  [ORDERNO]: map_OrderImportTemplete_SystemKey[ORDERNO],
  [ORDERUNIT]: map_OrderImportTemplete_SystemKey[ORDERUNIT],
}

// 套账相关字段
const FAKE_ADD_ORDER = {
  [FAKE_ADD_ORDER_VALUE_1]:
    map_OrderImportTemplete_SystemKey[FAKE_ADD_ORDER_VALUE_1],
  [FAKE_ADD_ORDER_VALUE_2]:
    map_OrderImportTemplete_SystemKey[FAKE_ADD_ORDER_VALUE_2],
  [FAKE_ADD_ORDER_VALUE_3]:
    map_OrderImportTemplete_SystemKey[FAKE_ADD_ORDER_VALUE_3],
  [FAKE_ADD_ORDER_VALUE_4]:
    map_OrderImportTemplete_SystemKey[FAKE_ADD_ORDER_VALUE_4],
}

export function getKeyMap(): { [key: number]: string } {
  const fakeOrderFields =
    !globalStore.isLite &&
    globalStore.hasPermission(
      Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
    )
      ? FAKE_ADD_ORDER
      : {}
  return { ...keyMap, ...fakeOrderFields }
}

const keysFun = (type: number) => {
  const newKeyMap = getKeyMap()
  return _.map(newKeyMap, (item, key) => {
    if (
      type === OrderImportTemplete_Type.TYPE_CUSTOMIZE &&
      [CUSTOMER_CUSTOMIZE_CODE, CUSTOMERNAME].includes(+key)
    )
      return null
    return { value: +key, text: item }
  }).filter((_) => _ !== null) as SelectItem[]
}

const getRelationColumns = (start: number, columns: any[]) => {
  const arr: { [key: number]: any } = {}
  let i = 0
  const targetIndex = start - 1
  while (
    i < columns.length &&
    (i <= targetIndex ||
      (i > targetIndex && columns[targetIndex] !== columns[i]))
  ) {
    arr[i + 1] = columns[i]
    i++
  }

  if (i >= columns.length) {
    return Promise.reject(new Error('开始循环列有误'))
  }

  return Promise.resolve(arr)
}

const hasSameItem = (list: any[]) => {
  const set = new Set(list)
  return list.length !== set.size
}

export { keyMap, getRelationColumns, keysFun, hasSameItem }
