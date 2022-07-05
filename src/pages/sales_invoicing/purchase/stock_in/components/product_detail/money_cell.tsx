import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { isInShare, getLinkCalculate } from '../../../../util'
import store, { PDetail } from '../../stores/receipt_store1'
import { Flex, Price } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
  disabled?: boolean
}

/**
 * @deprecated 已废弃
 */
const MoneyCell: FC<Props> = observer((props) => {
  const { apportionList, receiptDetail } = store
  const { index, data, disabled } = props
  const { amount_show, sku_id, ssu_unit_id } = data

  const handleMoneyChange = (value: number) => {
    const {
      ssu_quantity,
      ssu_quantity_show,
      ssu_base_quantity,
      ssu_base_quantity_show,

      different_price,
      different_price_show,
      ssu_base_price_show,
      ssu_base_price,
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
      amount: value,
      amount_show: value,
      different_price,
      different_price_show,
      ssu_base_price_show,
      ssu_base_price,
    })
  }

  const canEdit =
    !isInShare(apportionList, sku_id, ssu_unit_id) &&
    !checkDigit(receiptDetail.status, 8)

  // useEffect(() => {
  //   if (disabled && canEdit) {
  //     handleMoneyChange(0)
  //   }
  // }, [])

  return (
    <>
      {!canEdit ? (
        amount_show + Price.getUnit()
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            disabled={disabled}
            precisionType='dpInventoryAmount'
            value={amount_show}
            onChange={handleMoneyChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{Price.getUnit()}</span>
        </Flex>
      )}
    </>
  )
})

export default MoneyCell
