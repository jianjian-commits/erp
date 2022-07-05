import type { SelectedOptions } from '@/common/components/category_filter_hoc/types'
import { getCategoryIds, getModelValuesKV } from '@/common/util'
import { getSkuType } from '@/pages/production/util'
import globalStore from '@/stores/global'
import Big from 'big.js'
import { GetProductionProduceTaskDataResponse } from 'gm_api/src/databi'
import {
  GetManySku,
  GetManySkuRequest_RequestData,
  GetManySkuResponse,
  GetManySkuResponse_SkuInfo,
  GetUnitRateGroup,
  GetUnitRateGroupRequest_UnitIdGroup,
  GetUnitRateGroupResponse_UnitRateGroup,
  Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'
import {
  CleanFoodTaskDataFields,
  ExportTaskData,
  GetManyTask,
  Task,
  TaskDataFilter,
  Task_TimeType,
  Task_Type,
} from 'gm_api/src/production'
import _, { noop } from 'lodash'
import { action, makeObservable, observable } from 'mobx'
import moment from 'moment'
import type {
  ByProductInfo,
  Filter,
  MaterialInfo,
  ReportDetailInfo,
  ReportTaskInfo,
} from './interface'

export interface F extends Filter {
  category: SelectedOptions
  searchTarget: TaskDataFilter
}

export const initFilter: F = {
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  category: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  q: '',
  sku_type: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
  sort_type: 'asc',
  time_type: Task_TimeType.TIME_TYPE_CREATE,
  searchTarget: TaskDataFilter.TASKDATAFILTER_PRODUCT,
}

class Store {
  constructor() {
    // makeAutoObservable(this, undefined, { autoBind: true })
    makeObservable(this, {
      filter: observable,
      tasks: observable,
      taskCount: observable,
      updateTime: observable,
      tasksOfSku: observable,
      task_ids: observable,
      unit_rates: observable,
      loading: observable,
      searchData: action,
      // doRequest: action,
      setDoRequest: action,
      clear: action,
      updateFilter: action,
      flattenData: action,
      getSkuIds: action,
      fetchSkus: action,
      getSkuInfo: action,
      getTasksOfSku: action,
      exportTaskData: action,
    })
  }

  filter: F = {
    ...initFilter,
  }

  tasks: ReportTaskInfo[] = []

  taskCount = 0

  updateTime = ''

  tasksOfSku: ReportDetailInfo[] = []

  task_ids: string[] = []

  unit_rates: {
    [key: string]: GetUnitRateGroupResponse_UnitRateGroup[]
  } = {}

  loading = false

  searchData() {
    const { begin_time, end_time, sku_type, time_type } = this.filter

    return {
      time_range: {
        begin_time: `${+begin_time}`,
        end_time: `${+end_time}`,
        time_field:
          time_type === Task_TimeType.TIME_TYPE_CREATE
            ? 'create_time'
            : time_type === Task_TimeType.TIME_TYPE_DELIVERY
            ? 'delivery_time'
            : 'release_time',
      },
      get_many_sku_request: {
        q: this.filter.q,
        not_package_sub_sku_type: sku_type,
        ...getCategoryIds(
          _.map(
            this.filter.category?.category1_ids || [],
            (v) => v.value as string,
          ),
          _.map(
            this.filter.category?.category2_ids || [],
            (v) => v.value as string,
          ),
          _.map(
            this.filter.category?.pinlei_ids || [],
            (v) => v.value as string,
          ),
        ),
      },
      task_expr: {
        order_by_fields: [
          {
            name: 'input_actual_usage_total_price_sum',
            expr: 'input_actual_usage_total_price_sum asc',
          },
        ],
      },
    }
  }

  doRequest = noop

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  clear() {
    this.filter = { ...initFilter }
    this.tasks = []
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value

    if (key.toString() === 'sort_type') {
      this.doRequest()
    }
  }

  flattenData(data: any) {
    const result: any[] = _.map(data?.model_values || [], ({ kv }: any) => ({
      ...kv,
      base_unit_name: kv.base_unit_id
        ? globalStore.getUnitName(kv.base_unit_id)
        : '-',
    }))
    return result
  }

  getSkuIds(data: any) {
    const result: string[] = _.filter(
      _.map(getModelValuesKV(data?.model_values), (item) => item.sku_id),
      (item) => !_.isNil(item),
    )
    return result
  }

  fetchSkus(sku_ids: string[]) {
    if (sku_ids.length) {
      return GetManySku({
        sku_ids,
        request_data:
          GetManySkuRequest_RequestData.CATEGORY +
          GetManySkuRequest_RequestData.SSU,
      }).then((json) => {
        return json.response
      })
    }
    return {
      sku_map: {} as { [key: string]: GetManySkuResponse_SkuInfo },
      paging: {},
    }
  }

  // 包装计划处理时ssu_unit_id必须传才能拿到ssu信息
  getSkuInfo(
    sku_id: string,
    skus: GetManySkuResponse,
    needSpec?: boolean,
    ssu_unit_id?: string,
  ) {
    const sku = skus?.sku_map ? skus?.sku_map[sku_id] : null
    let spec_name = ''
    let spec = ''
    let pack_unit_name = ''

    if (needSpec) {
      // 处理包装计划需要的规格及包装单位信息
      const ssu = sku?.ssu_map ? sku?.ssu_map[ssu_unit_id!] : {}
      spec_name = ssu?.ssu?.name || ''
      spec = `${ssu.ssu?.unit.rate}${globalStore.getUnitName(
        ssu.ssu?.unit.parent_id || '',
      )}/${ssu.ssu?.unit.name}`
      pack_unit_name = ssu.ssu?.unit.name || ''
    }

    return {
      customized_code: sku ? sku.sku?.customize_code : '-',
      category_path: sku
        ? _.map(sku.category_infos, (c) => c.category_name).join('/')
        : '-',
      sku_type: getSkuType(sku_id, skus?.sku_map || {}),
      spec_name,
      spec,
      pack_unit_name,
    }
  }

  async getReportData(
    data: GetProductionProduceTaskDataResponse,
    taskType: Task_Type,
  ) {
    this.getTaskData(data, taskType).then((tasks) => {
      this.tasks = tasks
    })
  }

  async getTaskData(
    data: GetProductionProduceTaskDataResponse,
    taskType: Task_Type,
  ) {
    const { input_data, output_data, task_data } = data
    // input_data对应计划的原料信息，output_data对应计划的副产品信息，将两部分按照bom_id进行分类
    const tasks: ReportTaskInfo[] = this.flattenData(task_data)
    const materialsMap: { [key: string]: any } = _.groupBy(
      this.flattenData(input_data),
      (item) =>
        taskType === Task_Type.TYPE_PRODUCE_CLEANFOOD
          ? `${item.bom_id}:${item.sku_id}`
          : item.bom_id,
    )
    const byProductsMap: { [key: string]: any } = _.groupBy(
      this.flattenData(output_data),
      (item) =>
        taskType === Task_Type.TYPE_PRODUCE_CLEANFOOD
          ? `${item.bom_id}:${item.input_sku_id}`
          : item.bom_id,
    )
    const getInputs = (task: ReportTaskInfo) => {
      return materialsMap[
        taskType === Task_Type.TYPE_PRODUCE_CLEANFOOD
          ? `${task.bom_id}:${task.input_sku_id}`
          : task.bom_id!
      ]
    }
    const getOutputs = (task: ReportTaskInfo) => {
      return byProductsMap[
        taskType === Task_Type.TYPE_PRODUCE_CLEANFOOD
          ? `${task.bom_id}:${task.input_sku_id}`
          : task.bom_id!
      ]
    }

    // 成品及原料的信息需要通过接口拉取
    const sku_ids = this.getSkuIds(input_data)
      .concat(this.getSkuIds(output_data))
      .concat(this.getSkuIds(task_data))
    const skus = await this.fetchSkus(sku_ids)

    // 针对单原料时单位与成品单位不同需要查询换算比例
    const unit_id_groups: GetUnitRateGroupRequest_UnitIdGroup[] = []
    _.forEach(tasks, (task: ReportTaskInfo) => {
      const inputs: MaterialInfo[] = getInputs(task)
      if (task.base_unit_id && task.base_unit_id !== inputs[0].unit_id) {
        // unit_id_1 成品id， unit_id_2 原料id
        unit_id_groups.push({
          unit_id_1: task.base_unit_id!,
          unit_id_2: inputs[0].unit_id!,
        })
      }
    })
    let unit_rate_groups: GetUnitRateGroupResponse_UnitRateGroup[] = []
    if (unit_id_groups.length) {
      unit_rate_groups = await GetUnitRateGroup({
        unit_id_groups,
      }).then((json) => {
        return json.response.unit_rate_groups
      })
    }
    this.unit_rates = _.groupBy(unit_rate_groups, 'unit_id_2')

    const reportTasks = _.map(tasks, (task: ReportTaskInfo) => {
      // 处理原料信息
      const inputs = getInputs(task)
      const materials: MaterialInfo[] = _.map(inputs || [], (input) => {
        return {
          ...input,
          base_unit_name: input.unit_id
            ? globalStore.getUnitName(input.unit_id)
            : '-',
          // 如果没有units_rates说明不是同一类单位，要去商品的生产单位中找比率
          sku_unit_rate: this.unit_rates[input.unit_id]?.length
            ? this.unit_rates[input.unit_id][0].rate
            : skus.sku_map?.[input.sku_id]?.sku?.production_unit?.rate || '-',
          ...this.getSkuInfo(input.sku_id!, skus),
        }
      })
      // 汇总
      const uniqMaterials: MaterialInfo[] = []
      materials.forEach((material) => {
        const exist = uniqMaterials.find((m) => m.sku_id === material.sku_id)
        if (!exist) {
          uniqMaterials.push(material)
        } else {
          const keys = [
            'actual_usage_amount_sum',
            'actual_usage_total_price_sum',
            'plan_usage_amount_sum',
            'receive_amount_sum',
            'return_amount_sum',
          ]
          keys.forEach((key) => {
            // @ts-ignore
            exist[key] = Big(exist[key]).plus(material[key]).toString()
          })
        }
      })

      // 处理副产品信息
      const outputs = getOutputs(task)
      const by_products: ByProductInfo[] = _.filter(
        _.map(outputs, (output) => ({
          ...output,
          base_unit_name: output.base_unit_id
            ? globalStore.getUnitName(output.base_unit_id)
            : '-',
          ...this.getSkuInfo(output.sku_id, skus),
        })),
        (o) => o.sku_id !== task.sku_id,
      )

      const needSpec = taskType === Task_Type.TYPE_PACK
      return {
        ...task,
        by_products,
        materials: uniqMaterials,
        ...this.getSkuInfo(task.sku_id!, skus, needSpec, task.unit_id || ''),
      }
    })
    return reportTasks
  }

  getTasksOfSku(task_ids: string[]) {
    return GetManyTask({ task_ids, need_details: true }).then((json) => {
      const { task_details, skus } = json.response
      this.tasksOfSku = _.map(task_ids, (id) => {
        const task = task_details && task_details[id].task
        const ssu_map = skus
          ? skus[task?.sku_id!].ssu_map
            ? skus[task?.sku_id!].ssu_map
            : null
          : null
        const ssu = ssu_map ? ssu_map[task?.unit_id!] : null
        const spec = ssu
          ? `${ssu.ssu?.unit.rate}${globalStore.getUnitName(
              ssu.ssu?.unit.parent_id || '',
            )}/${ssu.ssu?.unit.name}`
          : ''

        return {
          ...(task as Task),
          base_unit_name: task?.base_unit_id
            ? globalStore.getUnitName(task?.base_unit_id)
            : '-',
          // 规格信息
          spec,
          pack_unit_name: ssu ? ssu.ssu?.unit.name : '',
          by_products: {
            ...task?.by_products,
            by_products: _.map(task?.by_products?.by_products || [], (b) => ({
              ...b,
              base_unit_name: b.unit_id
                ? globalStore.getUnitName(b?.unit_id)
                : '-',
              plan_amount: '',
            })),
          },
          task_inputs: (task_details && task_details[id].task_inputs) || [],
        }
      })

      return json
    })
  }

  async exportTaskData({
    type,
    task_data_filter,
    clean_food_task_data_fields = CleanFoodTaskDataFields.CLEANFOODTASKDATAFIELDS_UNSPECIFIED,
  }: {
    type: Task_Type
    task_data_filter: TaskDataFilter
    clean_food_task_data_fields?: CleanFoodTaskDataFields
  }) {
    const req = this.searchData()
    await ExportTaskData({
      get_many_sku_request: {
        ...req.get_many_sku_request,
      },
      task_type: type,
      begin_time: req.time_range.begin_time,
      end_time: req.time_range.end_time,
      time_field: req.time_range.time_field,
      task_data_filter,
      clean_food_task_data_fields,
    })
  }
}

export default Store
