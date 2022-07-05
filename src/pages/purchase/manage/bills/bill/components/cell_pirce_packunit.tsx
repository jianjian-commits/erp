/*
 * @Author: xjh
 * @Date: 2021-09-27 11:02:28
 * @LastEditTime: 2021-11-04 15:57:31
 * @Description: 采购单价（包装单位）
 * @FilePath: /gm_static_x_erp/src/pages/purchase/manage/bills/bill/components/cell_pirce_packunit.tsx
 */
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import store from '../store'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

interface CellPriceUnitProps {
  index: number
  disabled?: boolean
}
const CellPricePackUnit: FC<CellPriceUnitProps> = (props) => {
  const { index, disabled = false } = props
  const {
    _amount_edit_filed,
    ssuInfos = [],
    ssu_unit_id,
    purchase_price,
  } = store.list[index]
  const ssu = _.find(ssuInfos, (v) => v.value === ssu_unit_id!)
  const rate = ssu?.ssu_unit_rate || 1

  const unitName = !_amount_edit_filed ? '-' : ssu?.unit?.name
  const isCommitted =
    store.info.status === (PurchaseSheet_Status.COMMIT as number)

  const price = purchase_price
    ? Big(purchase_price || 0)
        .times(rate)
        .toFixed(2)
    : 0
  if (isCommitted) {
    return (
      <Flex alignCenter>
        {price + Price.getUnit()}/{unitName}
      </Flex>
    )
  }

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        disabled={disabled}
        value={price === null ? null : +price}
        min={0}
        style={{ width: '85px' }}
        className='input-sm'
        precisionType='order'
      />
      <span style={{ wordBreak: 'normal' }}>
        {Price.getUnit()}/{unitName}
      </span>
    </Flex>
  )
}

export default observer(CellPricePackUnit)
