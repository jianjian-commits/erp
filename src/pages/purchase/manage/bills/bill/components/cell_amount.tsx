import React, { FC } from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Flex } from '@gm-pc/react'
import store from '../store'
import { toFixed } from '@/common/util'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { useGMLocation } from '@gm-common/router'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'

interface CellAmountProps {
  index: number
}
const CellAmount: FC<CellAmountProps> = (props) => {
  const { index } = props
  // const { basic_price } = store
  const location = useGMLocation<{ id: string }>()
  const id = location.query?.id
  const isDetail = !!id
  const {
    purchase_amount,
    // ssuInfos = [],
    // ssu_unit_id,
    supplier_cooperate_model_type,
    purchase_unit_name,
  } = store.list[index]
  // const ssuInfosMap: { [key: string]: any } = {}
  // ssuInfos.forEach((v: any) => {
  //   ssuInfosMap[v.value] = v
  // })
  // const ssu = ssuInfosMap[ssu_unit_id!]
  // const rate = ssu?.ssu_unit_rate || 1
  const handleChange = (value: number) => {
    // const saleAmount = Big(value || 0).div(rate)
    const { purchase_price } = store.list[index]
    store.updateRowColumn(index, 'purchase_amount', value)
    // store.updateRowColumn(index, '_amount_edit_filed', 'purchase_amount')
    store.updateRowColumn(
      index,
      'purchase_money',
      value && purchase_price ? +toFixed(Big(value).times(purchase_price)) : 0,
    )

    // 同步更新 采购数量(采购单位)， 采购金额
    // store.updateRowColumn(
    //   index,
    //   'purchase_sale_amount',
    //   value ? +toFixed(saleAmount) : undefined,
    // )

    // basic_price === 0 || basic_price !== purchase_price
    //   ? store.updateRowColumn(
    //       index,
    //       'purchase_money',
    //       value && purchase_price
    //         ? +toFixed(Big(value).times(purchase_price))
    //         : 0,
    //     )
    //   : store.updateRowColumn(
    //       index,
    //       'purchase_money',
    //       value && purchase_price ? +toFixed(Big(value).times(basic_price)) : 0,
    //     )
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
        {purchase_amount}
        {purchase_unit_name || '-'}
      </Flex>
    )

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        disabled={isDetail && disabled}
        value={purchase_amount === null ? null : purchase_amount!}
        onChange={handleChange}
        min={0}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>{purchase_unit_name || '-'}</span>
    </Flex>
  )
}

export default observer(CellAmount)
