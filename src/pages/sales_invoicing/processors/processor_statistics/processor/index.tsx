import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'
import store from '../processor_store'
import ProcessorFilter from './filter'
import List from './list'

export default () => {
  const { sku_id } = useGMLocation<{
    sku_id: string
  }>().query

  const { pagination, run, loading, refresh } = usePagination<any>(
    store.getSearchList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'customerLogList',
    },
  )

  useEffect(() => {
    store.changeFilter('sku_id', sku_id)
    run()
  }, [])
  return (
    <>
      <ProcessorFilter onSearch={run} />
      <List loading={loading} onFetchList={refresh} pagination={pagination} />
    </>
  )
}
