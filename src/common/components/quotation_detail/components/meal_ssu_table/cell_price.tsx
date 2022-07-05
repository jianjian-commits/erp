import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { Flex, Price } from '@gm-pc/react'
import React, { CSSProperties } from 'react'

interface CellPriceProps {
  className?: string
  style?: CSSProperties
  value?: number
  onChange?: (value?: number) => void
}

const CellPrice: React.VFC<CellPriceProps> = (props) => {
  const { className, style, value, onChange } = props

  const val: number | null = value === undefined ? null : value
  const handleChange = (e: number | null) => {
    onChange && onChange(e === null ? undefined : e)
  }

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        className={className}
        style={style}
        precisionType='order'
        value={val}
        onChange={handleChange}
      />
      <span>{Price.getUnit()}</span>
    </Flex>
  )
}

export default CellPrice
