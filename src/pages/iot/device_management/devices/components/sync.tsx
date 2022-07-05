import { getSort } from '@/pages/iot/device_management/util'
import { Button, Flex, Modal, Tip } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { SortBy } from 'gm_api/src/common'
import {
  Device,
  DeviceSupplier,
  ListSupplierDevice,
  ListSupplierDeviceRequest_PagingField,
} from 'gm_api/src/device'
import { Select_DeviceSupplier } from 'gm_api/src/device/pc'
import _ from 'lodash'
import React, { useRef, useState } from 'react'
import storeInfo from '../store/storeInfo'

const Sync = () => {
  const supplierData = useRef<DeviceSupplier[]>()
  const sortRef = useRef<SortBy[]>()
  const [loading, setLoading] = useState(false)
  const [supplierId, setId] = useState<string>()
  const [tableInfo, setTableInfo] = useState<Device[]>([])
  const [deviceChose, setDevice] = useState<string[]>([])

  const handleChange = (supplierID: string) => {
    setLoading(true)
    setId(supplierID)
    ListSupplierDevice({
      device_supplier_id: supplierID,
      paging: { limit: 999 },
      sortby: sortRef.current ?? undefined,
    })
      .then((json) => {
        setTableInfo(json.response.devices!)
        return null
      })
      .catch(() => {
        setTableInfo([])
      })
      .finally(() => {
        setLoading(false)
        setDevice([])
      })
  }

  const handleSubmit = () => {
    if (!deviceChose.length) {
      Tip.danger(t('请选择一项'))
      return
    }
    const { device_supplier_id, device_supplier_name } = _.find(
      supplierData.current,
      {
        device_supplier_id: supplierId,
      },
    )!

    const deviceInfo = _.find(tableInfo, {
      device_key: deviceChose[0],
    })

    storeInfo.changeDeviceInfos(
      Object.assign(storeInfo.deviceInfo, {
        ...deviceInfo,
        device_model_id: undefined, // 同步供应商的设备一定不绑定设备类型
        device_supplier_id,
        device_supplier_name,
      }),
    )
    storeInfo.getModel()
    Modal.hide()
  }

  const columns: Column<Device>[] = [
    {
      Header: t('设备识别号'),
      headerSort: true,
      id: ListSupplierDeviceRequest_PagingField.DEVICE_KEY as any,
      accessor: 'device_key',
    },
    {
      Header: t('设备名称'),
      accessor: 'device_name',
      id: ListSupplierDeviceRequest_PagingField.DEVICE_NAME as any,
      headerSort: true,
    },
  ]

  return (
    <>
      <Flex alignCenter className='gm-margin-top-10 gm-margin-bottom-10'>
        <div>{t('供应商类型：')}</div>
        <Select_DeviceSupplier
          getName={({ device_supplier_name }) => device_supplier_name}
          getResponseData={(res) => {
            supplierData.current = res.device_suppliers
            return res.device_suppliers
          }}
          value={supplierId}
          onChange={(supplierID) => handleChange(supplierID)}
          placeholder={t('选择供应商')}
        />
      </Flex>
      <Table<Device>
        loading={loading}
        isSelect
        virtualizedHeight={500}
        style={{ height: '510px' }}
        selectType='radio'
        fixedSelect
        keyField='device_key'
        selected={deviceChose}
        onSelect={(select: string[]) => setDevice(select)}
        isSelectorDisable={(select: Device) => !!+select.device_id}
        isVirtualized
        data={tableInfo.slice()}
        columns={columns}
        onHeadersSort={(des) => {
          sortRef.current = getSort(des)
          handleChange(supplierId!)
        }}
      />
      <Flex justifyCenter className='gm-margin-top-10'>
        <Button
          onClick={() => {
            Modal.hide()
          }}
        >
          {t('取消')}
        </Button>
        <span className='gm-gap-10' />
        <Button type='primary' onClick={handleSubmit}>
          {t('确认')}
        </Button>
      </Flex>
    </>
  )
}

export default Sync
