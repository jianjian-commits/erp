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
  batch: { value: number; text: string } = { value: 0, text: t('??????') }
  // todo  ??????antd???gm-kcSelect
  factoryModalList: CascaderAndSelectOptions<string>[] = []
  skuList: { [key: string]: GetManySkuResponse_SkuInfo } = {}
  OutputTaskList: TaskSkuInfo[] = []
  selectedTask: TaskSkuInfo[] = [] // ???????????????????????????
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

  // ????????????????????????
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

  // ???????????? && ????????????
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
    // isSelectAll????????????????????????
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
          // ????????????????????????
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

  // ????????????????????????????????? && process_task_id??????
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
      // ???????????????
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
      // ???????????????????????????
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

  // ?????????????????????????????????
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
      unit_id, // ????????????
      base_unit_id, // ????????????
      actual_amount, // ????????????(????????????)
      base_unit_actual_amount, // ????????????(????????????)
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
        // ?????????????????????
        unit_id: unit_id!,
        base_unit_name, // ????????????
        actual_amount: base_unit_actual_amount!,
        output_amount: '0',
        isByproduct: true, // ????????????????????????/???????????????
        // ?????????????????????
        spec: '-',
        base_unit_id: material.base_unit_id!,
        pack_unit_name,
        pack_base_actual_amount: base_unit_actual_amount!, // ????????????(????????????)
        pack_actual_amount: actual_amount!, // ????????????(????????????)
        pack_base_unit_name: base_unit_name || '', // ????????????
        pack_output_amount: '', // ?????????(????????????)
        pack_base_output_amount: isProduce
          ? '0'
          : numMinus(plan_amount || '', material?.actual_amount || '') || '', // ??????????????????????????????????????????????????????????????????, // ?????????(????????????)
      }
    } else {
      const spec = `${packrate}${base_unit_name}/${pack_unit_name}`
      const { actual_amount, plan_amount } = material
      const pack_output_amount =
        plan_amount !== ''
          ? numMinus(plan_amount || '', actual_amount || '')
          : '' // ????????? = ??????????????? - ????????????(?????????????????????????????????????????????????????????????????????)
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
        plan_amount: material.plan_amount, // ??????????????????????????????
        // ????????????
        base_unit_id: material.base_unit_id!,
        base_unit_name, // ????????????
        actual_amount: material.base_unit_actual_amount!, // ??????????????????
        output_amount:
          parseFloat(_output_amount || '0') < 0 ? '0' : _output_amount, // ???????????? ?????????????????????????????? - ????????????
        isByproduct: false, // ????????????????????????/???????????????
        // ????????????
        spec,
        unit_id: material.unit_id!,
        pack_base_unit_name: base_unit_name || '', // ??????????????????
        pack_unit_name, // ??????????????????
        pack_base_actual_amount: material.base_unit_actual_amount!, // ????????????(????????????)
        pack_actual_amount: actual_amount, // ????????????(????????????)
        pack_output_amount, // ?????????(????????????)
        pack_base_output_amount:
          parseFloat(pack_base_output_amount) < 0
            ? '0'
            : pack_base_output_amount, // ???????????????????????????
      }
    }
  }

  /**
   * ???????????????????????????
   * @param data ????????????
   * @param isProduce ?????????????????????
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
      // ????????????????????????output??????,??????????????? ????????? ?????????????????????????????????
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
    // ?????????????????? -- 1.?????????:?????????output_amount??????actual_amount,2.?????????:??????sku_id,
    // ?????????????????? -- 1.base_output_amount??????base_actual_amount,output_amount??????actual_amount,2.???????????????output_amount,???sku_id
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
      Tip.success(t('??????????????????'))
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
