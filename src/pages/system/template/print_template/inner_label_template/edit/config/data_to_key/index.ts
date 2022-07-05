import moment from 'moment'
import { GetTaskWeightResponse, Task, TaskWeight } from 'gm_api/src/production'
import { Unit } from 'gm_api/src/merchandise'
import _ from 'lodash'

interface OtherPrintInfoProps {
  page_number: string
}

const toKey = (
  data: GetTaskWeightResponse & OtherPrintInfoProps,
  units: Unit[],
) => {
  const newData = {
    _origin: data,
  }

  const { task, skus, page_number, task_weight, customers } = data
  const { sku_name, sku_id, delivery_time, unit_id } = task as Task
  const { sku, ssu_map } = skus![sku_id]
  const { ssu } = ssu_map![unit_id]
  const { customer_id, quantity, customized_code } = task_weight as TaskWeight
  const customer = customer_id ? customers![customer_id] : null

  const ssuParentUnit = _.find(
    units,
    (unit) => unit.unit_id === ssu?.unit.parent_id,
  )
  Object.assign(newData, {
    // 基础
    SKU: sku_name,
    SKU_ID: sku?.customize_code,
    实称数_基本单位: `${quantity}${ssuParentUnit?.name}`,
    保质期: `${sku?.expiry_date}天`,
    计划交期: moment(parseInt(delivery_time || '0', 10)).format('YYYY-MM-DD'),
    // 入库条码: `${customized_code}`,
    // 商品条码: `${sku?.spu_id}${task_weight.unit_id}2`,
    产品组成: '小炒肉，酱油，辣椒酱，包装盒',
    // 配送
    商户名: customer ? customer.name : '-',
    商户编码: customer ? customer.customized_code : '-',

    // 其他
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_年月日: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),
    页码: page_number,
  })

  return newData
}

export default toKey
