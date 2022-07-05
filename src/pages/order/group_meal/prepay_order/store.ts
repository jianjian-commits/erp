import { makeAutoObservable, toJS } from 'mobx'
import _ from 'lodash'
import {
  ListAdvancedOrder,
  AdvancedOrder_State,
  AdvancedOrder,
  ListAdvancedOrderRequest,
  DeleteAdvancedOrder,
  ExportListAdvancedOrder,
  RefundAdvancedOrder,
  Cycle,
} from 'gm_api/src/eshop'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'

const initFilter = {
  q: '',
  meal_date_start: '',
  meal_date_end: '',
  cycle: 1,
  school_id: '0',
  class_id: '0',
  states: [AdvancedOrder_State.STATE_UNSPECIFIED],
  need_student: true,
  need_parent: true,
  need_total_info: true,
}

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter: Omit<ListAdvancedOrderRequest, 'paging'> = _.cloneDeep(initFilter) // 头部过滤

  list: AdvancedOrder[] = [] // 列表list

  selected: string[] = [] // 选中的select

  /** 分页数据 */
  paging = _.cloneDeep(initPaging)

  customers: any[] = []

  count = '0'
  total_count = '0'

  // isAllSelected = false

  setSelected(selected: string[]) {
    this.selected = selected
  }

  // setIsAllSelected(bool: boolean) {
  //   this.isAllSelected = bool
  // }

  getPrepayOrder(params?: any) {
    if (params?.paging) {
      this.paging = params.paging
    }
    let filter_params = _.omit(this.filter, 'cycle')
    if (filter_params?.states?.[0] === 0) {
      filter_params = { ..._.omit(filter_params, 'states') }
    }
    if (
      filter_params.meal_date_start === '' ||
      filter_params.meal_date_end === ''
    ) {
      filter_params = {
        ..._.omit(filter_params, 'meal_date_start', 'meal_date_end'),
      }
    }
    return ListAdvancedOrder({ ...filter_params, paging: this.paging }).then(
      (json) => {
        this.list = json.response.advanced_orders!
        this.count = json.response.order_count || '0'
        this.total_count = json.response.total_amount || '0'
        this.selected = []
        return json.response
      },
    )
  }

  setFilter(key: string, value: string | Cycle | string[]) {
    _.set(this.filter, key, value)
  }

  updateFilter() {
    this.filter = { ...this.filter }
  }

  setFilterName(key: string, value: string) {
    _.set(this.filter, key, value)
  }

  // 获取班级
  getCurstomerList() {
    return ListCustomer({
      level: 1,
      paging: { limit: 999 },
      need_child_customers: true, // 返回学校的班级
      type: Customer_Type.TYPE_SCHOOL,
    }).then((json) => {
      const { customers, child_customer_relation, child_customers } =
        json.response
      if (customers && child_customer_relation) {
        const _customers = _.map(customers, (_school) => {
          return {
            title: _school?.name!,
            value: _school?.customer_id!,
            key: _school?.customer_id!,
            parentId: _school.parent_id!,
            children: _.map(
              child_customer_relation[_school?.customer_id!]?.values,
              (class_id) => {
                const _class = child_customers[class_id]
                return {
                  value: _class?.customer_id!,
                  title: _class?.name!,
                  key: _class?.customer_id!,
                  parentId: _class.parent_id!,
                }
              },
            ),
          }
        })
        this.customers = _customers
      }
    })
  }

  exportList() {
    let filterParmas = this.filter
    if (this.filter?.states?.[0] === 0) {
      filterParmas = { ..._.omit(this.filter, 'states') }
    }
    if (this.filter.states)
      return ExportListAdvancedOrder({ ...filterParmas }).then(() => {
        globalStore.showTaskPanel('1')
      })
  }

  // 删除
  deleteAdvance(id: string) {
    return DeleteAdvancedOrder({ advanced_order_id: id })
  }

  // 退款
  refunAdvance(id: string) {
    return RefundAdvancedOrder({ advanced_order_id: id })
  }

  // 删除更多
  moreDeleteAdvance() {
    return DeleteAdvancedOrder({ advanced_order_ids: this.selected })
  }

  init() {
    this.filter = { ...initFilter }
  }
}

export default new Store()
