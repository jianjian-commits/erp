import {
  ListProcessTaskOutputLogRequest,
  ProcessTask_TimeType,
  Task_Type,
  ListProcessTaskOutputLog,
  Task_OutputSource,
  UpdateProcessTaskOutputLog,
  DeleteProcessTaskOutputLog,
  ListBomSku,
  BomType,
} from 'gm_api/src/production'
import moment from 'moment'
import { SingleValueType } from 'rc-cascader/lib/Cascader'
import React from 'react'
import { makeAutoObservable } from 'mobx'
import { PagingParams } from 'gm_api/src/common'
import {
  FilterParams,
  GetManySkuResponse_SkuInfo,
  ListSkuV2Request,
  map_Sku_NotPackageSubSkuType,
  map_Sku_PackageSubSkuType,
  Sku_NotPackageSubSkuType,
  Sku_PackageSubSkuType,
} from 'gm_api/src/merchandise'
import _, { sortBy } from 'lodash'
import {
  MoreSelectDataItem,
  ProduceRecondInfo,
} from '@/pages/production/plan_management/plan/produce/interface'
import globalStore from '@/stores/global'
import { CascaderAndSelectOptions } from '@/pages/production/task_command/interface'
import {
  getRecondPackUnit,
  getSkuType,
} from '@/pages/production/plan_management/plan/produce/utils'

export interface FilterType
  extends Omit<
    ListProcessTaskOutputLogRequest,
    'begin_time' | 'end_time' | 'paging'
  > {
  time_type?: ProcessTask_TimeType
  begin_time?: Date
  end_time?: Date
  sku_ids?: string[] // 商品id
  sku_type?: Sku_NotPackageSubSkuType | Sku_PackageSubSkuType // 商品类型
  category_ids?: string[] // 分类
  processor_ids?: string[] // 车间小组
}

