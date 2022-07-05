import { Response } from '@gm-common/x-request'
import {
  CreateMonitorList,
  CreateMonitorListResponse,
  DeleteMonitorList,
  DeleteMonitorListResponse,
  Device,
  DeviceGroup,
  Device_DeviceType,
  GetDevice,
  GetDeviceRequest_StatisticalType,
  GetDeviceResponse,
  ListDevice,
  ListMonitorList,
  ShieldingDeviceAlarm,
  ShieldingDeviceAlarmResponse,
} from 'gm_api/src/device'
import { action, makeAutoObservable } from 'mobx'

/**
 * 筛选器的属性
 */
interface Filter {
  /** 设备区域 */
  region?: string
}

/**
 * 温湿度监控的Store类，用于温湿度监控及投屏页面的各种操作
 */
class MonitorStore {
  /** 设备筛选器 */
  filter: Filter = {}
  /** 设备组集合 */
  device_groups: DeviceGroup[] = []
  /** 设备集合 */
  devices: Device[] = []

  /**
   * @class
   */
  constructor() {
    // 必须使用autoBind，否则usePagination无法获取this
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 获取设备，现在返回的是设备组用于排序，想要获取设备信息需要再解构一层
   * @async
   * @param {any} params 过滤的属性
   */
  @action
  async fetchDevices(params: any): Promise<DeviceGroup[]> {
    let deviceGroups: DeviceGroup[] = []
    const { filter } = this
    params = {
      ...params,
      ...filter,
      paging: {
        limit: 999, // 上限是999，多了会报错
      },
    }
    await ListMonitorList(params).then((response) => {
      deviceGroups = response.response.device_groups || []
      // 当前只显示温湿度类型的设备，所以过滤掉其他设备
      deviceGroups = deviceGroups.filter(
        (group) =>
          group.device?.device_type ===
          Device_DeviceType.DEVICETTYPE_HUMIDITY_TEMPERATURE,
      )
      // 根据sort_num属性对设备组排序
      deviceGroups.sort((prev, next) =>
        prev.sort_num === undefined
          ? -1
          : next.sort_num === undefined
          ? 1
          : prev.sort_num - next.sort_num,
      )
      this.device_groups = deviceGroups
      return deviceGroups
    })
    return deviceGroups
  }

  /**
   * 初始化筛选器
   */
  @action
  initFilter(): void {
    this.filter = {}
  }

  /**
   * 初始化设备组集合
   */
  @action
  initDeviceGroups(): void {
    this.device_groups = []
  }

  /**
   * 初始化设备集合
   */
  initDevices(): void {
    this.devices = []
  }

  /**
   * 更新筛选器
   * @param {T extends keyof Filter} key   过滤属性名
   * @param {Filter[T]}              value 过滤属性值
   */
  @action
  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]): void {
    if (!value) {
      delete this.filter[key]
      return
    }

    this.filter[key] = value
  }

  /**
   * 解除警报
   * @param  {string}                                          device_id 设备ID
   * @return {Promise<Response<ShieldingDeviceAlarmResponse>>}           解除警报的响应
   */
  @action
  dismissAlarm(
    device_id: string,
  ): Promise<Response<ShieldingDeviceAlarmResponse>> {
    const params = {
      device_id,
      shielding_time: (5 * 60 * 1000).toString(), // 5分钟
    }
    return ShieldingDeviceAlarm(params)
  }

  /**
   * 获取设备最近8小时数据
   * @param  {string}                               device_id 设备ID
   * @return {Promise<Response<GetDeviceResponse>>}           获取数据的响应
   */
  @action
  getDeviceData(device_id: string): Promise<Response<GetDeviceResponse>> {
    const params = {
      device_id,
      need_newest_data: true,
      statistical_type:
        GetDeviceRequest_StatisticalType.STATISTICALTYPE_LAST_8_HOURS,
      need_alarm_rule: true,
    }

    return GetDevice(params)
  }

  /**
   * 移除监控设备
   * @param  {string}                                       device_id 设备ID
   * @return {Promise<Response<DeleteMonitorListResponse>>}           移除监控设备的响应
   */
  @action
  deleteMonitorDevice(
    device_id: string,
  ): Promise<Response<DeleteMonitorListResponse>> {
    const params = { device_ids: [device_id] }
    return DeleteMonitorList(params)
  }

  /**
   * 获取温湿度设备集合
   * @async
   * @return {Promise<Device[]>} 获取温湿度设备的响应
   */
  @action
  async getTempHumDevices(): Promise<Device[]> {
    let devices: Device[] = []
    const params = {
      paging: {
        limit: 999, // 上限是999，多了会报错
      },
    }
    await ListDevice(params).then((response) => {
      devices = [...response.response.devices]
      devices = devices.filter(
        (device) =>
          device.device_type ===
          Device_DeviceType.DEVICETTYPE_HUMIDITY_TEMPERATURE,
      )
      // 把未被监控的设备放在前面，便于用户勾选
      devices.sort((prev, next) =>
        this.checkInMonitor(prev) > this.checkInMonitor(next) ? 1 : -1,
      )
      this.devices = devices
      return devices
    })

    return devices
  }

  /**
   * 添加监控设备
   * @param  {string[]}                                     device_ids 设备ID的集合
   * @return {Promise<Response<CreateMonitorListResponse>>}            添加监控设备的响应
   */
  @action
  addMonitorDevices(
    device_ids: string[],
  ): Promise<Response<CreateMonitorListResponse>> {
    return CreateMonitorList({ device_ids })
  }

  /**
   * 检查设备是否在监控中
   * @param  {Device}  device 设备信息
   * @return {boolean}        设备是否在监控中；true为在监控中，否则为false
   */
  @action
  checkInMonitor(device: Device): boolean {
    return (
      this.device_groups.findIndex(
        ({ device_id }) => device.device_id === device_id,
      ) > -1
    )
  }
}

export default new MonitorStore()
