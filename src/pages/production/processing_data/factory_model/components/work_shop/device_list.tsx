import globalStore from '@/stores/global'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Device, map_Device_DeviceType } from 'gm_api/src/device'
import { Permission } from 'gm_api/src/enterprise'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../../store'

interface Props {
  data: Device[]
}

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const DeviceList: FC<Props> = observer(({ data }) => {
  const {
    current_modal: { current_selected_modal },
  } = store

  const handleDeleteDeviceOfModal = (device_id: string) => {
    store.deleteDevice([device_id])
  }

  return (
    <Table
      data={data.slice()}
      style={{ maxHeight: 'calc(100% - 60px)' }}
      columns={
        [
          {
            Header: t('设备编号'),
            id: 'device_id',
            accessor: 'device_id',
          },
          {
            Header: t('设备名称'),
            id: 'device_name',
            accessor: 'device_name',
          },
          {
            Header: t('设备类型'),
            id: 'customized_code',
            accessor: ({ device_type }) => map_Device_DeviceType[device_type!],
          },
          {
            Header: OperationHeader,
            id: 'options' as any,
            Cell: (data) => {
              // 当前为车间，只展示设备，不能删除
              if (
                !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_UPDATE_PROCESSOR,
                ) ||
                current_selected_modal.parent_id === '0'
              ) {
                return <div className='gm-text-left'>-</div>
              }

              return (
                <OperationCell>
                  <OperationDelete
                    title={t('确认删除')}
                    onClick={() =>
                      handleDeleteDeviceOfModal(data.original.device_id)
                    }
                  >
                    {t('是否要删除设备？')}
                  </OperationDelete>
                </OperationCell>
              )
            },
          },
        ] as Column<Device>[]
      }
    />
  )
})

export default DeviceList
