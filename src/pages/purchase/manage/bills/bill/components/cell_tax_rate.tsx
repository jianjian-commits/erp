import React, { FC } from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Flex } from '@gm-pc/react'
import store from '../store'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import { toFixed } from '@/common/util'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

interface CellTaxRateProps {
  index: number
}
const CellTaxRate: FC<CellTaxRateProps> = (props) => {
  const { index } = props
  const { status } = store.info
  const { tax_rate } = store.list[index]
  const isCommitted = status === (PurchaseSheet_Status.COMMIT as number)

  const handleChange = (value: number) => {
    store.updateRowColumn(index, 'tax_rate', value)
  }

  if (isCommitted) {
    return <Flex alignCenter>{toFixed(Big(tax_rate || 0), 2) + '%'}</Flex>
  }

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        value={tax_rate!}
        onChange={handleChange}
        min={0}
        precision={0}
        max={100}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>%</span>
    </Flex>
  )
}

export default observer(CellTaxRate)
