import React from 'react'
import OrderDetail from '../../order/detail'
import { Customer_Type } from 'gm_api/src/enterprise'

const detail = () => (
  <OrderDetail customer_type={Customer_Type.TYPE_VIRTUAL_SCHOOL_STAFF} />
)

export default detail
