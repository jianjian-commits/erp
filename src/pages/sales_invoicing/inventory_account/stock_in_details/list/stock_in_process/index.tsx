import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'
import { useMount } from 'react-use'

import { OPERATE_TYPE } from '@/pages/sales_invoicing/enum'
import Filter from '../../components/filter'
import List from './list'
import store from './store'
import { observer } from 'mobx-react'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

export default observer(() => {
  const {
    filter: { warehouse_id },
  } = store

  const { paging, runChangePaging, run } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'stockInProcessList',
  })

  useMount(() => {
    const getInfo = async () => {
      await store.fetchRoute()
      run()
    }
    execMutiWarehouseJudge(getInfo)
  })

  useEffectOnce<string | undefined>(run, warehouse_id)

  return (
    <>
      <Filter
        orderType={OPERATE_TYPE.productIn}
        filter={store.filter}
        onSearch={run}
        onChange={store._handleUpdateFilter}
        onExport={store._handleExport}
        routeList={store.routeList}
      />
      <List />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
})
