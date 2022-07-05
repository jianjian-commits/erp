import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './store'

const PickUpTask = () => {
  const { paging, runChangePaging, run } = usePagination<any>(
    store.fetchTaskList,
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )
  useEffect(() => {
    store.setDoRequest(run)
    store.fetchDriverList()
    run()
    return () => {
      store.clearStore()
    }
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

export default PickUpTask
