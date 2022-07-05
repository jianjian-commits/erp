import { history } from '@/common/service'
import { Flex, RightSideModal } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  DeviceData_DataType,
  GetDevice,
  GetDeviceRequest_StatisticalType,
} from 'gm_api/src/device'
import _ from 'lodash'
import moment from 'moment'
import React, { FC, useEffect, useRef, useState } from 'react'
import '../../environment/temp_hum_monitor/style.less'
import DataChart from './dataChart'
import { dataTypeEnum } from './enum'
import {
  DeviceDataType,
  DeviceItemType,
  DEVICE_ITEM_VALUE,
  ItemChartsDataType,
  ItemChartsType,
} from './interface'

const DeviceItem: DeviceItemType[] = [
  {
    value: 'temperature',
    text: t('温度'),
    dataType: DeviceData_DataType.DATATYPE_TEMPERATURE,
  },
  {
    value: 'humidity',
    text: t('湿度'),
    dataType: DeviceData_DataType.DATATYPE_HUMIDITY,
  },
]

const DeviceChart: FC<{ device_id: string; isMore?: boolean }> = ({
  device_id,
  isMore,
}) => {
  const deviceData = useRef<DeviceDataType>()
  const deviceDatas = useRef<ItemChartsType>()
  const [type, setType] = useState<DEVICE_ITEM_VALUE>('temperature')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    GetDevice({
      device_id,
      need_alarm_rule: true,
      need_newest_data: true,
      statistical_type:
        GetDeviceRequest_StatisticalType.STATISTICALTYPE_LAST_8_HOURS,
    }).then((json) => {
      const { device, device_alarm_rule, device_datas } = json.response
      const mapData = ({
        text,
        dataType,
      }: DeviceItemType): ItemChartsDataType[] =>
        _.map(device_datas, ({ data }) => {
          const infoData = data?.datas?.[dataType]
          return {
            time: moment(+infoData?.time!).format('HH:mm'),
            value: infoData?.val!,
            type: text!,
            unitName: infoData?.unit_name!,
          }
        })

      deviceData.current = Object.assign(device, {
        device_alarm_rule: device_alarm_rule!,
      })
      deviceDatas.current = {
        [DeviceData_DataType.DATATYPE_TEMPERATURE]: mapData(DeviceItem[0]),
        [DeviceData_DataType.DATATYPE_HUMIDITY]: mapData(DeviceItem[1]),
      }
      setLoading(true)
      return null
    })
  }, [])

  const getCardClass = (cardType: string) => {
    let cardClass = 'iot-device-chart-info-card'
    if (cardType === type) {
      cardClass += ' highlight'
    }
    return cardClass
  }

  const Item: FC<{
    data: DeviceItemType
  }> = ({ data: { value: type, text, dataType } }) => {
    const data = deviceData.current?.device_data?.data?.datas?.[dataType]
    return (
      <div className={getCardClass(type)} onClick={() => setType(type)}>
        <div className='iot-device-chart-info-card-prop'>{text}</div>
        <Flex alignBaseline>
          <div className='iot-device-chart-info-card-value'>
            {data?.val?.toFixed(2) || '-'}
          </div>
          <div className='iot-device-chart-info-card-unit'>
            {data?.unit_name}
          </div>
        </Flex>
      </div>
    )
  }

  const handleToMore = () => {
    const { device_type, device_model_id, device_name } = deviceData.current!
    RightSideModal.hide()
    /**
     * 由于device_name可能有中文，所以必须使用encodeURIComponent()进行转码，否则会使数据页面加载两次，从而调两次接口
     * 究其原因，应该是在进行带参数跳转时，浏览器会自动对中文进行转码，然后又会导致router的history方法监听浏览器地址栏变化
     * 也就是说当我们使用的路径中带有中文时，浏览器地址会变化两次，然后导致页面组件也会加载两次
     * 使用encodeURIComponent()之后路径中的中文已经被转换了，所以浏览器地址只会变化一次，所以页面也只加载一次
     */
    history.push(
      `/iot/device_management/data/records?type=${device_type}&modelId=${device_model_id}&name=${encodeURIComponent(
        device_name || '',
      )}`,
    )
  }

  return (
    <div className='iot-device-chart'>
      {isMore && (
        <Flex justifyEnd>
          <a className='tw-cursor-pointer' onClick={handleToMore}>
            {t('查看更多数据 >')}
          </a>
        </Flex>
      )}
      <Flex className='iot-device-chart-info' alignCenter justifyBetween>
        {_.map(DeviceItem, (data) => (
          <Item data={data} key={data.dataType} />
        ))}
      </Flex>
      <div className='iot-device-chart-chart'>
        <DataChart
          dataType={dataTypeEnum[type]}
          deviceData={deviceData.current!}
          deviceDatas={deviceDatas.current!}
        />
      </div>
    </div>
  )
}

export default DeviceChart
