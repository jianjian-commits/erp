import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import { Customer_Type } from 'gm_api/src/enterprise'
import {
  ListEshopOrder,
  ListEshopOrderRequest,
  Order,
  UpdateEshopOrder,
  Order_State,
  ListEshopOrderRequest_PagingField,
} from 'gm_api/src/order'
import {
  ExportEshopOrder,
  BatchUpdateEshopOrderState,
  ListMenuPeriodGroup,
  MenuPeriod,
  MenuPeriodGroup,
} from 'gm_api/src/eshop'
import { FilterProps } from '../interface'
import { handleOrderInfo } from './util'

const initFilter = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  search_text: '',
  search_type: 1, // 输入框搜索类型  1-order_nos 2-student_name 3-parents_name
  school_ids: [],
  class_ids: [],
  menu_period_group_id: '',
  state: Order_State.STATE_NOT_PRODUCE,
}

interface MenuPeriodGroup_ extends MenuPeriodGroup {
  value: string
  text: string
}

class OrderStore {
  filter: FilterProps = initFilter

  list: Order[] = []

  menuPeriodList: MenuPeriodGroup_[] = []

  customer_type = Customer_Type.TYPE_VIRTUAL_STUDENT

  summary = {
    count: 0,
    total_order_price: 0,
  }

  relation_info = {}

  // 批量删除备注
  remark: string = ''

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeFilter<T extends keyof FilterProps>(name: T, value: FilterProps[T]) {
    this.filter[name] = value
  }

  getServicePeriodList() {
    return ListMenuPeriodGroup({
      paging: { limit: 999 },
    }).then((json) => {
      this.menuPeriodList = _.map(
        json.response.menu_period,
        (item: MenuPeriod) => {
          return {
            ...item.menu_period_group,
            value: item.menu_period_group.menu_period_group_id || '',
            text: item.menu_period_group.name || '',
          }
        },
      )
      return json
    })
  }

  get getFilter() {
    const {
      begin,
      end,
      class_ids,
      school_ids,
      menu_period_group_id,
      state,
      search_type,
      search_text,
    } = this.filter
    const filter: ListEshopOrderRequest = {
      common_list_order: {
        order_receive_from_time: '' + moment(begin).format('x'),
        order_receive_to_time: '' + moment(end).format('x'),
      },
      class_ids,
      school_ids,
      need_delete_order: true,
      need_total_info: true,
      customer_type: this.customer_type,
      paging: { limit: 10 },
      sort_by: [
        {
          field: ListEshopOrderRequest_PagingField.ORDER_TIME,
          desc: true,
        },
      ],
      relation_info: {
        need_customer_info: true,
        need_quotation_info: true,
        need_sku_info: true,
        need_driver_info: true,
        need_user_info: true,
        need_sales_group_user_info: true,
      },
    }

    if (menu_period_group_id) {
      filter.common_list_order.menu_period_group_ids = [menu_period_group_id]
    }
    if (state) {
      filter.common_list_order.states = [state]
    }
    if (this.customer_type === Customer_Type.TYPE_VIRTUAL_STUDENT) {
      if (search_text) {
        if (search_type === 1) {
          filter.common_list_order.serial_nos = [search_text]
        } else if (search_type === 2) {
          filter.student_name = search_text
        } else if (search_type === 3) {
          filter.parents_name = search_text
        }
      }
    } else {
      if (search_text) {
        if (search_type === 1) {
          filter.common_list_order.serial_nos = [search_text]
        } else if (search_type === 2) {
          filter.teaching_staff_name = search_text
        }
      }
    }
    return filter
  }

  fetchList(params?: any) {
    return ListEshopOrder({
      ...this.getFilter,
      paging: params?.paging,
    }).then((json) => {
      this.list = _.map(json.response.orders || [], (order) => {
        return handleOrderInfo(
          order,
          json.response.relation_info,
          this.menuPeriodList,
        )
      })
      this.summary = {
        count: json.response.paging?.count,
        total_order_price: json.response?.total_order_price,
      }
      this.relation_info = json.response.relation_info
      return json.response
    })
  }

  export() {
    return ExportEshopOrder({
      filter: {
        ...this.getFilter,
        paging: { all: true, limit: 0 },
      },
    })
  }

  cancelOrder(index: number) {
    return UpdateEshopOrder({
      order: { ...this.list[index], state: Order_State.STATE_DELETE },
    })
  }

  setCustomerType(customer_type: number) {
    this.customer_type = customer_type
  }

  changeRemark(index: number, remark: string) {
    const list = this.list
    list[index].remark = remark
    this.list = list
  }

  batchDeleteOrder(selected: string[], isSelecedAll: boolean) {
    let filter: ListEshopOrderRequest = {
      common_list_order: {},
      paging: { limit: 0 },
    }
    if (isSelecedAll) {
      filter = { ...this.getFilter, paging: { all: true, limit: 0 } }
    } else {
      Object.assign(filter, {
        ...this.getFilter,
        paging: { all: true },
        common_list_order: {
          ...this.getFilter.common_list_order,
          serial_nos: selected,
        },
      })
    }
    return BatchUpdateEshopOrderState({
      filter,
      to_set_state: Order_State.STATE_DELETE,
      remark: this.remark,
    })
  }

  changeBatchRemark(remark: string) {
    this.remark = remark
  }

  clearFilter() {
    this.filter.class_ids = []
    this.filter.school_ids = []
  }

  init() {
    this.filter = { ...initFilter }
    this.list = []
    this.menuPeriodList = []
    this.customer_type = Customer_Type.TYPE_VIRTUAL_STUDENT
    this.summary = {
      count: 0,
      total_order_price: 0,
    }
    this.relation_info = []
    this.remark = ''
  }
}

export default new OrderStore()
