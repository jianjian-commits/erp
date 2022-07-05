// import { ListSkuStock } from 'gm_api/src/inventory'
import { LocalStorage } from '@gm-common/tool'
import { LevelSelectDataItem, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { PagingResult } from 'gm_api/src/common'
import {
  BatchUpdateTaskStatus,
  DeleteTask,
  ListTask,
  ListTaskResponse,
  ReleaseTask,
  Task,
  Task_ByProduct,
  Task_Operation,
  Task_State,
  Task_TimeType,
  Task_Type,
  UpdateTask,
  UpdateTaskOutput,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { BATCH_OPERATION_MAP } from '../enum'
import type { TableRequestParams } from '../interface'
import { dealOutputTask, getTaskTypes, getUnitInfo } from '../util'
import type { Filter, TaskInfo, TaskSku, TaskSkuInfo } from './interface'

const initFilter: Filter = {
  batch_info: '',
  target_customer_ids: [],
  sku_type: 0,
  state: 0,
  // source: 0,
  processor_ids: [],
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  time_type: Task_TimeType.TIME_TYPE_CREATE,
  q: '',
  serial_no: '',
  processor_selected: [],
  user_selected: [],
  batch: '',
  category_ids: [],
  route: [],
  selected: 1,
  desc: '',
}

// 后台以任务进行定义，前端展示为计划
class Store {
  // 计划列表筛选字段
  filter: Filter = {
    ...initFilter,
  }

  task_selected: string[] = []

  taskList: TaskInfo[] = []

  taskDetails: ListTaskResponse = {
    task_details: [],
    units: {},
    paging: {},
  }

  loading = false

  factoryModalList: LevelSelectDataItem<string>[] = []

  // 标记产出的任务列表 -- 兼容生产任务跟包装任务
  outputTaskList: TaskSkuInfo[] = []

  selectedTask: TaskSkuInfo[] = [] // 保留一份选择的数据

  diyPickModal = false

  paging: PagingResult = { count: '0' }

  /* eslint-disable */
  doRequest = () => {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  init() {
    this.filter = { ...initFilter }
    this.task_selected = []
  }

  setDiyPickModal = (status: boolean) => {
    this.diyPickModal = status
  }

  setFactoryModalList(list: LevelSelectDataItem<string>[]) {
    this.factoryModalList = list
  }

  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  resetFilter() {
    this.filter = { ...initFilter }
  }

  // 修改生产列表项
  updateListColumn<T extends keyof TaskInfo>(
    index: number,
    key: T,
    value: TaskInfo[T],
  ) {
    this.taskList[index][key] = value
  }

  updateSelected(selected: string[]) {
    this.task_selected = selected
  }

  getSearchData(type?: Task_Type) {
    const {
      processor_selected,
      user_selected,
      route,
      selected,
      q,
      serial_no,
      task_type,
      category_ids,
    } = this.filter
    const req = _.omit(this.filter, [
      'task_type',
      'processor_selected',
      'user_selected',
      'batch',
      'spec',
      'search_text',
      'route',
      'q',
      'selected',
      'serial_no',
    ])
    let processor_ids: string[] = []
    // 若当前选择为车间，需要把当前车间下所有小组id传给后台. 选择未分配需要特殊处理
    _.forEach(processor_selected, (p) => {
      if (p[0] === '0') {
        processor_ids.push(p[0])
      } else if (p[1]) {
        processor_ids.push(p[1])
      } else {
        const processor = _.find(
          this.factoryModalList.slice(),
          (m) => m.value === p[0],
        )

        const child_ids = _.map(processor?.children || [], (pro) => pro.value)
        processor_ids = processor_ids.concat(child_ids)
      }
    })
    return {
      ...req,
      q: selected === 1 ? q : '',
      serial_no: selected === 2 ? serial_no : '',
      begin_time: `${+this.filter.begin_time}`,
      end_time: `${+this.filter.end_time}`,
      processor_ids,
      target_customer_ids: _.map(user_selected, (u) => u.value), // 生产对象
      batch_info: this.filter.batch || undefined,
      route_ids: _.map(route, ({ value }) => value),
      need_details: true,
      task_types: getTaskTypes(type ?? task_type),
      category_ids: category_ids?.slice(-1),
    }
  }

  fetchTaskList(params: TableRequestParams, type?: Task_Type) {
    this.loading = true
    const req = Object.assign(
      { paging: params.paging }, // 生产计划
      this.getSearchData(type),
    )
    return ListTask({ ...req })
      .then((json) => {
        const { task_details, units, skus, routes, customers, paging } =
          json.response
        this.taskDetails = {
          task_details: task_details!.slice(),
          units: units || {},
          skus: skus || {},
          paging: paging || {},
        }

        // 获取列表sku的库存信息，目前在途跟冻结库存还有点问题，暂时先hold
        // const res = await ListSkuStock({
        //   paging: { limit: 999 },
        //   sku_ids: _.map(task_details, (task) => task.task.sku_id),
        // })
        // const stock_map = list2Map(res.response.sku_stocks, 'sku_id')

        this.taskList = _.map(task_details, (task) => {
          let sku_type = 0
          const sku = skus && skus[task?.task?.sku_id!]
          if (sku) {
            sku_type = sku.sku?.not_package_sub_sku_type || 0
          }

          const unit_info = getUnitInfo({
            sku_id:
              type !== Task_Type.TYPE_PACK ? undefined : task?.task?.sku_id,
            skus: type !== Task_Type.TYPE_PACK ? undefined : skus,
            unit_id: task?.task?.unit_id || '',
            units: units!,
          })

          // 生产任务直接取sku的单位, 包装任务的单位需要取对应ssu的单位
          const unit_name: string = unit_info.unitName

          // const stock_amount: string =
          //   type !== Task_Type.TYPE_PACK
          //     ? stock_map[task.task.sku_id]?.available_stock?.base_unit
          //         ?.quantity || ''
          //     : ''

          return {
            ...task.task!,
            isEditing: false,
            _plan_amount: task?.task?.plan_amount || '', // 计划生产数
            sku_type,
            unit_name,
            stock_amount: '',
            spec: '',
            unit_info: unit_info,
            router_name: routes![task!.task!.target_route_id!]?.route_name,
            customer_name: customers![task!.task!.target_customer_id!]?.name,
          }
        })
        this.loading = false
        if (params.paging.offset === 0) this.paging = paging
        return json.response
      })
      .catch((err) => {
        Promise.reject(err)
        this.loading = false
      })
  }

  getTaskInfo(index: number) {
    const task = { ...this.taskList[index] }
    const req = _.omit(task, [
      'isEditing',
      '_plan_amount',
      'sku_type',
      'unit_name',
    ])

    return {
      task: {
        ...req,
        plan_amount: task.plan_amount,
        task_id: task.task_id,
      },
      operation: Task_Operation.OPERATION_MODIFY_PLAN_AMOUNT,
    }
  }

  updateTask(index: number) {
    const req = this.getTaskInfo(index)
    return UpdateTask({ ...req }).then((json) => {
      return json
    })
  }

  // fetchFactoryModalList() {
  //   return ListProcessor({ paging: { limit: 999 } }).then((json) => {
  //     // 处理好数据
  //     const { processors } = json.response
  //     const group = _.groupBy(processors, 'parent_id')
  //     const parents = group['0']
  //     this.factoryModalList = (parents || []).map((v) => ({
  //       ...v,
  //       value: v.processor_id,
  //       text: v.name,
  //       children: _.map(group[v.processor_id] || [], (g) => ({
  //         ...g,
  //         value: g.processor_id,
  //         text: g.name,
  //       })),
  //     }))
  //     return null
  //   })
  // }

  batchUpdateTask(
    operationType: string,
    selected: string[],
    isSelectedAll: boolean,
    taskType?: Task_Type,
  ) {
    let filter = {}
    const selectedAllFilter = this.getSearchData(taskType)
    // task_type isRequire, 如果全选则传filter，非全选则传task_ids: []
    if (isSelectedAll) {
      filter = {
        ...selectedAllFilter!,
      }
    } else {
      filter = {
        task_ids: selected,
      }
    }

    // 批量计划
    if (
      BATCH_OPERATION_MAP[operationType] !== Task_Operation.OPERATION_RELEASE
    ) {
      return BatchUpdateTaskStatus({
        filter: {
          ...filter,
          paging: { limit: 100 },
        },
        operation: BATCH_OPERATION_MAP[operationType],
      }).then((json) => {
        Tip.success(t('批量操作成功'))
        this.doRequest()
        return json
      })
    }

    // 下达计划
    // 如果当前选择了自动生成且有领料单类型，则自动生成领料单，否则不生成
    // 自动生成与领料单类型都保存在了localStorage中，为了记住用户的选择
    const autoGenerate = LocalStorage.get('autoGenerate') || false
    const listType = (autoGenerate && LocalStorage.get('listType')) || 0
    return ReleaseTask({
      filter: {
        ...filter,
        task_type: taskType,
        material_list_type: listType,
        paging: { limit: 100 },
      },
    })
  }

  deleteTask(task_id: string) {
    return DeleteTask({ task_id }).then((json) => {
      if (json.response) {
        Tip.success(t('删除成功'))
      }
      this.doRequest()
      return json
    })
  }

  // 处理标记产出的任务数据
  getOutputTaskList(data: Task[], isPack = false) {
    const { units, skus } = this.taskDetails
    const taskSkus: TaskSkuInfo[] = dealOutputTask(
      data,
      isPack,
      units || {},
      skus || {},
    )
    // 过滤掉已完成的计划
    this.outputTaskList = _.filter(
      taskSkus.slice(),
      (t) => t.state !== Task_State.STATE_FINISHED,
    )
    // 保留源选择数据
    this.selectedTask = taskSkus.slice()
  }

  updateOutputTask(isFilter: boolean) {
    if (isFilter) {
      // 过滤掉已完成的计划
      this.outputTaskList = _.filter(
        this.selectedTask,
        (t) => t.state !== Task_State.STATE_FINISHED,
      )
      return
    }
    this.outputTaskList = this.selectedTask.slice()
  }

  updateOutputTaskItem<T extends keyof TaskSku>(
    tIndex: number,
    value: TaskSku[T],
    bIndex: number,
    field: T,
  ) {
    const task: TaskSkuInfo = this.outputTaskList[tIndex]
    task.skus[bIndex][field] = value
    this.outputTaskList[tIndex] = {
      ...task,
    }
  }

  batchUpdateTaskOutput(is_finish: boolean, isPack: boolean) {
    // 生产任务成品 -- 直接取output_amount
    // 包装任务成品 -- 需要包装单位与基本单位, 副产品取基本单位
    const tasks = _.map(this.outputTaskList, (t) => {
      const by_products: Task_ByProduct[] = _.map(t?.skus?.slice(1), (b) => {
        return {
          sku_id: b.sku_id,
          sku_name: b.sku_name,
          output_amount: isPack
            ? b.pack_base_output_amount || ''
            : b.output_amount || '',
          unit_id: b.unit_id,
          plan_amount: b.plan_amount || '',
        }
      })

      // 包装任务需要 base_unit_output_amount
      let pack_obj: {
        output_amount?: string
        base_unit_output_amount?: string
      } = {}
      if (isPack) {
        pack_obj = {
          output_amount: t.skus[0].pack_output_amount || '',
          base_unit_output_amount: t.skus[0].pack_base_output_amount || '',
        }
      }

      return {
        ...t.original,
        // 成品只有一个且在第一个
        output_amount: t.skus[0].output_amount || '',
        by_products: { by_products },
        task_id: t.task_id,
        ...pack_obj,
      }
    })

    // 生产计划合并后不需要传task_type
    return UpdateTaskOutput({
      is_finish,
      tasks,
      task_type: isPack ? Task_Type.TYPE_PACK : undefined,
    }).then((json) => {
      this.doRequest() // 更新列表
      Tip.success(t('操作产出成功！'))
      return json
    })
  }

  /**
   * 计划作废（删除）
   */
  invalidateTask(index: number) {
    const taskInfo = this.getTaskInfo(index)
    const invalidTask = {
      ...taskInfo,
      operation: Task_Operation.OPERATION_VOID,
    }
    return UpdateTask(invalidTask).then((json) => {
      this.doRequest() // 作废计划后更新列表
      Tip.success(t('作废计划成功！'))
      return json
    })
  }
}

export default new Store()
