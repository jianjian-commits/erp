import { observable, makeAutoObservable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import {
  ListPurchaseTask,
  ListBatch,
  TimeType,
  PurchaseTask_Type,
  GetPurchaseTaskSummaryRequest,
  GetPurchaseTaskSummary,
  GetPurchaseTaskSummaryResponse,
  Batch,
  PurchaseTask_RequestSource,
  MergePurchaseTask,
  PurchaseTask,
  SplitPurchaseTaskRequestDetail,
  GetSupplierUpperLimitWithPlanCount,
} from 'gm_api/src/purchase'
import globalStore from '@/stores/global'
import { MoreSelectDataItem } from '@gm-pc/react'
import {
  Sku,
  GetManySkuResponse_SkuInfo,
  Sku_SupplierCooperateModelType,
} from 'gm_api/src/merchandise'
import { Customer } from 'gm_api/src/enterprise'
import { Task } from '../../interface'
import { CombineTask, SplitTable, TableData } from './interface'
import { getTaskParams } from '../../util'
import { PagingResult } from 'gm_api/src/common'
import { getCategoryName } from '@/common/util/sku'
import Big from 'big.js'
import { message } from 'antd'

type RateMap = { [key: string]: string }
type SkuSnaps = { [key: string]: Sku }
type CustomerSnaps = { [key: string]: Customer }
type SkuMap = { [key: string]: GetManySkuResponse_SkuInfo }

const initFilter = {
  search_text: '',
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  dateType: TimeType.CREATE_TIME,
  plan_state: 0,
  batch_id: '',
  purchaser_id: '',
  category_ids: [],
  suppliers: [],
  searchType: 0, // 控制搜索类型，0 : 按商品搜索，1: 按计划编号搜索
  supplier_cooperate_model_type: -1,
}

/** @description init初始化数据 */
export const initTable: SplitTable = {
  supplier_id: '0',
  need_value: '',
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter: { [key: string]: any } = {
    ...initFilter,
  }

  list: Task[] = []

  skuSnaps: SkuSnaps = observable.object<SkuSnaps>({})
  rateMap: RateMap = {}

  skuMap = observable.object<SkuMap>({})

  customers: CustomerSnaps = observable.object<CustomerSnaps>({})

  loading = true

  /** @description 自定导出按供应商导出接口返回的字段数据 */
  exportHeaderListBySupplier: any = {}

  /** @description 自定导出按采购员导出接口返回的字段数据 */
  exportHeaderListByBuyer: any = {}

  /** @description 控制抽屉的visible  */
  drawerVisible = false

  paging: PagingResult = {
    count: '0',
  }

  /** @description 选中的select */
  selected: string[] = []

  /**  @description 是否设置全选 */
  isSelectAll = false

  active = '1'

  summary: GetPurchaseTaskSummaryResponse =
    observable.object<GetPurchaseTaskSummaryResponse>({})

  /** @description 勾选的采购计划 */
  selectPurchaseTask: Task[] = []

  /** * @description 合并之后的采购计划数据 */
  combinePurchaseTask: CombineTask[] = []

  /** @description 根据关联客户拆分的数据源 */
  splitTable: SplitTable[] = [initTable]

  /** @description 修改数据源的地址触发更新 */
  updateSplitTable(splitTable: SplitTable[]) {
    this.splitTable = [...splitTable]
  }

  /** @description 根据商品拆分需求的方法  */
  splitMerchants(splitMerchants: TableData, index: number) {
    const {
      purchase_time,
      sku,
      sku: { sku_id },
      type,
      status,
      request_source,
      purchase_task_id,
      customer_id,
      request_sheet_serial_no,
      sku_level_filed_id,
    } = splitMerchants
    const purchase_tasks = _.map(this.splitTable, (item) => {
      const request_details = {
        request_details: [
          {
            ..._.omit(
              splitMerchants,
              'customer_name',
              'rate',
              'remark',
              'sku',
              'purchase_sku',
              'levelName',
            ),
            request_source,
            unit_id: sku?.purchase_unit_id,
            sku_revision: sku?.revision!,
            customer_id,
            request_sheet_serial_no,
            sheet_value: {
              input: {
                unit_id: sku?.purchase_unit_id,
                quantity: '' + item.need_value,
                price: '',
              },
              calculate: {
                unit_id: sku?.purchase_unit_id,
                quantity: '' + item.need_value,
                price: '',
              },
            },
          },
        ],
      }
      return {
        request_details,
        plan_value: {
          input: {
            unit_id: sku?.purchase_unit_id,
            quantity: '' + item.need_value,
            price: '',
          },
          calculate: {
            unit_id: sku?.purchase_unit_id,
            quantity: '' + item.need_value,
            price: '',
          },
        },
        request_source: PurchaseTask_RequestSource.PURCHASE_TASK,
        purchase_time,
        sku_id,
        sku_level_filed_id,
        status,
        supplier_id: item.supplier_id,
        type,
      }
    }) as unknown as PurchaseTask[]
    return SplitPurchaseTaskRequestDetail({
      purchase_task_id: purchase_task_id!,
      purchase_request_detail_index: '' + index,
      purchase_tasks,
    })
  }

  /** @description 设置选中的方法 */
  setSelected(selected: string[]) {
    this.selected = selected
  }

  /** @description 关闭抽屉的方法 */
  setDrawerVisible(drawerVisible: boolean) {
    this.drawerVisible = drawerVisible
  }

  /** @description 设置全选的方法 */
  setIsSelectAll(isSelectAll: boolean) {
    this.isSelectAll = isSelectAll
  }

  /** * @description 将选中的采购计划加进去 */
  setSelectPurchaseTask(selectPurchaseTask: Task[]) {
    this.selectPurchaseTask = _.cloneDeep(selectPurchaseTask)
  }

  /** @description 处理混合的逻辑 后台和前端都可以做，但是后台让前端做,推判断逻辑 */
  processCombine() {
    const combineData: CombineTask[] = []
    _.forEach(this.selectPurchaseTask, (item) => {
      // 先找到有没有合并的
      const index = _.findIndex(
        combineData,
        (combine) =>
          combine.sku_id === item.sku_id &&
          combine.purchase_time === item.purchase_time,
      )
      // /**
      //  * @description requestDetail的sheetValue 有一个为0需求数就是0
      //  * @description hasNotNeed 如果为true 那么就是0,否则就加起来
      //  * */
      // let hasNotNeed

      // if (!combineData[index]?.has_not_need) {
      //   hasNotNeed =
      //     _.some(
      //       item.request_details.request_details,
      //       (i) => i.sheet_value?.calculate?.quantity === '0',
      //     ) ||
      //     item.request_value?.calculate?.quantity! !==
      //       item.plan_value?.calculate?.quantity!
      // }
      /**
       * @description hasAmendMode  requestDetail来源只有订单
       * @description 计划采购数不等于需求数就不让修改 且是仅供货的模式
       * @description 为true就是可以修改，不为true就是不让修改
       * */
      const hasAmendMode = _.every(
        item.request_details.request_details,
        (i) => i.request_source === PurchaseTask_RequestSource.ORDER,
      )
      // if (!combineData[index]?.has_amend_mode) {
      //   hasAmendMode =
      // } else {
      //   hasAmendMode = combineData[index]?.has_amend_mode
      // }
      if (index === -1) {
        combineData.push({
          ...item,
          has_amend_mode: hasAmendMode,
          supplier_cooperate_model_type: hasAmendMode
            ? item.supplier_cooperate_model_type
            : Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
        })
      } else {
        // 设置需求数是否为0
        // combineData[index].has_not_need = hasNotNeed
        // 设置可以不可以修改供应商协作模式
        combineData[index].has_amend_mode = !combineData[index].has_amend_mode
          ? combineData[index].has_amend_mode
          : hasAmendMode

        // 波次id
        combineData[index].batch_id =
          item.batch_id !== combineData[index].batch_id ? '0' : item.batch_id

        // 计划备注
        if (combineData[index].remark) {
          combineData[index].remark += item.remark ? ',' + item.remark : ''
        } else {
          combineData[index].remark = item.remark
        }
        // 商品等级id
        combineData[index].sku_level_filed_id =
          item.sku_level_filed_id !== combineData[index].sku_level_filed_id
            ? '0'
            : item.sku_level_filed_id
        // 设置供应商
        combineData[index].supplier_id =
          combineData[index].supplier_id !== item.supplier_id
            ? '0'
            : item.supplier_id
        // 采购员id
        combineData[index].purchaser_id =
          combineData[index].purchaser_id !== item.purchaser_id
            ? '0'
            : item.purchaser_id
        // 设置供应商协作模式
        combineData[index].supplier_cooperate_model_type =
          combineData[index].supplier_cooperate_model_type !==
            item.supplier_cooperate_model_type || hasAmendMode
            ? Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS
            : item.supplier_cooperate_model_type
        // 计划采购数的计算
        const combinePlan = combineData[index].plan_value?.calculate?.quantity!
        const planValue = item.plan_value?.calculate?.quantity!
        combineData[index].plan_value = {
          ...combineData[index].plan_value,
          calculate: {
            ...combineData[index].plan_value?.calculate!,
            quantity: '' + Big(+combinePlan || 0).add(+planValue || 0),
          },
        }
        // 计划需求数的计算
        const quantity = item.request_value?.calculate?.quantity!
        const combineQuantity =
          combineData[index].request_value?.calculate?.quantity!

        combineData[index].request_value = {
          ...combineData[index].request_value,
          calculate: {
            ...combineData[index].request_value?.calculate!,
            quantity: '' + Big(+quantity || 0).add(+combineQuantity || 0),
          },
        }
      }
    })
    this.combinePurchaseTask = combineData
  }

  /** @description 设置合并之后的采购计划 */
  setCombinePurchaseTask(value: string, key: string, index: number) {
    _.set(this.combinePurchaseTask[index], key, value)
    this.combinePurchaseTask = _.cloneDeep(this.combinePurchaseTask)
  }

  /** @description 批量修改 */
  updateCombinePurchaseTask(combineData: CombineTask[]) {
    this.combinePurchaseTask = combineData
  }

  /** @description 合并请求接口 */
  mergePurchaseTask() {
    const purchase_batch_map: { [key: string]: Batch } = {}
    const purchase_tasks: PurchaseTask[] = _.map(
      this.selectPurchaseTask,
      (item) => {
        const findIndex = _.findIndex(
          this.combinePurchaseTask,
          (i) =>
            i.purchase_time === item.purchase_time && i.sku_id === item.sku_id,
        )
        purchase_batch_map[item?.purchase_time! + '_' + item?.sku_id!] = {
          last_purchase_time: item.purchase_time,
          last_submit_time: '' + new Date().getTime()!,
          name:
            this.combinePurchaseTask[findIndex].batch_id === '0'
              ? ''
              : this.combinePurchaseTask[findIndex].batch?.name || '',
          batch_id: '0',
        }
        return {
          ...item,
          supplier_id: this.combinePurchaseTask[findIndex].supplier_id || '0',
          purchaser_id: this.combinePurchaseTask[findIndex].purchaser_id || '0',
          sku_level_filed_id:
            this.combinePurchaseTask[findIndex].sku_level_filed_id || '0',
          supplier_cooperate_model_type:
            this.combinePurchaseTask[findIndex].supplier_cooperate_model_type,
          remark: this.combinePurchaseTask[findIndex].remark,
        }
      },
    )
    return MergePurchaseTask({ purchase_batch_map, purchase_tasks })
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  /** @description 搜索 */
  getTaskParams() {
    const params: any = {
      q: this.filter.search_text || undefined,
      serial_no: this.filter.search_text || undefined,
      status: this.filter.plan_state || undefined,
      supplier_ids: this.filter.suppliers.map(
        (v: MoreSelectDataItem<string>) => v.value,
      ),
      type: PurchaseTask_Type.COMMON,
      batch_id: this.filter.batch_id || undefined,
      purchaser_ids: this.filter.purchaser_id
        ? ([this.filter.purchaser_id] as string[])
        : ([] as string[]),
      category_ids: this.filter.category_ids,
      filter_time_type: this.filter.dateType,
      begin_time: `${+this.filter.begin}`,
      end_time: `${+this.filter.end}`,
    }

    if (this.filter.supplier_cooperate_model_type !== -1) {
      params.supplier_cooperate_model_type =
        this.filter.supplier_cooperate_model_type
    }

    // 按计划编号搜索剔除 q，按商品搜索剔除 serial_no
    _.unset(params, this.filter.searchType ? 'q' : 'serial_no')
    return params
  }

  /** @description 查询供货上限数据 */
  async fetchUpperLimit(list: Task[]) {
    if (list.length <= 0) {
      return list
    }
    let resultData: Task[] = []
    const request_filters = list.map((item) => ({
      supplier_id: item.supplier_id,
      sku_id: item.sku_id,
      purchase_time: item.purchase_time,
    }))
    try {
      const res = await GetSupplierUpperLimitWithPlanCount({
        request_filters,
        conversion_purchase_unit: true,
      })
      if (res.code === 0) {
        const data = res.response.purchase_upper_limit
        resultData = list.map((item) => ({
          ...item,
          upperLimiit: data?.find(
            (_item) =>
              _item.supplier_id! + _item.sku_id! ===
              item.supplier_id! + item.sku_id!,
          )?.upper_limit,
        }))
      } else {
        message.error(res.message)
      }
    } catch (err) {
      console.log(err)
    }
    return resultData
  }

  /** @description 列表的数据来源 */
  async fetchList(params?: any) {
    this.loading = true
    const batches = await ListBatch({
      filter_time_type: this.filter.dateType,
      begin_time: `${+this.filter.begin}`,
      end_time: `${+this.filter.end}`,
    }).then((json) => {
      const map: { [key: string]: Batch } = {}
      ;(json.response.batches! || []).forEach((v: Batch) => {
        map[v.batch_id] = v
      })
      return map
    })

    return ListPurchaseTask(
      Object.assign(
        {
          ...this.getTaskParams(),
        },
        params,
      ),
    )
      .then(async (json) => {
        const task = json?.response?.purchase_tasks! || []
        const stockMap = json?.response?.sku_stocks || {}
        this.skuSnaps = json?.response?.sku_map || {} // 新增
        this.customers = json.response.customers || {}
        this.rateMap = json.response.purchase_unit_rate_map! || {}
        if (params?.paging?.offset === 0) {
          this.paging = json.response.paging
        }

        // 获取采购计划表格数据
        const list = task.map((v) => {
          const level =
            this.skuSnaps!?.[v?.sku_id!]?.sku_level?.sku_level! || []
          const levelData = _.map(level, (item) => {
            return {
              ...item,
              text: item.name!,
              label: item.name!,
              value: item.level_id!,
              disable: false,
            }
          })
          const stock = stockMap[v.sku_id] || {}
          const baseUnit = stock.available_stock?.base_unit
          const skuInfo = json.response.sku_map[v.sku_id] || {}
          const category_id = skuInfo?.category_id || ''
          const rate = this.rateMap?.[v.sku_id] || '1'
          const unit_name =
            globalStore.getUnitName(skuInfo?.purchase_unit_id!) ||
            globalStore.getPurchaseUnitName(
              skuInfo?.units?.units,
              skuInfo?.purchase_unit_id!,
            ) ||
            ''
          return {
            ...v,
            category_name:
              getCategoryName(json?.response?.categorys!, category_id!) ||
              '未知',
            sku: skuInfo || null,
            supplier: json.response?.suppliers[v.supplier_id!] || null,
            purchaser: json.response?.group_users[v.purchaser_id!] || null,
            batch: batches[v.batch_id!] || null,
            stock: baseUnit?.quantity || '0',
            stockUnitName: globalStore.getUnitName(baseUnit?.unit_id!) || '',
            isEditing: false,
            base_stock: stock.stock,
            name: skuInfo.name || '-',
            rate,
            unit_name,
            levelData,
            sku_level_name:
              _.find(
                levelData,
                (item) => item.level_id === v.sku_level_filed_id,
              )?.name! || '-',
          }
        })
        // 查询供货上限 （组合供货上限和list数据）
        const res = await this.fetchUpperLimit(list)
        this.list = res || []
        this.selected = []
        this.isSelectAll = false
        return json.response
      })
      .finally(() => (this.loading = false))
  }

  /** @description 获取参数 */
  getParams(index: number) {
    const task = this.list[index]
    return getTaskParams(task)
  }

  setActive(active: string) {
    this.active = active
  }

  updateFilter(key: string, value: any) {
    this.filter[key] = value
  }

  rowUpdate<T extends keyof Task>(index: number, key: T, value: Task[T]) {
    this.list[index][key] = value
  }

  initSummaryFilter() {
    this.filter.purchaser_id = ''
    this.filter.suppliers = []
  }

  getSummary() {
    GetPurchaseTaskSummary({
      ...(this.getTaskParams() as GetPurchaseTaskSummaryRequest),
      supplier_ids: [],
      purchaser_ids: [],
    }).then((json) => {
      this.summary = json?.response || {}
    })
  }

  initFilter() {
    this.filter = { ...initFilter }
  }

  initSplitTable() {
    this.splitTable = [initTable]
  }

  init() {
    this.initFilter()
    this.initSplitTable()
    this.list = []
    this.selected = []
    this.isSelectAll = false
    this.drawerVisible = false
  }
}

export default new Store()

export type { Task }
