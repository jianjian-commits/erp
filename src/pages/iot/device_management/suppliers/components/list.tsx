import React, { FC } from 'react'
import {
  DeviceSupplier,
  DeviceSupplier_Status,
  ListDeviceSupplierRequest_PagingField,
} from 'gm_api/src/device'
import Options from '../../components/options'

import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { BoxTable, Tip, BoxTableProps } from '@gm-pc/react'
import { Button } from 'antd'
import { history } from '@/common/service'
import storeList from '../store/storeList'
import SwitchEnum from '@/pages/iot/device_management/components/switchEnum'
import { formatDateTime } from '@/common/util'
import { observer } from 'mobx-react'
import { getSort } from '@/pages/iot/device_management/util'

const List: FC<
  { onFetchList: () => {}; offset: number } & Pick<BoxTableProps, 'pagination'>
> = ({ onFetchList, offset, pagination }) => {
  const handleCreate = () => {
    history.push('/iot/device_management/suppliers/create')
  }
  const searchList = () => {
    Tip.success('操作成功')
    onFetchList()
  }

  const handleUpdateState = (check: number, device_supplier_id: string) => {
    storeList
      .updateSupplierStatue(device_supplier_id, check)
      .then(() => searchList())
  }

  const handleDelete = (id: string) => {
    storeList.deleteSupplier(id).then(() => searchList())
  }

  const columns: Column<DeviceSupplier>[] = [
    {
      Header: t('序号'),
      minWidth: 120,
      id: 'index',
      accessor: (_, index) => offset + index + 1,
    },
    {
      Header: t('供应商编码'),
      minWidth: 150,
      accessor: 'device_supplier_id',
      id: ListDeviceSupplierRequest_PagingField.DEVICE_SUPPLIER_ID,
      headerSort: true,
    },
    {
      Header: t('供应商'),
      minWidth: 120,
      accessor: 'device_supplier_name',
      diyEnable: false,
      id: ListDeviceSupplierRequest_PagingField.DEVICE_SUPPLIER_NAME,
      headerSort: true,
    },
    {
      Header: t('最后上线时间'),
      minWidth: 120,
      accessor: ({ enable_time }) =>
        +enable_time! ? formatDateTime(+enable_time!) : '-',
      id: ListDeviceSupplierRequest_PagingField.ENABLE_TIME,
      headerSort: true,
    },
    {
      Header: t('创建用户'),
      minWidth: 120,
      accessor: 'creater_name',
      id: 'creater_name',
    },
    {
      Header: t('创建时间'),
      minWidth: 120,
      accessor: ({ create_time }) => formatDateTime(+create_time!),
      id: ListDeviceSupplierRequest_PagingField.CREATE_TIME,
      headerSort: true,
    },
    {
      Header: t('激活状态'),
      width: 80,
      id: 'status',
      Cell: ({ original: { status, device_supplier_id } }) => {
        return (
          <SwitchEnum<DeviceSupplier_Status>
            status={status!}
            trueValue={DeviceSupplier_Status.STATUS_ENABLE}
            falseValue={DeviceSupplier_Status.STATUS_DISABLE}
            onEnumChange={(check) =>
              handleUpdateState(check, device_supplier_id)
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
      Cell: ({ original: { device_supplier_name, device_supplier_id } }) => {
        return (
          <Options
            name={device_supplier_name!}
            url={`/iot/device_management/suppliers/edit?supplier_id=${device_supplier_id}`}
            onDelete={() => handleDelete(device_supplier_id)}
          >
            <a
              onClick={() => {
                history.push(
                  `/iot/device_management/products?supplier_id=${device_supplier_id}`,
                )
              }}
            >
              {t('管理设备型号')}
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
          {t('添加供应商')}
        </Button>
      }
    >
      <Table<DeviceSupplier>
        isDiy
        data={storeList.supplierList}
        columns={columns}
        onHeadersSort={(des) => {
          storeList.changeSortBy(getSort(des))
          onFetchList()
        }}
      />
    </BoxTable>
  )
}

export default observer(List)
