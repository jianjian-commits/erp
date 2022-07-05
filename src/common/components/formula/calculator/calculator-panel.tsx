import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import React from 'react'
import { BUTTON_LIST, VARIABLE_LIST } from './constant'
import { ActionType } from './enum'
import { CalcBtnConfig } from './types'

interface CalculatorPanelProps {
  /**
   * 点击数字键盘时触发
   */
  onClick?: (value: CalcBtnConfig) => void
  /**
   * 事件触发
   */
  onAction?: (type: ActionType) => void
}

// 阻止默认事件可以防止 input 失去焦点
const preventDefault = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
  e.preventDefault()
}

const CalculatorPanel: React.FC<CalculatorPanelProps> = (props) => {
  const { onAction, onClick } = props

  const handleClick = (val: CalcBtnConfig) => {
    if (val.isAction) {
      if (_.isFunction(onAction)) {
        onAction(val.value as ActionType)
      }
    } else {
      if (_.isFunction(onClick)) {
        onClick(val)
      }
    }
  }

  const renderBtn = (item: CalcBtnConfig) => {
    return (
      <button
        key={item.value}
        type='button'
        className='calc-button'
        style={item.style}
        onPointerDown={preventDefault}
        onMouseDown={preventDefault}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          handleClick(item)
        }}
      >
        {item.content}
      </button>
    )
  }

  return (
    <Flex className='calculator-panel' onMouseDown={preventDefault}>
      <div className='calculator-side' onMouseDown={preventDefault}>
        {VARIABLE_LIST.map(renderBtn)}
      </div>
      <div className='calc-panel' onMouseDown={preventDefault}>
        {BUTTON_LIST.map(renderBtn)}
      </div>
    </Flex>
  )
}

export default CalculatorPanel
