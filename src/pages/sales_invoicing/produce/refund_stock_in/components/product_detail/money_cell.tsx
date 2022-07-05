import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { getLinkCalculate } from '../../../../util'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex, Price } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const MoneyCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { amount } = data

  const handleMoneyChange = (value: number) => {
    const {
      ssu_quantity,
      ssu_quantity_show,
      ssu_base_quantity,
      ssu_base_quantity_show,
      ssu_base_price_show,
      ssu_base_price,
      different_price_show,
      different_price,
    } = getLinkCalculate({
      data,
      currentField: 'amount',
      currentValue: value,
    })
    store.changeProductDetailsItem(index, {
      ssu_quantity,
      ssu_quantity_show,
      ssu_base_quantity,
      ssu_base_quantity_show,
      ssu_base_price_show,
      ssu_base_price,
      different_price_show,
      different_price,
      amount_show: value,
      amount: value,
    })
  }

  return (
    <>
      <Flex alignCenter>
        <KCPrecisionInputNumber
          precisionType='dpInventoryAmount'
          value={amount}
          onChange={handleMoneyChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
        <span className='gm-padding-5'>{Price.getUnit()}</span>
      </Flex>
    </>
  )
})

export default MoneyCell
