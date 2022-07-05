import React from 'react'
import { Select } from '@gm-pc/react'
import { Filters_Bool } from 'gm_api/src/common'
import _ from 'lodash'
import { PRINT_MEAN, PRINT_OPTIONS } from './constants'

interface CellPrintProps {
  /** 打印状态 */
  value?: Filters_Bool
  /** 只读 */
  readonly?: boolean
  disabled?: boolean
  onChange?: (value: Filters_Bool) => void
}

/** 订单打印状态 */
const CellPrint: React.VFC<CellPrintProps> = (props) => {
  const { readonly = false, disabled, value, onChange } = props

  if (readonly) {
    if (_.isNil(value)) {
      return <>-</>
    }
    return <>{`${PRINT_MEAN[value]}`}</>
  }

  return (
    <Select
      value={value}
      data={PRINT_OPTIONS}
      disabled={disabled}
      onChange={onChange}
    />
  )
}

export default CellPrint
