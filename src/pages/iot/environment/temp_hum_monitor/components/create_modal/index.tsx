import { TableListColumn } from '@gm-pc/business'
import { usePagination } from '@gm-common/hooks'
import { Button, Flex, Modal, Tip } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Device_EnableStatus } from 'gm_api/src/device'
import React, { FC, useEffect, useState } from 'react'
import store from '../../store'

/**
 * 添加设备弹窗的属性
 */
interface CreateModalProps {
  /** 刷新设备列表的方法 */
  refreshList: Function
}

/**
 * 添加设备弹窗的组件函数
 */
const CreateModal: FC<CreateModalProps> = ({ refreshList }) => {
  // 设备列表的栏
  const columns: TableListColumn[] = [
    {
      Header: t('设备编号'),
      accessor: 'device_id',
    },
    {
      Header: t('设备名称'),
      accessor: 'device_name',
    },
    {
      Header: t('区域'),
      accessor: ({ region }) => region || '-',
    },
    {
      Header: t('启用状态'),
      accessor: ({ enable_status }) =>
        enable_status === Device_EnableStatus.ENABLESTATUS_ENABLE ? (
          <Flex alignCenter>
            <div className='iot-device-create-modal-table-status online' />
            <div>{t('在线')}</div>
          </Flex>
        ) : (
          <Flex alignCenter>
            <div className='iot-device-create-modal-table-status offline' />
            <div>{t('离线')}</div>
          </Flex>
        ),
    },
  ]

  const [selectedDevices, setSelectedDevices] = useState<string[]>([])

  /**
   * 通过usePagination获取run函数
   * run函数的作用为执行store里的函数并对结果分页
   */
  const { run } = usePagination<any>(store.getTempHumDevices)

  /**
   * 处理取消按钮点击事件，取消按钮点击时触发
   * 关闭弹窗
   */
  const handleCancelButtonClick = () => {
    Modal.hide()
  }

  /**
   * 处理确认按钮点击事件，确认按钮点击时触发
   * 添加设备到监控列表，若成功则关闭弹窗并刷新列表
   */
  const handleConfirmButtonClick = () => {
    store.addMonitorDevices(selectedDevices).then(() => {
      Modal.hide()
      Tip.success(t('添加成功'))
      refreshList()
      return null
    })
  }

  /**
   * 组件第一次渲染时触发
   * 获取设备列表
   */
  useEffect(() => {
    store.initDevices()
    run()
  }, [])

  /**
   * 渲染组件
   */
  return (
    <div className='iot-device-create-modal'>
      <Table
        className='iot-device-create-modal-table'
        keyField='device_id'
        columns={columns}
        data={store.devices}
        selected={selectedDevices}
        limit={6}
        isSelectorDisable={store.checkInMonitor}
        onSelect={(selected) => setSelectedDevices(selected)}
        isSelect
        isVirtualized
      />
      <Flex className='iot-device-create-modal-select'>
        <div>{t('当前选中：')}</div>
        <div className='iot-device-create-modal-select-count'>
          {selectedDevices.length}
        </div>
      </Flex>
      <Flex className='iot-device-create-modal-buttons' justifyEnd>
        <Button
          className='iot-device-create-modal-buttons-cancel'
          onClick={handleCancelButtonClick}
        >
          {t('取消')}
        </Button>
        <Button
          className='iot-device-create-modal-buttons-confirm'
          onClick={handleConfirmButtonClick}
        >
          {t('确认')}
        </Button>
      </Flex>
    </div>
  )
}

export default CreateModal
