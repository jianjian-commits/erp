import { getUnitInfo } from '@/pages/production/util'
import Big from 'big.js'
import { t } from 'gm-i18n'
import {
  ListTaskResponse,
  ProductionOrder,
  TaskDetail,
  Task_Type,
} from 'gm_api/src/production'
import _ from 'lodash'
import moment from 'moment'

export const handleTaskDetail = (data: {
  task_detail: TaskDetail
  info: Omit<ListTaskResponse, 'paging'>
}) => {
  const {
    task_detail,
    info: { units, skus, routes, customers },
  } = data
  const { target_route_id, target_customer_id, batch, ...req } =
    task_detail.task!
  const { sku_id, type, unit_id, release_time, order_sku_id, sku_name } = req

  let sku_type = 0
  const sku = skus && skus[sku_id!]
  if (sku) {
    sku_type = sku.sku?.not_package_sub_sku_type || 0
  }

  const unit_info = getUnitInfo({
    sku_id: type !== Task_Type.TYPE_PACK ? undefined : sku_id,
    skus: type !== Task_Type.TYPE_PACK ? undefined : skus,
    unit_id: unit_id || '',
    units: units!,
  })

  // 生产任务直接取sku的单位, 包装任务的单位需要取对应ssu的单位
  // 涉及到'-'显示的都在这里处理
  const unit_name: string = unit_info.unitName
  return {
    ...req,
    key: req.task_id,
    isEditing: false,
    unit_name,
    sku_type,
    _plan_amount: req?.plan_amount || '', // 计划生产数
    customerName: customers?.[target_customer_id!]?.name || '-',
    routerName: routes?.[target_route_id!]?.route_name || '-',
    releaseTime:
      release_time && release_time !== '0'
        ? moment(+release_time!).format('YYYY-MM-DD HH:mm:ss')
        : '-',
    batch: batch || '-',
    skuName: sku_name,
    taskSources: task_detail.task_sources!,
    materialType: sku_id && sku_id === order_sku_id ? t('成品') : t('半成品'),
  }
}
const dpProduction = 4

export const numMultiple = (x: string, y: string) => {
  return Big(x || 0)
    .times(y || 0)
    .toFixed(dpProduction)
}

export const numMinus = (x: string, y: string) => {
  return Big(x || 0)
    .minus(y || 0)
    .toFixed(dpProduction)
}

export const filterProductionOrders = (
  production_orders: ProductionOrder[],
  productionOrderId?: string,
) => {
  const orderProductionIndex = _.findIndex(
    production_orders,
    (v) => v.production_order_id === productionOrderId,
  )
  if (orderProductionIndex) {
    production_orders.unshift(production_orders[orderProductionIndex])
    production_orders.splice(orderProductionIndex + 1, 1)
  }

  return production_orders
}
