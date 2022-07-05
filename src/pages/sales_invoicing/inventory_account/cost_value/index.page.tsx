import React from 'react'
import { usePagination } from '@gm-common/hooks'
import { useMount } from 'react-use'
import Filter from './filter'
import List from './list'
import store from './store'
import { observer } from 'mobx-react'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

export default observer(() => {
  const {
    filter: { warehouse_id },
  } = store
  const { pagination, run } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'costValueList',
  })

  useEffectOnce(run, warehouse_id)

  useMount(() => {
    execMutiWarehouseJudge(run)
    return store.clear
  })

  return (
    <>
      <Filter onSearch={run} />
      <List run={run} pagination={pagination} />
    </>
  )
})
