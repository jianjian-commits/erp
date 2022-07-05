import { Response } from '@gm-common/x-request'
import { SortBy } from 'gm_api/src/common'
import {
  DeviceData,
  Device_DeviceType,
  ListDeviceData,
  ListDeviceDataRequest_PagingField,
  ListDeviceDataResponse,
} from 'gm_api/src/device'
import { action, makeAutoObservable, toJS } from 'mobx'
import moment from 'moment'

/**
 * 历史记录筛选器的属性
 */
interface Filter {
  /** 设备类型 */
  device_type?: Device_DeviceType
  /** 设备型号ID */
  device_model_id?: string
  /** 设备名 */
  device_name?: string
  /** 开始时间 */
  begin_time?: string
  /** 结束时间 */
  end_time?: string
  /** 排序的属性及顺序 */
  sortby?: SortBy[]
}

/**
 * 历史记录标签页的Store类，用于历史记录标签页的操作
 */
class HistoryTabStore {
  /** 历史记录的集合 */
  historyRecords: DeviceData[] = []
  /** 历史记录的筛选器 */
  filter: Filter = {}

  /**
   * @class
   */
  constructor() {
    // 必须使用autoBind，否则usePagination无法获取this
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 获取历史记录
   * @async
   * @param  {any}                             params 过滤的属性
   * @return {Promise<ListDeviceDataResponse>}        获取历史记录的响应
   */
  @action
  async fetchHistoryRecords(params: any) {
    this.initHistoryRecords()
    // 默认按照报告时间降序排列，即首页显示最新的记录
    if (!this.filter.sortby || !this.filter.sortby.length) {
      this.filter.sortby = [
        {
          field: ListDeviceDataRequest_PagingField.REPORTING_TIME as number,
          desc: true,
        },
      ]
    }
    params = { ...toJS(this.filter), ...params } // 因为有数组，所以需要用toJS转换一下，否则传入的是Proxy
    const response = await ListDeviceData(params).then(
      (response: Response<ListDeviceDataResponse>) => {
        this.historyRecords = response.response.device_datas
        return response.response
      },
    )
    return response
  }

  /**
   * 初始化筛选器
   * @param {number} device_type     设备类型
   * @param {string} device_model_id 设备型号ID
   * @param {string} device_name     设备名
   */
  @action
  initFilter(
    device_type: number,
    device_model_id?: string,
    device_name?: string,
  ): void {
    this.filter = {
      device_type,
      device_model_id,
      device_name,
      begin_time: moment().startOf('hour').format('x'),
      end_time: moment()
        .startOf('hour')
        .hours(moment().get('hour') + 1)
        .format('x'),
    }
  }

  /**
   * 初始化历史记录
   */
  initHistoryRecords(): void {
    this.historyRecords = []
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
}

export default new HistoryTabStore()
