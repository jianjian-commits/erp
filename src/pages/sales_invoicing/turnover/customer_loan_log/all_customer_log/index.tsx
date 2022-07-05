import React, { useEffect } from 'react'
import store from '../stores/all_customer_store'
import { usePagination } from '@gm-common/hooks'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { observer } from 'mobx-react'

import Filter from './filter'
import List from './list'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'
import { useEffectOnce } from '@/common/hooks'

export default observer(() => {
  const {
    filter: { warehouse_id },
  } = store
  const { paging, runChangePaging, run } = usePagination<any>(
    store.getSearchList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'allCustomerLogList',
    },
  )

  useEffectOnce(run, warehouse_id)

  useEffect(() => {
    execMutiWarehouseJudge(run)
  }, [])
  return (
    <>
      <Filter onSearch={run} />
      <List />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
})
