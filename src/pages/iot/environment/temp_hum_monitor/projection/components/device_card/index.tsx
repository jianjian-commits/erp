import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Device, DeviceData_DataType, NumberData } from 'gm_api/src/device'
import React, { FC, useEffect, useState } from 'react'

/**
 * 投屏页面设备卡片的属性
 */
interface DeviceCardProps {
  /** 设备信息 */
  device: Device
  /** 是否高亮，高亮的设备会在右侧图表显示近8小时的数据 */
  highlight?: boolean
}

/**
 * 投屏页面设备卡片的组件函数
 */
const DeviceCard: FC<DeviceCardProps> = ({ device, highlight }) => {
  const { region, device_name, device_data } = device

  const temperatureData =
    device_data?.data?.datas &&
    device_data.data.datas[DeviceData_DataType.DATATYPE_TEMPERATURE]
  const humidityData =
    device_data?.data?.datas &&
    device_data.data.datas[DeviceData_DataType.DATATYPE_HUMIDITY]

  const [isTempValid, setIsTempValid] = useState(true)
  const [isHumValid, setIsHumValid] = useState(true)

  /**
   * 获取数据报警类型
   * @param  {boolean} isValid 数据是否合法；true为合法，否则不合法
   * @return {string}          数据报警类型，normal为正常，alert为异常
   */
  const getAlarmType = (isValid: boolean): string => {
    return isValid ? 'normal' : 'alert'
  }

  /**
   * 获取数据值的样式class
   * @param  {boolean} isValid 数据是否合法；true为合法，否则不合法
   * @return {string}          数据值的样式class
   */
  const getValueClass = (isValid: boolean): string => {
    let valueClass = 'iot-projection-device-card-data-value '
    valueClass += getAlarmType(isValid)
    return valueClass
  }

  /**
   * 获取数据单位的样式class
   * @param  {boolean} isValid 数据是否合法；true为合法，否则不合法
   * @return {string}          数据单位的样式class
   */
  const getUnitClass = (isValid: boolean): string => {
    let unitClass = 'iot-projection-device-card-data-unit '
    unitClass += getAlarmType(isValid)
    return unitClass
  }

  /**
   * 获取数据差异符号的样式class
   * @param  {boolean}    isValid 数据是否合法；true为合法，否则不合法
   * @param  {NumberData} [data]  数据
   * @return {string}             数据差异符号的样式class
   */
  const getDiffClass = (isValid: boolean, data?: NumberData): string => {
    if (!data) {
      return 'iot-projection-device-card-data-diff'
    }

    const { alarm_type } = data
    let diffClass = 'iot-projection-device-card-data-diff '
    diffClass +=
      isValid || alarm_type === 0
        ? 'normal'
        : alarm_type === 1
        ? 'above'
        : 'below'
    return diffClass
  }

  useEffect(() => {
    setIsTempValid(temperatureData ? temperatureData.alarm_type === 0 : true)
  }, [temperatureData])

  useEffect(() => {
    setIsHumValid(humidityData ? humidityData.alarm_type === 0 : true)
  }, [humidityData])

  /**
   * 渲染组件
   * 组件内不同情况下的样式由style.less中的class名决定
   * 组件函数中只是通过逻辑来给元素赋予不同的class以分配样式
   * 组件函数中所有getXXXClass的函数都是来判断并赋予class的
   */
  return (
    <div
      className={`iot-projection-card-container ${highlight && 'highlight'}`}
    >
      <Flex className='iot-projection-device-card'>
        <div
          className='iot-projection-device-card-title'
          title={`${region}/${device_name}`}
        >
          {/** 默认是区域/设备名，若没有区域则只显示设备名 */}
          {region ? `${region}/${device_name}` : device_name}
        </div>
        <Flex className='iot-projection-device-card-content'>
          <Flex className='iot-projection-device-card-prop'>
            <Flex className='iot-projection-device-card-prop-name' alignCenter>
              {t('温度')}
            </Flex>
            <Flex className='iot-projection-device-card-prop-name' alignCenter>
              {t('湿度')}
            </Flex>
          </Flex>
          <div className='iot-projection-device-card-data'>
            <Flex alignBaseline>
              <div className={getValueClass(isTempValid)}>
                {temperatureData?.val?.toFixed(1) || '-'}
              </div>
              <div className={getUnitClass(isTempValid)}>
                {temperatureData?.unit_name}
              </div>
              <div className={getDiffClass(isTempValid, temperatureData)} />
            </Flex>
            <Flex className='iot-projection-device-card-data' alignBaseline>
              <div className={getValueClass(isHumValid)}>
                {humidityData?.val?.toFixed(2) || '-'}
              </div>
              <div className={getUnitClass(isHumValid)}>
                {humidityData?.unit_name}
              </div>
              <div className={getDiffClass(isHumValid, humidityData)} />
            </Flex>
          </div>
        </Flex>
      </Flex>
    </div>
  )
}

export default DeviceCard
