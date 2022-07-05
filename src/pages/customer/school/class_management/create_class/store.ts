import { makeAutoObservable } from 'mobx'
import {
  CreateCustomer,
  Customer_Type,
  GetCustomer,
  Customer,
  UpdateCustomer,
} from 'gm_api/src/enterprise'
import { ListStudent, BatchUpdateStudent } from 'gm_api/src/eshop'
import { StudentList } from './interface'
import { getRandomId } from '@/pages/merchandise/util'
import _ from 'lodash'

const initBaseInfo = {
  name: '',
  parent_id: '0',
  customer_id: '0',
  type: Customer_Type.TYPE_CLASS,
  attrs: {
    addresses: [
      {
        receiver: '',
        phone: '',
        address: '0',
      },
    ],
  },
}
class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  baseInfo: Customer = { ...initBaseInfo }

  student_list: StudentList[] = []

  count = '0'

  setBaseInfo(key: string, value: string) {
    _.set(this.baseInfo, key, value)
  }

  updateList(value: string, index: number, key: string) {
    _.set(this.student_list[index], key, value)
  }

  createClass(customer_id: string) {
    this.baseInfo.parent_id = customer_id
    return CreateCustomer({ customer: this.baseInfo })
  }

  getCustomer(customer_id: string) {
    return GetCustomer({ customer_id: customer_id }).then((json) => {
      this.baseInfo = json.response.customer!
    })
  }

  updateCustomer() {
    return UpdateCustomer({ customer: this.baseInfo })
  }

  getListStudent(class_id: string) {
    return ListStudent({
      class_id: class_id,
      paging: { limit: 999, need_count: true },
    }).then((json) => {
      this.count = json.response.paging.count!
      this.student_list = _.map(json.response.students, (item) => {
        return {
          ...item,
          key: getRandomId(),
        }
      })
      return json.response
    })
  }

  updateStudentList() {
    return BatchUpdateStudent({ students: this.student_list })
  }

  init() {
    this.student_list = []
    this.baseInfo = { ...initBaseInfo }
  }
}

export default new Store()
