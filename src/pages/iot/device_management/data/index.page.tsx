import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Device_DeviceType, list_Device_DeviceType } from 'gm_api/src/device'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import DeviceGroupCard from './components/device_group_card'
import store from './store'

/**
 * 数据页面的组件函数
 */
const DataListPage: FC = observer(() => {
  useEffect(() => {
    store.fetchDeviceGroups()
  }, [])

  /**
   * 渲染组件
   */
  return (
    <Flex className='product-card-grid'>
      {
        // 当前只显示温湿度类型或者计数器设备类型的设备组
        toJS(store.deviceGroups)
          ?.filter(
            (deviceGroup) =>
              deviceGroup.device_type ===
                Device_DeviceType.DEVICETTYPE_HUMIDITY_TEMPERATURE ||
              deviceGroup.device_type === Device_DeviceType.DEVICETTYPE_COUNTER,
          )
          .map((deviceGroup) => {
            const { device_type, device_count, online_count } = deviceGroup
            return (
              <DeviceGroupCard
                key={Math.random()}
                title={
                  list_Device_DeviceType[(device_type as number) - 1]?.text ||
                  t('未指定类型设备')
                }
                deviceType={
                  device_type || Device_DeviceType.DEVICETTYPE_UNSPECIFIED
                }
                deviceCount={device_count ? parseInt(device_count) : 0}
                onlineCount={online_count ? parseInt(online_count) : 0}
              />
            )
          })
      }
    </Flex>
  )
})

export default DataListPage
