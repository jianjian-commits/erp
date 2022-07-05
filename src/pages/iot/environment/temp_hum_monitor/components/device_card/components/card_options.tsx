import OptionIcon from '@/svg/more_options.svg'
import { List, Popover } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC } from 'react'

/**
 * 设备卡片选项的属性
 */
interface CardOptionsProps {
  /** 设备ID */
  device_id: string
  /** 删除函数 */
  onDelete: Function
}

/**
 * 设备卡片属性的组件函数
 */
const CardOptions: FC<CardOptionsProps> = (props) => {
  const { onDelete } = props

  /**
   * 渲染弹出的选项列表
   * @return {List} 选项列表
   */
  const renderPopup = () => {
    // 选项
    const options = [
      {
        value: 'delete',
        text: t('删除'),
        onSelect: onDelete,
      },
    ]

    /**
     * 处理点击选项的事件，点击选项时触发
     * 执行选项的选择触发函数
     */
    const handleSelect = () => {
      onDelete() // 当前只有一个选项，所以直接执行该选项的动作，如果有多个需要传入选项字符串并筛选
    }

    /**
     * 渲染列表
     */
    return (
      <List
        data={options}
        className='gm-border-0'
        style={{ minWidth: '60px' }}
        onSelect={handleSelect}
      />
    )
  }

  /**
   * 渲染组件
   */
  return (
    <Popover type='hover' popup={renderPopup} top showArrow>
      <div>
        <OptionIcon className='gm-text-18' />
      </div>
    </Popover>
  )
}

export default CardOptions
