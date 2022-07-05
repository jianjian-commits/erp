import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'
import Big from 'big.js'
import _ from 'lodash'
import {
  getLinkCalculateV2,
  isInShareV2,
  transferAvaiValue,
} from '../../../../util'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

/**
 * @deprecated 目前已经没有地方用到，暂且保留，下个迭代删除
 */
const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { apportionList, receiptDetail } = store
  const { index, data } = props
  const {
    base_quantity_show,
    sku_base_unit_name,
    sku_id,
    input_stock: { input, input2 },
  } = data

  const handleQuantityChange = (value: number) => {
    const { amount } = getLinkCalculateV2({
      data,
      currentField: 'base_quantity',
      currentValue: value,
    })
    // TODO： 暂时不需要进行second_base_unit_ratio换算，后续需要补充
    const secondInputValue = !_.isNil(value) ? Big(value).times(1) : ''
    _.set(data, 'input_stock', {
      input: {
        ...input,
        quantity: !_.isNil(value) ? value.toString() : '',
      },
      input2: {
        ...input2,
        quantity: secondInputValue.toString(),
      },
    })
    store.changeProductDetailsItem(index, {
      base_quantity: value,
      base_quantity_show: value,
      // amount_show,
      amount,
    })
  }

  const canEdit =
    !isInShareV2(apportionList, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {!canEdit ? (
        base_quantity_show + (sku_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            precisionType='salesInvoicing'
            value={transferAvaiValue(input?.quantity)}
            onChange={handleQuantityChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
        </Flex>
      )}
    </>
  )
})

export default SsuBaseQuantityCell
