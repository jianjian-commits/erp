import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'
import { getLinkCalculateV2 } from '../../../../util'
import { Badge } from 'antd'
import Big from 'big.js'
import _ from 'lodash'

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
    ssu_base_unit_name,
    currStockQuantity,
    sku_id,
    input_stock: { input, input2 },
  } = data
  const { related_sheet_id } = store.receiptDetail

  const handleQuantityChange = (value: number) => {
    // const { base_quantity_show } = getLinkCalculateV2({
    //   data,
    //   currentField: 'base_quantity',
    //   currentValue: value,
    // })
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
      batch_selected: [], // 改变数量需要清空批次 // 现在不需要了 // 现在又要清除了
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

  const show = +currStockQuantity! < +ssu_base_quantity_show! || isOverStock

  return (
    <Flex alignCenter>
      {related_sheet_id !== '0' ? (
        ssu_base_quantity_show
      ) : (
        <KCPrecisionInputNumber
          precisionType='salesInvoicing'
          value={ssu_base_quantity_show}
          onChange={handleQuantityChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
      )}

      <span className='gm-padding-5'>{ssu_base_unit_name || '-'}</span>
      <Badge count={show ? '库存不足' : 0} />
    </Flex>
  )
})

export default SsuBaseQuantityCell
