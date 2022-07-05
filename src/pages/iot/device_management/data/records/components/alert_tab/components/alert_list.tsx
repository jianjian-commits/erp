import { TableListColumn } from '@gm-pc/business'
import { SortsType, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import {
  DeviceException,
  ListDeviceExceptionRequest_PagingField,
  list_DeviceData_DataType,
} from 'gm_api/src/device'
import { toJS } from 'mobx'
import moment from 'moment'
import React, { FC, useEffect } from 'react'
import store from '../store'

/**
 * 报警数据列表的属性
 */
interface AlertListProps {
  /** 排序触发事件 */
  onSort: (sort: SortsType) => void
}

/**
 * 报警数据列表的组件函数
 */
const AlertList: FC<AlertListProps> = ({ onSort }) => {
  // 由于后端返回的是单个字符，需要转码来匹配'°C'字符串，否则无法匹配
  const CENTIGRADE = String.fromCharCode(8451)

  /**
   * 显示数值和单位
   * @param  {number} [value] 数值
   * @param  {string} [unit]  单位
   * @return {string}         数值和单位
   */
  const displayWithUnit = (value?: number, unit?: string): string => {
    if (value === undefined || unit === undefined) {
      return '-'
    }

    const digits = unit === CENTIGRADE ? 1 : 2
    return `${value.toFixed(digits)} ${unit}`
  }

  /**
   * 报警记录列表的栏
   */
  const columns: TableListColumn<DeviceException>[] = [
    {
      Header: t('序号'),
      id: 'index', // 需要定义id才可以在自定义显示栏中勾选
      accessor: (_, index) => index + 1,
      diyEnable: false,
    },
    {
      Header: t('区域'),
      id: ListDeviceExceptionRequest_PagingField.REGION, // 需要用枚举类型作为id才能用于排序
      accessor: ({ region }) => region || '-',
      headerSort: true,
    },
    {
      Header: t('设备'),
      id: ListDeviceExceptionRequest_PagingField.DEVICE_NAME,
      accessor: 'device_name',
      headerSort: true,
      diyEnable: false,
    },
    {
      Header: t('时间'),
      id: ListDeviceExceptionRequest_PagingField.REPORTING_TIME,
      accessor: ({ reporting_time }) =>
        moment(reporting_time, 'x').format('YYYY-MM-DD HH:mm:ss'),
      headerSort: true,
      diyEnable: false,
    },
    {
      Header: t('异常类型'),
      id: 'exception_type',
      accessor: ({ exception_type }) => t('报警规则'),
      // list_DeviceException_ExceptionType[(exception_type as number) - 1].text, TODO: 在gm_api中定义翻译
      diyEnable: false,
    },
    {
      Header: t('数据'),
      id: ListDeviceExceptionRequest_PagingField.DATA_TYPE,
      accessor: ({ data_type }) =>
        list_DeviceData_DataType[(data_type as number) - 1].text,
      headerSort: true,
      diyEnable: false,
    },
    {
      Header: t('单位'),
      id: 'unit_name',
      accessor: 'unit_name',
    },
    {
      Header: t('标准值'),
      id: 'standard_value',
      accessor: ({ standard_value, unit_name }) =>
        displayWithUnit(standard_value, unit_name),
    },
    {
      Header: t('上限'),
      id: 'upper_limit_value',
      accessor: ({ upper_limit_value, unit_name }) =>
        displayWithUnit(upper_limit_value, unit_name),
    },
    {
      Header: t('下限'),
      id: 'lower_limit_value',
      accessor: ({ lower_limit_value, unit_name }) =>
        displayWithUnit(lower_limit_value, unit_name),
    },
    {
      Header: t('实际值'),
      id: 'actual_value',
      accessor: ({ actual_value, unit_name }) =>
        displayWithUnit(actual_value, unit_name),
      diyEnable: false,
    },
  ]

  const { alertRecords } = store

  useEffect(() => {
    store.initAlertRecords()
  }, [])

  /**
   * 渲染组件
   */
  return (
    <Table<DeviceException>
      columns={columns}
      data={toJS(alertRecords)}
      onHeadersSort={onSort}
      isDiy
    />
  )
}

export default AlertList
