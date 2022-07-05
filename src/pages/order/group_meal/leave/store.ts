import { makeAutoObservable, toJS } from 'mobx'
import moment, { Moment } from 'moment'
import {
  ListLeaveOrder,
  LeaveOrder,
  GetLeaveMenuPeriod,
  BatchCreateLeaveOrder,
  MenuPeriodIds,
  DeleteLeaveOrder,
  ExportLeaveOrder,
  Student,
  ListLeaveOrderRequest,
  ExportLeaveOrderRequest,
} from 'gm_api/src/eshop'
import _ from 'lodash'
import { Filter, MenuPeriod, MenuPeriodsMap } from './interface'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { message } from 'antd'
import { t } from 'gm-i18n'
const initFilter = {
  student_name: '',
  leave_order_ids: [],
  school_id: '0',
  class_id: '0',
  leave_date_start: null,
  leave_date_end: null,
}

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

const initLeaveParams = {
  class_id: '',
  leave_date_start: moment().startOf('day'),
  leave_date_end: moment().endOf('day'),
  remark: '',
}
class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  menu_period_map: MenuPeriodsMap[] = []
  // 请假筛选字段
  filter: Filter = {
    ...initFilter,
  }

  paging = _.cloneDeep(initPaging)
  // 请假列表
  leave_list: LeaveOrder[] = []

  count = '0'

  // 班级信息
  customers: any[] = []

  // 餐次信息
  menu_period: MenuPeriod = {}

  // 选中的请假餐次
  leave_info: Record<string, MenuPeriodIds> = {}

  // 选中的select
  selected: string[] = []

  // modal的参数
  leave_params: {
    class_id: string
    leave_date_start: Moment | Date | null
    leave_date_end: Moment | Date | null
    remark: string
  } = {
    ...initLeaveParams,
  }

  student_map: Record<string, Student> = {} // 学生信息

  // 修改选中的请假餐次
  setLeaveInfo(params: { [key: string]: MenuPeriodIds }) {
    this.leave_info = params
  }

  setSelected(selected: string[]) {
    this.selected = selected
  }

  // 获取到对应的时间餐次
  getLeaveMenu() {
    return GetLeaveMenuPeriod({
      start_date: '' + this.leave_params.leave_date_start,
      end_date: '' + this.leave_params.leave_date_end,
      class_id: this.leave_params.class_id,
    }).then((json) => {
      const { menu_period_map, menu_period_info } = json.response
      this.menu_period = menu_period_info!
      const keys = _.keys(menu_period_map).sort()
      const value = _.values(menu_period_map!)
      if (value.length > 0) {
        this.menu_period_map = keys.map((item) => {
          return {
            [item]: menu_period_map?.[item]!,
          }
        })
      } else {
        this.menu_period_map = []
      }
    })
  }

  // 获取餐次
  // getMeal() {
  //   ListEshopMenuPeriodGroup({
  //     paging: { limit: 999 },
  //     type: MenuPeriodGroup_Type.ESHOP,
  //   }).then((json) => {
  //     const { menu_period_groups } = json.response
  //     if (menu_period_groups) {
  //       const changeData = () => {
  //         return _.map(menu_period_groups, (item) => ({
  //           menu_period_group_id: item.menu_period_group_id,
  //           name: item.name,
  //         }))
  //       }
  //       this.menu_period = changeData()
  //     }
  //   })
  // }

  // 验证新建参数
  verify() {
    if (_.get(this.leave_params, 'class_id') === '') {
      message.error(t('请选择班级'))
      return false
    }
    if (_.keys(this.leave_info).length === 0) {
      message.error(t('请选择请假餐次'))
      return false
    }
    return true
  }

  // 新建请假
  createLeave() {
    const params = {
      ...this.leave_params,
      leave_date_start:
        '' + moment(this.leave_params.leave_date_start).toDate().getTime(),
      leave_date_end:
        '' + moment(this.leave_params.leave_date_end).toDate().getTime(),
      leave_info: this.leave_info,
    }
    return BatchCreateLeaveOrder(params)
  }

  // 获取列表
  fetchList(params?: any) {
    if (params) {
      this.paging = params.paging
    }
    let filterParmas = this.filter

    if (
      filterParmas.leave_date_start === null ||
      filterParmas.leave_date_end === null
    ) {
      filterParmas = {
        ..._.omit(filterParmas, 'leave_date_start', 'leave_date_end'),
      }
    }
    return ListLeaveOrder({
      ...filterParmas,
      paging: this.paging,
    } as ListLeaveOrderRequest).then((json) => {
      const { leave_orders, student_map, paging } = json.response
      this.leave_list = leave_orders
      this.student_map = student_map!
      if (this.paging.offset === 0) {
        this.count = paging.count!
      }
      this.selected = []
      return json.response
    })
  }

  // 更改filter
  setFilter(params: Filter) {
    this.filter = { ...params }
  }

  updateFilter() {
    this.filter = { ...this.filter }
  }

  // 修改batchModal的参数
  setLeaveParams(value: any) {
    this.leave_params = value
  }

  // 修改filter的name不触发接口调用
  setFilterName(name: string) {
    this.filter.student_name = name
  }

  // 获取班级
  getCurstomerMenu() {
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

  // 删除请假单
  deleteLeave(leave_order_id: string) {
    return DeleteLeaveOrder({ leave_order_ids: [leave_order_id] })
  }

  // 删除更多
  moreDeleteLeave() {
    return DeleteLeaveOrder({ leave_order_ids: this.selected })
  }

  // 导出
  exportLeave() {
    let filterParmas = this.filter
    if (
      this.filter.leave_date_start === null ||
      this.filter.leave_date_end === null
    ) {
      filterParmas = _.omit(this.filter, 'leave_date_start', 'leave_date_end')
    }

    return ExportLeaveOrder({
      leave_order_filter: { ...filterParmas, paging: { limit: 999 } },
    } as ExportLeaveOrderRequest).then(() => {
      globalStore.showTaskPanel()
    })
  }

  // 初始化filter的参数
  init() {
    this.filter = { ...initFilter }
    this.leave_params = { ...initLeaveParams }
    this.menu_period_map = []
    this.leave_info = {}
    this.selected = []
  }

  initModal() {
    this.leave_info = {}
    this.leave_params = { ...initLeaveParams }
  }
}

export default new Store()
