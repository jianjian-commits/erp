import { usePagination } from '@gm-common/hooks'

import React, { useEffect } from 'react'
import store from './store'
import Filter from './components/filter'
import List from './components/list'
import { observer } from 'mobx-react'

const PaidReceipt = observer(() => {
  const { pagination, run, loading } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
  })
  useEffect(() => {
    store.setListRequest(run)
    run()
  }, [])
  return (
    <div>
      <Filter onSearch={run} loading={loading} />
      <List loading={loading} onFetchList={run} pagination={pagination} />
    </div>
  )
})

export default PaidReceipt
