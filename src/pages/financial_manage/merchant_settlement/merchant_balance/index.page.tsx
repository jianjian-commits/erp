import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks'
import List from './components/list'
import Filter from './components/filter'
import store from './store'

export default observer(() => {
  const { pagination, run } = usePagination<any>(store.fetchBalanceList, {
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
      <List onFetchList={run} pagination={pagination} />
    </>
  )
})
