import React, { useEffect } from 'react'
import { Filter, List } from './components'
import { usePagination } from '@gm-common/hooks'
import { Pagination, BoxPagination } from '@gm-pc/react'
import store from './store'
import type { ListWarehouseRequest } from 'gm_api/src/inventory'

const WarehouseInfo = () => {
  const { pagination, runChangePaging, run, loading } =
    usePagination<ListWarehouseRequest>((params) => store.fetchList(params), {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'warehouselist',
    })

  useEffect(() => {
    run()
    // store.fetchGroupUser()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List onFetchList={run} loading={loading} paging={pagination} />
    </>
  )
}

export default WarehouseInfo
