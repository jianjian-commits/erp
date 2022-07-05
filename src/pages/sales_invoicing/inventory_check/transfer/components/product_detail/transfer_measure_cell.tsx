import { KCInputNumber } from '@gm-pc/keyboard'
import { Flex } from '@gm-pc/react'
import { TABLE_X } from '@gm-pc/table-x/src/utils'
import Big from 'big.js'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import store, { PDetail } from '../../stores/detail_store'
import { toFixedSalesInvoicing } from '@/common/util'
import { transferAvaiValue } from '@/pages/sales_invoicing/util'

interface Props {
  data: PDetail
  index: number
}

function handleRateInput(
  value: number | null,
  rate: number | null,
): number | null {
  if (!value) {
    return null
  }
  return +Big(value ?? 0)
    .div(rate ?? 1)
    .toFixed(4)
}

const TransferMesureCell: FC<Props> = observer((props) => {
  const { data, index } = props

  const {
    ssu_unit_rate,
    base_unit_quantity,
    sku_base_unit_name,
    transfer_measure,
    sku_unit_quantity,
    batch_selected_single,
  } = data
  // const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    if (!batch_selected_single?.batch_id) {
      store.changeProductListItem(index, {
        transfer_measure: 0,
      })
    }
  }, [batch_selected_single, index])

  const handleInput = (value: number) => {
    // let currentValue
    // if (value >= +base_unit_quantity) {
    //   currentValue = +base_unit_quantity
    // } else {
    //   currentValue = value
    // }
    // setValue(currentValue)
    store.changeProductListItem(index, {
      transfer_measure: value,
      transfer_package:
        value < +base_unit_quantity
          ? Big(handleRateInput(value, ssu_unit_rate) ?? 0).toFixed(4)
          : Big(+sku_unit_quantity).toFixed(4),
    })
  }

  return (
    <>
      {batch_selected_single?.batch_id ? (
        <Flex alignCenter>
          <KCInputNumber
            precision={4}
            value={
              transfer_measure
                ? transferAvaiValue(toFixedSalesInvoicing(transfer_measure))
                : null
            }
            max={+base_unit_quantity}
            min={0}
            onChange={handleInput}
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>/{sku_base_unit_name}</span>
        </Flex>
      ) : (
        <span>-</span>
      )}
    </>
  )
})

export default TransferMesureCell
