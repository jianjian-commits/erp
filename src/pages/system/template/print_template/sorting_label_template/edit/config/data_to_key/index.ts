import moment from 'moment'
import { Unit } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { ListSortingTaskResponse } from 'gm_api/src/sorting'
import { OrderDetail } from 'gm_api/src/order'
import globalStore from '@/stores/global'

interface OtherPrintInfoProps {
  sorting_task: OrderDetail
  page_number: string
}

const toKey = (
  data: ListSortingTaskResponse & OtherPrintInfoProps,
  units: Unit[],
) => {
  const newData = {
    _origin: data,
  }

  const {
    page_number,
    sorting_task,
    order_customer_info,
    customer_info,
    route_info,
    orders,
    sku_info = {},
  } = data
  const {
    sku_id,
    sku_revision,
    sorting_quantity,
    order_unit_value_v2,
    order_id,
    unit_cal_info,
  } = sorting_task

  // 下单数下单单位
  const order_unit = _.find(
    unit_cal_info?.unit_lists,
    (unit) => unit.unit_id === order_unit_value_v2?.quantity?.unit_id,
  )

  // 实称数下单单位
  const sorting_unit = _.find(
    unit_cal_info?.unit_lists,
    (unit) => unit.unit_id === sorting_quantity?.input?.unit_id,
  )

  // const key = `${sku_id}_${sku_revision}`
  const key: string = sku_id as string
  const sku = sku_info[key]
  const customer = customer_info![order_customer_info![order_id!]]
  const order = orders![order_id!]
  Object.assign(newData, {
    // 基础
    SKU: sku?.name,
    SKU_ID: sku?.sku_id,
    商品规格编码: sku?.customize_code,
    下单数_下单单位: `${order_unit_value_v2?.quantity?.val || 0}${
      order_unit?.name
    }`,
    实称数_下单单位: `${sorting_quantity?.input?.quantity || 0}${
      sorting_unit?.name
    }`,
    单价: `${+(order_unit_value_v2?.price?.val || 0)}`,
    单价_下单单位: `${+(order_unit_value_v2?.price?.val || 0)}元/${
      order_unit?.name
    }`,
    商品备注: `${sorting_task?.remark}`,
    订单备注: `${order?.remark}`,
    分拣员名字: globalStore.stationInfo.name || '',
    商品条码: `${sorting_task.order_detail_id}`,
    // 配送
    商户名: customer ? customer.name : '-',
    商户编码: customer ? customer.customized_code : '-',
    线路: route_info?.route_name,
    司机: order?.driver_id,
    收货日期: order.receive_time
      ? moment(Number(order.receive_time)).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD HH:mm:ss'),

    // 其他
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_年月日: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),
    页码: page_number,
  })

  return newData
}

export default toKey
