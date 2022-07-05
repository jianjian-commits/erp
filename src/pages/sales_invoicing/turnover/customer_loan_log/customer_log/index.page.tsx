import React, { useEffect } from 'react'
import store from '../stores/customer_store'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'

import Filter from './filter'
import List from './list'

export default () => {
  const { customer_id, sku_id, warehouse_id } = useGMLocation<{
    customer_id: string
    sku_id: string
    warehouse_id: string
  }>().query

  const { pagination, run } = usePagination<any>(store.getSearchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'customerLogList',
  })

  useEffect(() => {
    store.changeFilter('target_id', customer_id)
    store.changeFilter('sku_id', sku_id)
    store.changeFilter('warehouse_id', warehouse_id)
    run()
  }, [])
  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}
