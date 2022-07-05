import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './stores/store'

export default () => {
  const { paging, runChangePaging, run } = usePagination<any>(
    store.fetchSheetList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'otherStockStockOutList',
    },
  )

  useEffect(() => {
    run()
  }, [])
  return (
    <>
      <Filter onSearch={run} />
      <List onFetchList={run} />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
}
