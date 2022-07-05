import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import { usePagination } from '@gm-common/hooks'
import store from './store'

export default () => {
  const { pagination, run, refreshAfterDelete } = usePagination<any>(
    store.fetchList,
    {
      paginationKey: 'view_order',
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    store.setDoRequest(run)
    store.setDoRequestAfterDelete(refreshAfterDelete)
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}
