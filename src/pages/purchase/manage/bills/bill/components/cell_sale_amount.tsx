import React, { FC } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import { Flex } from '@gm-pc/react'
import store from '../store'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import { toFixed } from '@/common/util'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { useGMLocation } from '@gm-common/router'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'

interface CellSaleAmountProps {
  index: number
}

const CellSaleAmount: FC<CellSaleAmountProps> = (props) => {
  const { index } = props
  const { basic_price } = store
  const location = useGMLocation<{ id: string }>()
  const id = location.query?.id
  const isDetail = !!id
  const {
    purchase_sale_amount,
    ssuInfos = [],
    ssu_unit_id,
    supplier_cooperate_model_type,
    purchase_price,
  } = store.list[index]
  const ssu = _.find(ssuInfos, (v) => v.value === ssu_unit_id!)
  const handleChange = (value: number) => {
    // const price = +Big(+basic_price).times(+ssu?.ssu_unit_rate) || 0
    const rate = ssu?.ssu_unit_rate || 1
    store.updateRowColumn(index, 'purchase_sale_amount', value)
    store.updateRowColumn(index, '_amount_edit_filed', 'purchase_amount')
    const purchase_amount = value ? +toFixed(Big(value).times(rate)) : undefined
    const price = +Big(purchase_amount || 0).times(purchase_price || 0)
    // 同步更新 采购数量(计量单位)， 采购金额
    store.updateRowColumn(index, 'purchase_amount', purchase_amount)
    store.updateRowColumn(index, 'purchase_money', price)
  }

  const isCommitted =
    store.info.status === (PurchaseSheet_Status.COMMIT as number)
  const disabled =
    supplier_cooperate_model_type ===
      Sku_SupplierCooperateModelType.SCMT_WITH_SORTING ||
    supplier_cooperate_model_type ===
      Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY

  if (isCommitted)
    return (
      <Flex alignCenter>
        {purchase_sale_amount}
        {ssu?.unit?.name || '-'}
      </Flex>
    )

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        disabled={isDetail && disabled}
        value={purchase_sale_amount!}
        onChange={handleChange}
        min={0}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>{ssu?.unit?.name || '-'}</span>
    </Flex>
  )
}
export default observer(CellSaleAmount)
