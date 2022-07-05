import globalStore from '@/stores/global'
import { LevelSelectDataItem, Tip } from '@gm-pc/react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import {
  GetUnitRateGroupRequest_UnitIdGroup,
  Unit,
} from 'gm_api/src/merchandise'
import {
  GetBom,
  GetTask,
  GetTaskResponse,
  ListProcessor,
  SplitTaskProcess,
  Task,
  TaskProcess_Operation,
  TaskSource,
  TaskSource_SourceType,
  UpdateTaskProcess,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { dpProduction, toFixedZero } from '../enum'
import { numMinus, toFixed } from '../util'
import { BomData, SplitTaskInfo, TaskProcessInfo } from './interface'
import { DealWithGroup, transToG6Data } from './util'

// 代替被删除的接口proto
interface RateGroup {
  unit_id_1: string
  unit_id_2: string
  rate: string // u
}

interface TaskDetails extends GetTaskResponse {
  rate_units: RateGroup[]
  task_sources_group?: { [key in TaskSource_SourceType]?: TaskSource[] }
  units?: { [key: string]: Unit }
}

const initTaskInfo: SplitTaskInfo = {
  amount: '',
  processor: '',
  processor_select: [],
}

const initTask: Task = {
  task_id: '',
  order_amount: '',
  plan_amount: '',
  output_amount: '',
  base_unit_output_amount: '',
  sku_id: '',
  unit_id: '',
}

class Store {
  activeTab = '1'

  // 任务拆分
  splitTaskList: SplitTaskInfo[] = [{ ...initTaskInfo }, { ...initTaskInfo }]

  taskProcesses: TaskProcessInfo[] = []

  taskDetails: TaskDetails = { task: { ...initTask }, rate_units: [] }

  bomData: BomData = { nodes: [], edges: [] }

  factoryModalList: LevelSelectDataItem<string>[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setActiveTab(active: string) {
    this.activeTab = active
  }

  initData() {
    this.taskDetails = { task: { ...initTask }, rate_units: [] }
    this.bomData = { nodes: [], edges: [] }
  }

  /** 任务拆分相关 start */
  initSplitTaskProcesses(selected: TaskProcessInfo[]) {
    this.splitTaskList = _.map(selected.slice(), (s) => {
      return {
        amount: s.outputs?.outputs![0].material?.plan_amount || '0',
        processor_select: [s.processor || '0'],
        processor: s.processor || '',
      }
    })
  }

  addSplitTaskProcessesItem() {
    // 增加新的拆分数据，小组默认选择外部小组数据, 默认为未分配
    this.splitTaskList.push({ ...initTaskInfo, processor_select: ['0'] })
  }

  deleteSplitTaskProcessesItem(index: number) {
    this.splitTaskList.splice(index, 1)
  }

  clearSplitTaskProcesses() {
    this.splitTaskList = [{ ...initTaskInfo }]
  }

  updateSplitTaskProcessesItem<T extends keyof SplitTaskInfo>(
    index: number,
    key: T,
    value: SplitTaskInfo[T],
  ) {
    this.splitTaskList[index][key] = value
  }

  splitTaskProcesses(process_id: string) {
    const split_data = _.map(
      _.filter(this.splitTaskList.slice(), (t) => t.amount !== ''),
      (s) => {
        const processor: string = s?.processor_select?.length
          ? s?.processor_select![1] || s?.processor_select![0]
          : '0'
        return { plan_amount: s.amount, processor }
      },
    )

    return SplitTaskProcess({
      task_id: this.taskDetails.task.task_id,
      process_id,
      split_data,
    }).then((json) => {
      if (json.response) {
        Tip.tip(t('拆分成功！'))
        const { task_id } = this.taskDetails.task
        this.getTaskDetail(task_id)
      }
      return json
    })
  }
  /** 任务拆分相关 end */

  /** 待分配产出数量 */
  get distributedAmounts() {
    // 需要保留四位小数再计算
    const amounts = _.sumBy(this.splitTaskList, (t) =>
      parseFloat(toFixed(t.amount)),
    )
    return amounts
  }

  updateTaskProcesses<T extends keyof TaskProcessInfo>(
    index: number,
    key: T,
    value: TaskProcessInfo[T],
  ) {
    this.taskProcesses[index][key] = value
  }

  updateTaskProcessesItem<T extends TaskProcessInfo>(index: number, item: T) {
    this.taskProcesses[index] = item
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
        children: _.map(group[v.processor_id] || [], (g) => ({
          ...g,
          value: g.processor_id,
          text: g.name,
        })),
      }))
      return null
    })
  }

  // 获取单位间的换算比例，成品与物料单位不同时候用
  getSkuUnitsRate(diffUnits: GetUnitRateGroupRequest_UnitIdGroup[]) {
    const req = _.filter(
      diffUnits,
      (u) => u.unit_id_1 !== '' && u.unit_id_2 !== '',
    )
    if (req.length) {
      const unitData = globalStore.getSameUnitArray()
      const data: RateGroup[] = []
      _.map(req, ({ unit_id_1, unit_id_2 }) => {
        const unitId1Data = _.find(unitData, ({ unitArrayId }) =>
          unitArrayId.includes(unit_id_1),
        )!
        const unitId2Data = _.find(unitData, ({ unitArrayId }) =>
          unitArrayId.includes(unit_id_2),
        )!
        if (unitId1Data?.parentId === unitId2Data?.parentId) {
          data.push({
            unit_id_1,
            unit_id_2,
            rate: (
              +unitId1Data.unitMap[unit_id_1].rate /
              +unitId2Data.unitMap[unit_id_2].rate
            ).toString(),
          })
        }
      })
      this.taskDetails.rate_units = data
    }
  }

  // 展示bom图用
  getBom() {
    return GetBom({
      bom_id: this.taskDetails.task.bom_id!,
      revision: this.taskDetails.task.bom_revision!,
      need_sku_infos: true,
    }).then((res) => {
      this.bomData = transToG6Data(
        res.response.bom!,
        res.response.skus!,
        this.taskDetails.task_processes,
      )
      return res
    })
  }

  getTaskDetail(task_id: string) {
    return GetTask({ task_id }).then((json) => {
      if (json.response) {
        this.taskDetails = {
          ...json.response,
          task_sources_group: DealWithGroup(json.response.task_sources!),
          rate_units: [],
        }
        this.taskProcesses = _.map(
          _.sortBy(json.response?.task_processes?.slice() || [], (p) =>
            Number(p.rank),
          ),
          (process, index: number) => ({
            ...process,
            isEditing: false,
            processor_select: [],
            index,
          }),
        )
      }

      // 拉取数据后查询成品单位与成品单位不同的sku单位间的换算关系
      const diffUnits1 = _.map(
        _.filter(
          json.response.task_inputs,
          (m) => m.unit_id !== json.response.task.unit_id,
        ),
        (u) => ({
          unit_id_1: json.response.task.unit_id || '',
          unit_id_2: u.unit_id || '',
        }),
      )
      // GetUnitRateGroup, 直接判断获取与成品单位不同的换算rate
      return this.getSkuUnitsRate(diffUnits1)
    })
  }

  updateTaskProcess(index: number, processor_id: string) {
    const task_process = {
      ...this.taskProcesses[index],
      processor: processor_id,
    }
    UpdateTaskProcess({
      task_process,
      operation: TaskProcess_Operation.OPERATION_MODIFY_PROCESSOR,
    }).then((json) => {
      this.getTaskDetail(this.taskDetails.task.task_id)
      return json
    })
  }

  // 生产成品 计算出成率与用量率
  getFinishProductRate(type: string) {
    // 当前生产成品单位与物料单位其中一个不同且不能换算时，无需计算
    const unit_id = this.taskDetails.task.unit_id
    let rate = ''
    let actual_usage_amounts: Big = Big(0)
    if (unit_id) {
      const unitGroup = _.groupBy(this.taskDetails.rate_units, 'unit_id_2')
      _.forEach(this.taskDetails.task_inputs?.slice(), (m) => {
        const _actual_amount = toFixed(
          numMinus(
            Big(m.receive_amount || '0').toFixed(dpProduction),
            Big(m.return_amount || '0').toFixed(dpProduction),
          ),
        )
        if (m.unit_id !== unit_id) {
          // 单位不同, 查询是否可以换算
          // rate = 成品单位(id1) / 物料单位(id2)，物料转为成品单位 = 物料 / rate
          const rateObj = unitGroup[m.unit_id || '']
          const _rate = rateObj ? rateObj[0].rate || '-' : '-'
          if (_rate === '-') {
            rate = '-'
            return false
          }

          actual_usage_amounts = Big(_actual_amount || 0)
            .div(_rate)
            .plus(actual_usage_amounts || 0)
        } else {
          actual_usage_amounts = Big(actual_usage_amounts).plus(
            _actual_amount || 0,
          )

          return true
        }
        return true
      })
    }

    if (rate === '-') {
      return '-'
    }

    const output_amount = this.taskDetails.task.output_amount || 0
    if (type === 'output') {
      // rate = 成品实际用料 / 物料实际用料之和
      return !+actual_usage_amounts
        ? '-'
        : Big(output_amount || 0)
            .div(actual_usage_amounts!)
            .times(100)
            .toFixed(dpProduction)
    }

    // rate = 物料实际用料之和 / 成品实际用料
    return Big(output_amount || 0).toFixed(dpProduction) === toFixedZero ||
      !+actual_usage_amounts
      ? '-'
      : Big(actual_usage_amounts || 0)
          .div(output_amount!)
          .times(100)
          .toFixed(dpProduction)
  }

  // 工序出成率
  getProcessRate(index: number, out_unit: string, out_amount: string) {
    // 当前生产成品单位与物料单位其中一个不同且不能换算时，无需计算
    const unit_id = this.taskDetails.task.unit_id
    const unitGroup = _.groupBy(this.taskDetails.rate_units, 'unit_id_2')

    // 工序sku的投料跟产出都需要与成品单位进行对比, 投料信息在inputs中，产出信息在outputs中
    const inputs = this.taskDetails?.task_processes![index].inputs
    const out_amounts: Big[] = []

    const in_amounts: Big[] = _.map(inputs?.inputs?.slice() || [], (i) => {
      if (i?.unit_id !== unit_id) {
        const rate_obj = unitGroup[i?.unit_id || '']
        const _rate: string = rate_obj ? rate_obj[0].rate || '-' : '-'
        return _rate === '-' || !i.actual_amount
          ? Big('-1')
          : Big(i.actual_amount || '-1').div(_rate)
      }
      return Big(i.actual_amount || '-1')
    })

    if (
      _.filter(
        in_amounts,
        (i) => i.toFixed(dpProduction) === Big('-1').toFixed(dpProduction),
      ).length
    ) {
      return '-'
    }

    // 求产出数量
    if (out_unit !== unit_id) {
      const rate_obj = unitGroup[out_unit]
      const _rate: string = rate_obj ? rate_obj[0].rate || '-' : '-'

      if (_rate === '-') {
        return '-'
      }

      out_amounts.push(Big(out_amount || 0).times(_rate))
    } else {
      out_amounts.push(Big(out_amount || '0'))
    }

    const ins = _.sumBy(in_amounts, (i) => Number(i.toFixed(dpProduction)))
    return ins === 0
      ? '-'
      : Big(out_amounts[0]).div(ins).times(100).toFixed(dpProduction)
  }
}

export default new Store()
