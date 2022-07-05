import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Filter, List, List_OrderDetail } from './interface'

import { ListSsuSortingTask } from 'gm_api/src/sorting'
import { UnitValueSet, Quotation } from 'gm_api/src/merchandise'
import { toFixedOrder, parseSsu } from '@/common/util'
import Big from 'big.js'
import { Customer } from 'gm_api/src/enterprise'
import { OrderDetail } from 'gm_api/src/order'

// debug
const d_start_date = moment().subtract(11, 'day').toDate()

const date = moment().startOf('day').toDate()

const initFilter = {
  begin_time: d_start_date,
  end_time: date,
  time_type: 1,
  search: '',
  category: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  quotation_ids: [],
}

class Merchandise {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 按订单分拣搜索条件
  filter: Filter = { ...initFilter }

  list: List[] = []

  pagination: any = {}

  init() {
    this.filter = { ...initFilter }
  }

  getParams() {
    const { filter } = this
    const { begin_time, end_time, time_type, search, quotation_ids, category } =
      filter

    const baseParams = {
      ssu_name: search,
      quotation_ids,
      category_ids_1: category.category1_ids,
      category_ids_2: category.category2_ids,
    }
    const params =
      time_type === 1
        ? {
            create_begin_time: `${+begin_time}`,
            create_end_time: `${+end_time}`,
          }
        : {
            receive_begin_tmie: `${+begin_time}`,
            receive_end_time: `${+end_time}`,
          }
    return { ...params, ...baseParams }
  }

  fetchList(params?: any) {
    return ListSsuSortingTask({
      ...params,
      ...this.getParams(),
    }).then((json) => {
      const cate_map = json.response.category_info
      const quotation_map = json.response.quotation_info
      const order_map = json.response.order_info
      const customer_map = json.response.customer_info

      this.list = _.map(json.response.ssu_sorting_tasks, (ssu) => {
        return {
          ...ssu.ssu!,
          categoryName: cate_map[ssu.ssu?.category_id!],
          // 报价单名称
          quotationName: this.getQuotation(
            ssu.sorting_tasks![0]?.order_id || '',
            quotation_map,
          ),
          _process: this.getProcess(ssu.sorting_tasks!, order_map),
          sub_list: _.map(ssu.sorting_tasks, (order) => {
            const parse = parseSsu(ssu.ssu!)
            // 下单信息
            const orderNumber = this.getUnitNumber(
              order.order_unit_value,
              parse,
            )
            // 出库信息
            const outstock = this.getUnitNumber(
              order.outstock_unit_value!,
              parse,
            )
            const orderInfo = order_map[order.order_id!] || {}
            return {
              ...order,
              ...parse,
              editing: false,
              state: orderInfo.state,
              sorting_num: orderInfo.sorting_num,
              serial_no: orderInfo.serial_no,
              // 商户名
              customerName: this.getCustomer(order.order_id!, customer_map),
              // 出库数
              realQuantity: outstock.pack,
              baseRealQuantity: outstock.base,
              // 下单数
              quantity: orderNumber.pack,
              baseQuantity: orderNumber.base,
            }
          }),
        }
      })
      return json.response
    })
  }

  reset() {
    this.filter = {
      ...initFilter,
      // time_config_id: store.serviceTime[0]._id,
      begin_time: date,
      end_time: date,
    }
  }

  // 报价单列表
  getSaleMenuList() {}

  // 设置出库数
  updateQuantity(skuIndex: any, orderIndex: string, value: string) {}

  /** 更新编辑状态 */
  updateEditing(data: List_OrderDetail, bool: boolean) {
    data.editing = bool
  }

  batchOutStockVerify(list: any[] | null = null) {}

  // 设置批量缺货
  batchOutStock(list: any[] | null = null) {}

  setFilter(field: keyof Filter, value: any) {
    this.filter[field] = value
  }

  updateOrder(skuIndex: number, orderIndex: number, key: any, value: any) {}

  get computedSelectedOrderList() {
    return []
  }

  // -------------------------- 一些工具函数 -----------------------------
  /**
   * 计算单位转换后的数量
   * @return base=基本， pack=包装
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

  /**
   * 获取报价单
   */
  getQuotation(orderId: string, quotationMap, format?: (q: Quotation) => any) {
    if (!format) {
      format = (q) => q.inner_name
    }

    const quotation = quotationMap[orderId]
    if (quotation) {
      return quotation
    }
    return '-'
  }

  /** 获取商户 */
  getCustomer(orderId: string, customerMap, format?: (q: Customer) => any) {
    if (!format) {
      format = (q) => q.name
    }

    const customer = customerMap[orderId]
    if (customer) {
      return format(customer)
    }
    return '-'
  }

  /** 计算分拣进度 */
  getProcess(tasks: OrderDetail[], order_map: any) {
    const len = tasks.length
    const finish = tasks.reduce((t, c) => {
      const order = order_map[c.order_id!]
      const isFinish =
        Big(order.sorting_info?.weight_count || 0).add(
          order.sorting_info?.out_stock_count || 0,
        ) === order.sorting_info?.total_count
      return t + (isFinish ? 1 : 0)
    }, 0)

    return Big(finish)
      .div(len || 1)
      .times(100)
      .toFixed(2)
  }
}

export default new Merchandise()
