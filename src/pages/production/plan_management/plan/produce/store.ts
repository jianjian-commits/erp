import { makeAutoObservable } from 'mobx'
import {
  ListTaskOutputGroupBy,
  Task_Type,
  ListTaskOutputGroupByRequest,
  TaskOutput_State,
  map_TaskOutput_State,
  map_Task_State,
} from 'gm_api/src/production'
import { PagingParams } from 'gm_api/src/common'
import {
  FilterParams,
  GetManySkuV2Response,
  ListSkuV2Request,
  map_Sku_NotPackageSubSkuType,
  map_Sku_PackageSubSkuType,
  Sku_NotPackageSubSkuType,
  Sku_PackageSubSkuType,
} from 'gm_api/src/merchandise'
import planStore from '../store'
import _ from 'lodash'
import { MoreSelectDataItem } from '@gm-pc/react'
import globalStore from '@/stores/global'
import { ProduceInfo } from '@/pages/production/plan_management/plan/produce/interface'
import {
  getPackUnit,
  getSkuType,
} from '@/pages/production/plan_management/plan/produce/utils'
import { PackType } from '@/pages/production/plan_management/plan/produce/enum'

interface FilterType
  extends Omit<
    ListTaskOutputGroupByRequest,
    'time_type' | 'begin_time' | 'endtime' | 'paging'
  > {
  sku_ids: string[] // 生产成品id
  sku_type: Sku_NotPackageSubSkuType | PackType // 商品类型
  category_ids?: string[] // 分类
  state: TaskOutput_State // 任务状态
  production_order_ids?: string[] // 需求id
  stock_sheet_serial_no?: string // 生产入库单编号
}

