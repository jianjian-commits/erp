/*
 * @Author: xjh
 * @Date: 2021-09-27 11:02:28
 * @LastEditTime: 2021-12-17 10:47:52
 * @Description: 采购单价（计量单位）
 * @FilePath: /gm_static_x_erp/src/pages/purchase/manage/bills/bill/components/cell_price.tsx
 */
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import store from '../store'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import { toFixed } from '@/common/util'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

interface CellPriceProps {
  index: number
  disabled?: boolean
}
const CellPrice: FC<CellPriceProps> = (props) => {
  const { index, disabled = false } = props
  const {
    purchase_price,
    // _amount_edit_filed,
    // ssuInfos = [],
    // ssu_unit_id,
    purchase_unit_name,
  } = store.list[index]
  // const ssu = _.find(ssuInfos, (v) => v.value === ssu_unit_id!)
  const handleChange = (value: number) => {
    /**
     * @description 只算计量单位乘以计量单位的值
     */
    const amount = store.list[index].purchase_amount
    /**
     * @description 查看到rate的值，默认给0,算包装单位值
     */
    // const rate = ssu?.ssu_unit_rate || 1
    store.updateRowColumn(index, 'purchase_price', value)
    store.updateRowColumn(
      index,
      'purchase_money',
      value && amount ? +toFixed(Big(amount).times(value)) : undefined,
    )
  }
  // const unitName = !_amount_edit_filed ? '-' : ssu?.ssu_unit_parent_name
  const isCommitted =
    store.info.status === (PurchaseSheet_Status.COMMIT as number)

  useEffect(() => {
    if (disabled && !isCommitted && !purchase_price) {
      handleChange(0)
    }
  }, [])

  const price =
    purchase_price === null ? null : Big(purchase_price || 0).toFixed(2)

  if (isCommitted)
    return (
      <Flex alignCenter>
        {price + Price.getUnit()}/{purchase_unit_name}
      </Flex>
    )
  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        disabled={disabled}
        value={price === null ? null : +price}
        onChange={handleChange}
        min={0}
        style={{ width: '85px' }}
        className='input-sm'
        precisionType='order'
      />
      <span style={{ wordBreak: 'normal' }}>
        {Price.getUnit()}/{purchase_unit_name}
      </span>
    </Flex>
  )
}

export default observer(CellPrice)
