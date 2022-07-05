import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import { usePagination } from '@gm-common/hooks'
import store from './store'

export default () => {
  const { pagination, run } = usePagination<any>(store.fetchList, {
    paginationKey: 'view_combine',
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    store.setDoRequest(run)
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}
