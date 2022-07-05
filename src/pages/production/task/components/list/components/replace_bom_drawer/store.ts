import { getUnitInfo } from '@/pages/production/util'
import {
  ListSkuV2,
  ListSkuV2Request_RequestData,
  Unit,
} from 'gm_api/src/merchandise'
import {
  ListTask,
  ListTaskResponse,
  Task,
  TaskInput_Type,
  Task_Type,
} from 'gm_api/src/production'
import { action, observable } from 'mobx'
import { ExpandedTask } from './interfaces'

/**
 * 原物料与替换物料的映射，用来记录原物料对应的替换物料
 */
interface ReplaceSkuMap {
  /** key是原物料的ID，value是替换物料的ID */
  [originSkuId: string]: string
}

/**
 * 任务（计划）与投料的映射，用来记录任务（计划）中所有的投料
 */
interface TaskInputMap {
  /** key是任务（计划）的ID，value是原料与替换料的Map */
  [taskId: string]: ReplaceSkuMap
}

/**
 * 任务（计划）与有效物料的映射，用来记录任务（计划）中所有有效物料的数量
 */
interface ValidTaskSkuMap {
  /** key是任务（计划）ID，value是有效物料的数量 */
  [taskId: string]: number
}

/**
 * 替换物料抽屉的Store，用来处理替换物料相关操作
 */
class ReplaceBomStore {
  /** 所有按物料拆分后的任务（计划） */
  @observable
  tasks: ExpandedTask[] = []

  /** 任务（计划）投料的映射，用来记录任务（计划）所有原物料和替换物料 */
  @observable
  taskInputMap: TaskInputMap

  /** 任务（计划）有效物料的映射，用来记录任务（计划）的跨行数 */
  @observable
  validTaskSkuMap: ValidTaskSkuMap

  /**
   * @class
   */
  constructor() {
    this.taskInputMap = {}
    this.validTaskSkuMap = {}
  }

  /**
   * 获取任务列表并按物料拆分，同时更新各种映射
   * @async
   * @param  {Task_Type}               type    任务（计划）类型
   * @param  {string[]}                taskIds 任务（计划）ID的集合
   * @return {Promise<ExpandedTask[]>}         获取任务列表的请求
   */
  @action
  async fetchTaskList(type: Task_Type, taskIds: string[]) {
    const params = {
      task_ids: taskIds,
      need_details: true,
      paging: {
        limit: 999,
      },
    }
    const { response } = await ListTask(params)
    const taskDetails = response.task_details || []
    const tasks: ExpandedTask[] = []
    const taskInputMap: TaskInputMap = {}
    const validTaskSkuMap: ValidTaskSkuMap = {}

    taskDetails.map((taskDetail, taskIndex) => {
      const { task, task_inputs } = taskDetail
      if (!task || !task_inputs) {
        return
      }

      const unitInfoParams = this.getUnitInfoParams(type, response, task)
      const unitInfo = getUnitInfo(unitInfoParams)
      const replaceSkuMap: ReplaceSkuMap = {}
      const validAmount = task_inputs.reduce((amount, input, inputIndex) => {
        // 替换物料的映射不过滤物料类型
        if (input.sku_id) {
          replaceSkuMap[input.sku_id] = ''
        }

        if (input.type === TaskInput_Type.TYPE_UNSPECIFIED && input.sku_id) {
          amount++
          tasks.push({ ...task, taskIndex, inputIndex, input, unitInfo })
        }

        return amount
      }, 0)

      taskInputMap[task.task_id] = replaceSkuMap
      validTaskSkuMap[task.task_id] = validAmount
    }, [] as ExpandedTask[])

    this.tasks = tasks
    this.taskInputMap = taskInputMap
    this.validTaskSkuMap = validTaskSkuMap

    return this.tasks
  }

  /**
   * 获取单位信息的属性
   * @param  {Task_Type}        type     任务（计划）的类型
   * @param  {ListTaskResponse} response 获取任务（计划）列表的响应
   * @param  {Task}             task     当前任务（计划）
   * @return {any}                       单位信息的属性
   */
  @action
  getUnitInfoParams(type: Task_Type, response: ListTaskResponse, task: Task) {
    const units = response.units || {}
    const skus = response.skus || {}
    return {
      sku_id: type !== Task_Type.TYPE_PACK ? undefined : task.sku_id,
      skus: type !== Task_Type.TYPE_PACK ? undefined : skus,
      unit_id: task.unit_id || '',
      units: units,
    }
  }

  /**
   * 根据名称获取商品列表
   * @param  {string}                             name    商品名称
   * @param  {any}                                options 其他选项
   * @return {Promise<ListSkuResponse_SkuInfo[]>}         获取商品列表的请求
   */
  @action
  getSkusByName(name: string, options?: any) {
    return ListSkuV2({
      filter_params: {
        q: name,
        request_data: ListSkuV2Request_RequestData.FINANCE_CATEGORY,
        ...options,
      },
      paging: { limit: 999 },
    }).then((response) => {
      return response.response
    })
  }

  /**
   * 获取可选的单位列表
   * @param  {string} baseUnitId       基本单位
   * @param  {string} productionUnitId 生产单位
   * @param  {Unit[]} unitList         所有单位的列表
   * @return {Unit[]}                  可选的单位列表，结果为生成单位与和基本单位同类的单位
   */
  @action
  getSelectableUnits(
    baseUnitId: string,
    productionUnitId: string,
    unitList: Unit[],
  ) {
    const baseUnit = unitList.find((unit) => unit.unit_id === baseUnitId)
    const sameTypeUnits = unitList.filter((unit) => {
      // 判断是否是同一个单位或者是生产单位，是的话直接返回
      const isSameOrProduction =
        unit.unit_id === baseUnit?.unit_id || unit.unit_id === productionUnitId
      /**
       * 判断同类单位需要用parent_id
       * 同一类单位的父级单位parent_id是'0'
       * 子级单位的parent_id都是父级单位的unit_id
       * 根据当前单位的级别做不同的判断
       */
      if (baseUnit?.parent_id === '0') {
        return isSameOrProduction || unit.parent_id === baseUnit.unit_id
      } else {
        return (
          isSameOrProduction ||
          unit.unit_id === baseUnit?.parent_id ||
          unit.parent_id === baseUnit?.parent_id
        )
      }
    })

    return sameTypeUnits
  }
}

export default new ReplaceBomStore()
