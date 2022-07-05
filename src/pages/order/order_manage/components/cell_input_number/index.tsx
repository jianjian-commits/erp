import React, { ReactNode } from 'react'
import { Flex } from '@gm-pc/react'
import { KCInputNumber } from '@gm-pc/keyboard'
import globalStore from '@/stores/global'
import _ from 'lodash'

interface CellInputNumberProps {
  value?: string | number | null
  placeholder?: string
  disabled?: boolean
  /**
   * 精度
   *
   * 默认使用 globalStore.dpOrder
   */
  precision?: number
  /** 后缀内容 */
  suffix?: ReactNode
  onChange?: (value: number) => void
}

/** 单元格 数字输入组件 */
const CellInputNumber: React.VFC<CellInputNumberProps> = (props) => {
  const {
    value,
    placeholder,
    precision = globalStore.dpOrder,
    disabled,
    suffix,
    onChange,
  } = props

  const maybeNumber =
    _.isNil(value) || _.size(`${value}`) === 0 ? null : Number(value)
  const val = Number.isNaN(maybeNumber) ? null : maybeNumber

  return (
    <Flex alignCenter>
      <KCInputNumber
        value={val}
        onChange={onChange}
        precision={precision}
        disabled={disabled}
        placeholder={placeholder}
        min={0}
      />
      <Flex className='gm-padding-left-5 tw-flex-none'>{suffix}</Flex>
    </Flex>
  )
}

export default CellInputNumber
