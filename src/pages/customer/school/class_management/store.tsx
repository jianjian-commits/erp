import { makeAutoObservable } from 'mobx'
import {
  ListCustomer,
  Customer_Type,
  Customer,
  DeleteCustomer,
} from 'gm_api/src/enterprise'
import _ from 'lodash'
import { DataNode, FilterOption } from './interface'

const initFilter = {
  customer_ids: [],
}

class ListStore {
  filter: FilterOption = {
    ...initFilter,
  }

  customers: any[] = []

  count = 0
  schoolList: DataNode[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 修改filter
  updateFilter<T extends keyof FilterOption>(key: T, value: FilterOption[T]) {
    this.filter[key] = value
  }

  // 获取学校的列表
  fetchSchoolList() {
    const req =
      this.filter.customer_ids.length === 0
        ? Object.assign(
            { paging: { limit: 999 } },
            { need_child_customers: true },
            {
              level: 1,
              type: Customer_Type.TYPE_SCHOOL,
              customer_ids: this.filter.customer_ids,
            },
          )
        : Object.assign(
            { paging: { limit: 999 } },
            { need_child_customers: true },
            {
              customer_ids: this.filter.customer_ids,
            },
          )

    return ListCustomer(req).then((json) => {
      const { customers, child_customers, child_customer_relation } =
        json.response
      const _customers = _.map(customers, (_school) => {
        return {
          ..._school,
          title: _school?.name,
          level: '' + _school?.level,
          key: _school?.customer_id,
          children: _.map(
            child_customer_relation?.[_school?.customer_id]?.values,
            (class_id) => {
              const _class = child_customers[class_id]
              return {
                ..._class,
                key: _class?.customer_id,
                title: _class?.name,
                level: '' + _class?.level,
              }
            },
          ),
        }
      })
      this.count = _customers.length
      this.schoolList = _customers
    })
  }

  deleteCustomer(id: string) {
    return DeleteCustomer({ customer_id: id })
  }

  getCurstomer() {
    ListCustomer({
      level: 1,
      paging: { limit: 999 },
      need_child_customers: true, // 返回学校的班级
      type: Customer_Type.TYPE_SCHOOL,
    }).then((json) => {
      const { customers, child_customers, child_customer_relation } =
        json.response

      const _customers = _.map(customers, (_school) => {
        return {
          ..._school,
          label: _school?.name,
          value: _school?.customer_id,
          children: _.map(
            child_customer_relation?.[_school?.customer_id]?.values,
            (class_id) => {
              const _class = child_customers[class_id]
              return {
                ..._class,
                value: _class?.customer_id,
                label: _class?.name,
              }
            },
          ),
        }
      })
      this.customers = _customers
    })
  }

  init() {
    this.filter = { ...initFilter }
  }
}

export default new ListStore()
