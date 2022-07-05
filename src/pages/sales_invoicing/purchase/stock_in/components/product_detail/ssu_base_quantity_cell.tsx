import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store1'
import { Flex } from '@gm-pc/react'
import { getLinkCalculateV2, isInShareV2 } from '../../../../util'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'
import Big from 'big.js'
import _ from 'lodash'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { apportionList, receiptDetail } = store
  const { index, data } = props
  const {
    ssu_base_quantity_show,
    ssu_base_unit_name,
    sku_id,
    input_stock: { input, input2 },
    ssu_unit_id,
  } = data

  const handleQuantityChange = (value: number) => {
    // 基本单位影响包装单位(废弃)和补差和金额
    const {
      // ssu_quantity,
      // ssu_quantity_show,
      amount,
      amount_show,
      different_price,
      // different_price_show,
      // ssu_base_price_show,
      // ssu_base_price,
    } = getLinkCalculateV2({
      data,
      currentField: 'base_quantity',
      currentValue: value,
    })
    // TODO： 暂时不需要进行second_base_unit_ratio换算，后续需要补充
    const secondInputValue = !_.isNil(value) ? Big(value || 0).times(1) : ''
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
      // ssu_quantity,
      // ssu_quantity_show,
      base_quantity: value,
      base_quantity_show: value,
      amount,
      amount_show,
      different_price,
      // different_price_show,
      // ssu_base_price_show,
      // ssu_base_price,
    })
  }

  const canEdit =
    !isInShareV2(apportionList, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {!canEdit ? (
        ssu_base_quantity_show + (ssu_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            value={ssu_base_quantity_show}
            onChange={handleQuantityChange}
            min={0}
            precisionType='salesInvoicing'
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{ssu_base_unit_name || '-'}</span>
        </Flex>
      )}
    </>
  )
})

export default SsuBaseQuantityCell
