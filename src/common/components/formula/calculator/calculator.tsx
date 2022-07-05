import { Input, InputProps, Popover } from '@gm-pc/react'
import _ from 'lodash'
import React, { useRef, useEffect, useCallback } from 'react'
import './calc.less'
import CalculatorPanel from './calculator-panel'
import { ACTION, ActionType } from './enum'
import { CalcBtnConfig } from './types'
import classNames from 'classnames'
import useInputRef from './hooks/use_input_ref'
import useFormulaValue from './hooks/use_formula_value'
import useKeybordEvent from './hooks/use_keybord_event'
import useInputFocusState from './hooks/use_input_focus_state'
import { OPERATOR_BUTTON } from './constant'
import { Tooltip } from 'antd'

export interface CalculatorProps extends Omit<InputProps, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?(value: string): void
}

const Calculator: React.VFC<CalculatorProps> = (props) => {
  const { className, ...rest } = props
  const popoverRef = useRef<Popover>(null)

  const { inputRef, setCursorPosition, getCursorPosition } = useInputRef()
  const {
    formulaDesc,
    insetValue,
    clear,
    backspace,
    getRealCursorPosition,
    getCursorPositionSibling,
  } = useFormulaValue(props)

  /**
   * 为防止 input 失去焦点，button 鼠标事件已阻止默认事件。
   * 但是这样会引发问题：文本较长时，input 不再跟随光标位置滚动内容。
   *
   * 所以，以下代码的作用是：
   * 记录将要设置的光标位置，便于下一次渲染时使用。
   *
   * 为什么是下一次渲染？
   * 在 React 的合成事件中，setState 有类似异步的表现。当点击按钮输入公式或数字时，
   * 会调用 setState 更新页面，但它不是立刻更新的，而有 batchedUpdate，此时去设置
   * 光标位置则可能不准确。所以，在此记录下一次渲染时的光标位置，以便于
   * 渲染时设置。
   */
  const nextCursorPosition = useRef<number | null>(null)
  useEffect(() => {
    if (nextCursorPosition.current !== null) {
      setCursorPosition(nextCursorPosition.current)
      nextCursorPosition.current = null
    }
  })

  // 是否在原生事件中触发
  const isNativeEventTrigger = useRef(false)

  /**
   * 设置光标位置
   *
   * @param forNextRender 将光标位置作为下一次渲染时使用
   */
  const onSetCursorPosition = useCallback(
    (index: number, forNextRender = false) => {
      if (!isNativeEventTrigger.current && forNextRender) {
        nextCursorPosition.current = index
        return
      }
      isNativeEventTrigger.current = false
      setCursorPosition(index)
    },
    [setCursorPosition],
  )

  const handleClosePopover = () => {
    if (popoverRef.current) {
      popoverRef.current.apiDoSetActive(false)
    }
  }

  const onSetValue = (calcItem: CalcBtnConfig) => {
    const index = getCursorPosition()
    insetValue(calcItem, index)
    onSetCursorPosition(index + calcItem.textBoxValue.length, true)
  }

  const handleBackspace = () => {
    const index = getCursorPosition()
    const deleteWordsSize = backspace(index)
    onSetCursorPosition(index - deleteWordsSize, true)
  }

  const handler: Record<string, () => void> = {
    [ACTION.CLEAR]: clear,
    [ACTION.DONE]: handleClosePopover,
    [ACTION.BACKSPACE]: handleBackspace,
    ArrowLeft: () => {
      const { prev } = getCursorPositionSibling(getCursorPosition())
      onSetCursorPosition(prev.breforeSize)
    },
    ArrowRight: () => {
      const { next } = getCursorPositionSibling(getCursorPosition())
      onSetCursorPosition(next.afterSize)
    },
    Delete: () => {
      const { next } = getCursorPositionSibling(getCursorPosition())
      const deleteWordsSize = backspace(next.afterSize)
      onSetCursorPosition(next.afterSize - deleteWordsSize, true)
    },
    0: onSetValue.bind(null, OPERATOR_BUTTON[0]),
    1: onSetValue.bind(null, OPERATOR_BUTTON[1]),
    2: onSetValue.bind(null, OPERATOR_BUTTON[2]),
    3: onSetValue.bind(null, OPERATOR_BUTTON[3]),
    4: onSetValue.bind(null, OPERATOR_BUTTON[4]),
    5: onSetValue.bind(null, OPERATOR_BUTTON[5]),
    6: onSetValue.bind(null, OPERATOR_BUTTON[6]),
    7: onSetValue.bind(null, OPERATOR_BUTTON[7]),
    8: onSetValue.bind(null, OPERATOR_BUTTON[8]),
    9: onSetValue.bind(null, OPERATOR_BUTTON[9]),
    '.': onSetValue.bind(null, OPERATOR_BUTTON['.']),
    '+': onSetValue.bind(null, OPERATOR_BUTTON['+']),
    '-': onSetValue.bind(null, OPERATOR_BUTTON['-']),
    '*': onSetValue.bind(null, OPERATOR_BUTTON['*']),
    '/': onSetValue.bind(null, OPERATOR_BUTTON['/']),
    '(': onSetValue.bind(null, OPERATOR_BUTTON['(']),
    ')': onSetValue.bind(null, OPERATOR_BUTTON[')']),
  }

  const handleAction = (actionType: ActionType) => {
    const targetHandler = handler[actionType]
    if (targetHandler) {
      targetHandler()
    }
  }

  const { isFocus, onBlur, onFocus } = useInputFocusState()
  // 键盘事件
  useKeybordEvent((e) => {
    if (isFocus.current) {
      const targetHandler = handler[e.key]
      if (targetHandler) {
        e.preventDefault()
        e.stopPropagation()
        // 由于 React 16 setState 在原生事件属于同步操作，
        // 所以，此处的键盘事件触发后，更新光标位置就应当是同步操作
        // 而 handler 中更新光标位置均为推迟至下一次更新，所以需要
        // 区分同步和异步两种表现

        // 解决方案 1 (非标准)
        // unstable_batchedUpdates(targetHandler)

        // 解决方案 2
        isNativeEventTrigger.current = true
        targetHandler()
      }
    }
  })

  // 鼠标点击时，禁止光标处于公式变量中
  const handleClickInput = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    const index = e.currentTarget.selectionEnd
    if (index === 0) {
      return
    }
    onSetCursorPosition(getRealCursorPosition(index ?? undefined))
  }

  return (
    <Popover
      ref={popoverRef}
      popup={<CalculatorPanel onAction={handleAction} onClick={onSetValue} />}
    >
      <Tooltip trigger='hover' mouseEnterDelay={0.3} overlay={formulaDesc}>
        <Input
          ref={inputRef}
          className={classNames('calculator-field', className)}
          {...rest}
          value={formulaDesc}
          onChange={_.noop}
          onClick={handleClickInput}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Tooltip>
    </Popover>
  )
}

export default Calculator
