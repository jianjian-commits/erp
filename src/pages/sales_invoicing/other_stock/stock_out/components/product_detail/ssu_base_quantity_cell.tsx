import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../stores/detail_store'
import { Flex } from '@gm-pc/react'
import { transferAvaiValue, getLinkCalculateV2 } from '../../../../util'
import { Badge } from 'antd'
import Big from 'big.js'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import _ from 'lodash'

const { TABLE_X } = TableXUtil

interface Props {
  data: any
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { updateStockSheetErrDetails } = store
  const {
    currStockQuantity,
    sku_id,
    second_base_unit_ratio,
    input_stock: { input, input2 },
    base_quantity_show,
    sku_base_unit_name,
  } = data

  const handleQuantityChange = (value: number) => {
    const { amount, amount_show, different_price } = getLinkCalculateV2({
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
      ...data,
      amount_show,
      // base_quantity: '', // 不要的数据，后面
      amount,
      different_price,
      batch_selected: [],
    })
  }
  // 处理骚操作添加相同商品
  const skuIndex = updateStockSheetErrDetails.findIndex(
    (v) => v.sku_id === sku_id,
  )
  if (skuIndex !== -1) {
    // updateStockSheetErrDetails.splice(skuIndex, 1)
  }
  const isOverStock = skuIndex !== -1

  const show = +currStockQuantity! < +base_quantity_show! || isOverStock

  return (
    <>
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
        <Badge count={show ? '库存不足' : 0} />
      </Flex>
    </>
  )
})

export default SsuBaseQuantityCell
