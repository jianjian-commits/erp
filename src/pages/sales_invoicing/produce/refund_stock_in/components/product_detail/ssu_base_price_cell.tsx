import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'

import { Flex, Price } from '@gm-pc/react'
import { getLinkCalculate } from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const SsuBasePriceCell: FC<Props> = observer((props) => {
  const { index, data } = props

  const { ssu_base_unit_name, ssu_base_price_show } = data

  const handleStdUnitPriceChange = (value: number) => {
    const {
      ssu_quantity,
      ssu_quantity_show,
      ssu_base_quantity,
      ssu_base_quantity_show,

      different_price_show,
      different_price,
      amount_show,
      amount,
    } = getLinkCalculate({
      data,
      currentField: 'ssu_base_price',
      currentValue: value,
    })
    store.changeProductDetailsItem(index, {
      ssu_quantity,
      ssu_quantity_show,
      ssu_base_quantity,
      ssu_base_quantity_show,
      ssu_base_price_show: value,
      ssu_base_price: value,
      different_price_show,
      different_price,
      amount_show,
      amount,
    })
  }

  return (
    <>
      <Flex alignCenter>
        <KCPrecisionInputNumber
          precisionType='dpInventoryAmount'
          value={ssu_base_price_show}
          onChange={handleStdUnitPriceChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
        <span className='gm-padding-5'>
          {Price.getUnit() + '/'}
          {ssu_base_unit_name || '-'}
        </span>
      </Flex>
    </>
  )
})

export default SsuBasePriceCell
