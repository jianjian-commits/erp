import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'

import { observer } from 'mobx-react'
import List from './list'
import Filter from '../components/filter'
import store from '../stores/return_store'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'
import { useEffectOnce } from '@/common/hooks'

export default observer(() => {
  const {
    filter: { warehouse_id },
  } = store
  const { pagination, run, refresh } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'returnRecordList',
  })
  useEffectOnce(run, warehouse_id)
  useEffect(() => {
    store.setDoRequest(refresh)
    execMutiWarehouseJudge(run)
  }, [])
  return (
    <>
      <Filter
        filter={store.filter}
        // eslint-disable-next-line react/jsx-handler-names
        onChange={store.changeFilter}
        handleSearch={run}
        // eslint-disable-next-line react/jsx-handler-names
        onExport={store.export}
        tab='return'
      />
      <List pagination={pagination} />
    </>
  )
})
