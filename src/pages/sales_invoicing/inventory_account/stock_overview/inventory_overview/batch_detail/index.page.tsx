import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'

import store from '../stores/batch_store'
import Filter from './filter'
import List from './list'

export default () => {
  const { batch_id } = useGMLocation<{
    batch_id: string
  }>().query

  const { pagination, run } = usePagination<any>(store.fetchBatchLog, {
    manual: true,
    paginationKey: 'batchDetailList',
  })
  useEffect(() => {
    store.handleChangeFilter('batch_id', batch_id)
    run()
    return store.clean
  }, [])
  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}
