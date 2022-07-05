import { history } from '@/common/service'
import { t } from 'gm-i18n'
import { Device_DeviceType } from 'gm_api/src/device'
import React, { FC, HtmlHTMLAttributes, MouseEventHandler } from 'react'
import '../style.less'

/**
 * 数据页面设备组卡片的属性
 */
interface CardProps extends HtmlHTMLAttributes<HTMLDivElement> {
  /** 设备组的名 */
  title: string
  /** 设备类型 */
  deviceType: Device_DeviceType
  /** 设备数量 */
  deviceCount: number
  /** 在线数量 */
  onlineCount: number
  /** 点击触发事件 */
  onClick?: MouseEventHandler<HTMLDivElement>
}

/**
 * 数据页面设备组卡片的组件函数
 */
const DeviceGroupCard: FC<CardProps> = ({
  title,
  deviceType,
  deviceCount,
  onlineCount,
  onClick,
}) => {
  /**
   * 处理卡片点击事件，点击卡片时触发
   * 跳转到数据列表页面
   */
  const handleClick = () => {
    history.push(`/iot/device_management/data/records?type=${deviceType}`)
  }

  /**
   * 渲染组件
   */
  return (
    <div className='iot-product-card' onClick={onClick || handleClick}>
      <div className='iot-product-card-header'>{title}</div>
      <div className='iot-product-card-content'>
        <div className='iot-product-card-content-data'>
          <div className='iot-product-card-content-data-prop'>
            {t('设备总数')}
          </div>
          <div className='iot-product-card-content-data-value'>
            {deviceCount}
          </div>
        </div>
        <div className='iot-product-card-content-data'>
          <div className='iot-product-card-content-data-prop'>
            {t('在线个数')}
          </div>
          <div className='iot-product-card-content-data-value'>
            {onlineCount}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeviceGroupCard
