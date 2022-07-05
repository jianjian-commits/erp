import React, { useEffect } from 'react'
import { Filter, List } from './components'
import { usePagination, UsePaginationService } from '@gm-common/hooks'
import store from './stores/store'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { Data } from '@/pages/purchase/supplier_manage/supplier_message/store'

const WarehouseInStock = () => {
  const { pagination, run, loading } = usePagination(
    store.fetchList as UsePaginationService<TableRequestParams, Data>,
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
      <Filter onSearch={run} loading={loading} />
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </>
  )
}

export default WarehouseInStock
