import ChartIcon from '@/svg/view_chart.svg'
import { Button, Flex, RightSideModal, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  Device,
  DeviceData_DataType,
  DeviceException_AlarmType,
  NumberData,
} from 'gm_api/src/device'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import DeviceChart from '../../../../components/deviceChat/deviceChart'
import store from '../../store'
import CardOptions from './components/card_options'

/**
 * 监控页面设备卡片的属性
 */
interface DeviceCardProps {
  /** 设备信息 */
  device: Device
  /** 刷新列表函数 */
  refreshList: Function
}

/**
 * 监控页面设备卡片的组件函数
 */
const DeviceCard: FC<DeviceCardProps> = observer(({ device, refreshList }) => {
  const { device_id, enable_status, region, device_name, device_data } = device

  const data = device_data?.data?.datas || {}

  const temperature_data = data[DeviceData_DataType.DATATYPE_TEMPERATURE]
  const humidity_data = data[DeviceData_DataType.DATATYPE_HUMIDITY]

  /**
   * 判断温湿度数据是否合法
   * 如果数据不存在或者数据的报警类型为未指定，则为合法；否则不合法
   */
  const isTempValid =
    !temperature_data ||
    temperature_data?.alarm_type ===
      DeviceException_AlarmType.ALARMTYPE_UNSPECIFIED
  const isHumValid =
    !humidity_data ||
    humidity_data?.alarm_type ===
      DeviceException_AlarmType.ALARMTYPE_UNSPECIFIED

  /**
   * 获取卡片的报警类型
   * @return {string} 卡片的报警类型，normal为正常，alert为报警
   */
  const getCardAlarmType = () => {
    return isTempValid && isHumValid ? 'normal' : 'alert'
  }

  /**
   * 获取数据的报警类型
   * @param  {boolean} isValid 数据是否合法，true为合法，否则不合法
   * @return {string}          数据的报警类型，normal为正常，alert为报警
   */
  const getAlarmType = (isValid: boolean) => {
    return isValid ? 'normal' : 'alert'
  }

  /**
   * 获取卡片的样式class，用在style.less中
   * @return {string} 卡片的样式class
   */
  const getCardClass = (): string => {
    let cardClass = 'iot-device-card '
    cardClass += enable_status === 1 ? getCardAlarmType() : 'offline'
    return cardClass
  }

  /**
   * 获取设备状态的样式class
   * @return {string} 设备状态的样式class
   */
  const getStatusClass = () => {
    let statusClass = 'iot-device-card-header-status '
    statusClass += enable_status === 1 ? 'online' : 'offline'
    return statusClass
  }

  /**
   * 获取设备状态文字
   * @return {string} 设备状态文字，“在线”或“离线”
   */
  const getStatusText = () => {
    const statusText = enable_status === 1 ? '在线' : '离线'
    return t(statusText)
  }

  /**
   * 获取数据值样式的class
   * @param  {boolean} isValid 数据是否合法，true为合法，否则不合法
   * @return {string}          数据值样式的class
   */
  const getValueClass = (isValid: boolean): string => {
    let valueClass = 'iot-device-card-content-data-value '
    valueClass += getAlarmType(isValid)
    return valueClass
  }

  /**
   * 获取数据单位样式的class
   * @param  {boolean} isValid 数据是否合法，true为合法，否则不合法
   * @return {string}          数据单位样式的class
   */
  const getUnitClass = (isValid: boolean): string => {
    let unitClass = 'iot-device-card-content-data-unit '
    unitClass += getAlarmType(isValid)
    return unitClass
  }

  /**
   * 获取数据差异符号样式的class
   * @param  {boolean}    isValid 数据是否合法，true为合法，否则不合法
   * @param  {NumberData} [data]  数据
   * @return {string}             数据差异符号样式的class
   */
  const getDiffClass = (isValid: boolean, data?: NumberData): string => {
    if (!data) {
      return 'iot-device-card-content-data-diff'
    }

    const { alarm_type } = data
    let diffClass = 'iot-device-card-content-data-diff '
    diffClass +=
      isValid || alarm_type === DeviceException_AlarmType.ALARMTYPE_UNSPECIFIED
        ? 'normal'
        : alarm_type === DeviceException_AlarmType.ALARMTYPE_OVER_LIMIT
        ? 'above'
        : 'below'
    return diffClass
  }

  /**
   * 处理解除警报按钮点击事件，点击解除警报按钮触发
   * 解除该设备的警报并刷新列表
   */
  const handleDismissClick = (): void => {
    store.dismissAlarm(device_id).then(() => {
      refreshList()
      return null
    })
  }

  /**
   * 处理查看曲线图事件，点击曲线图图标触发
   * 展示该设备近8小时的数据
   */
  const handleView = () => {
    RightSideModal.render({
      title: t('设备数据详情'),
      style: { width: '640px' },
      children: <DeviceChart device_id={device_id} />,
      onHide: RightSideModal.hide,
    })
  }

  /**
   * 处理移除监控设备事件，点击删除选项触发
   * 从监控列表中移除该设备并刷新列表
   */
  const handleDelete = () => {
    store.deleteMonitorDevice(device_id).then((json) => {
      Tip.success(t('删除成功'))
      refreshList()
      return json
    })
    // 需求暂时不要求二次确认对话框，如果需要就激活下面的代码
    // Dialog.render({
    //   title: t('删除设备'),
    //   buttons: [
    //     {
    //       text: t('取消'),
    //       onClick: Dialog.hide,
    //     },
    //     {
    //       text: t('确定'),
    //       onClick: () => {
    //         store.deleteDevice(device_id).then((json) => {
    //           Tip.success(t('删除成功'))
    //           refreshList()
    //           Dialog.hide()
    //           return json
    //         })
    //       },
    //       btnType: 'primary',
    //     },
    //   ],
    //   children: t('确认删除？'),
    // })
  }

  /**
   * 渲染组件
   * 组件内不同情况下的样式由style.less中的class名决定
   * 组件函数中只是通过逻辑来给元素赋予不同的class以分配样式
   * 组件函数中所有getXXXClass的函数都是来判断并赋予class的
   */
  return (
    <div className={getCardClass()}>
      <div className='iot-device-card-status-bar' />
      <Flex className='iot-device-card-header' justifyBetween>
        <Flex>
          <div className={getStatusClass()}>{getStatusText()}</div>
          <div
            className='iot-device-card-header-title'
            title={`${region}/${device_name}`}
          >
            {region ? `${region}/${device_name}` : device_name}
          </div>
        </Flex>
        <Flex>
          <Flex
            className='iot-device-card-header-chart'
            alignCenter
            justifyCenter
          >
            <ChartIcon className='gm-text-18' onClick={handleView} />
          </Flex>
          <Flex
            className='iot-device-card-header-options'
            alignCenter
            justifyCenter
          >
            <CardOptions device_id={device_id} onDelete={handleDelete} />
          </Flex>
        </Flex>
      </Flex>
      <Flex className='iot-device-card-content' justifyCenter>
        <div className='iot-device-card-content-data'>
          <div className='iot-device-card-content-data-prop'>{t('温度')}</div>
          {enable_status === 1 ? (
            <Flex alignBaseline>
              <div className={getValueClass(isTempValid)}>
                {temperature_data?.val?.toFixed(1) || '-'}
              </div>
              <div className={getUnitClass(isTempValid)}>
                {temperature_data?.unit_name}
              </div>
              <div className={getDiffClass(isTempValid, temperature_data)} />
            </Flex>
          ) : (
            <Flex alignBaseline>
              <div className='iot-device-card-content-data-value offline'>
                -
              </div>
            </Flex>
          )}
        </div>
        <div className='iot-device-card-content-data'>
          <div className='iot-device-card-content-data-prop'>{t('湿度')}</div>
          {enable_status === 1 ? (
            <Flex alignBaseline>
              <div className={getValueClass(isHumValid)}>
                {humidity_data?.val?.toFixed(2) || '-'}
              </div>
              <div className={getUnitClass(isHumValid)}>
                {humidity_data?.unit_name}
              </div>
              <div className={getDiffClass(isHumValid, humidity_data)} />
            </Flex>
          ) : (
            <Flex alignBaseline>
              <div className='iot-device-card-content-data-value offline'>
                -
              </div>
            </Flex>
          )}
        </div>
        <Flex
          className='iot-device-card-content-dismiss'
          alignCenter
          justifyCenter
        >
          <Button type='primary' onClick={handleDismissClick}>
            {t('解除警报')}
          </Button>
        </Flex>
      </Flex>
    </div>
  )
})

export default DeviceCard
