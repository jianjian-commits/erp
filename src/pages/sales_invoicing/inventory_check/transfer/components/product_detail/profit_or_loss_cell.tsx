import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { StockSheet_UpdateBatch } from 'gm_api/src/inventory/types'
import { toFixedSalesInvoicing } from '@/common/util'
import { POSITION_FILTER, RECEIPT_STATUS } from '../../../../enum'
import { ssuBaseToSkuBaseQ } from '../../../../util'
import Big from 'big.js'
import store from '../../stores/detail_store'
import _ from 'lodash'

interface Props {
  data: any
  index: number
}
const getQuantity = ({
  reduce_select,
  parm_one,
  parm_two,
}: {
  reduce_select: any
  parm_one: string
  parm_two: string
}) => {
  const quantity = _.toNumber(
    Big(
      _.reduce(
        reduce_select,
        (sum, n) => {
          return sum + (n[parm_one] - n[parm_two])
        },
        0,
      ),
    ),
  )
  return quantity
}

const getDoneQuantity = ({
  reduce_select,
  type,
}: {
  reduce_select: StockSheet_UpdateBatch[]
  type: number
}) => {
  const quantity = _.toNumber(
    Big(
      _.reduce(
        reduce_select,
        (sum, n) => {
          const {
            input_stock: { input, input2 },
            old_stock: { base_unit, sku_unit },
          } = n
          const quantity =
            type === 1
              ? parseInt(input?.quantity!) - base_unit?.quantity
              : parseInt(input2?.quantity!) - sku_unit?.quantity
          return sum + quantity
        },
        0,
      ),
    ),
  )
  return quantity
}

const TextAreaCell: FC<Props> = observer((props) => {
  const {
    data: {
      batch_selected,
      ssu_unit_name,
      sheet_status,
      update_batches,
      ssu_base_unit_name,
      ssu_base_unit_rate,
    },
    index,
  } = props
  const { positionFilter } = store
  let ssu_stock_quantity: number | string = ''
  let sku_stock_quantity: number | string = ''

  if (batch_selected.length !== 0 || update_batches) {
    if (sheet_status === RECEIPT_STATUS.approved) {
      sku_stock_quantity = ssuBaseToSkuBaseQ(
        getDoneQuantity({
          reduce_select: update_batches,
          type: 1,
        }),
        ssu_base_unit_rate,
      )
      ssu_stock_quantity = getDoneQuantity({
        reduce_select: update_batches,
        type: 2,
      })
    } else {
      sku_stock_quantity = ssuBaseToSkuBaseQ(
        getQuantity({
          reduce_select: batch_selected,
          parm_one: 'sku_base_quantity',
          parm_two: 'sku_stock_base_quantity',
        }),
        ssu_base_unit_rate,
      )
      ssu_stock_quantity = getQuantity({
        reduce_select: batch_selected,
        parm_one: 'ssu_quantity',
        parm_two: 'ssu_stock_quantity',
      })
    }

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
        ssu_stock_quantity,
        sku_stock_quantity,
      })
    }
  }
  return (
    <>
      {ssu_stock_quantity && sku_stock_quantity && (
        <div>
          <span>
            {toFixedSalesInvoicing(sku_stock_quantity)}
            {ssu_base_unit_name}
          </span>
          <span>/</span>
          <span>
            {toFixedSalesInvoicing(ssu_stock_quantity)}
            {ssu_unit_name}
          </span>
        </div>
      )}
    </>
  )
})

export default TextAreaCell
