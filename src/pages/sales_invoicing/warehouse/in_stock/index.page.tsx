import React, { useEffect } from 'react'
import { Filter, List } from './components'
import { usePagination } from '@gm-common/hooks'
import { Pagination, BoxPagination } from '@gm-pc/react'
import store from './store'

const WarehouseInStock = () => {
  const { paging, runChangePaging, run, refresh, loading } = usePagination(
    store.getSkuStock,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'inventoryOverviewList',
    },
  )
  useEffect(() => {
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List paging={paging} run={refresh} loading={loading} />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
}

export default WarehouseInStock
