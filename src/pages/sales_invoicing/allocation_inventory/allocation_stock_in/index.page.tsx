import React from 'react'
import { Filter, List } from './components'
import { usePagination } from '@gm-common/hooks'
import store from './stores/store'
import { useEffectOnce } from '@/common/hooks'
import { observer } from 'mobx-react'

const AllocationStocIn = observer(() => {
  const { pagination, run, loading } = usePagination(store.fetchList as any, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'inventoryStockInList',
  })
  const {
    filter: { warehouse_id },
  } = store

  useEffectOnce<string>(run, warehouse_id)

  return (
    <>
      <Filter onSearch={run} loading={false} />
      <List paging={pagination} onFetchList={run} loading={loading} />
    </>
  )
})

export default AllocationStocIn
