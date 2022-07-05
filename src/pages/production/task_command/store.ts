import { PagingResult } from 'gm_api/src/common'
import { GetManySkuResponse_SkuInfo } from 'gm_api/src/merchandise'
import {
  GetSkuUnitRate,
  GetSkuUnitRateRequest_SkuUnitIdGroup,
  ListProcessor,
  ListProcessTask,
  ListProcessTaskFilter,
  ProcessTaskDetail,
  ProcessTask_State,
  ProcessTask_TimeType,
  ProduceType,
  SplitProcessTask,
  UpdateProcessTask,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { TASK_COMMAND_SELECT_TYPE } from '../enum'
import type { TableRequestParams } from '../interface'
import { getProcessPickMain, getProduceTypes } from '../util'
import type {
  CascaderAndSelectOptions,
  FilterType,
  MapProcessTaskDetail,
  ProcessTaskMoreDetail,
  SplitTaskType,
} from './interface'

const initFilter: FilterType = {
  time_type: ProcessTask_TimeType.TIME_TYPE_CREATE,
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  state: 0,
  target_customer_id: undefined,
  target_route_id: undefined,
  processor_ids: undefined,
  process_template_id: undefined,
  select_type: TASK_COMMAND_SELECT_TYPE.outPut,
  batch: '',
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

  // todo  兼容antd和gm-kcSelect
  factoryModalList: CascaderAndSelectOptions<string>[] = []

  skuList: { [key: string]: GetManySkuResponse_SkuInfo } = {}

  paging: PagingResult = { count: '0' }

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
  }

  getSearchTaskData(type?: ProduceType): ListProcessTaskFilter {
    const {
      begin_time,
      end_time,
      process_template_id,
      processor_ids,
      target_customer_id,
      target_route_id,
      select_type,
      serial_no,
      input_sku_id,
      output_sku_id,
      produce_type,
      batch,
      ...other
    } = this.filter
    return {
      begin_time: moment(begin_time).format('x'),
      end_time: moment(end_time).format('x'),
      target_customer_id: target_customer_id?.value,
      processor_ids: _.map(processor_ids, (v) =>
        v.length >= 2 ? v[1] : v[0],
      ) as string[],
      process_template_id: process_template_id?.value,
      target_route_id: target_route_id?.value,
      produce_types: getProduceTypes(type ?? produce_type),
      serial_no:
        select_type === TASK_COMMAND_SELECT_TYPE.serialNo ? serial_no : '',
      input_sku_id:
        select_type === TASK_COMMAND_SELECT_TYPE.inPut
          ? input_sku_id?.value
          : '0',
      output_sku_id:
        select_type === TASK_COMMAND_SELECT_TYPE.outPut
          ? output_sku_id?.value
          : '0',
      batch,
      ...other,
    }
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

  getProcessorName(processorId: string): string {
    const processor = this.getProcessor(
      processorId,
      (modal) => modal,
      (_, group) => group,
    )

    return processor?.text || '-'
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

    return null
  }
}

export default new Store()
