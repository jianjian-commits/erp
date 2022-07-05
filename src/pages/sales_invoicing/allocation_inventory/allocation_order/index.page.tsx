import React from 'react'
import { Filter, List } from './components'
import { usePagination } from '@gm-common/hooks'
import store from './stores/store'
import { useMount } from 'react-use'
import type { ListWarehouseTransferSheetRequest } from 'gm_api/src/inventory'

const WarehouseInStock = () => {
  const { pagination, run, loading } =
    usePagination<ListWarehouseTransferSheetRequest>(
      (paging) => store.fetchAllocationList(paging),
      {
        defaultPaging: {
          need_count: true,
        },
      },
    )

  useMount(run)

  return (
    <>
      <Filter onSearch={run} loading={loading} />
      <List pagination={pagination} onFetchList={run} loading={loading} />
    </>
  )
}

export default WarehouseInStock
