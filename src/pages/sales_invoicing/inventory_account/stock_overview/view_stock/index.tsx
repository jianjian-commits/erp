import React, { useEffect } from 'react'
import store from './store'
import { usePagination } from '@gm-common/hooks'
import { Pagination, BoxPagination } from '@gm-pc/react'

import Filter from './components/filter'
import List from './components/list'

export default () => {
  const { paging, runChangePaging, run, refresh, loading } = usePagination(
    store.fetchList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'inventoryOverviewList',
    },
  )
  useEffect(() => {
    run()
  }, [])
  return (
    <>
      <Filter onSearch={run} />
      <List paging={paging} run={refresh} loading={loading} />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
}
