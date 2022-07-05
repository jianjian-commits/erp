import React, { FC, useMemo } from 'react'
import { observer } from 'mobx-react'
import { mutiUnitConvert } from '@/pages/sales_invoicing/util2'
import { getUnNillText } from '@/common/util'
import _ from 'lodash'

interface Props {
  index: number
  data: any
  type?: 'add' | 'detail' | 'overview' | 'virtual' | 'put_in_storage'
  accessor?: 'current_stock' | 'base_quantity'
}

const MutiUnitDisplay: FC<Props> = observer(({ data, type, accessor }) => {
  let _mult_unit_stock = ''
  if (type === 'overview' || type === 'put_in_storage') {
    // 库存总览 或者  库存总览--批次库存
    _mult_unit_stock = data?.stock?.mult_unit_stock
  } else if (type === 'virtual') {
    // 超支库存
    _mult_unit_stock = data?.virtual_stock?.mult_unit_stock
  } else {
    _mult_unit_stock = data?.stock?.mult_unit_stock
  }

  // TODO： 这里暂时就适配了 1. 库存总览 2. 超支库存
  if (type !== 'add') return <>{getUnNillText(_mult_unit_stock)}</>

  const sku_base_unit_id = data?.sku_base_unit_id
  const input_stock = data?.input_stock || data?.input_out_stock
  const units = data?.units?.units
  const quantity = input_stock?.input?.quantity
  const currStockQuantity = data?.currStockQuantity
  if (!units?.length) return <>{getUnNillText('')}</>

  if (accessor === 'current_stock') {
    // 当前库存
    return (
      <>
        {currStockQuantity
          ? mutiUnitConvert(currStockQuantity, units, sku_base_unit_id)
          : '-'}
      </>
    )
  } else {
    // 出库数
    return (
      <>{quantity ? mutiUnitConvert(quantity, units, sku_base_unit_id) : '-'}</>
    )
  }
})

export default MutiUnitDisplay
