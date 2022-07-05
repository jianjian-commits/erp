import { Container, FullScreenHeader } from '@/common/components/fullscreen'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  Device,
  Device_EnableStatus,
  GetDeviceResponse,
} from 'gm_api/src/device'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import store from '../store'
import '../style.less'
import DeviceCard from './components/device_card'
import ProjectionChart from './components/projection_chart'

/**
 * 投屏页面的组件函数
 */
const MonitorProjectionPage = () => {
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const dayOfWeek = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ]
  const now = moment()

  /**
   * 为了避免页面重复渲染，把所有的变量都放到一个对象中当做一个state
   * 为了避免图表与卡片的切换有延迟，把获取图表数据的响应也放在这里
   * 等到卡片和图表数据都返回之后再开始渲染
   */
  const [pageData, setPageData] = useState<{
    isFirstRender: boolean
    devices: Device[]
    highlightIndex: number
    getDeviceResponse?: GetDeviceResponse
  }>({
    isFirstRender: true,
    devices: [],
    highlightIndex: -1,
  })

  const { isFirstRender, devices, highlightIndex, getDeviceResponse } = pageData

  // 根据屏幕的高度自适应卡片个数，上限为5
  const scrollCount = Math.min(
    Math.floor((window.innerHeight - 280) / 140) + 1,
    5,
  )

  /**
   * 获取设备信息和最近8小时的数据，用于展示卡片和对应的图表
   * @async
   */
  const getDeviceAndRecentData = async () => {
    const isFirstRender = false
    // 获取设备信息，包括最后一次的数据
    const devices = await store
      .fetchDevices({
        enable_status: Device_EnableStatus.ENABLESTATUS_ENABLE,
      })
      .then((deviceGroups) => {
        const deviceData = deviceGroups.map(
          (deviceGroup) => deviceGroup.device,
        ) as Device[]
        return deviceData
      })

    // 如果请求错误或者超时，则10秒钟后重新发送请求
    if (!devices) {
      timeout.current = setTimeout(() => {
        getDeviceAndRecentData()
      }, 10 * 1000)
      return
    }

    // 获取并更新当前展示设备对应的序号
    let { highlightIndex } = pageData
    highlightIndex = (highlightIndex + 1) % devices.length
    // 获取当前展示设备最近8小时的数据
    const deviceId = devices[highlightIndex].device_id
    const getDeviceResponse = await store
      .getDeviceData(deviceId)
      .then((response) => {
        return response.response
      })

    // 如果请求错误或者超时，则10秒钟后重新发送请求
    if (!getDeviceResponse) {
      timeout.current = setTimeout(() => {
        getDeviceAndRecentData()
      }, 10 * 1000)
      return
    }

    setPageData({ isFirstRender, devices, highlightIndex, getDeviceResponse })
  }

  /**
   * 获取卡片列表样式的class
   * @retrun {string} 卡片列表样式的class
   */
  const getCardGridClass = () => {
    let cardGridClass = 'iot-projection-card-grid '
    cardGridClass += devices.length >= scrollCount ? 'flex' : 'block'
    return cardGridClass
  }

  // 第一次载入即时获取数据，随后每10秒获取一次
  if (isFirstRender) {
    getDeviceAndRecentData()
  } else {
    timeout.current = setTimeout(() => {
      getDeviceAndRecentData()
    }, 10 * 1000) // 10秒
  }

  useEffect(() => {
    // 退出投屏页面时清除timeout，以防覆盖其他页面的数据
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
    }
  }, [])

  /**
   * 渲染组件
   */
  return (
    <Container className='gm-padding-top-5'>
      <FullScreenHeader
        className='gm-margin-tb-10'
        title={t('温湿度监控')}
        leftSubtitle={dayOfWeek[now.weekday()]}
        rightSubtitle={now.format('YYYY年MM月DD日')}
        exitText={t('退出投屏')}
      />
      {devices.length ? (
        <Flex className='iot-projection-content flex'>
          <div className={getCardGridClass()}>
            {devices.map((device, index) => {
              if (index >= scrollCount) {
                return
              }
              return (
                <DeviceCard
                  key={device.device_id}
                  device={devices[(highlightIndex + index) % devices.length]}
                  highlight={index === 0}
                />
              )
            })}
          </div>
          <div className='iot-projection-chart-card'>
            <div className='iot-projection-chart-card-title'>
              {t('温湿度曲线')}
            </div>
            <div className='iot-projection-chart-card-chart'>
              {devices.length && getDeviceResponse && (
                <ProjectionChart getDeviceResponse={getDeviceResponse} />
              )}
            </div>
          </div>
        </Flex>
      ) : (
        <h1 style={{ color: 'white', margin: '20px' }}>{t('无数据')}</h1>
      )}
    </Container>
  )
}

export default MonitorProjectionPage
