import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { Loading, Flex } from '@gm-pc/react'
import HeaderDetail from '../components/header_detail'
import RefundOnlyList from './components/refund_only_list'
import { useGMLocation } from '@gm-common/router'
import store from '../store/detail_store'
import list_store from '../store/list_store'

const Detail = observer(() => {
  const location = useGMLocation<{ serial_no: string }>()
  const { serial_no } = location.query

  useEffect(() => {
    store.getAfterSaleOrder(serial_no)
    store.fetchMerchantList()
    list_store.fetchDriverList()
    return () => {
      store.clear()
    }
  }, [serial_no])

  if (store.loading) {
    return (
      <Flex justifyCenter style={{ marginTop: 100 }}>
        <Loading size='40' />
      </Flex>
    )
  }

  return (
    <>
      <HeaderDetail type='detail' />
      <RefundOnlyList />
    </>
  )
})

export default Detail
