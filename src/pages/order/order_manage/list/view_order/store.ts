import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import type { F, OrderInfoViewOrder } from './interface'
import {
  ListOrder,
  CommonListOrder,
  ListOrderRequest_PagingField,
  GetOrderStatistics,
  ListOrderResponse,
} from 'gm_api/src/order'
import { Filters_Bool } from 'gm_api/src/common'
import { Quotation_Type } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import { getCustomerRoute } from '../utils'

const initFilter: F = {
  status: 0,
  pay_status: 0,
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  dateType: 1,
  is_out_stock: '',
  serial_no: '',
  receive_customer_id: '',
  app_id: '',
  service_period_id: '',
  customers: [],
  sale_menus: [],
  has_remark: '',
  sort_remark: '',
  drivers: [],
  is_scan_receipt: Filters_Bool.ALL,
  menu_period_group_ids: [],
  inspectionFilterValue: Filters_Bool.ALL,
  is_create_stock_sheet: Filters_Bool.ALL,
  route: [],
  order_type: [],
  customize_type_ids: [],
}
class Store {
  filter: F = { ...initFilter }
  list: OrderInfoViewOrder[] = []

  summary = {
    orderCount: 0,
    totalOrderPrice: '0',
    totalOutStockPrice: '0',
  }

  doRequest = (): void | null => {
    return null
  }

