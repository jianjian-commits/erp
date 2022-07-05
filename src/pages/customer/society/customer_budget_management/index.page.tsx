import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import store from './store/listStore'
import detailStore from './store/detailStore'
import { usePagination } from '@gm-common/hooks'

const CustomerBudgetManagementPage = () => {
  const { pagination, run } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'ListBudget',
  })

  useEffect(() => {
    store.setDoRequest(run)
    detailStore.fetchMealTimesList()
    run()
    return store.init()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}

export default CustomerBudgetManagementPage
