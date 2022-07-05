import React from 'react'
import { useMount } from 'react-use'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'

import { OPERATE_TYPE } from '@/pages/sales_invoicing/enum'
import Filter from '../../components/filter'
import List from './list'
import store from './store'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'
import { observer } from 'mobx-react'

export default observer(() => {
  const {
    filter: { warehouse_id },
  } = store
  const { paging, runChangePaging, run } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'stockOutSaleList',
  })

  useEffectOnce<string | undefined>(run, warehouse_id)

  useMount(() => {
    execMutiWarehouseJudge(run)
  })

  return (
    <>
      <Filter
        orderType={OPERATE_TYPE.saleOut}
        filter={store.filter}
        onSearch={run}
        onChange={store._handleUpdateFilter}
        onExport={store._handleExport}
      />
      <List />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
})
