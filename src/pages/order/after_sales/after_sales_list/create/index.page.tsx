import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { Loading, Flex } from '@gm-pc/react'
import HeaderDetail from '../components/header_detail'
import RefundOnlyList from './components/refund_only_list'
import { useGMLocation } from '@gm-common/router'
import store from '../store/detail_store'

const Detail = observer(() => {
  const location = useGMLocation<{
    order_id: string
    customer_id: string
    type: 'create' | 'draft'
    serial_no: string
  }>()
  const { order_id, customer_id, type, serial_no } = location.query

  useEffect(() => {
    if (type === 'create') {
      store.getOrderDetail(order_id, customer_id)
    } else {
      store.fetchAfterSaleDraft(serial_no)
    }
    return () => {
      store.clear()
    }
  }, [order_id, type])

  if (store.loading) {
    return (
      <Flex justifyCenter style={{ marginTop: 100 }}>
        <Loading size='40' />
      </Flex>
    )
  }
  return (
    <>
      <HeaderDetail type='add' />
      <RefundOnlyList order_id={order_id} customer_id={customer_id} />
    </>
  )
})

export default Detail
