import { handleTaskDetail } from '@/pages/production/plan_management/plan/util'
import { getTaskTypes } from '@/pages/production/util'
import { Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import {
  ListTask,
  ListTaskRequest_ViewType,
  Task,
  Task_Operation,
  Task_State,
  Task_Type,
  UpdateTask,
  UpdateTaskRequest,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { Filter, TaskDetailsView } from './interface'
import planStore from '@/pages/production/plan_management/plan/store'
import { Filters_Bool, PagingParams } from 'gm_api/src/common'
import {
  ListTaskViewName,
  OmitViewType,
} from '@/pages/production/plan_management/plan/demand/enum'

const initFilter: Filter = {
  view_type: ListTaskRequest_ViewType.VIEW_TYPE_ORIGINAL,
  q: '',
  serial_no: '',
  task_type: Task_Type.TYPE_UNSPECIFIED,
  category_ids: [],
  state: Task_State.STATE_UNSPECIFIED,
  sku_type: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
  customerIds: [],
  routeIds: [],
  batch_info: '',
  selected: 1,
  is_finishe_product: Filters_Bool.ALL,
  skuSelect: [],
}

class Store {
  filter: Filter = { ...initFilter }
  taskDetailsView: TaskDetailsView[] = []

  /** 修改每一项的数据 key为id */
  taskDetails: Record<string, TaskDetailsView> = {}
  /** 用于清空列表选择项 */
  fetchDataNumber = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  // 修改生产列表项
  updateListColumn<T extends keyof TaskDetailsView>(
    taskId: string,
    key: T,
    value: TaskDetailsView[T],
  ) {
    this.taskDetails[taskId][key] = value
  }

  getTaskInfo(taskId: string, idsDelete?: boolean): UpdateTaskRequest {
    const task = { ...this.taskDetails[taskId] }
    const req = _.omit(task, [
      'isEditing',
      '_plan_amount',
      'sku_type',
      'unit_name',
      'releaseTime',
    ]) as Task

    return {
      task: {
        ...req,
      },
      operation: idsDelete
        ? Task_Operation.OPERATION_VOID
        : Task_Operation.OPERATION_MODIFY_PLAN_AMOUNT,
    }
  }

  updateTask(taskId: string, isDelete?: boolean) {
    const req = this.getTaskInfo(taskId, isDelete)
    return UpdateTask({ ...req }).then((json) => {
      return json
    })
  }

  init(holdView?: boolean) {
    this.filter = Object.assign(
      initFilter,
      holdView ? { view_type: this.filter.view_type } : undefined,
    )
    this.taskDetailsView = []
    this.taskDetails = {}
    this.fetchDataNumber = 0
  }

  afterFetch() {
    this.taskDetailsView = []
    this.fetchDataNumber += 1
  }

  getSearchData() {
    const {
      skuSelect,
      serial_no,
      selected,
      task_type,
      category_ids,
      routeIds,
      customerIds,
      batch,
      ...req
    } = this.filter
    const { productionOrderId, isProduce } = planStore.producePlanCondition

    return {
      ...req,
      skuIds: selected === 1 ? _.map(skuSelect, ({ value }) => value) : [],
      serial_no: selected === 2 ? serial_no : '',
      need_details: true,
      task_types: isProduce ? getTaskTypes(task_type) : [Task_Type.TYPE_PACK],
      category_ids: _.map(category_ids, (v) => v.slice(-1)[0]),
      target_customer_ids: _.map(customerIds, (u) => u.value),
      route_ids: _.map(routeIds, ({ value }) => value),
      production_order_ids: [productionOrderId],
      batch_info: batch?.value === -1 ? '!#' : batch?.text,
    }
  }

  fetchTaskList(paging: { paging: PagingParams }) {
    const { productionOrderId } = planStore.producePlanCondition
    this.afterFetch()
    const params = { ...this.getSearchData(), ...paging }
    return ListTask({ ...params }).then((res) => {
      // 防止点击过快导致数据错乱
      if (productionOrderId !== params.production_order_ids[0]) return
      let taskDetails = {}
      const { view_type } = params
      const isDemand = view_type === ListTaskRequest_ViewType.VIEW_TYPE_ORIGINAL
      const { task_detail_vos } = res.response
      const taskDetailViewData = _.map(task_detail_vos, (viewItem, index) => {
        const { task_details, title } = viewItem
        const children = _.map(task_details, (detailItem) => {
          const data = handleTaskDetail({
            task_detail: detailItem,
            info: res.response,
          })
          taskDetails = {
            ...taskDetails,
            [detailItem.task?.task_id!]: { ...data, isEditing: false },
          }
          return data
        })
        return {
          key: index,
          /** 子母表 */
          title: title || ListTaskViewName[view_type!],
          skuName: OmitViewType.includes(view_type!) ? '' : title,
          children,
        }
      })
      this.taskDetails = taskDetails
      this.taskDetailsView = isDemand
        ? taskDetailViewData?.[0]?.children
        : taskDetailViewData
      return res.response
    })
  }

  // 服务规划需求
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }
}

export default new Store()
