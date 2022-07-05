import globalStore from '@/stores/global'
import { pinYinFilter } from '@gm-common/tool'
import { Button, Flex, Input } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Device } from 'gm_api/src/device'
import { Permission } from 'gm_api/src/enterprise'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import store from '../store'
import DeviceList from './work_shop/device_list'

const WorkShopWithDevice: FC = observer(() => {
  const { current_modal } = store
  const { current_selected_modal, devices } = current_modal
  const parent_id = current_selected_modal?.parent_id
  const { processor_id } = current_selected_modal

  const [search_text, setSearchText] = useState<string>('')
  const [list, setList] = useState<Device[]>(devices.slice())

  useEffect(() => {
    setList(devices.slice())
  }, [devices])

  useEffect(() => {
    if (!processor_id) return
    store.getDevicesOfCurrentModal(processor_id)
  }, [])

  const handleSearchDevice = () => {
    const new_list = pinYinFilter(
      devices,
      search_text,
      (e: Device) => e.device_id + e.device_name,
    )
    setList(new_list)
  }

  const handleAddDevice = () => {
    store.setAddDevice(true)
  }

  return (
    <Flex className='gm-margin-left-10' column style={{ height: '100%' }}>
      <div className='gm-text-16 gm-margin-bottom-10'>
        <span>{t('设备数')}: </span>
        <span className='gm-text-primary'>{list.length}</span>
      </div>
      <Flex className='gm-margin-bottom-10'>
        <Input
          className='gm-margin-right-10'
          style={{ width: '250px' }}
          value={search_text}
          placeholder={t('请输入设备编号或名称')}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button type='primary' htmlType='submit' onClick={handleSearchDevice}>
          {t('定位')}
        </Button>
        {/** 当前选中为小组才展示添加按钮 */}
        {globalStore.hasPermission(
          Permission.PERMISSION_PRODUCTION_UPDATE_PROCESSOR,
        ) &&
          parent_id !== '0' &&
          parent_id !== '' && (
            <Flex flex justifyEnd>
              <Button
                type='primary'
                htmlType='submit'
                onClick={handleAddDevice}
              >
                {t('添加')}
              </Button>
            </Flex>
          )}
      </Flex>
      <DeviceList data={list} />
    </Flex>
  )
})

export default WorkShopWithDevice