const initFilter: FilterType = {
  begin_time: undefined,
  end_time: undefined,
  sku_type: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
  processor_ids: [], // 车间小组
  category_ids: [],
  sku_ids: [],
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  skuList: MoreSelectDataItem[] = []

  sku: any = undefined

  production_order_id = '0'

  setInitValue = (production_order_id: string) => {
    this.production_order_id = production_order_id
  }

  filter: FilterType = { ...initFilter }

  // 兼容组件传参
  categoryIds: React.Key[] = []
  factoryModalList: CascaderAndSelectOptions<string>[] = []
  factoryData: SingleValueType[] = []
  list: ProduceRecondInfo[] = []
  init() {
    this.resetFilter()
  }

  /** 重置筛选项时需要保留部分筛选字段 */
  resetFilter() {
    this.filter = { ...initFilter }
    this.sku = []
    this.categoryIds = []
  }

  setfactoryData(factoryData: SingleValueType[]) {
    this.factoryData = factoryData
  }

  setCategoryIds(ids: React.Key[]) {
    this.categoryIds = ids
  }

  setSkuList(skuList: { label: string; value: any }[]) {
    this.skuList = skuList
  }

  setSku(sku: any) {
    this.sku = sku
  }

  fetchSkuList(value: string) {
    if (!value) {
      return
    }
    ListBomSku({
      list_sku_v2_request: {
        filter_params: { q: value },
        paging: { limit: 999 },
      },
      bom_types: [
        BomType.BOM_TYPE_CLEANFOOD,
        BomType.BOM_TYPE_PRODUCE,
        BomType.BOM_TYPE_PACK,
      ],
    }).then((json) => {
      this.setSkuList(
        _.map(json.response.list_sku_v2_response?.skus, ({ sku_id, name }) => ({
          value: sku_id,
          label: name,
        })),
      )
      return null
    })
  }

  updateFilter<T extends keyof FilterType>(key: T, value: FilterType[T]) {
    this.filter[key] = value
  }

  getMsgFromSkuInfo(skuInfo: GetManySkuResponse_SkuInfo) {
    const sku = skuInfo.sku
    const category_infos = skuInfo.category_infos || []
    const skuType =
      map_Sku_NotPackageSubSkuType[sku?.not_package_sub_sku_type || ''] ||
      map_Sku_PackageSubSkuType[sku?.package_sub_sku_type || '']
    const category = category_infos.map((info) => info.category_name).join('/')
    return { skuType, category }
  }

  updateRecond(process_task_output_log_id: string) {
    const req = this.getRecondInfo(process_task_output_log_id)
    // @ts-ignore
    return UpdateProcessTaskOutputLog({ ...req }).then((json) => {
      return json
    })
  }

  getRecond(process_task_output_log_id: string) {
    const selectRecond = _.filter(
      this.list,
      (recond) =>
        recond.process_task_output_log_id === process_task_output_log_id,
    )
    return selectRecond[0] || {}
  }

  getRecondInfo(process_task_output_log_id: string) {
    const process_task_output_log = {
      ...this.getRecond(process_task_output_log_id),
    }
    const req = _.omit(process_task_output_log, [
      'isEditing',
      '_base_unit_amount',
      '_amount',
      'packUnit',
      'baseUnit',
      'sku_type',
      'category',
      'skuName',
      'skuType',
      'processor_name',
      'key',
      'is_combine',
      'serial_no',
      'delivery_time',
    ])
    return {
      process_task_output_log: {
        ...req,
        base_unit_amount: process_task_output_log.base_unit_amount,
        amount: process_task_output_log.amount,
      },
      output_source: Task_OutputSource.OUTPUT_SOURCE_TYPE_IN,
    }
  }

  // 修产出记录项
  updateListColumn<T extends keyof ProduceRecondInfo>(
    process_task_output_log_id: string,
    key: T,
    value: ProduceRecondInfo[T],
  ) {
    const SelectRecond = this.getRecond(process_task_output_log_id)
    SelectRecond[key] = value
  }

  // 删除产出记录
  deleteTaskOutputLog = (process_task_output_log_id: string) => {
    return DeleteProcessTaskOutputLog({ process_task_output_log_id }).then(
      (json) => {
        return json
      },
    )
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
    if (this.filter.sku_ids!.length === 0) {
      filter_params = _.omit(filter_params, 'sku_ids')
    }
    const list_sku_v2_request: ListSkuV2Request = {
      filter_params,
      // @ts-ignore
      paging: { all: true },
    }
    return list_sku_v2_request
  }

  // 是否需要传商品分类
  isSkuRequest(filter: FilterType) {
    return _.isEqual(
      _.omit(initFilter, 'begin_time', 'end_time', 'processor_ids'),
      _.omit(filter, 'begin_time', 'end_time', 'processor_ids'),
    )
  }

  fetchList(params: PagingParams) {
    const { not_package_sub_sku_type, package_sub_sku_type } = getSkuType(
      this.filter.sku_type,
    )
    let req: ListProcessTaskOutputLogRequest = {
      processor_ids: _.map(this.filter.processor_ids, (v) => {
        return v.split(',')[0]
      }),
      paging: params,
      begin_time: `${+this.filter.begin_time!}`,
      end_time: `${+this.filter.end_time!}`,
      production_order_ids: [this.production_order_id || '0'],
      types: [
        Task_Type.TYPE_PRODUCE_CLEANFOOD,
        Task_Type.TYPE_PRODUCE,
        Task_Type.TYPE_PACK,
      ],
      need_process_task_command: true,
      need_processor: true,
      need_process_task: true,
    }
    req = req.begin_time === 'NaN' ? _.omit(req, 'begin_time', 'end_time') : req
    req = this.isSkuRequest(this.filter)
      ? req
      : {
          ...req,
          list_sku_v2_request: this.getList_Sku_v2_request(
            not_package_sub_sku_type,
            package_sub_sku_type,
          ),
        }
    return ListProcessTaskOutputLog(req).then((res) => {
      const { process_task_output_logs, skus, process_tasks, processors } =
        res.response
      const skuMap = skus || {}
      const processTasksMap = process_tasks || {}
      this.list = _.map(process_task_output_logs, (process_task_output_log) => {
        // 处理单位的时候要多写一个函数
        const {
          process_task_output_log_id,
          base_unit_id,
          unit_id,
          process_task_id,
          base_unit_amount,
          amount,
          create_time,
          delete_time,
          update_time,
          status,
          processor_id,
          type,
        } = process_task_output_log
        const sku_id = process_task_output_log.sku_id || '0'
        const { skuType, category } = this.getMsgFromSkuInfo(
          skuMap[sku_id || ''],
        )
        const delivery_time =
          processTasksMap[process_task_id || ''].delivery_times
        const serial_no = processTasksMap[process_task_id || ''].serial_no
        const processor = processTasksMap[process_task_id || ''].processor || ''
        const processor_name = processors?.[processor]?.name
        const is_combine =
          processTasksMap[process_task_id || '']?.inputs!.inputs!.length >= 2
        const sku_name = skuMap[sku_id || ''].sku?.name
        const baseUnit = globalStore.getUnitName(base_unit_id || '')
        const packUnit =
          globalStore.getUnitName(unit_id || '') ||
          getRecondPackUnit(skuMap, sku_id!, unit_id!)
        const data = {
          ...process_task_output_log,
          _base_unit_amount: base_unit_amount || '',
          _amount: amount || '',
          isEditing: false,
          key: process_task_output_log_id,
          process_task_output_log_id,
          sku_id,
          processor_id,
          process_task_id: process_task_id || '-',
          is_combine,
          skuName: sku_name!,
          skuType,
          category,
          baseUnit,
          packUnit,
          base_unit_amount: base_unit_amount!,
          amount,
          create_time: create_time!,
          delete_time,
          update_time,
          processor_name: processor_name!,
          delivery_time: delivery_time!,
          serial_no: serial_no!,
          status: status!,
          type,
        }
        return data
      })
      this.list = sortBy(
        this.list.slice(),
        (v: { create_time: string }) => -v.create_time,
      )
      return res.response
    })
  }
}

export default new Store()
