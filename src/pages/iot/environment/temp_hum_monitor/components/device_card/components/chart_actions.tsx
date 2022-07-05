import ChartIcon from '@/svg/view_chart.svg'
import { List, Popover } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC } from 'react'

/**
 * 图表操作的属性
 */
interface ChartActionsProps {
  /** 查看图表函数 */
  onView: Function
}

/**
 * 设备卡片图表操作的组件函数
 */
const ChartActions: FC<ChartActionsProps> = (props) => {
  const { onView } = props

  /**
   * 渲染弹出的选项列表
   * @return {List} 选项列表
   */
  const renderPopup = () => {
    // 选项
    const options = [
      {
        value: 'view',
        text: t('查看曲线图'),
      },
    ]

    /**
     * 处理点击选项的事件，点击选项时触发
     * 执行选项的选择触发函数
     */
    const handleSelect = () => {
      onView() // 当前只有一个选项，所以直接执行该选项的动作，如果有多个需要传入选项字符串并筛选
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
        <ChartIcon className='gm-text-18' />
      </div>
    </Popover>
  )
}

export default ChartActions
