import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'

import Filter from '../components/filter'
import List from './list'
import store from '../stores/lend_store'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'
import { useEffectOnce } from '@/common/hooks'
import { observer } from 'mobx-react'

export default observer(() => {
  const {
    filter: { warehouse_id },
  } = store
  const { pagination, run, refresh } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'lendRecordList',
  })
  useEffectOnce(run, warehouse_id)
  useEffect(() => {
    store.setDoRequest(refresh)
    execMutiWarehouseJudge(run)
    return store.clear
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
        tab='lend'
      />
      <List pagination={pagination} />
    </>
  )
})
