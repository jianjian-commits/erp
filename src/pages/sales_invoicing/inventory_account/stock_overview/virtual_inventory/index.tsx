import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'

import store from './store'
import Filter from './filter'
import List from './list'
import { useEffectOnce } from '@/common/hooks'
import { observer } from 'mobx-react'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

export default observer(() => {
  const {
    filter: { warehouse_id },
  } = store
  const { pagination, run } = usePagination<any>(store.getListVirtual, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'virtualInventoryList',
  })

  useEffectOnce<string | undefined>(run, warehouse_id)

  useEffect(() => {
    store.setDoRequest(run)
    execMutiWarehouseJudge(run)
    return store.handleClearSelect
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
})
