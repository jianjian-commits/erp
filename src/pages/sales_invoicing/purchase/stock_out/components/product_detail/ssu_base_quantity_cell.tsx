import React, { FC } from 'react'
import _ from 'lodash'
import Big from 'big.js'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'
import { Badge } from 'antd'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { updateStockSheetErrDetails } = store
  const {
    ssu_base_quantity_show,
    sku_base_unit_name,
    currStockQuantity,
    sku_id,
    sku_unit_rate,
    input_stock: { input, input2 },
  } = data

  const handleQuantityChange = (value: number) => {
    const secondInputValue = !_.isNil(value)
      ? Big(Number(value) || 0).times(Number(sku_unit_rate || 1))
      : ''
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
      batch_selected: [], // 改变数量需要清空批次 // 现在不需要了 // 现在又要清除了
    })
  }

  // 处理骚操作添加相同商品
  const skuIndex = updateStockSheetErrDetails.findIndex(
    (v) => v.sku_id === sku_id,
  )

  const isOverStock = skuIndex !== -1

  const show = +currStockQuantity! < +ssu_base_quantity_show! || isOverStock
  const quantity = input?.quantity || ''

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        precisionType='salesInvoicing'
        value={quantity ? _.toNumber(input?.quantity) : quantity}
        onChange={handleQuantityChange}
        min={0}
        className='form-control input-sm'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
      />
      <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
      <Badge count={show ? '库存不足' : 0} />
    </Flex>
  )
})

export default SsuBaseQuantityCell
