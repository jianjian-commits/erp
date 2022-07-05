import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import type { FilterOptions, SkuDetail } from '../../../interface'
import {
  ListOrderDetail,
  CommonListOrder,
  ListOrderDetailRequest_Type,
} from 'gm_api/src/order'
import { Filters_Bool, PagingResult } from 'gm_api/src/common'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { DataNode } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { getCustomerRoute } from '../utils'

interface F extends Omit<FilterOptions, 'is_out_stock' | 'sort_remark'> {
  category: string[]
  is_create_production_task: number
  sku_q: string
}

const initFilter = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  dateType: 1,
  status: 0,
  pay_status: 0,
  serial_no: '',
  receive_customer_id: '',
  app_id: '',
  service_period_id: '',
  category: [],
  is_create_production_task: Filters_Bool.ALL,
  sort_status: 0,
  customers: [],
  sale_menus: [],
  drivers: [],
  sku_q: '',
  menu_period_group_ids: [],
  route: [],
  order_type: [],
  customize_type_ids: [],
}

class Store {
  filter: F = {
    ...initFilter,
  }

  paging: PagingResult = {
    count: '0',
  }

  list: SkuDetail[] = []

  categoryData: DataNode[] = []

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  doRequest = () => {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  initFilter() {
    this.filter = { ...initFilter }
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  updateSku<T extends keyof SkuDetail>(
    index: number,
    key: T,
    value: SkuDetail[T],
  ) {
    this.list[index][key] = value
  }

  getParams() {
    const { filter } = this
    const { begin, end, dateType, category, customize_type_ids } = this.filter
    const appOp = filter.app_id.split('_')
    const baseParams: CommonListOrder = {
      serial_nos: filter.serial_no ? [filter.serial_no] : undefined,
      states: filter.status ? [filter.status as number] : undefined,
      customer_search_text: filter.receive_customer_id || undefined,
      receive_customer_ids: filter.customers.map((v) => v.value),
      pay_states: filter.pay_status ? [filter.pay_status as number] : undefined,
      quotation_ids: filter.sale_menus.map((v) => v.value) || undefined,
      app_types: appOp[0] ? [appOp[0]] : undefined,
      order_op: appOp[1] ? [appOp[1]] : undefined,
      driver_ids: filter.drivers.map((v) => v.value),
      route_ids: filter.route.map((v) => v.value),
      service_period_id: undefined,
      menu_period_group_ids: _.map(
        filter.menu_period_group_ids,
        ({ value }) => value,
      ),
      customize_type_ids: customize_type_ids.map((item) => item.value),
    }
    const params =
      dateType === 1
        ? {
            order_time_from_time: `${+begin}`,
            order_time_to_time: `${+end}`,
          }
        : {
            order_receive_from_time: `${+begin}`,
            order_receive_to_time: `${+end}`,
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
    return {
      common_list_order: { ...params, ...baseParams },
      ...categorys,
      is_create_production_task: filter.is_create_production_task,
      sku_q: filter.sku_q || undefined,
      type: ListOrderDetailRequest_Type.TYPE_COMBINE_DETAIL, // 按组合商品
    }
  }

  async fetchList(params?: any) {
    try {
      const json = await ListOrderDetail(
        Object.assign(
          {
            ...this.getParams(),
            relation_info: {
              need_customer_info: true,
              need_quotation_info: true,
              need_sku_info: true,
              need_menu_period_group: true,
            },
          },
          params,
        ),
      )
      const routes = await getCustomerRoute(
        _.map(
          json.response.details,
          (item) => item.order?.receive_customer_id!,
        ),
      )
      const details = json.response.details! || []
      const relation_info = json.response.relation_info || {}
      const customers = relation_info?.customers || {}
      const quotations = relation_info?.quotations || {}
      const menu_period_groups = relation_info?.menu_period_groups || {}
      const childQuotationParentId =
        relation_info?.parent_child_quotation_id_map || {}

      this.list =
        details.map((v) => {
          // 找到报价单信息
          const quotation =
            quotations[
              relation_info.customer_quotation_relation?.[
                v.order?.receive_customer_id! || ''
              ]?.values?.[0] || ''
            ]
          // 周期报价单子报价单
          const childQuotation = _.get(
            quotations,
            _.get(childQuotationParentId, quotation?.quotation_id || ''),
          )

          const { unit_cal_info, unit_id } = v.detail!
          const units = unit_cal_info?.unit_lists
          const unit = units?.find((unit) => unit.unit_id === unit_id)
          const parentUnit = units?.find(
            (parentUnit) => parentUnit.unit_id === unit?.parent_id,
          )
          const route = routes[v?.order?.receive_customer_id!]

          return {
            ...v.detail!,
            editing: false,
            unit,
            parentUnit,
            order: v.order,
            customer: customers[v?.order?.receive_customer_id!],
            quotation,
            quotationName: _.filter(
              [quotation?.inner_name, childQuotation?.inner_name],
              (v) => !_.isEmpty(v),
            ).join('-'),
            menu_period_group:
              menu_period_groups[v.order?.menu_period_group_id!],
            route: {
              name: route?.route_name,
              id: route?.route_id,
            },
          }
        }) || []
      this.paging = json.response.paging
      return json.response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * 商品分类
   */
  async fetchCategory() {
    const { categoryTreeData } = await fetchTreeData()
    this.categoryData = categoryTreeData
  }
}

export default new Store()
export type { F as FilterOptions }
