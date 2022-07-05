import { PagingResult } from 'gm_api/src/common'
import { GetManySkuResponse_SkuInfo } from 'gm_api/src/merchandise'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'
import {
  GetSkuUnitRate,
  GetSkuUnitRateRequest_SkuUnitIdGroup,
  ListProcessor,
  ListProcessTask,
  ListProcessTaskFilter,
  ProcessTaskDetail,
  ProcessTask_State,
  ProduceType,
  SplitProcessTask,
  UpdateProcessTask,
  UpdateProcessTaskState,
  ProcessTask_Material,
  UpdateProcessTaskCommandOutputActualAmountRequest_OperationSource,
  BatchUpdateProcessTaskCommandOutputActualAmount,
  UpdateProcessTaskCommandOutputActualAmountRequest,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { TASK_COMMAND_SELECT_TYPE } from '@/pages/production/enum'
import type { TableRequestParams } from '@/pages/production/interface'
import {
  getProcessPickMain,
  getProduceTypes,
  numMultiple,
} from '@/pages/production/util'
import type {
  TaskSku,
  TaskSkuInfo,
  CascaderAndSelectOptions,
  FilterType,
  MapProcessTaskDetail,
  ProcessTaskMoreDetail,
  SplitTaskType,
  OutPutTasksType,
  MoreSelectDataItem,
} from './interface'
import globalStore from '@/stores/global'
import planStore from '../store'
import { SingleValueType } from 'rc-cascader/lib/Cascader'
import { numMinus } from '@/pages/production/plan_management/plan/util'

const initFilter: FilterType = {
  state: 0,
  target_customer_id: undefined,
  target_route_id: undefined,
  processor_ids: undefined,
  process_template_id: undefined,
  select_type: TASK_COMMAND_SELECT_TYPE.outPut,
}

const initSplitTask: SplitTaskType = {
  _plan_amount: null,
  plan_amount: 0,
  state: ProcessTask_State.STATE_PREPARE,
  processor: '0',
}

class Store {
  filter: FilterType = { ...initFilter }
  list: MapProcessTaskDetail[] = []
  splitTask: SplitTaskType[] = []
  selectAll = false
  selectedRowKeys: string[] = []
  count = 0
  input_sku_ids_list: MoreSelectDataItem[] = []
  output_sku_ids_list: MoreSelectDataItem[] = []
  factoryData: SingleValueType[] = []
  batch: { value: number; text: string } = { value: 0, text: t('全部') }
  // todo  兼容antd和gm-kcSelect
  factoryModalList: CascaderAndSelectOptions<string>[] = []
  skuList: { [key: string]: GetManySkuResponse_SkuInfo } = {}
  OutputTaskList: TaskSkuInfo[] = []
  selectedTask: TaskSkuInfo[] = [] // 保留一份选择的数据
  paging: PagingResult = { count: '0' }
  setselectAll(selectAll: boolean) {
    this.selectAll = selectAll
  }

  setfactoryData(factoryData: SingleValueType[]) {
    this.factoryData = factoryData
  }

  setInitData() {
    this.setselectAll(false)
    this.setSelectedRowKeys([])
  }

  setSelectedRowKeys(selectedRowKeys: string[]) {
    this.selectedRowKeys = selectedRowKeys
  }

  setInput_sku_ids_list(input_sku_ids_list: MoreSelectDataItem[]) {
    this.input_sku_ids_list = input_sku_ids_list
  }

  setOutput_sku_ids_list(output_sku_ids_list: MoreSelectDataItem[]) {
    this.output_sku_ids_list = output_sku_ids_list
  }

  // 打印弹窗显示状态
  showPrintModal: Partial<{
    [key in ProduceType]: boolean
  }> = {
    [ProduceType.PRODUCE_TYPE_CLEANFOOD]: false,
    [ProduceType.PRODUCE_TYPE_DELICATESSEN]: false,
    [ProduceType.PRODUCE_TYPE_PACK]: false,
  }

  diyPickModal = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof FilterType>(name: T, value: FilterType[T]) {
    this.filter[name] = value
    this.setInitData()
  }

  updateProcessTaskInfo<T extends keyof MapProcessTaskDetail>(
    index: number,
    key: T,
    value: MapProcessTaskDetail[T],
  ) {
    this.list[index][key] = value
  }

  setShowPrintModal = (key: ProduceType, status: boolean) => {
    this.showPrintModal[key] = status
  }

  setDiyPickModal = (status: boolean) => {
    this.diyPickModal = status
  }

  // 开始任务 && 标记完工
  batchUpdateTask(
    isSelectAll: boolean,
    process_task_ids: string[],
    state: ProcessTask_State,
  ) {
    const { productionOrderId: production_order_id, isProduce } =
      planStore.producePlanCondition
    const produce_types = isProduce
      ? [
          ProduceType.PRODUCE_TYPE_DELICATESSEN,
          ProduceType.PRODUCE_TYPE_CLEANFOOD,
        ]
      : [ProduceType.PRODUCE_TYPE_PACK]
    // isSelectAll是表示全选的位置
    const filter = isSelectAll
      ? {
          production_order_id,
          produce_types,
        }
      : {
          production_order_id,
          process_task_ids,
          produce_types,
        }
    if (!process_task_ids) return
    return UpdateProcessTaskState({
      filter,
      state,
    })
  }

  init() {
    this.resetFilter()
    this.list = []
    this.diyPickModal = false
    this.showPrintModal = {
      [ProduceType.PRODUCE_TYPE_CLEANFOOD]: false,
      [ProduceType.PRODUCE_TYPE_DELICATESSEN]: false,
      [ProduceType.PRODUCE_TYPE_PACK]: false,
    }
  }

  resetFilter() {
    this.filter = { ...initFilter }
    this.count = 0
    this.input_sku_ids_list = []
    this.output_sku_ids_list = []
  }

  getSearchTaskData(type?: ProduceType): ListProcessTaskFilter {
    const {
      process_template_id,
      processor_ids,
      target_customer_id,
      target_route_id,
      select_type,
      serial_no,
      input_sku_ids,
      output_sku_ids,
      produce_type,
      batch,
      ...other
    } = this.filter
    const data = {
      target_customer_id: target_customer_id?.value,
      processor_ids: _.map(processor_ids, (v) =>
        v.length >= 2 ? v[1] : v[0],
      ) as string[],
      process_template_id: process_template_id?.value,
      target_route_id: target_route_id?.value,
      produce_types: getProduceTypes(type ?? produce_type),
      serial_no:
        select_type === TASK_COMMAND_SELECT_TYPE.serialNo ? serial_no : '',
      input_sku_ids:
        select_type === TASK_COMMAND_SELECT_TYPE.inPut ? input_sku_ids : [],
      output_sku_ids:
        select_type === TASK_COMMAND_SELECT_TYPE.outPut ? output_sku_ids : [],
      batch: batch?.value === -1 ? '!#' : batch?.text,
      production_order_id: planStore.producePlanCondition.productionOrderId,
      ...other,
    }
    return data
  }

  getSearchCommandData() {
    return _.map(
      _.filter(this.splitTask, ({ _plan_amount }) => !!_plan_amount),
      ({ _plan_amount, processor }) => ({
        plan_amount: '' + _plan_amount,
        processor,
      }),
    )
  }

  fetchProcessTaskList(params: TableRequestParams, type?: ProduceType) {
    const req = Object.assign(
      { filter: this.getSearchTaskData(type) },
      {
        paging: params.paging,
      },
    )
    return ListProcessTask(req).then(async (json) => {
      if (params.paging.offset === 0) {
        this.count = Number(json.response.paging.count) || 0
      }
      let rate: string[]
      const { skus, routes, customers, paging, process_task_details } =
        json.response
      this.skuList = skus!
      if (
        type === ProduceType.PRODUCE_TYPE_PACK &&
        process_task_details?.length
      )
        rate = await this.fetchRateList(process_task_details)
      this.list = _.map(
        process_task_details,
        ({ process_task, ...other }, index) => ({
          key: process_task!.process_task_id,
          process_task_id: process_task!.process_task_id,
          processor: process_task?.processor!,
          packRate: rate?.[index],
          ssuInfo:
            type === ProduceType.PRODUCE_TYPE_PACK
              ? getProcessPickMain(process_task!, skus!)
              : undefined,
          // 包装计划下的单位
          process_task: Object.assign(process_task, {
            routerName: routes![process_task?.target_route_id!]?.route_name,
            customerName: customers![process_task?.target_customer_id!]?.name,
          }) as ProcessTaskMoreDetail,
          splitPrepareList: _.filter(other.process_task_commands, {
            state: ProcessTask_State.STATE_PREPARE,
          }),
          edit: false,
          ...other,
        }),
      )
      if (params.paging.offset === 0) this.paging = paging
      return json.response
    })
  }

  // 筛选条件为最后一道工序 && process_task_id符合
  handleBatchOutput = (selected: string[]) => {
    const dealTasks: OutPutTasksType[] = []
    const selectedTasks =
      this.list?.filter((task) => {
        if (
          task.process_task.is_task_last_process &&
          selected.indexOf(task.process_task_id) !== -1 &&
          task.process_task.state !== ProcessTask_State.STATE_PREPARE
        ) {
          return true
        }
        return false
      }) || []
    _.each(selectedTasks, (selectedTask) => {
      const {
        process_task_commands,
        packRate,
        process_task,
        processor,
        ssuInfo,
        process_task_relations,
      } = selectedTask
      _.each(process_task_commands, (process_task_command) => {
        dealTasks.push({
          process_task_command,
          processor,
          ssuInfo,
          process_task,
          process_task_relations,
          packRate,
        })
      })
    })
    return dealTasks
  }

  fetchRateList(processTaskDetail?: ProcessTaskDetail[]) {
    const data: GetSkuUnitRateRequest_SkuUnitIdGroup[] = _.map(
      processTaskDetail,
      ({ process_task }) => {
        const { sku_id, unit_id, base_unit_id } =
          process_task?.main_output?.material!
        return {
          sku_id: sku_id!,
          unit_id_1: unit_id!,
          unit_id_2: base_unit_id!,
        }
      },
    )
    return GetSkuUnitRate({ sku_unit_id_groups: data }).then((rep) => {
      return rep.response.rates!
    })
  }

  updateProcessTask(index: number) {
    const data = this.list[index]
    return UpdateProcessTask({
      process_task_id: data.process_task_id,
      processor: data.processor,
    })
  }

  fetchFactoryModalList() {
    return ListProcessor({ paging: { limit: 999 } }).then((json) => {
      // 处理好数据
      const { processors } = json.response
      const group = _.groupBy(processors, 'parent_id')
      const parents = group['0']
      this.factoryModalList = (parents || []).map((v) => ({
        ...v,
        value: v.processor_id,
        text: v.name,
        label: v.name,
        children: group[v.processor_id]
          ? _.map(group[v.processor_id], (g) => ({
              ...g,
              value: g.processor_id,
              text: g.name,
              label: g.name,
            }))
          : undefined,
      }))
      return null
    })
  }

  updateOutputTask(isFilter: boolean) {
    if (isFilter) {
      // 过滤掉已完成的计划
      this.OutputTaskList = _.filter(
        this.selectedTask,
        (t) => t.state !== ProcessTask_State.STATE_FINISHED,
      )
      return
    }
    this.OutputTaskList = this.selectedTask.slice()
  }

  updateOutputTaskItem<T extends keyof TaskSku>(
    tIndex: number,
    value: TaskSku[T],
    bIndex: number,
    field: T,
  ) {
    const task: TaskSkuInfo = this.OutputTaskList[tIndex]
    task.sku[bIndex][field] = value
    this.OutputTaskList[tIndex] = {
      ...task,
    }
  }

  // 处理标记产出的任务数据
  getOutputTaskList(selected: string[]) {
    const dealTasks = this.handleBatchOutput(selected)
    const { isProduce } = planStore.producePlanCondition
    const taskSkus: TaskSkuInfo[] = this.dealOutputTask(
      dealTasks,
      isProduce,
      this.skuList,
    )
    this.OutputTaskList = _.filter(
      taskSkus.slice(),
      (t) => t.state !== ProcessTask_State.STATE_FINISHED,
    )
    this.selectedTask = taskSkus.slice()
  }

  getSkuInfo = (
    material: ProcessTask_Material,
    skus: { [key: string]: GetManySkuResponse_SkuInfo },
    isProduce: boolean,
    type: number,
    packrate: string,
  ) => {
    const {
      unit_id, // 包装单位
      base_unit_id, // 基本单位
      actual_amount, // 已产出数(包装单位)
      base_unit_actual_amount, // 已产出数(基本单位)
    } = material
    const sku_id = material.sku_id || ''
    const base_unit_name = globalStore.getUnitName(base_unit_id!)
    const current_sku = skus && skus[sku_id!]?.sku
    const pack_unit_name =
      skus[sku_id!]?.ssu_map![material.unit_id!].ssu?.unit.name
    const sku_name = current_sku?.name
    if (type === 2) {
      const sku_type = isProduce
        ? current_sku?.not_package_sub_sku_type
        : current_sku?.package_sub_sku_type
      const plan_amount = isProduce ? '-' : material.plan_amount
      return {
        sku_id: sku_id!,
        sku_name: sku_name!,
        sku_type: sku_type!,
        plan_amount,
        // 生产副产物部分
        unit_id: unit_id!,
        base_unit_name, // 基本单位
        actual_amount: base_unit_actual_amount!,
        output_amount: '0',
        isByproduct: true, // 是否为生产副产品/包装周转物
        // 包装周转物部分
        spec: '-',
        base_unit_id: material.base_unit_id!,
        pack_unit_name,
        pack_base_actual_amount: base_unit_actual_amount!, // 已产出数(基本单位)
        pack_actual_amount: actual_amount!, // 已产出数(包装单位)
        pack_base_unit_name: base_unit_name || '', // 基本单位
        pack_output_amount: '', // 产出数(包装单位)
        pack_base_output_amount: isProduce
          ? '0'
          : numMinus(plan_amount || '', material?.actual_amount || '') || '', // 包装计划中周转物产出数默认为成品的计划生产数, // 产出数(基本单位)
      }
    } else {
      const spec = `${packrate}${base_unit_name}/${pack_unit_name}`
      const { actual_amount, plan_amount } = material
      const pack_output_amount =
        plan_amount !== ''
          ? numMinus(plan_amount || '', actual_amount || '')
          : '' // 产出数 = 计划生产数 - 已产出数(其中计划生产数暂时不需要转成基本单位再进行计算)
      const pack_base_output_amount = pack_output_amount
        ? numMultiple(pack_output_amount || '0', packrate!)
        : ''
      const sku_type =
        (skus && skus[sku_id!]?.sku?.not_package_sub_sku_type) || undefined
      const _output_amount =
        plan_amount !== ''
          ? numMinus(plan_amount || '', actual_amount || '')
          : ''
      return {
        sku_id,
        sku_name,
        sku_type,
        plan_amount: material.plan_amount, // 包装对应的是包装单位
        // 生产部分
        base_unit_id: material.base_unit_id!,
        base_unit_name, // 基本单位
        actual_amount: material.base_unit_actual_amount!, // 生产已产出数
        output_amount:
          parseFloat(_output_amount || '0') < 0 ? '0' : _output_amount, // 产出数， 成品默认为计划生产数 - 已产出数
        isByproduct: false, // 是否为生产副产品/包装周转物
        // 包装部分
        spec,
        unit_id: material.unit_id!,
        pack_base_unit_name: base_unit_name || '', // 基本单位名称
        pack_unit_name, // 包装单位名称
        pack_base_actual_amount: material.base_unit_actual_amount!, // 已产出数(基本单位)
        pack_actual_amount: actual_amount, // 已产出数(包装单位)
        pack_output_amount, // 产出数(包装单位)
        pack_base_output_amount:
          parseFloat(pack_base_output_amount) < 0
            ? '0'
            : pack_base_output_amount, // 产出数（基本单位）
      }
    }
  }

  /**
   * 标记计划的产出数据
   * @param data 计划数据
   * @param isProduce 是否是生产计划
   * @param units
   * @param skus
   */
  dealOutputTask = (
    data: OutPutTasksType[],
    isProduce = true,
    skus: { [key: string]: GetManySkuResponse_SkuInfo },
  ) => {
    const taskSkus: TaskSkuInfo[] = _.map(data, (t) => {
      const packRate = t.packRate || '1'
      const state = t.process_task_command.state
      const sequence_no = t.process_task_command.sequence_no
      const serial_no = t.process_task?.serial_no
      const process_task_command_id =
        t.process_task_command.process_task_command_id
      // 所有的产出都是在output里面,包括副产品 主产品 周转物，需要分类处理等
      const sku: TaskSku[] = []
      _.each(t.process_task_command?.outputs?.outputs, (p) => {
        const { type } = p
        const material = p?.material!
        if (type === 1) {
          sku.unshift(
            this.getSkuInfo(
              material,
              skus,
              isProduce,
              type,
              packRate,
            ) as TaskSku,
          )
        }
        if (type === 2) {
          sku.push(
            this.getSkuInfo(
              material,
              skus,
              isProduce,
              type,
              packRate,
            ) as TaskSku,
          )
        }
      })
      return {
        sku,
        state: state!,
        task_command_no: serial_no + '-' + sequence_no,
        process_task_command_id,
      }
    })
    return taskSkus
  }

  batchUpdateTaskOutput(is_finish: boolean, isPack: boolean) {
    // 生产任务成品 -- 1.主产品:直接取output_amount填充actual_amount,2.副产品:多传sku_id,
    // 包装任务成品 -- 1.base_output_amount填充base_actual_amount,output_amount填充actual_amount,2.副产品少传output_amount,多sku_id
    const req: UpdateProcessTaskCommandOutputActualAmountRequest[] = []
    _.each(this.OutputTaskList, (t) => {
      _.each(t?.sku?.slice(1), (b) => {
        req.push({
          operation_source:
            UpdateProcessTaskCommandOutputActualAmountRequest_OperationSource.OPERATION_SOURCE_PRODUCE,
          sku_id: b.sku_id,
          process_task_command_id: t.process_task_command_id,
          actual_amount: isPack
            ? b.pack_base_output_amount || ''
            : b.output_amount || '',
          is_finish,
        })
      })
      if (isPack) {
        req.push({
          operation_source:
            UpdateProcessTaskCommandOutputActualAmountRequest_OperationSource.OPERATION_SOURCE_PRODUCE,
          process_task_command_id: t.process_task_command_id,
          actual_amount: t.sku[0].pack_output_amount || '',
          base_actual_amount: t.sku[0].pack_base_output_amount || '',
          is_finish,
        })
      } else {
        req.push({
          operation_source:
            UpdateProcessTaskCommandOutputActualAmountRequest_OperationSource.OPERATION_SOURCE_PRODUCE,
          process_task_command_id: t.process_task_command_id,
          actual_amount: t.sku[0].output_amount || '',
          is_finish,
        })
      }
    })
    BatchUpdateProcessTaskCommandOutputActualAmount({
      update_process_task_command_output_actual_amount_requests: req,
    }).then(() => {
      this.doRequest()
      Tip.success(t('操作产出成功'))
    })
  }

  getSplitTask(value: SplitTaskType[]) {
    this.splitTask = value
  }

  updateSplitTask(process_task_id: string) {
    const splitData = this.getSearchCommandData()
    const req = Object.assign(
      { split_data: splitData },
      {
        process_task_id,
      },
    )
    return SplitProcessTask(req)
  }

  addRowSplitTask() {
    this.splitTask.push({ ...initSplitTask })
  }

  deleteRowSplitTask(index: number) {
    this.splitTask.splice(index, 1)
  }

  updateRowSplitTask<T extends keyof SplitTaskType>(
    index: number,
    key: T,
    value: SplitTaskType[T],
  ) {
    this.splitTask[index][key] = value
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  getProcessorName(processorId: string): any {
    const processor = this.getProcessor(
      processorId,
      (modal) => ({
        modal,
      }),
      (modal, group) => ({
        modal,
        group,
      }),
    )
    const { modal, group } = processor
    const name = group ? modal?.text + '-' + group?.text : modal?.text || '-'
    return name
  }

  getProcessor(
    processorId: string,
    onModal: (modal: any) => any,
    onGroup: (modal: any, group: any) => any,
  ) {
    for (const modal of this.factoryModalList) {
      if (modal.value === processorId) {
        return onModal(modal)
      }

      if (!modal.children) {
        continue
      }

      const group = modal.children.find((child) => child.value === processorId)
      if (!group) {
        continue
      }
      return onGroup(modal, group)
    }

    return {}
  }
}

export default new Store()
