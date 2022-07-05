import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { UnitStock } from 'gm_api/src/merchandise/types'
import Big from 'big.js'
import { toFixedSalesInvoicing } from '@/common/util'
import store, { PDetail } from '../../stores/detail_store'

interface Props {
  index: number
  data: PDetail
}

const InventoryCell: FC<Props> = observer((props) => {
  const {
    data: {
      sku_id,
      ssu_unit_id,
      // ssu_unit_name,
      sheet_status,
      sku_base_unit_name,
      ssu_base_unit_rate,
      batch_selected_single,
    },
    index,
  } = props
  const initStock: UnitStock = {
    base_unit: { unit_id: '', quantity: '' },
    sku_unit: { unit_id: '', quantity: '' },
  }
  const [stock, setStock] = useState<UnitStock>({ ...initStock })

  useEffect(() => {
    if (batch_selected_single) {
      setStock(batch_selected_single.stock ?? {})
    }
  }, [sku_id, ssu_unit_id, sheet_status, batch_selected_single])

  const { base_unit, sku_unit } = stock
  store.changeProductDetailsItem(index, {
    base_unit_quantity: `${+base_unit?.quantity! / (ssu_base_unit_rate ?? 1)}`,
    sku_unit_quantity: sku_unit?.quantity!,
  })

  return (
    <div>
      {base_unit?.quantity! &&
        `${toFixedSalesInvoicing(
          Big(+base_unit?.quantity!).div(ssu_base_unit_rate ?? 1),
        )} ${sku_base_unit_name}
      `}
      {/* {base_unit?.quantity! &&
        sku_unit?.quantity! &&
        `${toFixedSalesInvoicing(
          Big(+base_unit?.quantity!).div(ssu_base_unit_rate ?? 1),
        )} ${sku_base_unit_name}/${toFixedSalesInvoicing(
          Big(sku_unit?.quantity!),
        )} ${ssu_unit_name}`} */}
    </div>
  )
})

export default InventoryCell
