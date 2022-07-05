import { makeAutoObservable } from 'mobx'
import { ListCustomer, Customer_Type, Customer } from 'gm_api/src/enterprise'
import _ from 'lodash'

export interface Customer_MoreSelect extends Customer {
  value: string
  text: string
  children?: Customer_MoreSelect[]
}
export interface SelectedOptions {
  school_ids: string[]
  class_ids: string[]
  schoolId_map_classIds?: { [key: string]: any }
}

export interface FilterOption {
  student_name: string
  parent_name: string
  select: SelectedOptions
}

class Store {
  filter: FilterOption = {
    student_name: '',
    parent_name: '',
    select: {
      school_ids: [],
      class_ids: [],
      schoolId_map_classIds: {},
    },
  }

  student_info_list: Customer[] = []

  count = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  _updateFilter<T extends keyof FilterOption>(key: T, value: FilterOption[T]) {
    this.filter[key] = value
  }

  reSetFilter() {
    this.filter.parent_name = ''
    this.filter.student_name = ''
  }

  fetchStudentList(params?: any) {
    const { select, student_name, parent_name } = this.filter
    const { school_ids, class_ids, schoolId_map_classIds } = select
    let parent_ids: string[] = []
    // 选择学校，再选择班级的情况
    if (class_ids.length) {
      parent_ids = class_ids
      // 只选择学校的情况，获取所选择的学校所有班级
    } else {
      school_ids.length &&
        schoolId_map_classIds &&
        _.forEach(school_ids, (item) => {
          parent_ids.push(...schoolId_map_classIds[item])
        })
    }

    return ListCustomer({
      type: Customer_Type.TYPE_VIRTUAL_STUDENT,
      paging: { ...params.paging },
      parent_ids,
      q: student_name || parent_name,
    }).then((json) => {
      const { customers, paging } = json.response
      if (customers) {
        this.student_info_list = customers
      }
      if (paging?.count) {
        this.count = paging?.count
      }
      return json.response
    })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }
}

export default new Store()
