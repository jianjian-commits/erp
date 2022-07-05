import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import store, { PDetail } from '../../stores/receipt_store'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

interface Props {
  index: number
  data: PDetail
}
const TaxRateCell: FC<Props> = (props) => {
  const { index, data } = props
  const { tax_rate } = data

  const handleChange = (value: number) => {
    store.changeProductDetailsItem(index, {
      tax_rate: value,
    })
  }

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        value={tax_rate!}
        onChange={handleChange}
        min={0}
        precision={2}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>%</span>
    </Flex>
  )
}

export default observer(TaxRateCell)
