import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { toFixedSalesInvoicing } from '@/common/util'
import { POSITION_FILTER, RECEIPT_STATUS } from '../../../../enum'
import {
  ssuBaseToSkuBaseQ,
  getDoneQuantity,
  getQuantity,
} from '../../../../util'
import store from '../../stores/detail_store'
import _ from 'lodash'

interface Props {
  data: any
  index: number
}

const TextAreaCell: FC<Props> = observer((props) => {
  const {
    data: {
      batch_selected,
      ssu_unit_name,
      sheet_status,
      batches = {},
      sku_base_unit_name,
      ssu_base_unit_rate,
    },
    index,
  } = props
  const update_batches = batches?.update_batches || []
  const { positionFilter } = store
  let sku_stock_quantity: number | string = ''

  const changeSurplusType = (sku_stock_quantity: number) => {
    // 盘点盈亏
    if (positionFilter.productType === '0') {
      let type = ''
      if (sku_stock_quantity > 0) {
        type = POSITION_FILTER.profit
      }
      if (sku_stock_quantity < 0) {
        type = POSITION_FILTER.loss
      }
      if (sku_stock_quantity === 0) {
        type = POSITION_FILTER.all
      }
      // 列表筛选
      store.changeProductDetailsItem(index, {
        surplus_type: type,
        // ssu_stock_quantity,
        sku_stock_quantity,
      })
    }
  }
  if (batch_selected.length !== 0 || update_batches) {
    if (sheet_status === RECEIPT_STATUS.approved) {
      sku_stock_quantity = ssuBaseToSkuBaseQ(
        getDoneQuantity({
          reduce_select: update_batches,
          type: 1,
        }),
        ssu_base_unit_rate,
      )
    } else {
      sku_stock_quantity = ssuBaseToSkuBaseQ(
        getQuantity({
          reduce_select: batch_selected,
          parm_one: 'sku_base_quantity',
          parm_two: 'sku_stock_base_quantity',
        }),
        ssu_base_unit_rate,
      )
    }

    changeSurplusType(sku_stock_quantity)
  }

  return (
    <>
      {_.isNumber(sku_stock_quantity) && (
        <div>
          <span>
            {toFixedSalesInvoicing(sku_stock_quantity as number)}
            {sku_base_unit_name}
          </span>
        </div>
      )}
    </>
  )
})

export default TextAreaCell
