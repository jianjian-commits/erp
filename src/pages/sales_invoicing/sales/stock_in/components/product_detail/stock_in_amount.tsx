import React, { FC } from 'react'
import store, { PDetail } from '../../stores/list_store'
import { observer } from 'mobx-react'
import { Flex, Price } from '@gm-pc/react'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import { getLinkCalculateV2 } from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import _ from 'lodash'

interface Props {
  data: PDetail
  index: number
}

const { TABLE_X } = TableXUtil

const StockInAmount: FC<Props> = ({ index, data }) => {
  const { isEdit } = store.list[index]
  const { base_price_show } = data

  const handleQuantityChange = (value: number | null) => {
    const {
      amount_show,
      amount,
      // ssu_base_quantity,
      // base_quantity_show,
      // different_price_show,
      // base_quantity_show,
      // different_price,
      // ssu_quantity,
      // ssu_quantity_show,
    } = getLinkCalculateV2({
      data,
      currentField: 'base_price',
      currentValue: value,
    })

    store.changeDetailItem(index, {
      base_price_show: value,
      base_price: value,
      // ssu_quantity_show,
      // ssu_quantity,
      amount_show,
      amount,
      // ssu_base_quantity,
      // base_quantity_show,
      // different_price_show,
      // different_price,
    })
  }
  return (
    <>
      {!isEdit ? (
        base_price_show + Price.getUnit()
      ) : (
        <Flex alignCenter>
          <PrecisionInputNumber
            precisionType='salesInvoicing'
            value={!_.isNil(base_price_show) ? Number(base_price_show) : null}
            onChange={handleQuantityChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{Price.getUnit()}</span>
        </Flex>
      )}
    </>
  )
}

export default observer(StockInAmount)
