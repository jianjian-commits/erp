import { usePagination } from '@gm-common/hooks'

import React, { useEffect } from 'react'
import store from './store'
import Filter from './components/filter'
import List from './components/list'

const UnHandleReceipt = () => {
  const { pagination, run } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
  })
  useEffect(() => {
    run()
  }, [])
  return (
    <div>
      <Filter onSearch={run} />
      <List onFetchList={run} pagination={pagination} />
    </div>
  )
}

export default UnHandleReceipt
