import { action, makeAutoObservable } from 'mobx'
import moment from 'moment'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  CommonListOrder,
  ListOrder,
  ListOrderRequest_PagingField,
  OrderRelationInfoResponse,
} from 'gm_api/src/order'
import { MoreSelectDataItem } from '@gm-pc/react'
import { ListOrderWithRelation, OrderRelationInfo } from 'gm_api/src/orderlogic'
import Big from 'big.js'
import { CategoryInfo, Quotation, UnitValueSet } from 'gm_api/src/merchandise'

import { parseSsu, toFixedOrder } from '@/common/util'
import {
  OrderFilter,
  SortingList,
  OrderList_OrderDetail,
  ListMeta,
} from './interface'

const date = moment().startOf('day').toDate()
const datedebug = moment().subtract(7, 'd').toDate()

const initFilter = {
  time_type: 1,
  begin_time: datedebug,
  end_time: date,

  search: '',
  status: 0,
  sort_status: 0,
  print_status: '',

  driver_selected: [] as MoreSelectDataItem<string>[],
  route_selected: [] as MoreSelectDataItem<string>[],
  quotation_ids: [] as string[],
}

class Order {
  orderFilter: OrderFilter = { ...initFilter }

  list: SortingList[] = []
  listMeta: ListMeta = {
    total: 0,
    finish: 0,
    unFinish: 0,
  }

  relation_info: OrderRelationInfoResponse & OrderRelationInfo = {}

  pagination: any = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init() {
    this.orderFilter = { ...initFilter }
  }

  reset() {
    this.orderFilter = {
      ...initFilter,
    }
  }

  getParams() {
    const { orderFilter } = this
    const { begin_time, end_time, time_type } = orderFilter

    const baseParams: CommonListOrder = {
      driver_ids: [],
      quotation_ids: [],
      receive_customer_ids: [],
    }
    const params =
      time_type === 1
        ? {
            order_time_from_time: `${+begin_time}`,
            order_time_to_time: `${+end_time}`,
          }
        : {
            order_receive_from_time: `${+begin_time}`,
            order_receive_to_time: `${+end_time}`,
          }
    return { ...params, ...baseParams }
  }

  fetchList(params?: any) {
    return ListOrderWithRelation({
      city_ids: [],
      district_ids: [],
      relation: { need_customer_route_info: true },
      route_ids: [],
      street_ids: [],
      filter: {
        common_list_order: this.getParams(),
        need_total_info: true,
        need_sorting_count_info: true,
        relation_info: {
          need_customer_info: true,
          need_driver_info: true,
          need_user_info: true,
          need_sku_info: true,
          need_quotation_info: true,
        },
        sort_by: [
          {
            field: ListOrderRequest_PagingField.ORDER_TIME,
            desc: true,
          },
        ],
        ...params,
      },
    }).then((json) => {
      const data = json.response.response!
      const relation = json.response.relation!

      const customers = data.relation_info?.customers || {}
      const groupUsers = data.relation_info?.group_users || {}
      this.relation_info = { ...data.relation_info!, ...relation }

      this.listMeta = {
        total: data.paging.count || 0,
        finish: data.sorting_finish_count || 0,
        unFinish: data.sorting_unfinish_count || 0,
      }

      this.list = (data.orders || []).map((v) => ({
        ...v,
        customer: customers[v.receive_customer_id],
        driver: groupUsers[v.driver_id!],
        // ???????????? = ???????????? + ?????????/ ?????????
        _process: Big(
          (v.sorting_info?.weight_count || 0) +
            (v.sorting_info?.out_stock_count || 0),
        )
          .div(v.sorting_info?.total_count || 1)
          .times(100)
          .toFixed(2),
        // ??????
        _route:
          (!_.isEmpty(this.relation_info) &&
            this.relation_info.routes![
              this.relation_info.customer_routes![v.receive_customer_id]
            ]?.route_name) ||
          t('???'),

        order_details: (v.order_details?.order_details || []).map((detail) => {
          const { ssu, ...rest } = detail
          const parse = parseSsu(ssu)

          const order = this.getUnitNumber(detail.order_unit_value, parse)
          const outstock = this.getUnitNumber(
            detail.outstock_unit_value!,
            parse,
          )

          return {
            ...rest,
            ...parse,
            // ????????????
            editing: false,
            ssu,
            // ???????????????id
            _sku_id: rest.sku_id! + rest.order_detail_id + rest.order_id!,
            // ?????????
            realQuantity: outstock.pack,
            baseRealQuantity: outstock.base,
            // ?????????
            quantity: order.pack,
            baseQuantity: order.base,

            categoryName: this.getCategory(ssu.sku_id!),
            quotationName: this.getQuotation(v.quotation_id!) || '-',
          }
        }),
      }))

      return json
    })
  }

  // ???????????????
  updateQuantity(orderIndex, skuIndex, value) {}

  setFilter(field: keyof OrderFilter, value: any) {
    this.orderFilter[field] = value
  }

  // -------------------------- ?????????????????? ---------------------------------

  /** ?????????????????? */
  @action
  updateEditing(data: OrderList_OrderDetail, bool: boolean) {
    data.editing = bool
  }

  /** ?????????????????? */
  @action
  updateList<T extends keyof SortingList>(
    index: number,
    key: T,
    value: SortingList[T],
  ) {
    this.list[index][key] = value
  }

  /** ??????sku????????????????????? x/x/x */
  getCategory(skuId: string, format?: (c: CategoryInfo[]) => any) {
    if (!format)
      format = (cts) => {
        return cts.map((c) => c.category_name).join('/')
      }
    const categoryInfo = this.relation_info.skus![skuId].category_infos!
    return format(categoryInfo)
  }

  /** ???????????????id???????????????????????????????????? */
  getQuotation(quotationId: string, format?: (q: Quotation) => any) {
    if (!format) {
      format = (q) => q.inner_name
    }

    const quotationInfo = this.relation_info.quotations![quotationId] || {}
    return format(quotationInfo)
  }

  /**
   * ??????????????????????????????
   * @return base=????????? pack=??????
   */
  getUnitNumber(unitSet: UnitValueSet, parse: any) {
    const quantity = +unitSet.input?.quantity! || 0
    const base = unitSet?.input?.unit_id === parse.ssu_unit_parent_id
    const rate = parse.ssu_unit_rate || 1

    return {
      base: base ? quantity : +toFixedOrder(Big(quantity).div(rate || 1)),
      pack: base ? +toFixedOrder(Big(quantity).div(rate || 1)) : quantity,
    }
  }
}

export default new Order()
