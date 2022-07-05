import * as React from 'react'
import { FC } from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'
import { Badge } from 'antd'
import { TableXUtil } from '@gm-pc/table-x'

import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

import { transferAvaiValue } from '@/pages/sales_invoicing/util'

import globalStore from '@/stores/global'
import { PDetail } from '../../stores/detail_store'
import { DetailStore } from '../../stores/index'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const BaseQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { updateStockSheetErrDetails, receiptDetail } = DetailStore
  const { order_id } = receiptDetail

  const {
    base_quantity_show,
    sku_base_unit_name,
    currStockQuantity,
    sku_id,
    stock,
    input_stock: { input, input2 },
  } = data

  const handleQuantityChange = (value: number) => {
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
    DetailStore.changeProductDetailsItem(index, {
      ...data,
      base_quantity: value,
      base_quantity_show: value,
      batch_selected: [], // 改变数量需要清空批次 // 现在不需要了 // 现在又要清除了
    })
  }

  // 处理骚操作添加相同商品
  const skuIndex = updateStockSheetErrDetails.findIndex(
    (v) => v.sku_id === sku_id,
  )
  // if (skuIndex !== -1) {
  //   updateStockSheetErrDetails.splice(skuIndex, 1)
  // }
  const isOverStock = skuIndex !== -1

  const show = +currStockQuantity! < +base_quantity_show! || isOverStock

  return (
    <Flex alignCenter>
      {order_id !== '0' ? (
        // 这里轻巧版要求展示的是这个字段
        globalStore.isLite ? (
          stock.base_unit?.quantity
        ) : (
          transferAvaiValue(input?.quantity)
        )
      ) : (
        <KCPrecisionInputNumber
          precisionType='salesInvoicing'
          value={transferAvaiValue(input?.quantity)}
          onChange={handleQuantityChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
      )}

      <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
      <Badge count={show ? '库存不足' : 0} />
    </Flex>
  )
})

export default BaseQuantityCell
