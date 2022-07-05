import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { getLinkCalculate } from '../../../../util'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const SsuQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { canEdit } = store
  const { ssu_quantity_show, ssu_unit_name } = data

  const handleQuantityChange = (value: number | null) => {
    const {
      ssu_base_price_show,
      ssu_base_price,
      amount_show,
      amount,
      ssu_base_quantity,
      ssu_base_quantity_show,
      different_price_show,
      different_price,
    } = getLinkCalculate({
      data,
      currentField: 'ssu_quantity',
      currentValue: value,
    })

    store.changeDetailItem(index, {
      ssu_quantity_show: value,
      ssu_quantity: value,
      ssu_base_price_show,
      ssu_base_price,
      amount_show,
      amount,
      ssu_base_quantity,
      ssu_base_quantity_show,
      different_price_show,
      different_price,
    })
  }

  return (
    <>
      {!canEdit ? (
        `${ssu_quantity_show}${ssu_unit_name}`
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            precisionType='salesInvoicing'
            value={ssu_quantity_show}
            onChange={handleQuantityChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{ssu_unit_name || '-'}</span>
        </Flex>
      )}
    </>
  )
})

export default SsuQuantityCell