  doRequestAfterDelete = (
    list: any[],
    delNum: number,
  ): Promise<ListOrderResponse> | null => {
    return null
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initFilter() {
    this.filter = { ...initFilter }
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  updateOrder<T extends keyof OrderInfoViewOrder>(
    index: number,
    key: T,
    value: OrderInfoViewOrder[T],
  ): void {
    this.list[index][key] = value
  }

  getParams() {
    const { filter } = this
    const { begin, end, dateType, customize_type_ids } = filter
    const appOp = filter.app_id.split('_')
    const baseParams: CommonListOrder = {
      serial_nos: filter.serial_no ? [filter.serial_no] : undefined,
      states: filter.status ? [filter.status as number] : undefined,
      customer_search_text: filter.receive_customer_id || undefined,
      receive_customer_ids: filter.customers.map((v) => v.value),
      driver_ids: filter.drivers.map((v) => v.value),
      route_ids: filter.route.map((v) => v.value),
      pay_states: filter.pay_status ? [filter.pay_status as number] : undefined,
      quotation_ids: filter.sale_menus.map((v) => v.value) || undefined,
      app_types: appOp[0] ? [appOp[0]] : undefined,
      order_op: appOp[1] ? [appOp[1]] : undefined,
      is_out_stock: filter.is_out_stock
        ? filter.is_out_stock === '1'
          ? Filters_Bool.TRUE
          : Filters_Bool.FALSE
        : undefined,
      service_period_id: undefined,
      sorting_remark: filter.sort_remark || undefined,
      is_remark: filter.has_remark
        ? filter.has_remark === '1'
          ? Filters_Bool.TRUE
          : Filters_Bool.FALSE
        : undefined,
      is_create_stock_sheet: this.filter.is_create_stock_sheet,
      // inspectionFilterValue: this.filter.inspectionFilterValue,
      is_scan_receipt: filter.is_scan_receipt,
      menu_period_group_ids: _.map(
        filter.menu_period_group_ids,
        ({ value }) => value,
      ),
      customize_type_ids: customize_type_ids.map((item) => item.value),
      ...(globalStore.isLite ? {} : { need_fake_order: true }),
    }

    const params =
      dateType === 1
        ? {
            order_time_from_time: `${+begin}`,
            order_time_to_time: `${+end}`,
          }
        : dateType === 2
        ? {
            order_receive_from_time: `${+begin}`,
            order_receive_to_time: `${+end}`,
          }
        : {
            order_outstock_from_time: `${+begin}`,
            order_outstock_to_time: `${+end}`,
          }
    return { ...params, ...baseParams }
  }

  async fetchList(params?: any) {
    const common_list_order = this.getParams()
    try {
      const json = await ListOrder(
        Object.assign(
          {
            common_list_order,
            need_total_info: true,
            relation_info: {
              need_customer_info: true,
              need_driver_info: true,
              need_user_info: true,
              need_quotation_info: true,
              need_menu_period_group: true,
              need_menu_info: true,
            },
            sort_by: [
              {
                field: ListOrderRequest_PagingField.ORDER_TIME,
                desc: true,
              },
            ],
            only_order_data: true,
          },
          params,
        ),
      )

      const routes = await getCustomerRoute(
        _.map(json.response.orders, (item) => item.receive_customer_id!),
      )

      common_list_order.order_ids = json.response.orders.map(
        (item) => item.order_id,
      )
      const customers = json.response.relation_info?.customers || {}
      const groupUsers = json.response.relation_info?.group_users || {}
      const quotations = json.response.relation_info?.quotations || {}
      const menus = json.response.relation_info?.menu_relation || {}
      const childQuotationParentId =
        json.response.relation_info?.parent_child_quotation_id_map || {}
      const menu_period_groups =
        json.response.relation_info?.menu_period_groups || {}
      this.list = (json.response.orders || []).map((v) => {
        const quotationIds =
          json.response.relation_info?.customer_quotation_relation?.[
            v.receive_customer_id!
          ]?.values || []
        // * 客户可以同时绑定报价单和菜谱，所以要根据这个订单的类型来找quotation
        const quotation = _.find(quotations, (item) => {
          const isValid = quotationIds.includes(item.quotation_id)
          const isValidType = [
            Quotation_Type.WITHOUT_TIME,
            Quotation_Type.PERIODIC,
            Quotation_Type.WITH_TIME,
          ].includes(item.type)
          return v.quotation_type === item.type && isValid && isValidType
        })
        // 周期报价单子报价单
        const childQuotation = _.get(
          quotations,
          _.get(childQuotationParentId, quotation?.quotation_id || ''),
        )
        const menu = menus?.[v.menu_id!] || ''

        const route = routes[v.receive_customer_id!]

        return {
          ...v,
          editing: false,
          customer: customers[v.receive_customer_id!],
          creator: groupUsers[v.creator_id!],
          driver: groupUsers[v.driver_id!],
          tempStateFe: v.state as number,
          menu,
          // quotation: quotations[v.quotation_id!],
          quotationName: _.filter(
            [quotation?.inner_name, childQuotation?.inner_name],
            (v) => !_.isEmpty(v),
          ).join('-'),
          quotation,
          menu_period_group: menu_period_groups[v.menu_period_group_id!],
          route: {
            name: route?.route_name,
            id: route?.route_id,
          },
        }
      })
      this.summary = {
        orderCount: +(json.response.paging?.count || 0),
        totalOrderPrice: json.response.total_order_price || '0',
        totalOutStockPrice: json.response.total_outstock_price || '0',
      }

      // 单独获取商品种类数
      GetOrderStatistics({
        common_list_order,
        paging: _.omit({ ...params.paging, offset: 0 }, 'need_count') as any, // 这个接口offset不支持，固定传0
      }).then((json) => {
        const {
          ssu_category_num_map = {},
          ssu_order_quantity_map = {},
          ssu_process_num_map = {},
          ssu_not_process_num_map = {},
        } = json.response
        this.list = this.list.map((item) => {
          return {
            catagorySum: ssu_category_num_map[item.order_id], // 商品种类数
            orderQuantity: ssu_order_quantity_map[item.order_id], // 总下单数
            processNum: ssu_process_num_map[item.order_id], // 加工数
            notProcessNum: ssu_not_process_num_map[item.order_id], // 非加工数
            ...item,
          }
        })
        return null
      })
      return json.response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  setDoRequest(func: () => void): void {
    this.doRequest = func
  }

  setDoRequestAfterDelete(
    func: (list: any[], delNum: number) => Promise<ListOrderResponse>,
  ) {
    this.doRequestAfterDelete = func
  }
}

export default new Store()
