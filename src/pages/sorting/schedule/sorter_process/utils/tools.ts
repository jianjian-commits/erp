import _ from 'lodash'

import {
  OrderSortingInfo2,
  CategorySortingInfo,
  SsuSortingInfo,
} from '../interface'
import {
  GetSortingInfoResponse_RelationInfo,
  GetSortingInfoResponse_SortingInfoUnit,
} from 'gm_api/src/sorting'
import { initOrderSortingInfo, initTotalInfo } from '../store'

/** 计算订单分拣进度 */
export function getOrderSortingInfo(infoMap: {
  [key: string]: GetSortingInfoResponse_SortingInfoUnit
}) {
  function get(n: number | undefined) {
    return n || 0
  }

  if (_.isEmpty(infoMap)) {
    return initOrderSortingInfo
  }

  return _.reduce(
    infoMap,
    (t, order) => {
      t.total += get(order.total_count)
      t.finished += get(order.weight_count) + get(order.out_stock_count)
      return t
    },
    {
      ...initOrderSortingInfo,
    },
  )
}

/** 计算订单分拣进度 商户进度 */
export function getOrderSortingInfo2(
  orderInfo: {
    [key: string]: string
  },
  infoMap: {
    [key: string]: GetSortingInfoResponse_RelationInfo
  },
  sortMap: {
    [key: string]: GetSortingInfoResponse_SortingInfoUnit
  },
) {
  function get(n: number | undefined) {
    return n || 0
  }

  return _.reduce(
    orderInfo,
    (t, v, order_id) => {
      const order = sortMap[order_id] || {}
      t.push({
        order_id,
        total: get(order.total_count!),
        finished: get(order.weight_count) + get(order.out_stock_count),
        ...(infoMap[v] ? infoMap[v] : {}),
      })
      return t
    },
    [] as OrderSortingInfo2[],
  )
}

export function getCategoryInfo(
  cateMap: {
    [key: string]: GetSortingInfoResponse_RelationInfo
  },
  infoMap: {
    [key: string]: GetSortingInfoResponse_SortingInfoUnit
  },
) {
  return _.reduce(
    cateMap,
    (t, v, id) => {
      t.push({
        name: v.name!,
        ...((infoMap[id] as Required<GetSortingInfoResponse_SortingInfoUnit>) ||
          initTotalInfo),
      })
      return t
    },
    [] as CategorySortingInfo[],
  )
}

export function getSsuInfo(
  ssuMap: {
    [key: string]: GetSortingInfoResponse_RelationInfo
  },
  infoMap: {
    [key: string]: GetSortingInfoResponse_SortingInfoUnit
  },
) {
  function get(n: number | undefined) {
    return n || 0
  }

  return _.reduce(
    ssuMap,
    (t, v, customize_code) => {
      const sort = infoMap[customize_code]
      t.push({
        customize_code,
        name: v.name!,
        total: get(sort.total_count!),
        finished: get(sort.weight_count) + get(sort.out_stock_count),
      })
      return t
    },
    [] as SsuSortingInfo[],
  )
}
