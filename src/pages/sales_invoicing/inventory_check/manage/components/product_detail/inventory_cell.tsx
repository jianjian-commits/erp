import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { UnitStock } from 'gm_api/src/merchandise/types'
import Big from 'big.js'
import { toFixedSalesInvoicing } from '@/common/util'
import store, { PDetail } from '../../stores/detail_store'
import { RECEIPT_STATUS } from '../../../../enum'
import { ssuBaseToSkuBase } from '../../../../util'
import _ from 'lodash'

interface Props {
  index: number
  data: PDetail
}

const InventoryCell: FC<Props> = observer((props) => {
  const {
    data: {
      sku_id,
      // ssu_unit_id,
      // ssu_unit_name,
      old_stock,
      sheet_status,
      sku_base_unit_name,
      // ssu_base_unit_rate,
      sku_base_unit_id,
    },
    index,
  } = props
  const {
    stockList,
    receiptDetail: { warehouse_id },
  } = store
  const initStock: UnitStock = {
    base_unit: { unit_id: '', quantity: '' },
    sku_unit: { unit_id: '', quantity: '' },
  }
  const [stock, setStock] = useState<UnitStock>({ ...initStock })

  const ifStock = (sku_id: string, sku_unit_id: string) => {
    const now_stock = _.cloneDeep(
      stockList![sku_id!]?.unit_stocks![sku_unit_id],
    )
    if (now_stock) {
      // setStock(ssuBaseToSkuBase(now_stock.stock!, ssu_base_unit_rate!))
      setStock(ssuBaseToSkuBase(now_stock.stock!, 1))
    }
    return now_stock
  }

  useEffect(() => {
    // 审核通过时
    if (sheet_status === RECEIPT_STATUS.approved) {
      // setStock(ssuBaseToSkuBase(old_stock!, ssu_base_unit_rate!))
      setStock(ssuBaseToSkuBase(old_stock!, 1))
      return
    }
    // 可操作时
    if (sku_id) {
      // 从stockList中查询是否有当前规格的信息
      if (ifStock(sku_id, sku_base_unit_id)) {
        // 接口查询
      } else {
        store.getSkuInventory(sku_id, sku_base_unit_id).then((json) => {
          setStock(ssuBaseToSkuBase(json.sku_unit_stock.stock!, 1))
          return json
        })
      }
      // 切换商品清除
    } else setStock({ ...initStock })
  }, [sku_id, sku_base_unit_id, sheet_status, warehouse_id])

  const { base_unit, sku_unit } = stock

  store.changeProductDetailsItem(index, {
    base_unit_quantity: base_unit?.quantity!,
    sku_unit_quantity: sku_unit?.quantity!,
  })

  return (
    <div>
      {base_unit?.quantity! &&
        `${toFixedSalesInvoicing(
          Big(base_unit?.quantity!),
        )} ${sku_base_unit_name}`}
    </div>
  )
})

export default InventoryCell
