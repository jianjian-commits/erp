import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './store'
import { useGMLocation } from '@gm-common/router'

export default () => {
  const { create_time, end_time } = useGMLocation<{
    create_time: string
    end_time: string
  }>().query
  store.filter.begin_time = create_time
  store.filter.end_time = end_time
  const { paging, runChangePaging, run } = usePagination(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'costValueList',
  })

  useEffect(() => {
    run()
    return store.clear
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List run={run} />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
}
