import { history } from '@/common/service'
import BackButton from '@/svg/back.svg'
import { useGMLocation } from '@gm-common/router'
import { Flex, Tabs } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { list_Device_DeviceType } from 'gm_api/src/device'
import React, { FC, useState } from 'react'
import '../style.less'
import AlertRecordTab from './components/alert_tab/index'
import HistoryRecordTab from './components/history_tab/index'

/**
 * 数据记录页面的组件函数
 */
const DataRecordPage: FC = () => {
  /**
   * 通过useGMLocation从url的query中获取type，modelId，name属性
   */
  const { type, modelId, name } = useGMLocation<{
    type: string
    modelId: string
    name: string
  }>().query

  const [active, setActive] = useState(0)
  /**
   * 标签页列表
   */
  const tabs = [
    {
      text: t('历史记录'),
      value: 0,
      children: (
        <HistoryRecordTab type={parseInt(type)} modelId={modelId} name={name} />
      ),
    },
  ]
  // 如果是湿温度传感器则需要报警记录
  if (type === '1') {
    tabs.push({
      text: t('报警记录'),
      value: 1,
      children: (
        <AlertRecordTab type={parseInt(type)} modelId={modelId} name={name} />
      ),
    })
  }

  /**
   * 渲染组件
   */
  return (
    <div>
      <Flex className='iot-data-record-header' alignCenter>
        <BackButton
          className='iot-data-record-header-button'
          onClick={() => history.go(-1)}
        />
        <div className='iot-data-record-header-text'>
          {
            /**
             * 有设备名说明是从设备页面过来的，那就显示设备名
             * 没有说明是在从数据页面过来的，那就显示设备类型
             */
            name || list_Device_DeviceType[parseInt(type) - 1].text
          }
        </div>
      </Flex>
      <Tabs
        tabs={tabs}
        active={active}
        onChange={(active) => setActive(active)}
        light
      />
    </div>
  )
}

export default DataRecordPage
