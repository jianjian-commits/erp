import React, { FC } from 'react'
import {
  DeviceStrategy,
  map_DeviceStrategy_Type,
  map_DeviceStrategy_CollectionType,
  DeviceStrategy_Status,
  map_TimeType,
  ListDeviceStrategyRequest_PagingField,
} from 'gm_api/src/device'
import Options from '@/pages/iot/device_management/components/options'

import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { BoxTable, Tip, BoxTableProps } from '@gm-pc/react'
import { Button } from 'antd'
import { history } from '@/common/service'
import storeList from '../store/storeList'
import { formatDateTime } from '@/common/util'
import SwitchEnum from '@/pages/iot/device_management/components/switchEnum'
import { observer } from 'mobx-react'
import { getSort } from '@/pages/iot/device_management/util'

const List: FC<
  { onFetchList: () => {}; offset: number } & Pick<BoxTableProps, 'pagination'>
> = ({ onFetchList, offset, pagination }) => {
  const handleCreate = () => {
    history.push('/iot/device_management/tasks/create')
  }

  const searchList = () => {
    Tip.success('操作成功')
    onFetchList()
  }

  const handleUpdateState = (
    device_strategy_id: string,
    check: DeviceStrategy_Status,
  ) => {
    storeList.updateStatue(device_strategy_id, check).then(() => searchList())
  }

  const handleDelete = (id: string) => {
    storeList.deleteStrategy(id).then(() => searchList())
  }

  const columns: Column<DeviceStrategy>[] = [
    {
      Header: t('序号'),
      minWidth: 120,
      id: 'index',
      accessor: (_, index) => offset + index + 1,
    },
    {
      Header: t('策略ID'),
      minWidth: 150,
      accessor: 'device_strategy_id',
      id: ListDeviceStrategyRequest_PagingField.DEVICE_STRATEGY_ID,
      headerSort: true,
    },
    {
      Header: t('策略名称'),
      minWidth: 120,
      accessor: 'device_strategy_name',
      diyEnable: false,
      id: ListDeviceStrategyRequest_PagingField.DEVICE_STRATEGY_NAME,
      headerSort: true,
    },
    {
      Header: t('策略类型'),
      minWidth: 120,
      accessor: ({ type }) => map_DeviceStrategy_Type[type!],
      id: ListDeviceStrategyRequest_PagingField.TYPE,
      headerSort: true,
    },
    {
      Header: t('设备型号'),
      minWidth: 120,
      accessor: 'device_model_name',
      id: 'device_model_name',
    },
    {
      Header: t('采集频率'),
      minWidth: 120,
      id: 'strategy_frequency',
      accessor: ({ strategy_frequency, time_type }) =>
        strategy_frequency + map_TimeType[time_type!],
    },
    {
      Header: t('采集方式'),
      minWidth: 120,
      accessor: ({ collection_type }) =>
        map_DeviceStrategy_CollectionType[collection_type!],
      id: ListDeviceStrategyRequest_PagingField.COLLECTION_TYPE,
      headerSort: true,
    },
    {
      Header: t('创建时间'),
      minWidth: 120,
      accessor: ({ create_time }) => formatDateTime(+create_time!),
      id: ListDeviceStrategyRequest_PagingField.CREATE_TIME,
      headerSort: true,
    },
    {
      Header: t('创建用户'),
      minWidth: 120,
      accessor: 'creater_name',
      id: 'creater_name',
    },
    {
      Header: t('启动状态'),
      width: 80,
      id: 'status',
      Cell: ({ original: { device_strategy_id, status } }) => {
        return (
          <SwitchEnum<DeviceStrategy_Status>
            status={status!}
            trueValue={DeviceStrategy_Status.STATUS_ENABLE}
            falseValue={DeviceStrategy_Status.STATUS_DISABLE}
            onEnumChange={(check) =>
              handleUpdateState(device_strategy_id, check)
            }
          />
        )
      },
    },
    {
      Header: t('操作'),
      minWidth: 180,
      id: 'option',
      diyEnable: false,
      Cell: ({ original: { device_strategy_name, device_strategy_id } }) => {
        return (
          <Options
            name={device_strategy_name!}
            url={`/iot/device_management/tasks/edit?strategy_id=${device_strategy_id}`}
            onDelete={() => handleDelete(device_strategy_id)}
          />
        )
      },
    },
  ]

  return (
    <BoxTable
      pagination={pagination}
      action={
        <Button type='primary' onClick={handleCreate}>
          {t('创建策略')}
        </Button>
      }
    >
      <Table<DeviceStrategy>
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
