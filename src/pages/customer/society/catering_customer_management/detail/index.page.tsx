import React, { FC } from 'react'
import { useGMLocation } from '@gm-common/router'

import Create from './create'
import Update from './update'
export interface CustomerDetailLocationQuery {
  type: string
  customer_id: string
}
const Detail: FC = () => {
  const location = useGMLocation<CustomerDetailLocationQuery>()
  const { type, customer_id } = location.query
  return (
    <>
      {type === 'updateCustomer' ? (
        <Update customer_id={customer_id} />
      ) : (
        <Create />
      )}
    </>
  )
}

export default Detail
