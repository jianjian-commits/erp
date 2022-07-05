import { usePagination } from '@gm-common/hooks'
import { BoxPagination, Pagination } from '@gm-pc/react'

import React, { useEffect } from 'react'
import store from './store'
import Filter from './components/filter'
import List from './components/list'

const UnHandleReceipt = () => {
  const { paging, runChangePaging, run, loading } = usePagination(
    store.getSearchList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'customerLogList',
    },
  )
  useEffect(() => {
    run()
  }, [])
  return (
    <div>
      <Filter onSearch={run} />
      <List onFetchList={run} loading={loading} />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </div>
  )
}

export default UnHandleReceipt
