import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './store/list_store'

const AfterSalesList = () => {
  const { paging, runChangePaging, run, loading } = usePagination<any>(
    store.fetchList,
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    store.setDoRequest(run)
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List onFetchList={run} loading={loading} />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
}

export default AfterSalesList
