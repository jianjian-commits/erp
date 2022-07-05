import React, { FC } from 'react'
import Big from 'big.js'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import { Badge } from 'antd'

import { transferAvaiValue } from '../../../../util'

import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

import { ProductDetailProps } from '../../stores/details_store'
import { DetailStore } from '../../stores/index'

const { TABLE_X } = TableXUtil

interface Props {
  data: ProductDetailProps
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { updateStockSheetErrDetails } = DetailStore
  const {
    sku_base_unit_name,
    currStockQuantity,
    sku_id,
    input_stock: { input, input2 },
  } = data

  const handleQuantityChange = (value: number) => {
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
    DetailStore.changeProductDetailsItem(index, {
      batch_selected: [], // 改变数量需要清空批次 // 现在不需要了 // 现在又要清除了
    })
  }
  // 处理骚操作添加相同商品
  const skuIndex = updateStockSheetErrDetails.findIndex(
    (v) => v.sku_id === sku_id,
  )
  if (skuIndex !== -1) {
    updateStockSheetErrDetails.splice(skuIndex, 1)
  }
  const isOverStock = skuIndex !== -1

  const quantity = input?.quantity || '0'
  const show = +currStockQuantity! < +quantity! || isOverStock

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        precisionType='salesInvoicing'
        value={transferAvaiValue(input?.quantity)}
        onChange={handleQuantityChange}
        min={0}
        className='form-control input-sm'
        style={{
          width: TABLE_X.WIDTH_EDIT_OPERATION,
        }}
      />
      <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
      <Badge count={show ? '库存不足' : 0} />
    </Flex>
  )
})

export default SsuBaseQuantityCell
