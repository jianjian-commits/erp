import React from 'react'
import { usePagination } from '@gm-common/hooks'
import { useMount } from 'react-use'
import Filter from './components/filter'
import List from './components/list'
import store from './stores/store'
import type { ListSkuStockRequest } from 'gm_api/src/inventory'
import { observer } from 'mobx-react'

export default observer(() => {
  const { pagination, run, refresh, loading } =
    usePagination<ListSkuStockRequest>((params) => store.getSkuStock(params), {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'inventoryOverviewList',
    })

  useMount(run)

  return (
    <>
      <Filter onSearch={run} />
      <List run={refresh} loading={loading} pagination={pagination} />
    </>
  )
})
