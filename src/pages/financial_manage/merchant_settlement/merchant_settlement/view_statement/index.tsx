import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { BoxPagination, Pagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'
import List from './components/list'
import Filter from './components/filter'
import store from './store'

export default observer(() => {
  const { paging, runChangePaging, run } = usePagination<any>(store.fetchList, {
    paginationKey: 'view_statement',
    defaultPaging: {
      need_count: true,
    },
  })
  useEffect(() => {
    store.setDoRequest(run)
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
})
