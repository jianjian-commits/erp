import { t } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Tree, Flex } from '@gm-pc/react'
import _ from 'lodash'
import { list_Device_DeviceType } from 'gm_api/src/device'

import DeviceAdd from './work_shop/device_add_list'
import store from '../store'

const WorkShopAddDevice = observer(() => {
  const {
    device_add_detail: { current_device_type, current_device },
    device_list,
  } = store

  const [deviceTypeList, setDeviceTypeList] = useState<
    { value: string; text: string }[]
  >([])

  useEffect(() => {
    let list: { value: string; text: string }[] = []
    list = _.map(list_Device_DeviceType, ({ value, text }) => ({
      value: String(value),
      text,
    }))
    setDeviceTypeList(list)
    // 默认设置选择第一个分类
    store.updateDeviceAddDetail('current_device_type', '0')
    store.getDevice()
  }, [])

  // 点击勾选类型
  const handleClickItem = (selected: string) => {
    store.updateDeviceAddDetail('current_device_type', selected)
  }

  // 选中类型
  const handleSelectedTypes = (selected: string[]) => {
    const _device: { [key: string]: string[] } = {}
    _.forEach(selected, (s) => {
      _device[s] = _.map(device_list[s], (v) => v.device_id!)
    })
    store.updateDeviceAddDetail('current_device', _device)
  }

  const selected: string[] = _.map(
    current_device,
    (_value, key) =>
      // 去掉半勾选
      key,
  )

  /** 左侧展示设备类型列表，右侧展示设备类型下的所有设备 */
  return (
    <Flex className='b-work-shop-add-process' style={{ height: '100%' }}>
      <Tree
        title={t('设备类型')}
        className='b-work-shop-add-process-tree'
        list={deviceTypeList} // 设备类型
        selectedValues={selected}
        onSelectValues={handleSelectedTypes}
        showAllCheck={false}
        withFilter={false}
        activeValue={current_device_type}
        renderLeafItem={(item) => (
          <Flex
            alignCenter
            style={{ height: '100%' }}
            onClick={() => handleClickItem(item.value)}
          >
            {item.text}
          </Flex>
        )}
      />
      <DeviceAdd />
    </Flex>
  )
})

export default WorkShopAddDevice
