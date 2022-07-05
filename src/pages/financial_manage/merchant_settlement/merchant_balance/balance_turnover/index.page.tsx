import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import { usePagination } from '@gm-common/hooks'
import List from './list'
import Filter from './filter'
import store from '../store'

export default observer(() => {
  const location = useGMLocation<{ company_id: string }>()
  const { company_id } = location.query
  const { pagination, run } = usePagination<any>(
    store.fetchBalanceTurnoverList,
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )
  useEffect(() => {
    store.updateFilter('target_id', company_id)
    store.setDoRequest(run)
    run({ company_id })
  }, [])
  return (
    <>
      <Filter onSearch={run} />
      <List onFetchList={run} pagination={pagination} />
    </>
  )
})
