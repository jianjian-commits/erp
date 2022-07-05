import React, { FC } from 'react'
import {
  Device,
  Device_AlarmEnableStatus,
  Device_EnableStatus,
  ListDeviceRequest_PagingField,
  map_Device_DeviceType,
} from 'gm_api/src/device'
import Options from '@/pages/iot/device_management/components/options'

import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableProps, RightSideModal, Tip } from '@gm-pc/react'
import { Button } from 'antd'
import { history } from '@/common/service'
import storeList from '../store/storeList'
import { formatDateTime } from '@/common/util'
import SwitchEnum from '@/pages/iot/device_management/components/switchEnum'
import { observer } from 'mobx-react'
import DeviceChart from '@/pages/iot/components/deviceChat/deviceChart'
import { getSort } from '@/pages/iot/device_management/util'

const List: FC<
  { onFetchList: () => {}; offset: number } & Pick<BoxTableProps, 'pagination'>
> = ({ onFetchList, offset, pagination }) => {
  const handleCreate = () => {
    history.push('/iot/device_management/devices/create')
  }

  const searchList = () => {
    Tip.success('操作成功')
    onFetchList()
  }

  const handleShowView = (device_id: string) => {
    RightSideModal.render({
      title: t('设备数据详情'),
      style: { width: '640px' },
      children: <DeviceChart device_id={device_id} isMore />,
      onHide: RightSideModal.hide,
    })
  }

  const handleDelete = (id: string) => {
    storeList.deleteDevice(id).then(() => searchList())
  }

  const columns: Column<Device>[] = [
    {
      Header: t('序号'),
      minWidth: 150,
      id: 'index',
      accessor: (_, index) => offset + index + 1,
    },
    {
      Header: t('设备编号'),
      minWidth: 150,
      accessor: 'device_id',
      id: ListDeviceRequest_PagingField.DEVICE_ID,
      headerSort: true,
    },
    {
      Header: t('设备'),
      minWidth: 120,
      accessor: 'device_name',
      diyEnable: false,
      id: ListDeviceRequest_PagingField.DEVICE_NAME,
      headerSort: true,
    },
    {
      Header: t('设备型号'),
      id: 'device_model_name',
      minWidth: 120,
      accessor: 'device_model_name',
    },
    {
      Header: t('设备类型'),
      minWidth: 120,
      id: 'device_type',
      accessor: ({ device_type }) => map_Device_DeviceType[device_type!],
    },
    {
      Header: t('区域'),
      minWidth: 120,
      accessor: ({ region }) => region || '-',
      id: ListDeviceRequest_PagingField.REGION,
      headerSort: true,
    },
    {
      Header: t('最后上线时间'),
      minWidth: 120,
      accessor: ({ enable_time }) =>
        +enable_time! ? formatDateTime(+enable_time!) : '-',
      id: ListDeviceRequest_PagingField.ENABLE_TIME,
      headerSort: true,
    },
    {
      Header: t('启用状态'),
      width: 80,
      id: 'enable_status',
      Cell: ({ original: { enable_status, device_id } }) => {
        return (
          <SwitchEnum<Device_EnableStatus>
            status={enable_status!}
            trueValue={Device_EnableStatus.ENABLESTATUS_ENABLE}
            falseValue={Device_EnableStatus.ENABLESTATUS_DISABLE}
            onEnumChange={(check) =>
              storeList
                .updateEnableStatus(device_id, check)
                .then(() => searchList())
            }
          />
        )
      },
    },
    {
      Header: t('报警启停'),
      width: 80,
      id: 'alarm_enable_status',
      Cell: ({ original: { device_id, alarm_enable_status } }) => {
        return (
          <SwitchEnum<Device_AlarmEnableStatus>
            status={alarm_enable_status!}
            trueValue={Device_AlarmEnableStatus.ALARMENABLESTATUS_ENABLE}
            falseValue={Device_AlarmEnableStatus.ALARMENABLESTATUS_DISABLE}
            onEnumChange={(check) =>
              storeList
                .updateAlarmEnableStatus(device_id, check)
                .then(() => searchList())
            }
          />
        )
      },
    },
    {
      Header: t('报警设置'),
      minWidth: 120,
      id: 'device_alarm_rule_name',
      accessor: ({ device_alarm_rule_name }) => device_alarm_rule_name || '-',
    },
    {
      Header: t('操作'),
      minWidth: 180,
      id: 'option',
      diyEnable: false,
      Cell: ({ original: { device_name, device_id } }) => {
        return (
          <Options
            name={device_name!}
            url={`/iot/device_management/devices/edit?device_id=${device_id}`}
            onDelete={() => handleDelete(device_id)}
          >
            <a onClick={() => handleShowView(device_id)}>{t('数据查看')}</a>
          </Options>
        )
      },
    },
  ]

  return (
    <BoxTable
      pagination={pagination}
      action={
        <Button type='primary' onClick={handleCreate}>
          {t('添加设备')}
        </Button>
      }
    >
      <Table<Device>
        isDiy
        data={storeList.list.slice()}
        columns={columns}
        onHeadersSort={(des) => {
          storeList.changeFilter('sortby', getSort(des))
          onFetchList()
        }}
      />
    </BoxTable>
  )
}

export default observer(List)
