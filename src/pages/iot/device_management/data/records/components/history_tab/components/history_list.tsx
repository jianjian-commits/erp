import { TableListColumn } from '@gm-pc/business'
import { useGMLocation } from '@gm-common/router'
import { SortsType, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import {
  DeviceData,
  DeviceData_DataType,
  ListDeviceDataRequest_PagingField,
  map_DeviceData_DataSource,
  NumberData,
} from 'gm_api/src/device'
import { Omit } from 'lodash'
import { toJS } from 'mobx'
import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'
import store from '../store'

/**
 * 历史记录列表的属性
 */
interface HistoryListProps {
  /** 排序触发事件 */
  onSort: (sort: SortsType) => void
}

/**
 * 历史记录的属性
 * 在DeviceData的基础上进行拓展并移除data属性，以便Table中可以使用id和accessor
 */
interface DeviceHistory extends Omit<DeviceData, 'data'> {
  /** 温湿度传感器温度数据 */
  temperature?: NumberData
  /** 温湿度传感器湿度数据 */
  humidity?: NumberData
  /** 计数器设备个数 */
  count?: NumberData
}

/**
 * 历史记录列表的组件函数
 */
const HistoryList: FC<HistoryListProps> = ({ onSort }) => {
  const { type } = useGMLocation<{
    type: string
  }>().query

  // 定义列表各列
  const index: TableListColumn<DeviceHistory> = {
    Header: t('序号'),
    id: 'index', // 需要定义id才能在自定义显示栏中勾选
    accessor: (_, index) => index + 1,
    diyEnable: false,
  }
  const region: TableListColumn<DeviceHistory> = {
    Header: t('区域'),
    id: ListDeviceDataRequest_PagingField.REGION, // 需要用枚举类型作为id才能用于排序
    accessor: ({ region }) => region || '-',
    headerSort: true,
  }
  const device: TableListColumn<DeviceHistory> = {
    Header: t('设备'),
    id: ListDeviceDataRequest_PagingField.DEVICE_NAME,
    accessor: 'device_name',
    headerSort: true,
    diyEnable: false,
  }
  const time: TableListColumn<DeviceHistory> = {
    Header: t('时间'),
    id: ListDeviceDataRequest_PagingField.REPORTING_TIME,
    accessor: ({ reporting_time }) =>
      moment(reporting_time, 'x').format('YYYY-MM-DD HH:mm:ss'),
    headerSort: true,
    diyEnable: false,
  }
  const temperature: TableListColumn<DeviceHistory> = {
    Header: t('温度'),
    id: 'temperature',
    accessor: ({ temperature }) => {
      if (!temperature) {
        return '-'
      }
      const { val, unit_name } = temperature
      return `${val?.toFixed(2)} ${unit_name}`
    },
  }
  const humidity: TableListColumn<DeviceHistory> = {
    Header: t('湿度'),
    id: 'humidity',
    accessor: ({ humidity }) => {
      if (!humidity) {
        return '-'
      }
      const { val, unit_name } = humidity
      return `${val?.toFixed(2)} ${unit_name}`
    },
  }
  const source: TableListColumn<DeviceHistory> = {
    Header: t('数据来源'),
    id: 'data_source',
    accessor: ({ data_source }) => {
      if (!data_source) {
        return '-'
      }
      return map_DeviceData_DataSource[data_source]
    },
  }
  const amount: TableListColumn<DeviceHistory> = {
    Header: t('个数'),
    id: 'count',
    accessor: ({ count }) => {
      if (!count) {
        return '-'
      }
      const { val } = count
      return val
    },
  }

  // 温度传感器历史记录列表的栏
  const tempHumColumns: TableListColumn<DeviceHistory>[] = [
    index,
    region,
    device,
    time,
    temperature,
    humidity,
  ]

  // 计数器设备历史记录列表的栏
  const counterColumns: TableListColumn<DeviceHistory>[] = [
    index,
    region,
    device,
    source,
    time,
    amount,
  ]

  const columns = type === '1' ? tempHumColumns : counterColumns
  const { historyRecords } = store

  const [deviceHistories, setDeviceHistories] = useState<DeviceHistory[]>([])

  useEffect(() => {
    store.initHistoryRecords()
  }, [])

  const setDataByType = (historyRecord: DeviceData) => {
    return type === '1'
      ? {
          temperature:
            historyRecord.data &&
            historyRecord.data.datas &&
            historyRecord.data.datas[DeviceData_DataType.DATATYPE_TEMPERATURE],
          humidity:
            historyRecord.data &&
            historyRecord.data.datas &&
            historyRecord.data?.datas[DeviceData_DataType.DATATYPE_HUMIDITY],
        }
      : {
          count:
            historyRecord.data &&
            historyRecord.data.datas &&
            historyRecord.data?.datas[DeviceData_DataType.DATATYPE_COUNT],
        }
  }

  useEffect(() => {
    const histories: DeviceHistory[] = []
    if (!toJS(historyRecords)) {
      return
    }

    // 把拿到的DeviceData数据转化为DeviceHistory
    toJS(historyRecords).map((historyRecord) => {
      const history = Object.assign(historyRecord, setDataByType(historyRecord))
      // 移除data属性，避免报错
      delete history.data
      histories.push(history)
    })
    setDeviceHistories(histories)
  }, [historyRecords])

  /**
   * 渲染组件
   */
  return (
    <Table<DeviceHistory>
      columns={columns}
      data={deviceHistories}
      onHeadersSort={onSort}
      isDiy
    />
  )
}

export default HistoryList
