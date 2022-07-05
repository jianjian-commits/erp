import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  ListOrder,
  ListOrderRequest_PagingField,
  CommonListOrder,
} from 'gm_api/src/order'
import { Quotation_Type } from 'gm_api/src/merchandise'
interface Filter {
  time_type: number
  begin_time: Date
  end_time: Date
  receive_customer_ids?: string
  search_text?: string
}

interface List {}

class Store {
  filter: Filter = {
    time_type: 1,
    begin_time: moment().startOf('day').toDate(),
    end_time: moment().endOf('day').toDate(),
    receive_customer_ids: undefined,
    search_text: '',
  }

  list: List[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  getParams() {
    const {
      receive_customer_ids,
      begin_time,
      end_time,
      search_text,
      time_type,
    } = this.filter

    const req: CommonListOrder = {
      serial_nos: search_text ? [search_text] : undefined,
      receive_customer_ids: receive_customer_ids
        ? [receive_customer_ids]
        : undefined,
      // quotation_type: Quotation_Type.WITHOUT_TIME, // 过滤按菜谱下单的订单
    }
    if (time_type === 1) {
      req.order_time_from_time = `${+begin_time}`
      req.order_time_to_time = `${+end_time}`
    } else if (time_type === 2) {
      req.order_receive_from_time = `${+begin_time}`
      req.order_receive_to_time = `${+end_time}`
    }

    return req
  }

  fetchOrderList(params?: any) {
    return ListOrder(
      Object.assign(
        {
          common_list_order: this.getParams(),
          need_total_info: true,
          relation_info: {
            need_customer_info: true,
            need_driver_info: true,
            need_user_info: true,
          },
          sort_by: [
            {
              field: ListOrderRequest_PagingField.ORDER_TIME,
              desc: true,
            },
          ],
        },
        { paging: params?.paging },
      ),
    ).then((json) => {
      const { orders, relation_info } = json.response
      this.list = _.map(orders, (order) => ({
        ...order,
        customer_name: relation_info?.customers![order?.receive_customer_id]
          ?.name,
      }))
      return json.response
    })
  }
}

export default new Store()
