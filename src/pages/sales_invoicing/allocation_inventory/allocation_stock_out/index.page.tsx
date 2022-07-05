import React from 'react'
import { Filter, List } from './components'
import { usePagination, UsePaginationService } from '@gm-common/hooks'
import store from './stores/store'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { Data } from '@/pages/purchase/supplier_manage/supplier_message/store'
import { useEffectOnce } from '@/common/hooks'

const AllocationStockOut = () => {
  const {
    filter: { warehouse_id },
  } = store
  const { pagination, run, loading } = usePagination(
    store.fetchList as UsePaginationService<TableRequestParams, Data>,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'allOcationStockOutViewList',
    },
  )

  useEffectOnce<string | undefined>(run, warehouse_id)

  return (
    <>
      <Filter onSearch={run} loading={loading} />
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </>
  )
}

export default AllocationStockOut
