import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import Filter from './list/components/filter'
import List from './list/components/list'
import store from './list/store'

const Bills = () => {
  const { pagination, run } = usePagination<any>(store.fetchList, {
    paginationKey: 'purchase_bill',
  })

  useEffect(() => {
    store.setDoRequest(run)
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}

export default Bills
