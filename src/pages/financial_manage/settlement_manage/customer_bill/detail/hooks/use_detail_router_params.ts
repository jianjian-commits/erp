import { useGMLocation } from '@gm-common/router'
import moment from 'moment'
import { useMemo } from 'react'
import { SearchParams } from '../interface'

export default function useDetailRouterParams() {
  const { query } = useGMLocation<SearchParams>()
  const {
    order_time_from_time,
    order_time_to_time,
    order_receive_from_time,
    order_receive_to_time,
    order_outstock_from_time,
    order_outstock_to_time,
    customerId,
  } = query

  const timeFilter = useMemo(() => {
    return {
      order_time_from_time,
      order_time_to_time,
      order_receive_from_time,
      order_receive_to_time,
      order_outstock_from_time,
      order_outstock_to_time,
    }
  }, [
    order_time_from_time,
    order_time_to_time,
    order_receive_from_time,
    order_receive_to_time,
    order_outstock_from_time,
    order_outstock_to_time,
  ])

  const beginMoment = useMemo(() => {
    const timestamp = Number(
      order_time_from_time ||
        order_receive_from_time ||
        order_outstock_from_time,
    )
    return moment(timestamp === 0 ? '' : timestamp)
  }, [order_outstock_from_time, order_receive_from_time, order_time_from_time])

  const endMoment = useMemo(() => {
    const timestamp = Number(
      order_time_to_time || order_receive_to_time || order_outstock_to_time,
    )
    return moment(timestamp === 0 ? '' : timestamp)
  }, [order_outstock_to_time, order_receive_to_time, order_time_to_time])

  return { beginMoment, endMoment, customerId, timeFilter }
}
