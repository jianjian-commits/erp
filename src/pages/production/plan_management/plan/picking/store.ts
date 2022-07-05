import { makeAutoObservable } from 'mobx'
import {
  Task_Type,
  TaskInput_MaterialType,
  ListTaskInputRequest_ViewType,
  ListTaskInput,
  ListTaskInputResponse,
  TaskInput,
  Processor,
  MaterialOrder,
  BackMaterialOrderByTaskInput,
  MaterialOrder_State,
  GetMaterialOrder,
  MaterialOrderDetail,
  ListTaskInputRequest_PagingField,
} from 'gm_api/src/production'
import _ from 'lodash'
import {
  ListSkuV2,
  Sku_SkuType,
  map_Sku_NotPackageSubSkuType,
  GetManySkuV2Response,
} from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import {
  RequireFilterType,
  FilterType,
  OriginalItemType,
  OriginalListType,
  PickingListType,
  PickingItemType,
  MaterialOrderType,
  MaterialOrderItemType,
  MoreSelectDataItem,
} from './type'
import Big from 'big.js'

const initFilter: RequireFilterType = {
  production_order_id: '',
  task_types: [Task_Type.TYPE_PRODUCE, Task_Type.TYPE_PRODUCE_CLEANFOOD],
  material_types: [TaskInput_MaterialType.MATERIAL_TYPE_MATERIAL],
  view_type: ListTaskInputRequest_ViewType.VIEW_TYPE_CATEGORY,
  need_sku: true,
  need_processor: true,
  need_material_order: true,
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter: FilterType = { ...initFilter }

  skuList: MoreSelectDataItem[] = []

  sku: any = undefined

  processor: any = undefined

  categoryIds: any[] = []

  list: OriginalListType[] | PickingListType[] = []

  selectAll = false

  selectedRowKeys: string[] = []

  selectedData: any[] = []

  setSelectedData(value: any) {
    this.selectedData = value
  }

  setSelectAll(value: boolean) {
    this.selectAll = value
  }

  setSelectedRowKeys(value: string[]) {
    this.selectedRowKeys = value
  }

  initSelectedData() {
    this.selectAll = false
    this.selectedRowKeys = []
    this.selectedData = []
  }

  // 单个领料单的数据
  materialOrder: MaterialOrderType = {
    state: MaterialOrder_State.STATE_UNSPECIFIED,
    serialNo: '',
    stockSheetSerialNo: '',
    sheet_id: '',
    children: [],
  }

  /** 重置筛选项时需要保留部分筛选字段 */
  resetFilter() {
    this.filter = _.pick(this.filter, [
      'task_types',
      'material_types',
      'view_type',
      'need_sku',
      'need_processor',
      'need_material_order',
      'production_order_id',
    ])
    this.sku = undefined
    this.categoryIds = []
    this.processor = []
  }

  setSkuList(skuList: { label: string; value: any }[]) {
    this.skuList = skuList
  }

  setSku(sku: any) {
    this.sku = sku
  }

  setProcessor(processor: any) {
    this.processor = processor
  }

  setCategoryIds(ids: any) {
    this.categoryIds = ids
  }

  fetchSkuList(q: string) {
    ListSkuV2({
      filter_params: {
        q,
        sku_type: Sku_SkuType.NOT_PACKAGE,
      },
      paging: {
        offset: 0,
        limit: 999,
      },
    }).then((res) => {
      const data = _.map(res.response.skus, (v) => ({
        value: v.sku_id,
        label: v.name,
        ...v,
      }))
      this.setSkuList(data)
    })
  }

  updateFilter<T extends keyof FilterType>(key: T, value: FilterType[T]) {
    this.filter[key] = value
    this.initSelectedData()
  }

  getMsgFromSkuInfo(skuId: string, skuInfo: GetManySkuV2Response) {
    const sku = _.get(skuInfo, `sku_map[${skuId}]`, {})
    const category_map = skuInfo.category_map || {}
    const category_infos = [
      category_map[sku.category1_id]?.name,
      category_map[sku.category2_id]?.name,
      category_map[sku.category3_id]?.name,
    ].filter((e) => e)
    const name = sku?.name || ''
    const skuType =
      map_Sku_NotPackageSubSkuType[sku?.not_package_sub_sku_type || ''] || ''
    // const category = category_infos.map((info) => info.category_name).join('/')
    const category = category_infos.join('/')
    const baseUnit = globalStore.getUnitName(sku?.base_unit_id || '')
    // 物料名称 物料类型 物料分类 基本单位名称
    return { name, skuType, category, baseUnit }
  }

  getMsgFromTaskInput(task: TaskInput) {
    const planUsageAmount = Big(task?.plan_usage_amount || 0).toFixed(4)
    const receiveAmount = Big(task?.receive_amount || 0).toFixed(4)
    const taskInputId = task?.task_input_id
    const batch = task?.batch || '-'
    // 需求数 领料出库数 task_input_id 备注
    return { planUsageAmount, receiveAmount, taskInputId, batch }
  }

  getMsgFromProcessor(processor: Processor, processorMap: any) {
    const parentId = processor?.parent_id
    if (parentId === '0' || !parentId) {
      // 领料车间 领料小组
      return { processorWorkShop: processor?.name || '-', processorGroup: '-' }
    }
    const parentProcessor = processorMap[parentId]
    // 领料车间 领料小组
    return {
      processorWorkShop: parentProcessor.name,
      processorGroup: processor.name,
    }
  }

  getMsgFromMaterialOrder(order: MaterialOrder) {
    const serialNo = order?.serial_no || '-'
    const stockSheetSerialNo = order?.stock_sheet_serial_no || '-'
    const materialOrderId = order?.material_order_id || ''
    const sheetId = order?.stock_sheet_id || ''
    const state = order?.state || MaterialOrder_State.STATE_UNSPECIFIED
    // 领料单编号 领料出库单编号 material_order_id sheetId 提交状态
    return { serialNo, stockSheetSerialNo, materialOrderId, sheetId, state }
  }

  getAllSelected(list: OriginalListType[] | PickingListType[]) {
    const keys: string[] = []
    const data: any[] = []
    for (const item of list) {
      keys.push(item.key)
      for (const child of item.children) {
        keys.push(child.key)
        data.push(child)
      }
    }
    return { keys, data }
  }

  /** 生成原料视角表格数据 */
  getOriginalList(response: ListTaskInputResponse) {
    const task_inputs_view = response.task_inputs_view || []
    const skuInfo = response.skus || {}
    const processorMap = response.processors || {}
    const materialOrderMap = response.material_orders || {}
    const list: OriginalListType[] = task_inputs_view.map((parent) => {
      const parentKey =
        parent.category?.category_id || Math.random().toString(36).slice(-6)
      const name = parent.title || ''
      const children: OriginalItemType[] = (parent.task_inputs || []).map(
        (task) => {
          const childKey = `${parentKey}-${task.task_input_id}`
          const sku_id = task.sku_id || ''
          const processor = processorMap[task.processor_id || '']
          const materialOrder = materialOrderMap[task.material_order_id || '']
          return {
            key: childKey, // 分类ID-taskInputId
            ...this.getMsgFromSkuInfo(sku_id, skuInfo),
            ...this.getMsgFromTaskInput(task),
            ...this.getMsgFromProcessor(processor, processorMap),
            ...this.getMsgFromMaterialOrder(materialOrder),
          }
        },
      )
      return {
        key: parentKey, // 分类ID
        name,
        children,
      }
    })
    return list
  }

  /** 生成领料单视角表格数据 */
  getPickingList(response: ListTaskInputResponse) {
    const task_inputs_view = response.task_inputs_view || []
    const skuInfo = response.skus || {}
    const processorMap = response.processors || {}
    const list: PickingListType[] = task_inputs_view.map((parent) => {
      const serialNo = parent.title || ''
      const materialOrder = parent.material_order as MaterialOrder
      const parentKey =
        materialOrder.serial_no || Math.random().toString(36).slice(-6)
      const children: PickingItemType[] = (parent.task_inputs || []).map(
        (task) => {
          const sku_id = task.sku_id || ''
          const processor = processorMap[task.processor_id || '']
          const childKey = `${parentKey}-${task.task_input_id}`
          return {
            key: childKey, // 领料单号-taskInputId
            ...this.getMsgFromSkuInfo(sku_id, skuInfo),
            ...this.getMsgFromTaskInput(task),
            ...this.getMsgFromProcessor(processor, processorMap),
            ...this.getMsgFromMaterialOrder(materialOrder),
          }
        },
      )
      return {
        key: parentKey, // 领料单号
        materialOrderId: materialOrder.material_order_id,
        serialNo,
        children,
      }
    })
    return list
  }

  fetchList(params: any) {
    const funMap: any = {
      [ListTaskInputRequest_ViewType.VIEW_TYPE_CATEGORY]: this.getOriginalList,
      [ListTaskInputRequest_ViewType.VIEW_TYPE_MATERIAL_ORDER]:
        this.getPickingList,
    }
    const req = { ...this.filter, ...params }
    if (
      this.filter.view_type ===
      ListTaskInputRequest_ViewType.VIEW_TYPE_MATERIAL_ORDER
    ) {
      req.sort_by = [
        {
          field: ListTaskInputRequest_PagingField.CATEGORY_ID,
          desc: true,
        },
      ]
    }
    return ListTaskInput(req).then((res) => {
      const list = funMap[this.filter.view_type](res.response)
      this.list = list
      if (this.selectAll) {
        const { keys, data } = this.getAllSelected(list)
        this.selectedRowKeys = _.uniq([...this.selectedRowKeys, ...keys])
        this.selectedData = _.uniqBy([...this.selectedData, ...data], 'key')
      }
      return res.response
    })
  }

  getMsgFromMaterialOrderDetail(detail: MaterialOrderDetail) {
    const planUsageAmount = Big(detail?.plan_amount || 0).toFixed(4)
    const receiveAmount = Big(detail?.receive_amount || 0).toFixed(4)
    const actualAmount = Big(detail?.actual_amount || 0).toFixed(4)
    const returnAmount = Big(detail?.return_amount || 0).toFixed(4)
    // 需求数 领料出库数 实际用料数 退料数量
    return { planUsageAmount, receiveAmount, actualAmount, returnAmount }
  }

  /** 获取单个领料单详情数据 */
  getMaterialOrder(material_order_id: string) {
    return GetMaterialOrder({ material_order_id, need_sku: true }).then(
      (res) => {
        const materialOrder = res.response.material_order
        const details = res.response.material_order_details || []
        const skuInfo = res.response.skus || {}
        const children: MaterialOrderItemType[] = details.map(
          (detail, index) => {
            // const skuInfo = skuMap[detail.sku_id || '']
            const sku_id = detail.sku_id || ''
            return {
              key: index,
              ...this.getMsgFromSkuInfo(sku_id, skuInfo),
              ...this.getMsgFromMaterialOrderDetail(detail),
            }
          },
        )
        this.materialOrder = {
          state: materialOrder.state || MaterialOrder_State.STATE_UNSPECIFIED,
          serialNo: materialOrder.serial_no || '',
          stockSheetSerialNo: materialOrder.stock_sheet_serial_no || '',
          sheet_id: materialOrder.stock_sheet_id || '',
          title: materialOrder.title || '',
          children,
        }
        return res.response
      },
    )
  }

  /** 删除原料 */
  deleteMaterial(task_input_id: string) {
    return BackMaterialOrderByTaskInput({
      task_input_ids: [task_input_id],
    }).then((res) => {
      return res.response
    })
  }
}

export default new Store()
