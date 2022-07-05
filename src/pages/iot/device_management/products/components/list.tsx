import React, { FC } from 'react'
import {
  DeviceModel,
  map_Device_DeviceType,
  ListDeviceModelRequest_PagingField,
} from 'gm_api/src/device'
import Options from '../../components/options'

import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { BoxTable, Tip, BoxTableProps } from '@gm-pc/react'
import { Button } from 'antd'
import { history } from '@/common/service'
import storeList from '../store/storeList'
import { formatDateTime } from '@/common/util'
import { getSort } from '@/pages/iot/device_management/util'

const List: FC<
  { onFetchList: () => {}; offset: number } & Pick<BoxTableProps, 'pagination'>
> = ({ onFetchList, offset, pagination }) => {
  const handleCreate = () => {
    history.push('/iot/device_management/products/create')
  }
  const searchList = () => {
    Tip.success('操作成功')
    onFetchList()
  }

  const handleDelete = (id: string) => {
    storeList.deleteModel(id).then(() => searchList())
  }

  const columns: Column<DeviceModel>[] = [
    {
      Header: t('序号'),
      minWidth: 120,
      id: 'index',
      accessor: (_, index) => offset + index + 1,
    },
    {
      Header: t('设备型号ID'),
      minWidth: 120,
      accessor: 'device_model_id',
      id: ListDeviceModelRequest_PagingField.DEVICE_MODEL_ID,
      headerSort: true,
    },
    {
      Header: t('设备型号'),
      minWidth: 120,
      accessor: 'device_model_name',
      diyEnable: false,
      id: ListDeviceModelRequest_PagingField.DEVICE_MODEL_NAME,
      headerSort: true,
    },
    {
      Header: t('设备类型'),
      minWidth: 120,
      id: 'device_type',
      accessor: ({ device_type }) => map_Device_DeviceType[device_type!],
    },
    {
      Header: t('供应商'),
      minWidth: 120,
      id: 'device_supplier_name',
      accessor: ({ device_supplier_name }) => device_supplier_name || '-',
    },
    {
      Header: t('创建时间'),
      minWidth: 120,
      accessor: ({ create_time }) => formatDateTime(+create_time!),
      id: ListDeviceModelRequest_PagingField.CREATE_TIME,
      headerSort: true,
    },
    {
      Header: t('创建用户'),
      minWidth: 120,
      id: 'creater_name',
      accessor: 'creater_name',
    },
    {
      Header: t('备注'),
      minWidth: 120,
      id: 'remarks',
      accessor: ({ remarks }) => (
        <div className='b-ellipsis-order-remark' title={remarks}>
          {remarks || '-'}
        </div>
      ),
    },
    {
      Header: t('操作'),
      minWidth: 180,
      id: 'option',
      diyEnable: false,
      Cell: ({ original: { device_model_name, device_model_id } }) => {
        return (
          <Options
            name={device_model_name!}
            url={`/iot/device_management/products/edit?model_id=${device_model_id}`}
            onDelete={() => handleDelete(device_model_id)}
          >
            <a
              onClick={() => {
                history.push(
                  `/iot/device_management/devices?model_id=${device_model_id}`,
                )
              }}
            >
              {t('管理设备')}
            </a>
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
          {t('添加设备型号')}
        </Button>
      }
    >
      <Table<DeviceModel>
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

export default List
