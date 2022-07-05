import { Response } from '@gm-common/x-request'
import { Model_Type, SortBy } from 'gm_api/src/common'
import {
  APIRequestRecord,
  APIRequestRecord_SyncStatus,
  ListAPIRequestRecord,
  ListAPIRequestRecordRequest_PagingField,
  ListAPIRequestRecordResponse,
  RepushAPIRequestRecord,
} from 'gm_api/src/sap'
import { action, makeAutoObservable, toJS } from 'mobx'
import moment from 'moment'

/**
 * 同步记录筛选器的属性
 */
interface Filter {
  /** 开始时间 */
  from_time?: string
  /** 结束时间 */
  to_time?: string
  /** 模块 */
  model_types?: Model_Type[]
  /** 状态 */
  sync_status?: APIRequestRecord_SyncStatus
  /** 单据编号 */
  data_sn?: string[]
  /** 排序的属性及顺序 */
  sort_by?: SortBy[]
}

/**
 * 同步模块的Store，用于处理同步相关操作
 */
class SyncStore {
  /** 筛选器 */
  filter: Filter = {}
  /** 同步记录列表 */
  syncRecords: APIRequestRecord[] = []
  /** 是否拉取近一年的所有数据，true是拉取所有，否则是false */
  isAll = true

  /**
   * @class
   */
  constructor() {
    // 必须使用autoBind，否则usePagination无法获取this
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 初始化筛选器
   */
  initFilter(): void {
    this.isAll = true
    // 默认按照同步时间降序排列，即首页显示最新的记录
    this.filter = {
      from_time: moment().startOf('d').subtract(1, 'y').add(1, 'd').format('x'),
      to_time: moment().endOf('d').format('x'),
      model_types: [
        Model_Type.TYPE_INVENTORY_STOCKSHEET,
        Model_Type.TYPE_ORDER_ORDER,
      ],
      sort_by: [
        {
          field: ListAPIRequestRecordRequest_PagingField.REQ_TIME as number,
          desc: true,
        },
      ],
    }
  }

  /**
   * 初始化同步记录
   */
  initSyncRecords(): void {
    this.syncRecords = []
  }

  /**
   * 更新筛选器
   * @param {T extends keyof Filter} key   筛选器属性名
   * @param {Filter[T]}              value 筛选器属性值
   */
  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]): void {
    if (!value) {
      delete this.filter[key]
      return
    }

    this.filter[key] = value
  }

  /**
   * 获取同步列表
   * @async
   * @param  {any}                                   params 过滤的属性
   * @return {Promise<ListAPIRequestRecordResponse>}        获取报警记录的响应
   */
  @action
  async fetchSyncList(params: any): Promise<ListAPIRequestRecordResponse> {
    this.initSyncRecords()
    if (this.isAll) {
      this.filter = {
        ...this.filter,
        from_time: moment()
          .startOf('d')
          .subtract(1, 'y')
          .add(1, 'd')
          .format('x'),
        to_time: moment().endOf('d').format('x'),
      }
    }
    params = { ...toJS(this.filter), ...params } // 因为有数组，所以需要用toJS转换一下，否则传入的是Proxy
    const response = await ListAPIRequestRecord(params).then(
      (response: Response<ListAPIRequestRecordResponse>) => {
        this.syncRecords = response.response.api_request_records
        return response.response
      },
    )
    return response
  }

  /**
   * 重新同步
   * @param  {string}                                            recordId 同步记录的ID
   * @return {Promise<Response<RepushAPIRequestRecordResponse>>}          重新同步的请求
   */
  @action
  resyncAPIRecords(recordId: string) {
    return RepushAPIRequestRecord({ api_request_record_id: recordId })
  }
}

export default new SyncStore()