const initFilter: FilterType = {
  state: TaskOutput_State.STATE_UNSPECIFIED,
  sku_type: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
  category_ids: [],
  stock_sheet_serial_no: '',
  sku_ids: [],
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  list: ProduceInfo[] = []
  filter: FilterType = { ...initFilter }
  isAllReq: ListTaskOutputGroupByRequest = {
    paging: { limit: 10, need_count: true, offset: 0 },
  }

  // 兼容组件传入类型
  sku: MoreSelectDataItem[string] = []
  skuList: MoreSelectDataItem[] = []
  categoryIds: React.Key[] = []
  selectAll = false
  selectedRowKeys: string[] = []
  setselectAll(selectAll: boolean) {
    this.selectAll = selectAll
  }

  setInitData() {
    this.setselectAll(false)
    this.setSelectedRowKeys([])
  }

  setSelectedRowKeys(selectedRowKeys: string[]) {
    this.selectedRowKeys = selectedRowKeys
  }

  resetFilter() {
    this.filter = {
      ...initFilter,
    }
    this.sku = []
    this.categoryIds = []
  }

  setSku(sku: MoreSelectDataItem[string]) {
    this.sku = sku
  }

  setSkuList(skuList: MoreSelectDataItem[]) {
    this.skuList = skuList
  }

  setCategoryIds(categoryIds: React.Key[]) {
    this.categoryIds = categoryIds
  }

  // 判断是否需要传商品搜索
  isSkuRequest(filter: FilterType) {
    return _.isEqual(initFilter, _.omit(filter, 'task_types'))
  }

  init() {
    this.resetFilter()
  }

  // 更新筛选条件
  updateFilter<T extends keyof FilterType>(key: T, value: FilterType[T]) {
    this.filter[key] = value
    this.setInitData()
  }

  getMsgFromSkuInfo(skuInfo: GetManySkuV2Response, sku_id: string) {
    const sku = _.get(skuInfo, `sku_map[${sku_id}]`, {})
    const category_map = skuInfo.category_map || {}
    const category_infos = [
      category_map[sku?.category1_id]?.name,
      category_map[sku?.category2_id]?.name,
      category_map[sku?.category3_id]?.name,
    ].filter((e) => e)
    const sku_name = sku?.name || ''
    const skuType =
      map_Sku_NotPackageSubSkuType[sku?.not_package_sub_sku_type || ''] ||
      map_Sku_PackageSubSkuType[sku?.package_sub_sku_type || '']
    const category = category_infos.join('/')
    const baseUnit = globalStore.getUnitName(sku?.base_unit_id || '')
    return { sku_name, skuType, category, baseUnit }
  }

  getSearchFilterData(filter: FilterType) {
    const task_types = planStore.producePlanCondition.isProduce
      ? [Task_Type.TYPE_PRODUCE_CLEANFOOD, Task_Type.TYPE_PRODUCE]
      : [Task_Type.TYPE_PACK]
    const states =
      this.filter.state === TaskOutput_State.STATE_SUBMITTED
        ? [
            TaskOutput_State.STATE_DOUBLE_SUBMITTED,
            TaskOutput_State.STATE_SUBMITTED,
          ]
        : this.filter.state === TaskOutput_State.STATE_NOT_SUBMITTED
        ? [TaskOutput_State.STATE_NOT_SUBMITTED]
        : []
    const { not_package_sub_sku_type, package_sub_sku_type } = getSkuType(
      filter.sku_type,
    )
    return {
      task_types,
      states,
      not_package_sub_sku_type,
      package_sub_sku_type,
    }
  }

  getList_Sku_v2_request(
    not_package_sub_sku_type: Sku_NotPackageSubSkuType,
    package_sub_sku_type: Sku_PackageSubSkuType,
  ) {
    let filter_params: FilterParams =
      {
        not_package_sub_sku_type,
        package_sub_sku_type,
        category_ids: this.filter.category_ids || [],
        sku_ids: this.filter.sku_ids || [],
      } || {}
    if (not_package_sub_sku_type === Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED)
      filter_params = _.omit(filter_params, 'not_package_sub_sku_type')
    if (package_sub_sku_type === Sku_PackageSubSkuType.PSST_UNSPECIFIED)
      filter_params = _.omit(filter_params, 'package_sub_sku_type')
    if (this.filter.category_ids?.length === 0) {
      filter_params = _.omit(filter_params, 'category_ids')
    }
    if (this.filter.sku_ids.length === 0) {
      filter_params = _.omit(filter_params, 'sku_ids')
    }
    const list_sku_v2_request: ListSkuV2Request = {
      filter_params,
      // @ts-ignore
      paging: { all: true },
    }
    return list_sku_v2_request
  }

  fetchList(paging: PagingParams) {
    const {
      task_types,
      states,
      not_package_sub_sku_type,
      package_sub_sku_type,
    } = this.getSearchFilterData(this.filter)

    let req = {
      ..._.omit(this.filter, 'state', 'sku_ids', 'sku_type', 'category_ids'),
      paging,
      need_unit: true,
      need_sku: true,
      need_task: true,
      states,
      task_types,
      production_order_ids: [
        planStore.producePlanCondition.productionOrderId || '',
      ],
    }
    req = this.isSkuRequest(this.filter)
      ? req
      : {
          ...req,
          list_sku_v2_request: this.getList_Sku_v2_request(
            not_package_sub_sku_type,
            package_sub_sku_type,
          ),
        }
    this.isAllReq = req
    return ListTaskOutputGroupBy(req).then((res) => {
      const { task_outputs, tasks } = res.response
      const skus = res.response.skus || {}
      this.list = _.map(task_outputs, (task_output) => {
        const {
          task_output_ids,
          stock_in_amount,
          base_unit_output_amount,
          output_amount,
          stock_sheet_serial_no,
          stock_sheet_id,
          task_id,
        } = task_output
        const sku_id = task_output.sku_id
        const { skuType, category, sku_name, baseUnit } =
          this.getMsgFromSkuInfo(skus, sku_id)
        const state =
          map_TaskOutput_State[task_output.state!] ===
          map_TaskOutput_State[TaskOutput_State.STATE_NOT_SUBMITTED]
            ? '未提交'
            : '已提交'
        const packUnit =
          globalStore.getUnitName(task_output.unit_id || '') ||
          getPackUnit(skus, sku_id, task_output.unit_id)
        const taskState = map_Task_State[tasks![task_id!].state!]
        return {
          key: task_output_ids!,
          sku_id: sku_id!,
          skuName: sku_name!,
          skuType: skuType!,
          category: category!,
          state,
          taskState,
          baseUnit,
          packUnit,
          base_unit_output_amount,
          output_amount,
          stock_in_amount: stock_in_amount!,
          stock_sheet_id: stock_sheet_id!,
          stock_sheet_serial_no: stock_sheet_serial_no || '-',
        }
      })
      return res.response
    })
  }
}

export default new Store()
