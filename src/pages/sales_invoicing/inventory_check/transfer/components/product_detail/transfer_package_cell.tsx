import { KCInputNumber } from '@gm-pc/keyboard'
import { Flex } from '@gm-pc/react'
import { TABLE_X } from '@gm-pc/table-x/src/utils'
import Big from 'big.js'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import store, { PDetail } from '../../stores/detail_store'

interface Props {
  data: PDetail
  index: number
}

const handleRateInput = (
  value: number | null,
  rate: number | null,
): number | null => {
  if (!value) {
    return null
  }
  return +Big(+value ?? 0)
    .times(rate ?? 1)
    .toFixed(4)
}

const TransferPackageCell: FC<Props> = observer((props) => {
  const { index, data } = props

  const {
    ssu_unit_rate,
    ssu_unit_name,
    sku_unit_quantity,
    transfer_package,
    base_unit_quantity,
    batch_selected_single,
  } = data

  // const [value, setValue] = useState<number | null>(0)

  useEffect(() => {
    if (!batch_selected_single?.batch_id) {
      store.changeProductListItem(index, {
        transfer_package: 0,
      })
    }
  }, [batch_selected_single, index])

  const handleInput = (value: number) => {
    // let currentValue
    // if (value >= +sku_unit_quantity) {
    //   currentValue = +sku_unit_quantity
    // } else {
    //   currentValue = value
    // }
    // setValue(value)
    store.changeProductListItem(index, {
      transfer_package: value,
      transfer_measure:
        value < +sku_unit_quantity
          ? Big(handleRateInput(value, ssu_unit_rate) ?? 0).toFixed(4)
          : Big(+base_unit_quantity).toFixed(4),
    })
  }

  return (
    <>
      {batch_selected_single?.batch_id ? (
        <Flex alignCenter>
          <KCInputNumber
            precision={4}
            min={0}
            max={+sku_unit_quantity}
            value={transfer_package}
            onChange={handleInput}
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>/{ssu_unit_name}</span>
        </Flex>
      ) : (
        <span>-</span>
      )}
    </>
  )
})

export default TransferPackageCell
