import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import { usePagination } from '@gm-common/hooks'
import store from './store'
import './index.less'

export default () => {
  const { pagination, run } = usePagination<any>(store.fetchList, {
    paginationKey: 'view_sku',
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
      <List pagination={pagination} />
    </>
  )
}
