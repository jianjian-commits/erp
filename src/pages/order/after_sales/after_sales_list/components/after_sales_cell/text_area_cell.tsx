import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { ReturnRefundList } from '../../interface'
import { Price } from '@gm-pc/react'
import _ from 'lodash'
import Big from 'big.js'
import {
  AFTER_SALES_REASON_MAP,
  AFTER_SALES_WAY_MAP,
  AFTER_SALES_TASK_METHOD,
} from '../../enum'
import { toFixedOrder } from '@/common/util'
import { toBasicUnit, getFeeUnitName } from '@/pages/order/util'
import detail_store from '../../store/detail_store'
import list_store from '../../store/list_store'

interface Props {
  data: ReturnRefundList // 这里使用退货退款的字段，包括所有
  field: keyof ReturnRefundList
}

const TextAreaCell: FC<Props> = observer((props) => {
  const { supplierList } = detail_store
  const { driverList } = list_store
  const { data, field } = props // data 为column的字段
  const {
    apply_return_amount,
    real_return_value,
    department_blame_name,
    department_to_name,
    reason,
    method,
    remark,
    last_operator_id,
    sku_name,
    sale_ratio,
    category_name,
    amount,
    sales_price,
    supplier_id,
    driver_id,
    task_method,
    flag,
    fee_unit_name,
    outstock_unit_name,
    ...rest
  } = data
  let showText: string | undefined | null
  const driver = _.find(driverList, (item) => item.value === driver_id)
  const supplier = _.find(supplierList, (item) => item.value === supplier_id)
  const { input } = real_return_value || {}
  const real_return_amount = toFixedOrder(
    Big(toBasicUnit(input?.quantity || '0', data, 'quantity')).times(
      toBasicUnit(input?.price || '0', data, 'price'),
    ),
  )
  switch (field) {
    case 'apply_return_amount':
      showText = apply_return_amount
        ? Big(Number(apply_return_amount)).toFixed(2) + Price.getUnit()
        : '-'
      break
    case 'real_return_amount':
      showText = Big(Number(real_return_amount)).toFixed(2) + Price.getUnit()
      break
    case 'department_blame_name':
      showText = department_blame_name || '-'
      break
    case 'department_to_name':
      showText = department_to_name || '-'
      break
    case 'reason':
      showText = AFTER_SALES_REASON_MAP[reason!] || '-'
      break
    case 'method':
      showText = AFTER_SALES_WAY_MAP[method!] || '-'
      break
    case 'remark':
      showText = remark || '-'
      break
    case 'last_operator_id':
      showText = last_operator_id || '-'
      break
    case 'sku_name':
      showText = sku_name || '-'
      break
    case 'sale_ratio':
      showText = (flag === 1 && sale_ratio) || '-'
      break
    case 'category_name':
      showText = (flag === 1 && category_name) || '-'
      break

    case 'amount':
      showText = amount
        ? Big(Number(amount)).toFixed(2) + outstock_unit_name
        : '-'
      // amount && ssu_base_unit_name && flag === 1
      //   ? Big(Number(amount)).toFixed(2) + ssu_base_unit_name
      //   : '-'
      break
    case 'sales_price':
      showText = sales_price
        ? `${
            Big(Number(sales_price)).toFixed(2) + Price.getUnit()
          }/${fee_unit_name}`
        : '-'
      break
    // sales_price && ssu_base_unit_name && flag === 1
    //   ? `${
    //       Big(Number(sales_price)).toFixed(2) + Price.getUnit()
    //     }/${ssu_base_unit_name}`
    //   : '-'
    case 'driver_id':
      showText = driver?.text! || '-'
      break
    case 'supplier_id':
      showText = supplier?.text! || '-'
      break
    case 'task_method':
      showText = AFTER_SALES_TASK_METHOD[task_method!] || '-'
      break
    case 'real_return_value':
      showText = real_return_amount || '-'
      break
    default:
      showText = data[field as keyof ReturnRefundList]?.toString()
      break
  }

  return <span>{showText || '-'}</span>
})

export default TextAreaCell
