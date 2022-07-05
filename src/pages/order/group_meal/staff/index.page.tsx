import React from 'react'
import OrderList from '../order/index'
import { Customer_Type } from 'gm_api/src/enterprise'

const list = () => (
  <OrderList customer_type={Customer_Type.TYPE_VIRTUAL_SCHOOL_STAFF} />
)

export default list
