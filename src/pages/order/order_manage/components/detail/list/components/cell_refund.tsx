import React, { FC } from 'react'
import { UnitValueSet } from 'gm_api/src/merchandise'
import Big from 'big.js'

interface Props {
  value: UnitValueSet
  unit_name: string
}

const CellRefund: FC<Props> = ({ value, unit_name }) => {
  return (
    <span>
      {Big(+(value?.calculate?.quantity || 0)).toFixed(2) + (unit_name || '-')}
    </span>
  )
}

export default CellRefund
