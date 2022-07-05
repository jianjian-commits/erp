import React, { FC } from 'react'
import { getCustomerStatus } from '@/pages/order/util'
import { Customer } from '../../interface'

interface Props {
  customer: Customer
}
const CustomerStatus: FC<Props> = ({ customer }) => {
  const status = getCustomerStatus(customer)
  if (!status.type) return null
  return (
    <div className='gm-padding-left-5 gm-text-danger' style={{ minWidth: 90 }}>
      {status.desc}
    </div>
  )
}

export default CustomerStatus
