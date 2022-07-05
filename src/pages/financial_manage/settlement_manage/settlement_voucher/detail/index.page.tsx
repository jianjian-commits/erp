import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import Header from './components/header'
import List from './components/list'
import store from '../store'
import { Flex, Loading } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'

export default observer(() => {
  const { query } = useGMLocation<{ settle_sheet_id: string }>()

  useEffect(() => {
    store.fetchCustomerSettleSheet(query.settle_sheet_id)
    return () => {
      store.initDetail()
    }
  }, [])

  if (store.loading) {
    return (
      <Flex justifyCenter style={{ marginTop: 50 }}>
        <Loading size='40' />
      </Flex>
    )
  }

  return (
    <>
      <Header />
      <List />
    </>
  )
})
