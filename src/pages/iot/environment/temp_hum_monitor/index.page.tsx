import { history } from '@/common/service'
import SVGEmpty from '@/svg/empty.svg'
import SVGNext from '@/svg/next.svg'
import { usePagination } from '@gm-common/hooks'
import {
  BoxForm,
  ControlledFormItem,
  Flex,
  FormBlock,
  FormButton,
  InputClose,
  Modal,
} from '@gm-pc/react'
import { Button } from 'antd'
import { t } from 'gm-i18n'
import { Device, DeviceGroup } from 'gm_api/src/device'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import CreateModal from './components/create_modal'
import DeviceCard from './components/device_card'
import store from './store'
import './style.less'

/**
 * 温湿度监控页面的组件函数
 */
const TempHumMonitorPage: FC = observer(() => {
  /**
   * 通过usePagination获取run函数
   * run函数的作用为执行store里的函数并对结果分页
   */
  const { run } = usePagination<any>(store.fetchDevices)

  const [region, setRegion] = useState<string>()
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([])

  /**
   * 处理区域更改的时间，更改区域时触发
   * 更新区域
   * @param {string} value 新的区域
   */
  const handleRegionChange = (value: string) => {
    setRegion(value)
  }

  /**
   * 处理搜索按钮点击的事件，点击搜索按钮时触发
   * 执行run函数，搜索设备
   */
  const handleSearchButtonClick = () => {
    run()
  }

  /**
   * 处理添加设备按钮点击的事件，点击添加设备按钮时触发
   * 打开添加设备弹窗
   */
  const handleCreateButtonClick = () => {
    Modal.render({
      title: t('添加设备'),
      onHide: () => {
        Modal.hide()
      },
      opacityMask: false,
      noCloseBtn: false,
      children: <CreateModal refreshList={run} />,
    })
  }

  /**
   * 获取投屏模式按钮点击的事件，点击投屏模式按钮时触发
   * 进入投屏模式的页面
   */
  const handleProjectionButtonClick = () => {
    history.push({
      pathname: '/iot/environment/temp_hum_monitor/projection',
    })
  }

  useEffect(() => {
    store.initDeviceGroups()
    run()
  }, [])

  useEffect(() => {
    store.updateFilter('region', region)
  }, [region])

  useEffect(() => {
    setDeviceGroups(toJS(store.device_groups))
  }, [store.device_groups])

  /**
   * 渲染组件
   */
  return (
    <div className='container'>
      <div>
        <Flex justifyBetween alignCenter>
          <BoxForm>
            <FormBlock>
              <ControlledFormItem label={t('区域筛选')}>
                <InputClose
                  placeholder={t('请输入区域')}
                  value={region}
                  onChange={handleRegionChange}
                />
              </ControlledFormItem>
            </FormBlock>
            <FormButton>
              <Button type='primary' onClick={handleSearchButtonClick}>
                {t('搜索')}
              </Button>
            </FormButton>
          </BoxForm>
          <Button
            className='iot-projection-button'
            onClick={handleProjectionButtonClick}
          >
            {t('投屏模式')}
            <SVGNext />
          </Button>
        </Flex>
      </div>
      <Flex className='box' column>
        <Flex justifyBetween>
          <Button
            type='primary'
            className='iot-add-device-button'
            onClick={handleCreateButtonClick}
          >
            {t('添加设备')}
          </Button>
          <Flex>
            <Flex className='iot-status-legend'>
              <Flex className='iot-status-legend-icon alert' />
              <Flex className='iot-status-legend-text'>{t('异常')}</Flex>
            </Flex>
            <Flex className='iot-status-legend'>
              <Flex className='iot-status-legend-icon normal' />
              <Flex className='iot-status-legend-text'>{t('在线')}</Flex>
            </Flex>
            <Flex className='iot-status-legend'>
              <Flex className='iot-status-legend-icon offline' />
              <Flex className='iot-status-legend-text'>{t('离线')}</Flex>
            </Flex>
          </Flex>
        </Flex>
        {deviceGroups.length ? (
          <Flex justifyBetween className='iot-device-card-grid'>
            {deviceGroups.map((deviceGroup) => {
              return (
                <DeviceCard
                  key={Math.random()}
                  device={deviceGroup.device as Device}
                  refreshList={run}
                />
              )
            })}
          </Flex>
        ) : (
          <Flex flex={1} justifyCenter>
            <Flex column alignCenter justifyCenter>
              <SVGEmpty style={{ fontSize: '64px' }} />
              <div className='gm-text-desc'>{t('暂无相关数据')}</div>
            </Flex>
          </Flex>
        )}
      </Flex>
    </div>
  )
})

export default TempHumMonitorPage
