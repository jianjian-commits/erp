import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

export default observer(() => {
  const { paging, runChangePaging, run, pagination } = usePagination<any>(
    store.fetchEmployeeList,
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
      <List pagination={pagination} />
    </>
  )
})
