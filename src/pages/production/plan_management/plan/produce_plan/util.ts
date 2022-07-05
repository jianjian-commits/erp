import { Tip } from '@gm-pc/react'
import { CommonListOrder } from 'gm_api/src/order'
import _ from 'lodash'
import { Filter as OrderFilter } from '@/pages/production/plan_management/plan/produce_plan/components/default/order/order_filter'
import { Filter as DemandFilter } from '@/pages/production/plan_management/plan/demand/interface'

import { t } from 'gm-i18n'
import { getTaskTypes } from '@/pages/production/util'

export const getOrderParams = (filter: OrderFilter) => {
  const { begin, end, dateType, category = new Array(3) } = filter

  const baseParams: CommonListOrder = {
    serial_nos: filter.serial_no ? [filter.serial_no] : undefined,
    customer_search_text: filter.receive_customer_id || undefined,
    quotation_ids: filter?.sale_menus?.map((v) => v.value) || undefined,
    receive_customer_ids: filter?.customers?.map((v) => v.value),
    menu_period_group_ids: _.map(
      filter.menu_period_group_ids,
      ({ value }) => value,
    ),
  }
  const params =
    dateType === 1
      ? {
          order_time_from_time: `${+begin!}`,
          order_time_to_time: `${+end!}`,
        }
      : {
          order_receive_from_time: `${+begin!}`,
          order_receive_to_time: `${+end!}`,
        }
  const categorys: Record<string, string> = {}

  category.map((item, index) => {
    switch (index) {
      case 0: {
        categorys.category_id_1 = item
        break
      }
      case 1: {
        categorys.category_id_2 = item
        break
      }
      case 2: {
        categorys.category_id_3 = item
        break
      }
      default: {
        Tip.danger(t('商品分类不应超过三级'))
        throw new Error('SPU CATEGORY ERROR')
      }
    }
  })

  const req: any = {
    common_list_order: {
      ...params,
      ...baseParams,
    },
    ...categorys,
    sku_q: filter.sku_q || undefined,
  }

  return req
}

export const getDemandParams = (filter: DemandFilter) => {
  const { customerIds, routeIds, task_type, category_ids, skuSelect, ...req } =
    filter

  return {
    ...req,
    sku_ids: skuSelect?.length
      ? _.map(skuSelect, ({ value }) => value)
      : undefined,
    task_types: getTaskTypes(task_type),
    category_ids: category_ids?.slice(-1),
    target_customer_ids: _.map(customerIds, (u) => u.value),
    route_ids: _.map(routeIds, ({ value }) => value),
  }
}
